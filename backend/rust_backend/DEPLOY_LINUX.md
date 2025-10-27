# Rust Backend Linux 部署指南

## 快速开始

### 1. 安装 Cross 工具（首次使用）

```bash
cargo install cross --git https://github.com/cross-rs/cross
```

### 2. 使用部署脚本（推荐）

```bash
cd backend/rust_backend
./deploy.sh
```

脚本会自动：
- ✅ 交叉编译到 Linux x86_64
- ✅ 创建部署包
- ✅ 打包配置文件和脚本
- ✅ 可选：自动上传到服务器

---

## 方法详解

### 方法 1: 使用 Cross 工具（推荐）

#### 1.1 安装 Cross

```bash
# 安装 cross（需要 Docker）
cargo install cross --git https://github.com/cross-rs/cross

# 确保 Docker 正在运行
docker info
```

#### 1.2 交叉编译

```bash
cd backend/rust_backend

# 编译到 Linux x86_64
cross build --release --target x86_64-unknown-linux-gnu --bin rust_backend

# 编译产物位置
ls -lh target/x86_64-unknown-linux-gnu/release/rust_backend
```

#### 1.3 创建部署包

```bash
# 创建部署目录
mkdir -p deploy
cd deploy

# 复制二进制文件
cp ../target/x86_64-unknown-linux-gnu/release/rust_backend .

# 复制配置文件
cp ../config.oath.yaml .
cp -r ../data .

# 创建启动脚本
cat > start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
./rust_backend --config config.oath.yaml
EOF

chmod +x start.sh
chmod +x rust_backend

# 打包
tar -czf oath-listener-linux.tar.gz *
```

#### 1.4 上传到服务器

```bash
# 上传部署包
scp oath-listener-linux.tar.gz user@server:/opt/oath-listener/

# SSH 到服务器
ssh user@server

# 解压
cd /opt/oath-listener
tar -xzf oath-listener-linux.tar.gz

# 运行
./start.sh
```

---

### 方法 2: 在 Linux 服务器上直接编译

如果有 Linux 服务器访问权限，可以直接在服务器上编译：

```bash
# 1. 上传源代码
scp -r backend/rust_backend user@server:/tmp/

# 2. SSH 到服务器
ssh user@server

# 3. 安装 Rust（如果未安装）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# 4. 编译
cd /tmp/rust_backend
cargo build --release --bin rust_backend

# 5. 部署
sudo mkdir -p /opt/oath-listener
sudo cp target/release/rust_backend /opt/oath-listener/
sudo cp config.oath.yaml /opt/oath-listener/
sudo cp -r data /opt/oath-listener/
```

---

### 方法 3: 使用 Docker 容器

#### 3.1 创建 Dockerfile

```dockerfile
# backend/rust_backend/Dockerfile
FROM rust:1.75 as builder

WORKDIR /app
COPY . .

RUN cargo build --release --bin rust_backend

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/rust_backend .
COPY config.oath.yaml .
COPY data ./data

CMD ["./rust_backend", "--config", "config.oath.yaml"]
```

#### 3.2 构建和运行

```bash
# 构建镜像
docker build -t oath-listener:latest .

# 运行容器
docker run -d \
  --name oath-listener \
  --restart unless-stopped \
  -v $(pwd)/config.oath.yaml:/app/config.oath.yaml \
  oath-listener:latest
```

---

## 服务器配置

### 1. 创建 systemd 服务

```bash
# 创建服务文件
sudo nano /etc/systemd/system/oath-listener.service
```

```ini
[Unit]
Description=Oath Event Listener
After=network.target

[Service]
Type=simple
User=oath
WorkingDirectory=/opt/oath-listener
ExecStart=/opt/oath-listener/rust_backend --config config.oath.yaml
Restart=always
RestartSec=10
Environment="RUST_LOG=info"

[Install]
WantedBy=multi-user.target
```

### 2. 启用和启动服务

```bash
# 重新加载 systemd
sudo systemctl daemon-reload

# 启用开机自启
sudo systemctl enable oath-listener

# 启动服务
sudo systemctl start oath-listener

# 查看状态
sudo systemctl status oath-listener

# 查看日志
sudo journalctl -u oath-listener -f
```

