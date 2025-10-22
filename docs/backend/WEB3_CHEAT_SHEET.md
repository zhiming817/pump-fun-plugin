# Web3 后端速查表 (Cheat Sheet)

> 快速查阅关键概念和代码片段

---

## 🎯 核心概念 5 分钟速览

### Web3 后端 = 链上数据的"监听者"和"服务者"

```
传统后端：处理请求 → 执行逻辑 → 存储数据
Web3 后端：监听事件 → 解析数据 → 索引存储 → 提供查询
```

**关键职责：**
1. 🎧 **监听**链上事件（轮询 / WebSocket）
2. 🔍 **解析**事件数据（Base64 + Borsh）
3. 💾 **存储**到数据库（快速查询）
4. 🌐 **提供** HTTP API（服务前端）

---

## 📊 概念对照表

| 传统概念 | Web3 等价物 | 一句话解释 |
|---------|------------|----------|
| 数据库 | 区块链 | 分布式、不可篡改的账本 |
| API 调用 | RPC 调用 | 与区块链节点通信 |
| 数据库触发器 | 区块链事件 | 合约执行后发出通知 |
| 主键 ID | 交易签名 | 唯一标识一笔交易 |
| JSON | Borsh | Solana 的序列化格式 |
| WHERE 查询 | 链下索引 | 区块链不支持复杂查询 |
| JWT 认证 | 钱包签名 | 私钥签名验证身份 |

---

## ⚡ 10 个最常用的代码片段

### 1. 创建 RPC 客户端

```rust
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_commitment_config::CommitmentConfig;

let rpc = RpcClient::new_with_commitment(
    "https://api.devnet.solana.com",
    CommitmentConfig::confirmed(),
);
```

### 2. 查询程序的交易

```rust
use solana_sdk::pubkey::Pubkey;

let program_id = Pubkey::from_str("YOUR_PROGRAM_ID")?;
let signatures = rpc.get_signatures_for_address(&program_id).await?;
```

### 3. 获取交易详情

```rust
use solana_transaction_status::UiTransactionEncoding;

let sig = Signature::from_str("5J7xQ3k...")?;
let tx = rpc.get_transaction(&sig, UiTransactionEncoding::Json).await?;
```

### 4. 提取日志

```rust
if let Some(meta) = tx.transaction.meta {
    if let Some(logs) = meta.log_messages {
        for log in logs {
            if log.contains("Program data:") {
                // 找到事件数据
            }
        }
    }
}
```

### 5. Base64 解码

```rust
use base64::{engine::general_purpose, Engine};

let base64_str = "YWJjZGVmZ2hpams...";
let bytes = general_purpose::STANDARD.decode(base64_str)?;
```

### 6. Borsh 反序列化

```rust
use borsh::BorshDeserialize;

#[derive(BorshDeserialize)]
struct CreateEvent {
    pub name: String,
    pub symbol: String,
    // ... 字段顺序必须与合约一致！
}

let event_data = &bytes[8..];  // 跳过前 8 字节鉴别器
let event = CreateEvent::try_from_slice(event_data)?;
```

### 7. 保存到数据库 (SQLx)

```rust
sqlx::query!(
    "INSERT INTO create_events (name, symbol, mint) VALUES (?, ?, ?)",
    event.name,
    event.symbol,
    event.mint.to_string(),
)
.execute(&pool)
.await?;
```

### 8. WebSocket 订阅

```rust
use serde_json::json;

let subscribe = json!({
    "jsonrpc": "2.0",
    "id": 1,
    "method": "logsSubscribe",
    "params": [{"mentions": ["PROGRAM_ID"]}]
});

ws_stream.send(Message::Text(subscribe.to_string())).await?;
```

### 9. HTTP API 端点 (Axum)

```rust
use axum::{routing::get, Router};

async fn get_events() -> Json<Vec<Event>> {
    // 查询数据库
    Json(events)
}

let app = Router::new()
    .route("/api/events", get(get_events));
```

### 10. 错误处理

