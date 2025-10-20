# Solana RPC 配置

## 当前使用的节点

### ZAN 节点（Devnet）

**HTTP RPC 端点：**
```
https://api.zan.top/node/v1/solana/devnet/55c625d41c924f97971cdd05bb533048
```

**WebSocket 端点：**
```
wss://api.zan.top/node/ws/v1/solana/devnet/55c625d41c924f97971cdd05bb533048
```

**特点：**
- ✅ 同时支持 HTTP 和 WebSocket
- ✅ 专用 API Key
- ✅ 更稳定的连接
- ✅ 更好的性能

## 使用方式

### 默认配置（已配置）

默认使用 ZAN 节点，无需额外设置：

```bash
cargo run
```

### 使用轮询模式

```bash
cargo run
# 或
export LISTENER_MODE=polling
cargo run
```

### 使用 WebSocket 模式

```bash
export LISTENER_MODE=websocket
cargo run
```

### 自定义端点

如果需要使用其他端点，可以通过环境变量覆盖：

```bash
# HTTP 端点
export SOLANA_RPC_URL="https://api.devnet.solana.com"
export LISTENER_MODE=polling
cargo run

# WebSocket 端点（会自动转换）
export SOLANA_RPC_URL="https://api.devnet.solana.com"
export LISTENER_MODE=websocket
cargo run
```

## 其他可用节点

### 官方节点（Devnet）

**HTTP:**
```
https://api.devnet.solana.com
```

**WebSocket:**
```
wss://api.devnet.solana.com
```

### 官方节点（Mainnet）

**HTTP:**
```
https://api.mainnet-beta.solana.com
```

**WebSocket:**
```
wss://api.mainnet-beta.solana.com
```

### Nodit 节点（之前使用的）

**HTTP:**
```
https://solana-devnet.nodit.io/g_geDW2RLecIkMAlMGV6TL6veVho5cNS
```

## URL 转换规则

程序会自动将 HTTP URL 转换为 WebSocket URL：

1. **标准节点**：
   - `https://api.devnet.solana.com` → `wss://api.devnet.solana.com`
   - `http://localhost:8899` → `ws://localhost:8899`

2. **ZAN 节点（特殊处理）**：
   - `https://api.zan.top/node/v1/...` → `wss://api.zan.top/node/ws/v1/...`
   - 自动将 `/node/v1/` 替换为 `/node/ws/v1/`

## 配置文件位置

配置在 `src/config.rs` 中的 `AppConfig::default()` 方法：

```rust
impl Default for AppConfig {
    fn default() -> Self {
        Self {
            rpc_url: "https://api.zan.top/node/v1/solana/devnet/55c625d41c924f97971cdd05bb533048".to_string(),
            program_id: "HZWKVfammvEHaNfPnYTppEgXYppZWfqPiGgxwgAjEdVv".to_string(),
            poll_interval_secs: 5,
            listener_mode: ListenerMode::Polling,
        }
    }
}
```

## 性能对比

| 节点 | 延迟 | 稳定性 | WebSocket 支持 | 备注 |
|------|------|--------|----------------|------|
| ZAN | 低 | 高 | ✅ | 推荐，专用 API Key |
| 官方 Devnet | 中 | 中 | ✅ | 免费，可能限流 |
| 官方 Mainnet | 低 | 高 | ✅ | 生产环境 |
| Nodit | 中 | 中 | ❓ | 之前使用 |

## 故障排查

### 连接失败

如果遇到连接问题，可以尝试：

1. **检查网络连接**
2. **验证 API Key**（如果使用需要 Key 的节点）
3. **切换节点**：
   ```bash
   export SOLANA_RPC_URL="https://api.devnet.solana.com"
   cargo run
   ```
4. **查看详细日志**（程序会输出连接的 URL）

### WebSocket 不工作

1. 确认节点支持 WebSocket
2. 检查防火墙设置
3. 尝试使用轮询模式：
   ```bash
   export LISTENER_MODE=polling
   cargo run
   ```

## 环境变量完整列表

```bash
# 基础配置
export SOLANA_RPC_URL="https://api.zan.top/node/v1/solana/devnet/55c625d41c924f97971cdd05bb533048"
export VAULT_PROGRAM_ID="HZWKVfammvEHaNfPnYTppEgXYppZWfqPiGgxwgAjEdVv"

# 监听模式配置
export LISTENER_MODE="websocket"  # 或 "polling"
export POLL_INTERVAL_SECS="5"     # 仅轮询模式使用
```
