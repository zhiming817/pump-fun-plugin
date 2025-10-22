# Web3 后端动手实践指南

> 从零到一，跟着做就能理解 Web3 后端

---

## 🎯 学习目标

通过本实践，你将：
1. ✅ 运行一个完整的 Web3 后端监听器
2. ✅ 理解链上事件的监听和解析过程
3. ✅ 掌握从区块链到数据库的完整数据流
4. ✅ 学会调试和排查问题

**预计时间：** 2-3 小时

---

## 📋 准备工作

### 1. 环境检查

```bash
# 检查 Rust 版本
rustc --version  # 应该 >= 1.70

# 检查 MySQL（或 PostgreSQL）
mysql --version

# 检查网络连接
curl https://api.devnet.solana.com \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
  
# 应该返回: {"jsonrpc":"2.0","result":"ok","id":1}
```

### 2. 初始化数据库

```bash
# 进入后端目录
cd backend/rust_backend

# 创建数据库
mysql -u root -p

# 在 MySQL 命令行中执行
CREATE DATABASE pumpfun;
USE pumpfun;

# 导入表结构
SOURCE data/init_mysql.sql;

# 退出
EXIT;
```

### 3. 配置连接信息

```bash
# 编辑配置文件
vim config.yaml
```

检查这些配置：
```yaml
# database 部分
database:
  type: "mysql"
  mysql_host: "127.0.0.1"
  mysql_port: 3306
  mysql_user: "root"
  mysql_password: "你的密码"
  mysql_database: "pumpfun"
```

---

## 🚀 实践 1：运行轮询模式监听器

### Step 1: 启动监听器

```bash
cd backend/rust_backend

# 使用轮询模式（默认）
cargo run
```

**预期输出：**
```
🚀 启动 Solana Vault 事件监听器...

🌐 激活网络: Devnet
🔗 RPC 端点: https://api.zan.top/node/v1/solana/devnet/...
🎯 事件解析模式: Create

🔄 使用轮询模式 (每 5 秒检查一次)

📍 监听程序 ID: 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P
⏳ 开始监听...
```

### Step 2: 理解输出

```
┌─────────────────────────────────────┐
│  每 5 秒执行一次查询循环            │
└─────────────────────────────────────┘
         ↓
  查询程序的最近交易
         ↓
  跳过已处理的交易
         ↓
  发现新交易 → 获取详情
         ↓
  解析事件数据
         ↓
  保存到数据库
         ↓
  打印到控制台
```

### Step 3: 查看数据库

另开一个终端：

```bash
mysql -u root -p pumpfun

# 查询创建事件
SELECT 
    id,
    name,
    symbol,
    LEFT(mint, 10) as mint,
    LEFT(creator, 10) as creator,
    timestamp
FROM create_events
ORDER BY id DESC
LIMIT 5;
```

**如果有数据，你会看到：**
```
+----+----------+--------+------------+------------+------------+
| id | name     | symbol | mint       | creator    | timestamp  |
+----+----------+--------+------------+------------+------------+
|  1 | MyToken  | MTK    | 7xK9q2...  | 5pZn3w...  | 1698765432 |
+----+----------+--------+------------+------------+------------+
```

---

## 🎮 实践 2：触发一个创建事件

### Step 1: 启动前端

```bash
# 新开一个终端
cd ../../frontend/web

# 安装依赖（如果还没装）
npm install

# 启动开发服务器
npm run dev
```

浏览器打开: `http://localhost:5173`

### Step 2: 连接钱包

1. 安装 Phantom 钱包浏览器插件
2. 切换到 Devnet 网络
3. 在网站上点击 "Connect Wallet"
4. 如果余额为 0，获取测试币：
   ```bash
   solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet
   ```

### Step 3: 创建代币

1. 在前端找到"创建代币"功能
2. 填写信息：
   - Name: `TestToken`
   - Symbol: `TEST`
   - URI: `https://example.com/metadata.json`
3. 点击"创建"
4. 在 Phantom 钱包中确认交易
5. 等待交易确认（约 1-2 秒）

### Step 4: 观察后端日志

回到运行 `cargo run` 的终端，你应该看到：

