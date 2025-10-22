# Web3 后端快速参考手册

> 实战速查 - 有传统后端经验的开发者快速上手

---

## 🎯 核心概念对照表

| 你熟悉的 | Web3 等价物 | 说明 |
|---------|------------|------|
| **数据库** | 区块链 | 存储数据，但不可修改 |
| **API 调用** | RPC 调用 | 查询区块链数据 |
| **数据库触发器** | 区块链事件 | 合约执行后发出通知 |
| **主键 ID** | 交易签名 | 唯一标识一笔交易 |
| **JSON** | Borsh | Solana 的序列化格式 |
| **WHERE 查询** | 链下索引 | 区块链不支持复杂查询 |
| **用户认证** | 钱包签名 | 私钥签名验证身份 |

---

## 📋 常用代码片段

### 1. 连接 Solana 区块链

```rust
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_commitment_config::CommitmentConfig;

// 创建 RPC 客户端
let rpc_client = RpcClient::new_with_commitment(
    "https://api.devnet.solana.com",
    CommitmentConfig::confirmed(),
);

// 获取最新区块高度
let slot = rpc_client.get_slot().await?;
println!("当前区块: {}", slot);

// 获取余额
let balance = rpc_client.get_balance(&pubkey).await?;
println!("余额: {} lamports", balance);
```

### 2. 查询程序的交易

```rust
use solana_sdk::pubkey::Pubkey;
use std::str::FromStr;

let program_id = Pubkey::from_str("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P")?;

// 获取程序的最近交易
let signatures = rpc_client
    .get_signatures_for_address(&program_id)
    .await?;

for sig_info in signatures {
    println!("交易: {}", sig_info.signature);
    println!("时间: {:?}", sig_info.block_time);
}
```

### 3. 获取交易详情

```rust
use solana_sdk::signature::Signature;
use solana_transaction_status::UiTransactionEncoding;

let signature = Signature::from_str("5J7xQ3k...")?;

let tx = rpc_client
    .get_transaction(&signature, UiTransactionEncoding::Json)
    .await?;

// 提取日志
if let Some(meta) = tx.transaction.meta {
    if let Some(logs) = meta.log_messages {
        for log in logs {
            println!("{}", log);
        }
    }
}
```

### 4. 解析事件数据

```rust
use base64::{engine::general_purpose, Engine};
use borsh::BorshDeserialize;

// 定义事件结构（必须与合约一致！）
#[derive(Debug, BorshDeserialize)]
pub struct CreateEvent {
    pub name: String,
    pub symbol: String,
    pub mint: Pubkey,
    pub creator: Pubkey,
    pub timestamp: i64,
}

// 从日志解析
fn parse_event(log_line: &str) -> Option<CreateEvent> {
    // 1. 检查日志格式
    if !log_line.contains("Program data:") {
        return None;
    }
    
    // 2. 提取 base64 字符串
    let base64_str = log_line
        .split("Program data: ")
        .nth(1)?
        .trim();
    
    // 3. 解码
    let bytes = general_purpose::STANDARD
        .decode(base64_str)
        .ok()?;
    
    // 4. 跳过前 8 字节（事件鉴别器）
    let event_data = &bytes[8..];
    
    // 5. Borsh 反序列化
    CreateEvent::try_from_slice(event_data).ok()
}
```

### 5. WebSocket 实时监听

```rust
use tokio_tungstenite::{connect_async, tungstenite::Message};
use futures_util::StreamExt;
use serde_json::json;

let wss_url = "wss://api.devnet.solana.com";
let (mut ws_stream, _) = connect_async(wss_url).await?;

// 订阅程序日志
let subscribe_msg = json!({
    "jsonrpc": "2.0",
    "id": 1,
    "method": "logsSubscribe",
    "params": [
        {
            "mentions": ["6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"]
        },
        {
            "commitment": "confirmed"
        }
    ]
});

ws_stream.send(Message::Text(subscribe_msg.to_string())).await?;

// 接收消息
while let Some(msg) = ws_stream.next().await {
    match msg? {
        Message::Text(text) => {
            println!("收到消息: {}", text);
            // 解析并处理事件
        }
        _ => {}
    }
}
```

### 6. 存储到数据库（SQLx）

