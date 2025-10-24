#!/bin/bash

# Oath 事件监听器启动脚本

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "🚀 启动 Oath 合约事件监听器..."
echo "工作目录: $SCRIPT_DIR"
echo ""

# 检查配置文件
if [ ! -f "config.oath.yaml" ]; then
    echo "❌ 错误: 找不到 config.oath.yaml 配置文件"
    echo "请先创建配置文件，参考 OATH_EVENT_LISTENER_GUIDE.md"
    exit 1
fi

# 检查数据库连接
echo "📊 检查数据库连接..."

# 从 config.oath.yaml 读取数据库配置
DB_TYPE=$(grep "type:" config.oath.yaml | awk '{print $2}' | tr -d '"')
echo "数据库类型: $DB_TYPE"

if [ "$DB_TYPE" = "mysql" ]; then
    DB_HOST=$(grep "mysql_host:" config.oath.yaml | awk '{print $2}' | tr -d '"')
    DB_PORT=$(grep "mysql_port:" config.oath.yaml | awk '{print $2}')
    DB_USER=$(grep "mysql_user:" config.oath.yaml | awk '{print $2}' | tr -d '"')
    DB_PASSWORD=$(grep "mysql_password:" config.oath.yaml | awk '{print $2}' | tr -d '"')
    DB_NAME=$(grep "mysql_database:" config.oath.yaml | awk '{print $2}' | tr -d '"')
    
    echo "检查 MySQL 连接: $DB_HOST:$DB_PORT..."
    
    # 测试 MySQL 连接
    if command -v mysql &> /dev/null; then
        if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME" 2>/dev/null; then
            echo "✅ MySQL 连接成功"
        else
            echo "⚠️  MySQL 连接失败，请检查数据库配置"
            echo "正在尝试创建数据库..."
            mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
            
            if [ $? -eq 0 ]; then
                echo "✅ 数据库创建成功"
                echo "正在初始化表结构..."
                mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < data/init_oath_events.sql
                echo "✅ 表结构初始化完成"
            else
                echo "❌ 数据库创建失败，请手动检查"
            fi
        fi
    else
        echo "⚠️  未安装 mysql 命令行工具，跳过连接测试"
    fi
fi

echo ""
echo "🔧 编译 Rust 项目..."
cargo build --release

if [ $? -ne 0 ]; then
    echo "❌ 编译失败"
    exit 1
fi

echo ""
echo "✅ 编译成功"
echo ""
echo "📡 启动监听器..."
echo "监听合约: Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ"
echo "网络: Devnet"
echo ""

# 启动监听器 (指定二进制文件)
cargo run --release --bin rust_backend -- --config config.oath.yaml
