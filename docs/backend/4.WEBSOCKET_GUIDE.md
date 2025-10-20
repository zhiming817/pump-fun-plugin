# WebSocket 实时监听模式使用指南

## 📡 概述

项目现在支持**两种事件监听模式**：

1. **轮询模式（Polling）** - 默认模式，每 5 秒查询一次新交易
2. **WebSocket 模式** - 实时监听，使用 Solana PubsubClient 订阅程序日志

## 🚀 快速开始

### 使用轮询模式（默认）

```bash
cargo run
```

或者明确指定：

```bash
export LISTENER_MODE=polling
cargo run
```

### 使用 WebSocket 模式

```bash
export LISTENER_MODE=websocket
cargo run
```

## 📋 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `LISTENER_MODE` | 监听模式 | `polling` | `websocket` 或 `ws` |
| `SOLANA_RPC_URL` | RPC 端点 | Devnet URL | `https://api.mainnet-beta.solana.com` |
| `VAULT_PROGRAM_ID` | 合约程序 ID | Devnet 合约地址 | `YOUR_PROGRAM_ID` |
| `POLL_INTERVAL_SECS` | 轮询间隔（仅轮询模式） | `5` | `10` |

### 完整示例

```bash
# WebSocket 模式配置
export LISTENER_MODE=websocket
export SOLANA_RPC_URL="https://api.devnet.solana.com"
export VAULT_PROGRAM_ID="HZWKVfammvEHaNfPnYTppEgXYppZWfqPiGgxwgAjEdVv"

cargo run
```

## 🔄 两种模式对比

### 轮询模式（Polling）

**优点：**
- ✅ 稳定可靠
- ✅ 不需要 WebSocket 连接
- ✅ 可以查询历史交易
- ✅ 适合批量处理

**缺点：**
- ⚠️ 有延迟（默认 5 秒）
- ⚠️ 可能错过非常快速的交易
- ⚠️ 消耗更多 RPC 请求

**适用场景：**
- 不需要实时性的场景
- RPC 端点不支持 WebSocket
- 需要历史数据回溯

### WebSocket 模式

**优点：**
- ✅ **实时监听**，无延迟
- ✅ 节省 RPC 请求
- ✅ 推送模式，服务端主动发送
- ✅ 适合高频交易监控

**缺点：**
- ⚠️ 需要 WebSocket 支持
- ⚠️ 连接可能断开需要重连
- ⚠️ 只能监听新事件（不包含历史）

**适用场景：**
- 需要实时响应的场景
- 高频交易监控
- 事件触发式处理

## 🔧 技术实现

### WebSocket 服务架构

```rust
WebSocketListenerController
    ↓
WebSocketService
    ↓
PubsubClient (solana-pubsub-client)
    ↓
logs_subscribe() / account_subscribe()
    ↓
实时日志流
```

### URL 转换

程序会自动将 HTTP(S) URL 转换为 WebSocket URL：

- `https://api.devnet.solana.com` → `wss://api.devnet.solana.com`
- `http://localhost:8899` → `ws://localhost:8899`

### 订阅类型

#### 1. 程序日志订阅（当前实现）

```rust
// 订阅特定程序的所有日志
logs_subscribe(
    RpcTransactionLogsFilter::Mentions(vec![program_id]),
    commitment_config
)
```

**功能：**
- 监听所有与程序相关的交易
- 实时接收 `Program data:` 日志
- 解析 VaultCreatedEvent 事件

#### 2. 账户订阅（已实现但未启用）

```rust
// 订阅特定账户的状态变化
account_subscribe(account_pubkey, None)
```

**功能：**
- 监听账户余额变化
- 监听账户数据更新
- 实时接收账户状态

## 📊 事件处理流程

### WebSocket 模式

```
1. 建立 WebSocket 连接
   ↓
2. 订阅程序日志
   ↓
3. 接收实时日志流
   ↓
4. 检测 "Instruction: CreateVault"
   ↓
5. 提取 "Program data:" 日志
   ↓
6. Base64 解码
   ↓
7. Borsh 反序列化
   ↓
8. 格式化输出 VaultCreatedEvent
```

### 轮询模式

```
1. 每 N 秒查询一次
   ↓
2. 获取最新交易签名
   ↓
3. 获取交易详情
   ↓
4. 检查交易日志
   ↓
5. 解析事件（同 WebSocket）
```

## 🛠️ 开发指南

### 添加新的订阅类型

1. 在 `WebSocketService` 中添加新方法：

```rust
pub async fn subscribe_slots(&self) -> Result<(), Box<dyn std::error::Error>> {
    let (mut stream, shutdown_handle) = self.client
        .slot_subscribe()
        .await?;
    
    while let Some(slot_info) = stream.next().await {
        println!("Current slot: {}", slot_info.slot);
    }
    
    shutdown_handle();
    Ok(())
}
```

2. 在 `WebSocketListenerController` 中调用。

### 实现自动重连

```rust
loop {
    match self.websocket_service.start_log_listener().await {
        Ok(_) => {
            println!("WebSocket 正常关闭");
            break;
        }
        Err(e) => {
            eprintln!("WebSocket 错误: {}，5秒后重连...", e);
            tokio::time::sleep(Duration::from_secs(5)).await;
        }
    }
}
```

## 📝 代码示例

### 切换到 WebSocket 模式

修改 `main.rs` 中的配置：

```rust
let mut config = AppConfig::default();
config.listener_mode = ListenerMode::WebSocket;
```

或者使用环境变量：

```bash
LISTENER_MODE=websocket cargo run
```

### 手动创建 WebSocket 控制器

```rust
use config::{AppConfig, ListenerMode};
use controllers::WebSocketListenerController;

let mut config = AppConfig::default();
config.listener_mode = ListenerMode::WebSocket;

let controller = WebSocketListenerController::new(config)?;
controller.start().await?;
```

## 🐛 故障排查

### 问题1：WebSocket 连接失败

**错误信息：**
```
❌ 无法创建 WebSocket 控制器: connection refused
```

**解决方案：**
1. 检查 RPC 端点是否支持 WebSocket
2. 确认防火墙设置
3. 尝试使用公共 RPC 端点：
   - Devnet: `https://api.devnet.solana.com`
   - Mainnet: `https://api.mainnet-beta.solana.com`

### 问题2：没有接收到事件

**可能原因：**
1. Program ID 不正确
2. 没有新的交易发生
3. 订阅配置错误

**调试步骤：**
1. 确认 Program ID 正确
2. 查看控制台输出是否显示 "WebSocket 连接成功"
3. 手动触发一个 CreateVault 交易测试

### 问题3：连接频繁断开

**解决方案：**
1. 实现自动重连机制（见上文）
2. 使用更稳定的 RPC 提供商
3. 添加心跳检测

## 🎯 性能优化建议

1. **使用连接池**：对于多个订阅，复用 PubsubClient
2. **批量处理**：累积多个事件后批量处理
3. **异步处理**：使用 tokio 的并发能力
4. **错误重试**：实现指数退避重连策略

## 📚 参考资料

- [Solana PubsubClient 文档](https://docs.rs/solana-pubsub-client/)
- [Solana WebSocket API](https://docs.solana.com/api/websocket)
- [Anchor Client 示例](https://github.com/solana-foundation/anchor/tree/master/client/example)

## ✅ 总结

现在你的项目支持两种监听模式：

- **默认轮询模式**：稳定可靠，适合大多数场景
- **WebSocket 模式**：实时响应，适合需要低延迟的场景

通过环境变量 `LISTENER_MODE` 轻松切换！