```rust
use sqlx::mysql::MySqlPool;

// 连接数据库
let pool = MySqlPool::connect("mysql://root:password@localhost/db").await?;

// 保存事件
sqlx::query!(
    "INSERT INTO create_events (name, symbol, mint, creator, timestamp)
     VALUES (?, ?, ?, ?, ?)",
    event.name,
    event.symbol,
    event.mint.to_string(),
    event.creator.to_string(),
    event.timestamp,
)
.execute(&pool)
.await?;
```

### 7. HTTP API（Axum）

```rust
use axum::{
    routing::get,
    Router,
    Json,
    extract::{Path, State},
};
use std::sync::Arc;

#[derive(Clone)]
struct AppState {
    db: Arc<MySqlPool>,
}

async fn get_events(
    State(state): State<AppState>,
) -> Json<Vec<CreateEvent>> {
    let events = sqlx::query_as!(
        CreateEvent,
        "SELECT * FROM create_events ORDER BY timestamp DESC LIMIT 10"
    )
    .fetch_all(&state.db)
    .await
    .unwrap();
    
    Json(events)
}

// 创建路由
let app = Router::new()
    .route("/api/events", get(get_events))
    .with_state(AppState { db: Arc::new(pool) });

// 启动服务器
axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
    .serve(app.into_make_service())
    .await?;
```

---

## 🔍 调试技巧

### 1. 在 Solana Explorer 查看交易

```bash
# 复制交易签名
signature="5J7xQ3k2mN8pF9rA..."

# 在浏览器打开
echo "https://explorer.solana.com/tx/$signature?cluster=devnet"

# 查看 "Transaction Logs" 找到 "Program data:" 行
```

### 2. 手动解码 Base64 数据

```rust
// 从 Explorer 复制 base64 字符串
let base64_data = "AQIDBAUG...";

// 解码
let bytes = general_purpose::STANDARD.decode(base64_data)?;

// 打印十六进制（用于调试）
println!("Hex: {:02x?}", bytes);

// 打印前 8 字节（鉴别器）
println!("Discriminator: {:02x?}", &bytes[0..8]);

// 尝试反序列化
let event = CreateEvent::try_from_slice(&bytes[8..])?;
println!("{:#?}", event);
```

### 3. 测试 RPC 连接

```bash
# 使用 curl 测试
curl https://api.devnet.solana.com \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getHealth"
  }'

# 预期响应: {"jsonrpc":"2.0","result":"ok","id":1}
```

### 4. 打印详细日志

```rust
// 添加到 Cargo.toml
// [dependencies]
// tracing = "0.1"
// tracing-subscriber = "0.3"

// 初始化日志
tracing_subscriber::fmt()
    .with_max_level(tracing::Level::DEBUG)
    .init();

// 使用
use tracing::{info, debug, error};

debug!("原始数据: {:02x?}", bytes);
info!(name = %event.name, "解析成功");
error!(error = %e, "解析失败");
```

---

## 🎮 实战场景

### 场景 1: 监听代币创建

```rust
async fn monitor_token_creation() {
    let rpc_client = RpcClient::new_with_commitment(
        "https://api.devnet.solana.com",
        CommitmentConfig::confirmed(),
    );
    
    let program_id = Pubkey::from_str("YOUR_PROGRAM_ID").unwrap();
    let mut last_signature = None;
    
    loop {
        // 1. 获取最新交易
        let sigs = rpc_client
            .get_signatures_for_address(&program_id)
            .await
            .unwrap();
        
        for sig_info in sigs {
            // 2. 跳过已处理的
            if Some(&sig_info.signature) == last_signature.as_ref() {
                break;
            }
            
            // 3. 获取交易详情
            let sig = Signature::from_str(&sig_info.signature).unwrap();
            let tx = rpc_client
                .get_transaction(&sig, UiTransactionEncoding::Json)
                .await
                .unwrap();
            
            // 4. 解析事件
            if let Some(meta) = tx.transaction.meta {
                if let Some(logs) = meta.log_messages {
                    for log in logs {
                        if let Some(event) = parse_event(&log) {
                            println!("🎉 新代币创建: {} ({})", event.name, event.symbol);
                            
                            // 5. 保存到数据库
                            save_to_db(&event).await;
                        }
                    }
                }
            }
        }
        
        // 更新最后处理的签名
        if let Some(first) = sigs.first() {
            last_signature = Some(first.signature.clone());
        }
        
        // 6. 等待 5 秒
        tokio::time::sleep(Duration::from_secs(5)).await;
    }
}
```

### 场景 2: 实时推送到前端