```rust
match CreateEvent::try_from_slice(data) {
    Ok(event) => {
        database.save(event).await;
    }
    Err(e) => {
        eprintln!("解析失败: {}", e);
        // 记录错误，继续处理下一条
    }
}
```

---

## 🔍 调试命令速查

### Solana CLI

```bash
# 查看账户余额
solana balance YOUR_ADDRESS --url devnet

# 查看交易详情
solana confirm SIGNATURE --url devnet

# 获取测试币
solana airdrop 2 YOUR_ADDRESS --url devnet
```

### RPC 测试

```bash
# 健康检查
curl https://api.devnet.solana.com \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'

# 获取最新区块
curl https://api.devnet.solana.com \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getSlot"}'
```

### 数据库查询

```sql
-- 最近 10 条事件
SELECT * FROM create_events ORDER BY id DESC LIMIT 10;

-- 按创建者查询
SELECT * FROM create_events WHERE creator = 'xxx';

-- 统计总数
SELECT COUNT(*) FROM create_events;

-- 查看表结构
DESCRIBE create_events;
```

### API 测试

```bash
# 健康检查
curl http://localhost:3000/health

# 获取最近事件
curl http://localhost:3000/api/events/recent/10 | jq

# 统计
curl http://localhost:3000/api/events/count
```

---

## ⚠️ 5 个最常见的陷阱

### 1. ❌ Borsh 字段顺序错误

```rust
// 错误：顺序与合约不一致
#[derive(BorshDeserialize)]
struct CreateEvent {
    pub creator: Pubkey,  // 如果合约是 name 在前，会解析失败！
    pub name: String,
}

// 正确：与合约定义完全一致
#[derive(BorshDeserialize)]
struct CreateEvent {
    pub name: String,     // 必须与合约顺序匹配
    pub symbol: String,
    pub creator: Pubkey,
}
```

### 2. ❌ 忘记跳过事件鉴别器

```rust
// 错误：直接反序列化
let event = CreateEvent::try_from_slice(&bytes)?;  // 失败！

// 正确：跳过前 8 字节
let event_data = &bytes[8..];
let event = CreateEvent::try_from_slice(event_data)?;
```

### 3. ❌ 不检查交易是否成功

```rust
// 错误：处理所有交易
process_transaction(tx);

// 正确：只处理成功的交易
if let Some(meta) = tx.transaction.meta {
    if meta.err.is_none() {  // 确保交易成功
        process_transaction(tx);
    }
}
```

### 4. ❌ RPC 请求过快被限流

```rust
// 错误：循环中快速请求
for sig in signatures {
    let tx = rpc.get_transaction(&sig).await?;
}

// 正确：添加延迟或并发控制
for sig in signatures {
    let tx = rpc.get_transaction(&sig).await?;
    tokio::time::sleep(Duration::from_millis(100)).await;
}
```

### 5. ❌ WebSocket 断开后不重连

```rust
// 错误：连接断开程序就退出了
let (ws, _) = connect_async(url).await?;
while let Some(msg) = ws.next().await {
    process(msg);
}

// 正确：自动重连
loop {
    match connect_and_listen().await {
        Ok(_) => println!("连接断开"),
        Err(e) => eprintln!("错误: {}", e),
    }
    tokio::time::sleep(Duration::from_secs(3)).await;
}
```

---

## 📐 数据结构设计模板

### 事件结构体

```rust
use borsh::BorshDeserialize;
use solana_sdk::pubkey::Pubkey;

#[derive(Debug, Clone, BorshDeserialize)]
pub struct CreateEvent {
    // 字符串类型 (Borsh: 4字节长度 + UTF-8 内容)
    pub name: String,
    pub symbol: String,
    pub uri: String,
    
    // 公钥类型 (固定 32 字节)
    pub mint: Pubkey,
    pub creator: Pubkey,
    
    // 数字类型
    pub timestamp: i64,        // 有符号 64 位
    pub amount: u64,           // 无符号 64 位
    pub price: u128,           // 无符号 128 位
    
    // 布尔类型 (1 字节)
    pub is_active: bool,
}
```

