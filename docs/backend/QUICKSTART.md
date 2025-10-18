# 快速开始指南

## 🚀 立即开始

### 方式 1：使用交互式脚本

```bash
./run.sh
```

然后选择：
- 选项 1：轮询模式（推荐开始）
- 选项 2：WebSocket 模式（实时监听）
- 选项 3：自定义配置

### 方式 2：直接运行

#### 使用轮询模式（默认）

```bash
cargo run
```

#### 使用 WebSocket 模式

```bash
export LISTENER_MODE=websocket
cargo run
```

## 📊 预期输出

### 轮询模式

```
🚀 启动 Solana Vault 事件监听器...

🔄 使用轮询模式 (每 5 秒检查一次)

📍 监听程序 ID: HZWKVfammvEHaNfPnYTppEgXYppZWfqPiGgxwgAjEdVv
🔗 RPC 端点: https://api.zan.top/node/v1/solana/devnet/...
⏳ 使用轮询方式监听 VaultCreatedEvent 事件...

📝 发现新交易: 2WADAZi2dR9rsfNxgJxvHja1ye5WR9WzSMrskH5vkiMi...
  🎯 检测到 CreateVault 指令!
  📊 发现程序数据日志
  ✅ 成功解析事件数据!

============================================================
🏦 Vault 创建事件详情
============================================================
📊 Vault ID: 1
👤 创建者: EQKsPeerwacq5L2kW7qPAjqnJMYhL7ousMY1HKsc219p
📝 名称: My Vault
🔖 符号: MVT
📈 目标 APY: 8.5%
💰 初始存款: 10 SOL
🎯 策略类型: stable_yield
⚠️  风险等级: 0
⏰ 创建时间: 1760260821
============================================================
```

### WebSocket 模式

```
🚀 启动 Solana Vault 事件监听器...

📡 使用 WebSocket 模式 (实时监听)

📡 启动 WebSocket 日志监听...
🔗 WebSocket URL: wss://api.zan.top/node/ws/v1/solana/devnet/...
📍 监听程序 ID: HZWKVfammvEHaNfPnYTppEgXYppZWfqPiGgxwgAjEdVv
⏳ 等待事件...

✅ WebSocket 连接成功，开始监听事件...

📝 检测到新交易: 2WADAZi2dR9rsfNxgJxvHja1ye5WR9WzSMrskH5vkiMi...
  🎯 检测到 CreateVault 指令!
  📊 发现程序数据日志
  ✅ 成功解析事件数据!

[显示 Vault 详情...]
```

## 🧪 测试事件监听

### 1. 启动监听器

选择任一模式启动监听器。

### 2. 触发事件

在另一个终端中，使用前端或合约客户端创建一个新的 Vault：

```bash
# 前端项目目录
cd ../../frontend/web
npm run dev
```

然后在浏览器中创建 Vault。

### 3. 查看监听器输出

返回监听器终端，应该能看到实时捕获的事件。

## 🔧 常用命令

### 编译项目

```bash
cargo build
```

### 运行测试（如果有）

```bash
cargo test
```

### 清理构建

```bash
cargo clean
```

### 检查代码

```bash
cargo check
```

### 格式化代码

```bash
cargo fmt
```

## 📝 配置说明

### 当前使用的端点

- **HTTP RPC**: `https://api.zan.top/node/v1/solana/devnet/55c625d41c924f97971cdd05bb533048`
- **WebSocket**: `wss://api.zan.top/node/ws/v1/solana/devnet/55c625d41c924f97971cdd05bb533048`
- **Program ID**: `HZWKVfammvEHaNfPnYTppEgXYppZWfqPiGgxwgAjEdVv`

### 自定义端点

通过环境变量覆盖：

```bash
export SOLANA_RPC_URL="https://api.devnet.solana.com"
export VAULT_PROGRAM_ID="YOUR_PROGRAM_ID"
export LISTENER_MODE="websocket"
cargo run
```

### 环境变量列表

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SOLANA_RPC_URL` | RPC 端点 | ZAN 节点 URL |
| `VAULT_PROGRAM_ID` | 程序 ID | HZWKVfammvEH... |
| `LISTENER_MODE` | 监听模式 | `polling` |
| `POLL_INTERVAL_SECS` | 轮询间隔 | `5` |

## 🐛 故障排查

### 编译错误

```bash
# 清理并重新编译
cargo clean
cargo build
```

### 连接失败

1. **检查网络连接**
2. **验证 RPC 端点**：
   ```bash
   curl https://api.zan.top/node/v1/solana/devnet/55c625d41c924f97971cdd05bb533048 \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
   ```
3. **切换到其他端点**：
   ```bash
   export SOLANA_RPC_URL="https://api.devnet.solana.com"
   cargo run
   ```

### WebSocket 连接失败

如果 WebSocket 模式失败，切换到轮询模式：

```bash
export LISTENER_MODE=polling
cargo run
```

### 没有检测到事件

1. **确认 Program ID 正确**
2. **检查是否有新交易**：访问 [Solana Explorer](https://explorer.solana.com/?cluster=devnet)
3. **手动创建测试 Vault**

## 📚 更多文档

- [MVC 架构说明](./README_MVC.md)
- [WebSocket 使用指南](./WEBSOCKET_GUIDE.md)
- [RPC 配置文档](./RPC_CONFIG.md)

## ⌨️ 常用快捷键

- `Ctrl + C`: 停止监听器
- `Ctrl + Z`: 暂停进程（不推荐，使用 `Ctrl + C` 代替）

## 💡 提示

1. **首次运行**：推荐使用轮询模式，更稳定
2. **实时监听**：需要低延迟时使用 WebSocket 模式
3. **调试问题**：查看程序输出的详细日志
4. **生产环境**：建议添加日志文件和监控

## 🎯 下一步

1. 启动监听器
2. 触发一些 Vault 创建事件
3. 观察事件是否被正确捕获和解析
4. 根据需要调整配置

祝使用愉快！🚀