```
📝 发现新交易: 3kR7mP9qT5w...
  🎯 检测到 Create 指令!
  📊 发现程序数据日志
  ✅ 成功解析 CreateEvent 数据!

============================================================
🪙 代币创建事件详情
============================================================
📝 名称: TestToken
🔖 符号: TEST
🆔 Mint: 7xK9q2pN8vL...
👤 创建者: 5pZn3wQr...
⏰ 时间戳: 1698765432
💰 Token 储备: 1000000000
💎 SOL 储备: 30000000000
============================================================

💾 已保存到数据库
```

### Step 5: 验证数据

```bash
# 查询数据库
mysql -u root -p pumpfun -e "
  SELECT name, symbol, timestamp 
  FROM create_events 
  ORDER BY id DESC 
  LIMIT 1;
"

# 应该看到刚才创建的 TestToken
```

---

## 🔬 实践 3：深入理解事件解析

### Step 1: 在 Solana Explorer 查看交易

1. 复制后端日志中的交易签名，例如：`3kR7mP9qT5w...`
2. 打开浏览器访问：
   ```
   https://explorer.solana.com/tx/3kR7mP9qT5w...?cluster=devnet
   ```
3. 找到 "Transaction Logs" 部分
4. 找到包含 `Program data:` 的那一行

**示例：**
```
Program 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P invoke [1]
Program log: Instruction: Create
Program data: YWJjZGVmZ2hpams...  ← 这就是事件数据的 base64 编码
Program 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P consumed 45678 compute units
Program 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P success
```

### Step 2: 手动解析数据

创建一个测试文件：

```bash
cd backend/rust_backend
touch src/bin/parse_test.rs
```

```rust
// src/bin/parse_test.rs
use base64::{engine::general_purpose, Engine};
use borsh::BorshDeserialize;
use solana_sdk::pubkey::Pubkey;

#[derive(Debug, BorshDeserialize)]
pub struct CreateEvent {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub mint: Pubkey,
    pub bonding_curve: Pubkey,
    pub user: Pubkey,
    pub creator: Pubkey,
    pub timestamp: i64,
    pub virtual_token_reserves: u64,
    pub virtual_sol_reserves: u64,
    pub real_token_reserves: u64,
    pub token_total_supply: u64,
}

fn main() {
    // 从 Explorer 复制的 base64 数据
    let base64_data = "YWJjZGVmZ2hpams...";  // 替换为实际数据
    
    println!("=== 开始解析 ===\n");
    
    // Step 1: Base64 解码
    println!("1️⃣ Base64 解码...");
    let decoded = general_purpose::STANDARD
        .decode(base64_data)
        .expect("Base64 解码失败");
    
    println!("   原始长度: {} bytes", decoded.len());
    println!("   前 8 字节 (鉴别器): {:02x?}", &decoded[0..8]);
    
    // Step 2: 提取事件数据
    println!("\n2️⃣ 提取事件数据 (跳过前 8 字节)...");
    let event_data = &decoded[8..];
    println!("   事件数据长度: {} bytes", event_data.len());
    
    // Step 3: Borsh 反序列化
    println!("\n3️⃣ Borsh 反序列化...");
    match CreateEvent::try_from_slice(event_data) {
        Ok(event) => {
            println!("   ✅ 解析成功!\n");
            println!("=== 事件详情 ===");
            println!("Name: {}", event.name);
            println!("Symbol: {}", event.symbol);
            println!("Mint: {}", event.mint);
            println!("Creator: {}", event.creator);
            println!("Timestamp: {}", event.timestamp);
            println!("Token Reserves: {}", event.virtual_token_reserves);
            println!("SOL Reserves: {}", event.virtual_sol_reserves);
        }
        Err(e) => {
            eprintln!("   ❌ 解析失败: {}", e);
        }
    }
}
```

运行测试：
```bash
cargo run --bin parse_test
```

### Step 3: 理解 Borsh 序列化格式

Borsh 是按字段顺序序列化的：

```
CreateEvent 的二进制布局:

[4 bytes: name 长度][N bytes: name UTF-8 字符串]
[4 bytes: symbol 长度][N bytes: symbol UTF-8 字符串]
[4 bytes: uri 长度][N bytes: uri UTF-8 字符串]
[32 bytes: mint Pubkey]
[32 bytes: bonding_curve Pubkey]
[32 bytes: user Pubkey]
[32 bytes: creator Pubkey]
[8 bytes: timestamp i64]
[8 bytes: virtual_token_reserves u64]
[8 bytes: virtual_sol_reserves u64]
[8 bytes: real_token_reserves u64]
[8 bytes: token_total_supply u64]
```