```rust
use tokio::sync::broadcast;

// 创建广播通道
let (tx, _rx) = broadcast::channel::<CreateEvent>(100);

// 后端监听线程
let tx_clone = tx.clone();
tokio::spawn(async move {
    loop {
        // 监听到事件
        let event = listen_for_event().await;
        
        // 广播给所有订阅者
        let _ = tx_clone.send(event);
    }
});

// WebSocket 连接处理
async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(tx): State<broadcast::Sender<CreateEvent>>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| async move {
        let mut rx = tx.subscribe();
        
        while let Ok(event) = rx.recv().await {
            // 发送给前端
            socket.send(Message::Text(
                serde_json::to_string(&event).unwrap()
            )).await;
        }
    })
}
```

### 场景 3: 批量同步历史数据

```rust
async fn sync_historical_data() {
    let mut before_signature = None;
    let mut total_count = 0;
    
    loop {
        // 获取一批交易（最多 1000 条）
        let mut config = GetConfirmedSignaturesForAddress2Config::default();
        config.before = before_signature;
        config.limit = Some(1000);
        
        let sigs = rpc_client
            .get_signatures_for_address_with_config(&program_id, config)
            .await?;
        
        if sigs.is_empty() {
            break;  // 没有更多数据
        }
        
        // 处理这批交易
        for sig_info in &sigs {
            let sig = Signature::from_str(&sig_info.signature)?;
            let tx = rpc_client.get_transaction(&sig, UiTransactionEncoding::Json).await?;
            
            process_transaction(tx).await;
            total_count += 1;
        }
        
        // 更新分页标记
        before_signature = Some(sigs.last().unwrap().signature.clone());
        
        println!("已同步 {} 条交易...", total_count);
        
        // 避免 RPC 限流
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
    
    println!("✅ 同步完成，共 {} 条交易", total_count);
}
```

---

## ⚠️ 常见陷阱

### 1. Borsh 字段顺序必须匹配

```rust
// ❌ 错误：字段顺序与合约不一致
#[derive(BorshDeserialize)]
pub struct CreateEvent {
    pub creator: Pubkey,  // 如果合约是 name 在前，这会解析错误！
    pub name: String,
}

// ✅ 正确：与合约定义完全一致
#[derive(BorshDeserialize)]
pub struct CreateEvent {
    pub name: String,     // 顺序必须匹配
    pub symbol: String,
    pub mint: Pubkey,
    pub creator: Pubkey,
}
```

### 2. 忘记跳过事件鉴别器

```rust
// ❌ 错误
let event = CreateEvent::try_from_slice(&decoded_bytes)?;  // 会失败！

// ✅ 正确
let event_data = &decoded_bytes[8..];  // 跳过前 8 字节
let event = CreateEvent::try_from_slice(event_data)?;
```

### 3. 交易可能失败

```rust
// 检查交易是否成功
if let Some(meta) = tx.transaction.meta {
    if meta.err.is_some() {
        println!("⚠️ 交易失败，跳过");
        continue;
    }
    
    // 只处理成功的交易
    process_logs(meta.log_messages);
}
```

### 4. RPC 限流

```rust
// ❌ 太快会被限流
for sig in signatures {
    let tx = rpc_client.get_transaction(&sig).await?;
}

// ✅ 添加延迟
for sig in signatures {
    let tx = rpc_client.get_transaction(&sig).await?;
    tokio::time::sleep(Duration::from_millis(100)).await;
}

// ✅ 或使用并发控制
use futures::stream::{self, StreamExt};

stream::iter(signatures)
    .map(|sig| async move {
        rpc_client.get_transaction(&sig).await
    })
    .buffer_unordered(10)  // 最多 10 个并发
    .collect::<Vec<_>>()
    .await;
```

### 5. WebSocket 会断开

```rust
// ❌ 不处理断开
let (ws, _) = connect_async(url).await?;
while let Some(msg) = ws.next().await {
    process(msg);
}
// 断开后程序就退出了

// ✅ 自动重连
loop {
    match connect_and_listen().await {
        Ok(_) => println!("WebSocket 断开"),
        Err(e) => eprintln!("连接错误: {}", e),
    }
    println!("3 秒后重连...");
    tokio::time::sleep(Duration::from_secs(3)).await;
}
```

---

## 📊 性能优化

### 1. 批量插入数据库

