# Oath 事件监听器 - 快速开始

## 快速启动

### 1. 准备数据库

```bash
# MySQL
mysql -u root -p
CREATE DATABASE oath_events CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit

# 初始化表结构
mysql -u root -p oath_events < data/init_oath_events.sql
```

### 2. 配置文件

配置文件已创建: `config.oath.yaml`

关键配置:
- **Program ID**: `Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ` (Oath 合约)
- **Network**: Devnet
- **RPC**: `https://solana-devnet.nodit.io/g_geDW2RLecIkMAlMGV6TL6veVho5cNS`

### 3. 启动监听器

```bash
# 方式 1: 使用启动脚本（推荐）
./run_oath_listener.sh

# 方式 2: 直接运行
cargo run --release -- --config config.oath.yaml
```

## 工作流程

```
1. 用户在前端创建 Oath
   ↓
2. 合约发射 OathCreated 事件
   ↓
3. WebSocket 监听器捕获交易日志
   ↓
4. 解析事件数据:
   - oath_id
   - creator
   - token_address
   - sol_collateral
   - target_market_cap
   - start_time
   - end_time
   - timestamp
   ↓
5. 保存到 MySQL 数据库
   ↓
6. 输出确认日志
```

## 监听器输出示例

```
📡 启动 WebSocket 日志监听...
🔗 WebSocket URL: wss://solana-devnet.nodit.io/...
📍 监听程序 ID: Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ
⏳ 等待事件...

✅ WebSocket 连接成功，开始监听事件...

📝 检测到新交易: 2VDoQi...
  📊 检测到 Oath 合约事件
  ✅ 成功解析 OathCreatedEvent 数据!
============================================================
🔐 OathCreatedEvent 详情
============================================================
Oath ID: 1
创建者: 8KqZwvKGZF5jBqjEFHcJV7y4TqMr3nN2xDfPkL9WqYz3
Token 地址: So11111111111111111111111111111111111111112
SOL 抵押: 1.5 SOL (1500000000 lamports)
目标市值: $1000000.0
开始时间: 1735017600
结束时间: 1767139200
创建时间戳: 1735017600
============================================================

💾 ✅ OathCreatedEvent 已成功保存到数据库
```

## 数据库查询

```sql
-- 查看所有 Oath 事件
SELECT 
    oath_id,
    creator,
    token_address,
    sol_collateral / 1000000000.0 AS sol_amount,
    target_market_cap / 1000000.0 AS target_mc_usd,
    FROM_UNIXTIME(timestamp) AS created_time
FROM oath_created_events
ORDER BY created_at DESC;

-- 统计数据
SELECT 
    COUNT(*) AS total_oaths,
    SUM(sol_collateral) / 1000000000.0 AS total_sol_locked,
    COUNT(DISTINCT creator) AS unique_creators,
    COUNT(DISTINCT token_address) AS unique_tokens
FROM oath_created_events;
```

## 文件结构

```
backend/rust_backend/
├── src/
│   ├── models/
│   │   ├── oath_created_event.rs           # 事件模型 (NEW)
│   │   └── oath_created_event_entity.rs    # 数据库实体 (NEW)
│   └── services/
│       ├── event_parser.rs                 # 添加 OathCreated 解析
│       ├── database_service.rs             # 添加保存/查询方法
│       └── websocket_service.rs            # 添加 Oath 监听逻辑
├── data/
│   └── init_oath_events.sql                # 数据库初始化 (NEW)
├── config.oath.yaml                         # Oath 配置 (NEW)
├── run_oath_listener.sh                     # 启动脚本 (NEW)
└── OATH_EVENT_LISTENER_GUIDE.md            # 完整指南 (NEW)
```

## 测试步骤

1. **启动监听器**: `./run_oath_listener.sh`
2. **创建 Oath**: 在前端创建一个新的 Oath
3. **查看日志**: 监听器会输出事件详情
4. **验证数据**: 查询数据库确认数据已保存

```sql
SELECT * FROM oath_created_events ORDER BY id DESC LIMIT 1;
```

## 故障排查

### WebSocket 连接失败
- 检查 RPC URL
- 确认网络连接
- 验证 API 密钥

### 数据库错误
```bash
# 检查 MySQL 服务
sudo systemctl status mysql

# 测试连接
mysql -u root -p -e "SHOW DATABASES;"

# 重新初始化表
mysql -u root -p oath_events < data/init_oath_events.sql
```

### 事件未捕获
- 确认 program_id 正确
- 检查合约是否已部署
- 验证前端是否调用了创建指令

## 下一步

- [ ] 添加 OathCompleted 事件监听
- [ ] 添加 OathSlashed 事件监听
- [ ] 创建 HTTP API 查询接口
- [ ] 添加实时通知推送
- [ ] 部署到生产环境

## 技术支持

详细文档: [OATH_EVENT_LISTENER_GUIDE.md](./OATH_EVENT_LISTENER_GUIDE.md)