**重要：** 字段顺序必须与智能合约完全一致！

---

## 📡 实践 4：使用 WebSocket 实时监听

### Step 1: 切换到 WebSocket 模式

```bash
# 停止之前的轮询模式（Ctrl+C）

# 使用环境变量启动 WebSocket 模式
export LISTENER_MODE=websocket
cargo run
```

**或者修改配置文件：**
```yaml
# config.yaml
listener:
  mode: "websocket"  # 改为 websocket
```

### Step 2: 观察输出差异

**轮询模式：**
```
⏳ 开始监听...
[等待 5 秒]
📝 查询最新交易...
[等待 5 秒]
📝 查询最新交易...
```

**WebSocket 模式：**
```
📡 启动 WebSocket 日志监听...
🔗 WebSocket URL: wss://api.zan.top/...
✅ WebSocket 连接成功，开始监听事件...
[实时等待]
📝 检测到新交易: 3kR7mP9...  ← 立即收到通知！
```

### Step 3: 测试实时性

1. 在前端创建一个新代币
2. 观察后端日志
3. 对比两种模式的延迟：
   - **轮询模式**：最多 5 秒延迟
   - **WebSocket 模式**：几乎实时（< 1 秒）

### Step 4: 测试重连机制

```bash
# 断开网络（模拟）
# 在另一个终端：
sudo ifconfig en0 down  # macOS
# 或
sudo ip link set eth0 down  # Linux

# 观察后端日志
# 应该看到自动重连提示

# 恢复网络
sudo ifconfig en0 up  # macOS
```

---

## 🔧 实践 5：启动 HTTP API 服务

### Step 1: 启动 API 服务器

```bash
# 设置环境变量
export ENABLE_HTTP_API=true

# 启动（会同时运行监听器和 API 服务器）
cargo run
```

**输出：**
```
🌐 启动 HTTP API 服务器...
✅ HTTP API 服务器运行在: http://0.0.0.0:3000

📋 可用的 API 端点:
  GET  http://0.0.0.0:3000                      - API 信息
  GET  http://0.0.0.0:3000/health              - 健康检查
  GET  http://0.0.0.0:3000/api/events          - 获取所有事件
  GET  http://0.0.0.0:3000/api/events/recent/10 - 获取最近的 10 条事件
  GET  http://0.0.0.0:3000/api/events/count    - 统计事件总数
  GET  http://0.0.0.0:3000/api/events/mint/{mint} - 根据 mint 查询
  GET  http://0.0.0.0:3000/api/events/creator/{creator} - 根据创建者查询
```

### Step 2: 测试 API

```bash
# 健康检查
curl http://localhost:3000/health

# 获取最近 10 条事件
curl http://localhost:3000/api/events/recent/10 | jq

# 统计总数
curl http://localhost:3000/api/events/count

# 根据 mint 查询
curl "http://localhost:3000/api/events/mint/7xK9q2pN8vL..." | jq
```

### Step 3: 理解 API 响应

```json
// GET /api/events/recent/10
[
  {
    "id": 1,
    "name": "TestToken",
    "symbol": "TEST",
    "uri": "https://example.com/metadata.json",
    "mint": "7xK9q2pN8vL...",
    "bonding_curve": "3mP5kR7...",
    "user": "5pZn3wQr...",
    "creator": "5pZn3wQr...",
    "timestamp": 1698765432,
    "virtual_token_reserves": 1000000000,
    "virtual_sol_reserves": 30000000000,
    "real_token_reserves": 0,
    "token_total_supply": 1000000000,
    "signature": "3kR7mP9qT5w...",
    "slot": 250000000,
    "block_time": 1698765432
  }
]
```

### Step 4: 在前端集成

```typescript
// frontend/web/src/hooks/use-coin-api.ts
export function useRecentTokens(limit: number = 10) {
  return useQuery({
    queryKey: ['recent-tokens', limit],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3000/api/events/recent/${limit}`
      );
      return response.json();
    },
    refetchInterval: 5000,  // 每 5 秒自动刷新
  });
}