```rust
// ❌ 慢：每条单独插入
for event in events {
    sqlx::query!("INSERT INTO ...").execute(&pool).await?;
}

// ✅ 快：批量插入
let mut tx = pool.begin().await?;
for event in events {
    sqlx::query!("INSERT INTO ...")
        .execute(&mut tx)
        .await?;
}
tx.commit().await?;
```

### 2. 并发处理交易

```rust
use futures::future::join_all;

let tasks: Vec<_> = signatures
    .into_iter()
    .map(|sig| {
        let client = rpc_client.clone();
        async move {
            let tx = client.get_transaction(&sig).await?;
            process_transaction(tx).await
        }
    })
    .collect();

join_all(tasks).await;  // 并发执行
```

### 3. 缓存常用数据

```rust
use std::sync::Arc;
use tokio::sync::RwLock;
use std::collections::HashMap;

#[derive(Clone)]
struct Cache {
    tokens: Arc<RwLock<HashMap<String, TokenInfo>>>,
}

async fn get_token_info(mint: &str, cache: &Cache) -> TokenInfo {
    // 先查缓存
    {
        let read = cache.tokens.read().await;
        if let Some(info) = read.get(mint) {
            return info.clone();
        }
    }
    
    // 缓存未命中，从数据库查
    let info = fetch_from_db(mint).await;
    
    // 写入缓存
    {
        let mut write = cache.tokens.write().await;
        write.insert(mint.to_string(), info.clone());
    }
    
    info
}
```

---

## 🛠️ 工具和库

### 必备依赖

```toml
[dependencies]
# Solana 核心
solana-client = "2.1"
solana-sdk = "2.1"
solana-transaction-status = "2.1"

# 异步运行时
tokio = { version = "1", features = ["full"] }

# 序列化
borsh = "1.5"
serde = { version = "1", features = ["derive"] }
serde_json = "1"

# 数据库
sqlx = { version = "0.8", features = ["runtime-tokio-native-tls", "mysql"] }

# HTTP 服务器
axum = "0.7"

# WebSocket
tokio-tungstenite = "0.21"
futures-util = "0.3"

# 工具
base64 = "0.22"
anyhow = "1"
tracing = "0.1"
tracing-subscriber = "0.3"
```

### 推荐工具

```bash
# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# 查看账户
solana account <ADDRESS> --url devnet

# 查看交易
solana confirm <SIGNATURE> --url devnet

# Anchor CLI (如果需要开发合约)
cargo install --git https://github.com/coral-xyz/anchor anchor-cli
```

---

## 🎯 快速启动检查清单

- [ ] 安装 Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- [ ] 克隆项目: `git clone ...`
- [ ] 安装 MySQL/PostgreSQL
- [ ] 创建数据库: `mysql -u root -p < data/init_mysql.sql`
- [ ] 配置 RPC 端点: 编辑 `config.yaml`
- [ ] 设置程序 ID: 编辑 `config.yaml`
- [ ] 运行项目: `cargo run`
- [ ] 测试 API: `curl http://localhost:3000/health`
- [ ] 触发事件: 在前端创建代币
- [ ] 查看日志: 观察后端输出
- [ ] 查询数据库: `SELECT * FROM create_events;`

---

## 📚 学习资源

### 官方文档
- [Solana 文档](https://docs.solana.com/) - 必读
- [Solana Cookbook](https://solanacookbook.com/) - 代码示例
- [Anchor 文档](https://www.anchor-lang.com/) - 智能合约框架

### 实用工具
- [Solana Explorer](https://explorer.solana.com/) - 查看交易
- [Solana Beach](https://solanabeach.io/) - 区块浏览器
- [Solscan](https://solscan.io/) - 另一个浏览器

### 社区
- [Solana Discord](https://discord.gg/solana)
- [Solana Stack Exchange](https://solana.stackexchange.com/)

---

## 💡 下一步

1. **运行示例**
   ```bash
   cd backend/rust_backend
   cargo run
   ```

2. **阅读源码**
   - 从 `main.rs` 开始
   - 理解 `event_parser.rs` 的解析逻辑
   - 查看 `solana_service.rs` 的 RPC 调用

3. **动手修改**
   - 添加新的事件类型
   - 实现新的 API 端点
   - 优化数据库查询

4. **部署上线**
   - 切换到 mainnet
   - 添加监控和告警
   - 配置负载均衡

---

**有问题？** 查看 [完整教程](./WEB3_BACKEND_TUTORIAL.md) 或项目其他文档。


