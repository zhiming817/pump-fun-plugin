#!/bin/bash

# Rust 后端部署脚本（支持 zigbuild 和 cross）
# 用于交叉编译 macOS -> Linux 并部署到服务器

set -e

echo "🚀 开始部署 Rust 后端到 Linux 服务器..."
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

if [ ! -f "Cargo.toml" ]; then
    echo "❌ 错误: 找不到 Cargo.toml"
    exit 1
fi

echo "✅ 工作目录: $SCRIPT_DIR"
echo ""

TARGET="x86_64-unknown-linux-gnu"
BINARY_NAME="rust_backend"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "请选择编译方式:"
echo "1) 使用 zigbuild (推荐，无需 Docker)"
echo "2) 使用 cross (需要 Docker)"
echo "3) 仅打包已编译的二进制文件"
read -p "选择 (1-3): " BUILD_METHOD

case $BUILD_METHOD in
    1)
        echo ""
        echo "📦 检查 cargo-zigbuild..."
        if ! command -v cargo-zigbuild &> /dev/null; then
            echo -e "${YELLOW}⚠️  cargo-zigbuild 未安装，正在安装...${NC}"
            cargo install cargo-zigbuild
        fi
        
        echo ""
        echo "🔨 使用 zigbuild 交叉编译到 Linux..."
        cargo zigbuild --release --target $TARGET --bin $BINARY_NAME
        ;;
    2)
        echo ""
        echo "📦 检查 Docker..."
        if ! docker info &> /dev/null; then
            echo -e "${RED}❌ Docker 未运行，请先启动 Docker Desktop${NC}"
            echo "运行: open -a Docker"
            exit 1
        fi
        
        echo "📦 检查 cross..."
        if ! command -v cross &> /dev/null; then
            echo -e "${YELLOW}⚠️  cross 未安装，正在安装...${NC}"
            cargo install cross --git https://github.com/cross-rs/cross
        fi
        
        echo ""
        echo "🔨 使用 cross 交叉编译到 Linux..."
        cross build --release --target $TARGET --bin $BINARY_NAME
        ;;
    3)
        echo ""
        echo "⏭️  跳过编译，使用已存在的二进制文件"
        if [ ! -f "target/$TARGET/release/$BINARY_NAME" ]; then
            echo -e "${RED}❌ 找不到编译好的二进制文件: target/$TARGET/release/$BINARY_NAME${NC}"
            exit 1
        fi
        ;;
    *)
        echo -e "${RED}❌ 无效选择${NC}"
        exit 1
        ;;
esac

if [ $? -ne 0 ] && [ "$BUILD_METHOD" != "3" ]; then
    echo -e "${RED}❌ 编译失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 准备就绪!${NC}"
echo ""

# 创建部署包
echo "📦 创建部署包..."
DEPLOY_DIR="deploy_package"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

cp target/$TARGET/release/$BINARY_NAME $DEPLOY_DIR/
echo "  ✓ 复制二进制文件"

cp config.oath.yaml $DEPLOY_DIR/
echo "  ✓ 复制配置文件"

if [ -d "data" ]; then
    cp -r data $DEPLOY_DIR/
    echo "  ✓ 复制数据目录"
fi

# 创建启动脚本
cat > $DEPLOY_DIR/start.sh << 'STARTEOF'
#!/bin/bash
cd "$(dirname "$0")"

if [ ! -f "config.oath.yaml" ]; then
    echo "❌ 找不到 config.oath.yaml"
    exit 1
fi

echo "🚀 启动 Oath 事件监听器..."
./rust_backend --config config.oath.yaml
STARTEOF

chmod +x $DEPLOY_DIR/start.sh
echo "  ✓ 创建启动脚本"

# 创建 systemd 服务文件
cat > $DEPLOY_DIR/oath-listener.service << 'SERVICEEOF'
[Unit]
Description=Oath Event Listener
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/oath-listener
ExecStart=/opt/oath-listener/rust_backend --config config.oath.yaml
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICEEOF

echo "  ✓ 创建 systemd 服务文件"

# 创建 README
cat > $DEPLOY_DIR/README.txt << 'READMEEOF'
Oath 事件监听器 - Linux 部署包
================================

部署步骤:
1. 解压到目标目录 (推荐: /opt/oath-listener)
   tar -xzf oath-listener-linux.tar.gz -C /opt/oath-listener

2. 修改配置文件
   vim /opt/oath-listener/config.oath.yaml
   # 更新数据库连接信息

3. 初始化数据库 (首次部署)
   mysql -u root -p < data/init_oath_events.sql

4. 启动监听器
   cd /opt/oath-listener
   ./start.sh

Systemd 服务安装 (推荐):
1. sudo cp oath-listener.service /etc/systemd/system/
2. sudo systemctl daemon-reload
3. sudo systemctl enable oath-listener
4. sudo systemctl start oath-listener

管理服务:
- 启动: sudo systemctl start oath-listener
- 停止: sudo systemctl stop oath-listener
- 重启: sudo systemctl restart oath-listener
- 状态: sudo systemctl status oath-listener
- 日志: journalctl -u oath-listener -f

直接运行 (测试):
./start.sh

文件说明:
- rust_backend: 主程序
- config.oath.yaml: 配置文件
- data/: 数据库初始化脚本
- start.sh: 启动脚本
- oath-listener.service: systemd 服务文件

READMEEOF

echo "  ✓ 创建 README"

echo ""
echo "📦 打包文件..."
tar -czf oath-listener-linux.tar.gz -C $DEPLOY_DIR .

echo ""
echo -e "${GREEN}✅ 部署包创建成功!${NC}"
echo ""
echo "📦 文件: oath-listener-linux.tar.gz"
echo "📏 大小: $(du -h oath-listener-linux.tar.gz | cut -f1)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 部署到服务器:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  上传文件:"
echo "   scp oath-listener-linux.tar.gz user@server:/opt/"
echo ""
echo "2️⃣  SSH 到服务器:"
echo "   ssh user@server"
echo ""
echo "3️⃣  解压部署:"
echo "   sudo mkdir -p /opt/oath-listener"
echo "   sudo tar -xzf /opt/oath-listener-linux.tar.gz -C /opt/oath-listener"
echo "   sudo chmod +x /opt/oath-listener/rust_backend"
echo "   sudo chmod +x /opt/oath-listener/start.sh"
echo ""
echo "4️⃣  配置并启动:"
echo "   cd /opt/oath-listener"
echo "   sudo vim config.oath.yaml  # 修改配置"
echo "   ./start.sh                 # 测试运行"
echo ""
echo "5️⃣  安装为服务 (可选):"
echo "   sudo cp oath-listener.service /etc/systemd/system/"
echo "   sudo systemctl daemon-reload"
echo "   sudo systemctl enable oath-listener"
echo "   sudo systemctl start oath-listener"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 完成!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"