### 数据库表设计

```sql
CREATE TABLE create_events (
    -- 主键
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- 链上唯一标识
    signature VARCHAR(128) UNIQUE NOT NULL,
    slot BIGINT NOT NULL,
    block_time BIGINT,
    
    -- 事件数据
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    uri TEXT,
    mint VARCHAR(64) NOT NULL,
    creator VARCHAR(64) NOT NULL,
    timestamp BIGINT NOT NULL,
    
    -- 金额字段 (使用 BIGINT 存储)
    amount BIGINT UNSIGNED,
    
    -- 索引 (常查询的字段)
    INDEX idx_mint (mint),
    INDEX idx_creator (creator),
    INDEX idx_timestamp (timestamp),
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🎛️ 配置文件模板

### config.yaml

```yaml
# Solana 网络配置
solana:
  active_network: devnet  # devnet | mainnet | testnet
  
  networks:
    devnet:
      rpc_url: "https://api.devnet.solana.com"
    mainnet:
      rpc_url: "https://api.mainnet-beta.solana.com"

# 程序配置
vault:
  program_id: "YOUR_PROGRAM_ID"

# 监听器配置
listener:
  mode: "websocket"  # polling | websocket
  poll_interval_secs: 5
  event_parse: "create"  # create | trade | both

# 数据库配置
database:
  type: "mysql"
  mysql_host: "127.0.0.1"
  mysql_port: 3306
  mysql_user: "root"
  mysql_password: "password"
  mysql_database: "pumpfun"
```

---

## 🚀 项目启动命令

```bash
# 开发环境
cargo run

# WebSocket 模式
export LISTENER_MODE=websocket
cargo run

# 启用 HTTP API
export ENABLE_HTTP_API=true
cargo run

# 生产环境（优化编译）
cargo run --release

# 后台运行
nohup cargo run --release > output.log 2>&1 &
```

---

## 📊 性能优化清单

- [ ] **数据库索引**：为常查询字段添加索引
- [ ] **并发控制**：使用 `buffer_unordered` 限制并发数
- [ ] **批量插入**：使用事务批量写入数据库
- [ ] **连接池**：配置合理的数据库连接池大小
- [ ] **缓存**：使用 `Arc<RwLock<HashMap>>` 缓存热数据
- [ ] **限流**：RPC 请求添加延迟避免限流
- [ ] **重连机制**：WebSocket 断开自动重连
- [ ] **错误处理**：不要让一个错误导致整个程序崩溃

---

## 🔗 快速链接

### 在线工具

- [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet)
- [Solana Explorer (Mainnet)](https://explorer.solana.com/)
- [Solscan](https://solscan.io/)
- [Solana Beach](https://solanabeach.io/)

### 文档

- [Solana 官方文档](https://docs.solana.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Anchor 框架](https://www.anchor-lang.com/)
- [Borsh 规范](https://borsh.io/)

### 本项目文档

- [学习路线图](./0.WEB3_LEARNING_PATH.md)
- [完整教程](./WEB3_BACKEND_TUTORIAL.md)
- [快速参考](./WEB3_QUICK_REFERENCE.md)
- [实践指南](./HANDS_ON_PRACTICE.md)

---

## 🎯 记住这些要点

1. **Web3 后端不执行业务逻辑**，只监听和索引数据
2. **Borsh 字段顺序必须与合约一致**，否则解析失败
3. **事件数据前 8 字节是鉴别器**，需要跳过
4. **区块链查询慢且贵**，需要链下数据库索引
5. **WebSocket 会断开**，需要重连机制
6. **RPC 有限流**，不要请求太快
7. **只处理成功的交易**，检查 `meta.err`
8. **异步编程用 tokio**，不要阻塞主线程

---

## 💡 一句话总结

> **Web3 后端就是把链上发生的事情（事件）搬运到链下数据库，方便快速查询和展示。**

---

**需要更多细节？** 查看完整教程 📖 [WEB3_BACKEND_TUTORIAL.md](./WEB3_BACKEND_TUTORIAL.md)