// 在组件中使用
function TokenList() {
  const { data: tokens, isLoading } = useRecentTokens(10);
  
  if (isLoading) return <div>加载中...</div>;
  
  return (
    <div>
      {tokens.map(token => (
        <div key={token.id}>
          <h3>{token.name} ({token.symbol})</h3>
          <p>创建者: {token.creator}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🐛 实践 6：调试常见问题

### 问题 1: 无法连接 RPC

**症状：**
```
❌ 无法获取交易签名: error sending request...
```

**解决步骤：**

1. 测试 RPC 连接
```bash
curl https://api.zan.top/node/v1/solana/devnet/YOUR_API_KEY \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

2. 如果失败，切换到公共端点
```yaml
# config.yaml
solana:
  networks:
    devnet:
      rpc_url: "https://api.devnet.solana.com"
```

3. 重启后端
```bash
cargo run
```

### 问题 2: 解析事件失败

**症状：**
```
❌ CreateEvent Borsh 反序列化失败: io error: unexpected end of file
```

**调试步骤：**

1. 打印原始数据
```rust
// 在 event_parser.rs 中添加
println!("原始 base64: {}", base64_data);
println!("解码后长度: {}", decoded_data.len());
println!("前 16 字节: {:02x?}", &decoded_data[0..16.min(decoded_data.len())]);
```

2. 检查结构体定义是否与合约一致
```bash
# 查看合约中的事件定义
cat ../../contract/pumpfun_oath_contract/programs/pumpfun_oath_contract/src/lib.rs
```

3. 对比字段顺序和类型

### 问题 3: 数据库连接失败

**症状：**
```
❌ 数据库连接失败: Access denied for user 'root'@'localhost'
```

**解决步骤：**

1. 检查 MySQL 服务
```bash
sudo systemctl status mysql  # Linux
# 或
brew services list  # macOS
```

2. 测试连接
```bash
mysql -u root -p -h 127.0.0.1
```

3. 检查配置
```yaml
# config.yaml
database:
  mysql_user: "root"
  mysql_password: "你的正确密码"
  mysql_host: "127.0.0.1"  # 注意不是 localhost
```

### 问题 4: 没有检测到事件

**症状：**
```
⏳ 开始监听...
[一直没有输出]
```

**检查清单：**

1. ✅ Program ID 是否正确？
```bash
# 在配置文件中检查
grep program_id config.yaml
```

2. ✅ 网络是否正确（devnet/mainnet）？
```yaml
solana:
  active_network: devnet  # 应该与合约部署的网络一致
```

3. ✅ 是否有新交易？
```bash
# 访问 Explorer 查看程序是否有交易
echo "https://explorer.solana.com/address/$(grep program_id config.yaml | awk '{print $2}' | tr -d '\"')?cluster=devnet"
```

4. ✅ 在前端手动创建一个代币测试

---

## 📊 实践 7：性能监控

### Step 1: 添加性能日志

编辑 `src/controllers/event_listener.rs`：

```rust
use std::time::Instant;

// 在 process_transaction 方法中
pub async fn process_transaction(&mut self, tx: EncodedConfirmedTransactionWithStatusMeta) {
    let start = Instant::now();
    
    // ... 原有代码 ...
    
    let duration = start.elapsed();
    println!("⏱️  处理耗时: {:?}", duration);
    
    if duration.as_secs() > 1 {
        println!("⚠️  处理较慢！");
    }
}
```

### Step 2: 统计数据

```rust
// 添加计数器
pub struct EventListenerController {
    // ... 原有字段
    stats: Arc<Mutex<Stats>>,
}

#[derive(Default)]
struct Stats {
    total_processed: u64,
    create_events: u64,
    trade_events: u64,
    parse_errors: u64,
}

// 定期打印统计
tokio::spawn(async move {
    loop {
        tokio::time::sleep(Duration::from_secs(60)).await;
        let stats = stats.lock().await;
        println!("\n📊 统计 (过去 1 分钟):");
        println!("  总交易: {}", stats.total_processed);
        println!("  创建事件: {}", stats.create_events);
        println!("  交易事件: {}", stats.trade_events);
        println!("  解析错误: {}\n", stats.parse_errors);
    }
});
```

### Step 3: 数据库性能

```bash
# 在 MySQL 中查看慢查询
mysql -u root -p pumpfun -e "
  SHOW VARIABLES LIKE 'slow_query_log';
  SET GLOBAL slow_query_log = 'ON';
  SET GLOBAL long_query_time = 1;
"

# 分析表性能
mysql -u root -p pumpfun -e "
  EXPLAIN SELECT * FROM create_events 
  WHERE creator = 'xxx' 
  ORDER BY timestamp DESC 
  LIMIT 10;
"
```

---

## 🎓 总结和下一步

### 你已经学会了

✅ **基础概念**
- 区块链、智能合约、事件的关系
- RPC 节点的作用
- Borsh 序列化格式

✅ **实战技能**
- 运行事件监听器（轮询/WebSocket）
- 解析链上事件数据
- 存储到数据库
- 提供 HTTP API

✅ **调试能力**
- 在 Solana Explorer 查看交易
- 手动解析 base64 数据
- 排查常见问题

### 进阶学习

#### 1. 添加新事件类型

```rust
// 1. 定义结构体
#[derive(Debug, BorshDeserialize)]
pub struct TradeEvent {
    pub mint: Pubkey,
    pub trader: Pubkey,
    pub sol_amount: u64,
    pub token_amount: u64,
    pub is_buy: bool,
    pub timestamp: i64,
}

// 2. 实现解析逻辑
impl EventParserService {
    pub fn parse_trade_event(&self, log: &str) -> Option<TradeEvent> {
        // ... 类似 parse_create_event
    }
}

// 3. 在控制器中处理
if log.contains("Instruction: Buy") || log.contains("Instruction: Sell") {
    if let Some(event) = parser.parse_trade_event(&log) {
        database.save_trade_event(&event).await;
    }
}
```

#### 2. 实现 WebSocket 推送给前端

```rust
use tokio::sync::broadcast;

// 创建广播频道
let (tx, _) = broadcast::channel::<CreateEvent>(100);

// 监听器发送事件
tx.send(event.clone()).ok();

// WebSocket 处理
async fn ws_handler(
    ws: WebSocketUpgrade,
    State(tx): State<broadcast::Sender<CreateEvent>>,
) -> Response {
    ws.on_upgrade(|socket| async move {
        let mut rx = tx.subscribe();
        while let Ok(event) = rx.recv().await {
            socket.send(json!(event)).await;
        }
    })
}
```

#### 3. 添加数据聚合 API

```rust
// 统计每日创建数量
#[derive(Serialize)]
struct DailyStats {
    date: String,
    count: i64,
}

async fn get_daily_stats(
    State(db): State<Arc<MySqlPool>>,
) -> Json<Vec<DailyStats>> {
    let stats = sqlx::query_as!(
        DailyStats,
        "SELECT 
            DATE(FROM_UNIXTIME(timestamp)) as date,
            COUNT(*) as count
         FROM create_events
         GROUP BY DATE(FROM_UNIXTIME(timestamp))
         ORDER BY date DESC
         LIMIT 30"
    )
    .fetch_all(&*db)
    .await
    .unwrap();
    
    Json(stats)
}
```

#### 4. 部署到生产环境

```bash
# 1. 切换到 mainnet
# config.yaml
solana:
  active_network: mainnet

# 2. 使用 systemd 管理服务
sudo nano /etc/systemd/system/solana-listener.service

# 3. 配置文件内容
[Unit]
Description=Solana Event Listener
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/backend/rust_backend
ExecStart=/usr/local/bin/cargo run --release
Restart=always

[Install]
WantedBy=multi-user.target

# 4. 启动服务
sudo systemctl enable solana-listener
sudo systemctl start solana-listener
```

### 学习资源

- 📖 [完整教程](./WEB3_BACKEND_TUTORIAL.md)
- ⚡ [快速参考](./WEB3_QUICK_REFERENCE.md)
- 🌐 [Solana 文档](https://docs.solana.com/)
- 📚 [Solana Cookbook](https://solanacookbook.com/)

---

**恭喜你完成了 Web3 后端的实践学习！** 🎉

现在你可以独立开发 Solana 的后端服务了。继续探索，构建更复杂的功能吧！