---

## 配置文件修改

### 服务器上修改 config.oath.yaml

```yaml
# Oath 合约事件监听器配置文件

solana:
  active_network: devnet
  networks:
    devnet:
      rpc_url: "https://api.devnet.solana.com"

vault:
  program_id: "Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ"

listener:
  mode: "websocket"
  poll_interval_secs: 5
  event_parse: "none"

database:
  type: "mysql"
  mysql_host: "localhost"
  mysql_port: 3306
  mysql_user: "oath_user"
  mysql_password: "secure_password"
  mysql_database: "oath_events"
  max_connections: 5
  min_connections: 1
```

---

## 数据库初始化

### MySQL

```bash
# 创建数据库
mysql -u root -p << EOF
CREATE DATABASE oath_events CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'oath_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON oath_events.* TO 'oath_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# 初始化表结构
mysql -u oath_user -p oath_events < data/init_oath_events.sql
```

---

## 故障排查

### 1. 检查二进制文件依赖

```bash
# 查看动态链接库依赖
ldd rust_backend

# 如果缺少 libssl
sudo apt-get install libssl3
```

### 2. 查看日志

```bash
# systemd 日志
sudo journalctl -u oath-listener -n 100 --no-pager

# 实时日志
sudo journalctl -u oath-listener -f
```

### 3. 手动运行测试

```bash
cd /opt/oath-listener
./rust_backend --config config.oath.yaml
```

### 4. 检查网络连接

```bash
# 测试 RPC 连接
curl -X POST https://api.devnet.solana.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'

# 测试 MySQL 连接
mysql -h localhost -u oath_user -p oath_events -e "SHOW TABLES;"
```

---

## 性能优化

### 1. 编译优化

在 `Cargo.toml` 中添加：

```toml
[profile.release]
opt-level = 3
lto = true
codegen-units = 1
strip = true
```

### 2. 运行时优化

```bash
# 设置环境变量
export RUST_LOG=info
export RUST_BACKTRACE=1

# 限制内存使用
systemd 服务中添加:
MemoryMax=512M
```

---

## 监控和维护

### 1. 日志轮转

```bash
# 创建 logrotate 配置
sudo nano /etc/logrotate.d/oath-listener
```

```
/var/log/oath-listener/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

### 2. 监控脚本

```bash
#!/bin/bash
# check-oath-listener.sh

if ! systemctl is-active --quiet oath-listener; then
    echo "❌ Oath listener is not running!"
    sudo systemctl restart oath-listener
    echo "✅ Service restarted"
fi
```

---

## 完整部署示例

```bash
# 1. 本地编译
cd backend/rust_backend
./deploy.sh

# 2. 上传到服务器
scp oath-listener-linux.tar.gz user@server:/tmp/

# 3. 服务器端部署
ssh user@server << 'ENDSSH'
    # 创建目录
    sudo mkdir -p /opt/oath-listener
    cd /opt/oath-listener
    
    # 解压
    sudo tar -xzf /tmp/oath-listener-linux.tar.gz
    sudo chmod +x rust_backend start.sh
    
    # 修改配置
    sudo nano config.oath.yaml
    
    # 初始化数据库
    mysql -u root -p oath_events < data/init_oath_events.sql
    
    # 安装服务
    sudo cp oath-listener.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable oath-listener
    sudo systemctl start oath-listener
    
    # 查看状态
    sudo systemctl status oath-listener
ENDSSH
```

---

## 安全建议

1. **使用非 root 用户运行**
2. **配置防火墙** - 只开放必要端口
3. **使用环境变量** - 不要在配置文件中硬编码密码
4. **定期备份数据库**
5. **监控日志** - 及时发现异常

---

## 支持的目标平台

- ✅ `x86_64-unknown-linux-gnu` (Intel/AMD 64位)
- ✅ `aarch64-unknown-linux-gnu` (ARM64)
- ✅ `x86_64-unknown-linux-musl` (静态链接版本)

如需编译其他平台：

```bash
cross build --release --target aarch64-unknown-linux-gnu --bin rust_backend
```
