# Oath 合约事件监听使用指南

本指南说明如何监听 Oath 合约的 `OathCreated` 事件并将数据保存到数据库。

## 系统架构

```
Oath 合约 (Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ)
    ↓ 发射 OathCreated 事件
WebSocket 监听器
    ↓ 解析事件数据
事件解析器 (EventParserService)
    ↓ 保存数据
数据库 (MySQL/PostgreSQL/SQLite)
```

## 已实现的功能

### 1. 数据模型

#### OathCreatedEvent (Borsh 反序列化)
```rust
pub struct OathCreatedEvent {
    pub oath_id: u64,              // Oath ID
    pub creator: Pubkey,           // 创建者地址
    pub token_address: Pubkey,     // Token 地址
    pub sol_collateral: u64,       // SOL 抵押金额 (lamports)
    pub target_market_cap: u64,    // 目标市值 (USDC, 6 decimals)
    pub start_time: u64,           // 开始时间
    pub end_time: u64,             // 结束时间
    pub timestamp: i64,            // 创建时间戳
}
```

#### 数据库表结构 (oath_created_events)
- `id`: 自增主键
- `oath_id`: Oath ID (唯一索引)
- `creator`: 创建者地址 (索引)
- `token_address`: Token 地址 (索引)
- `sol_collateral`: SOL 抵押金额
- `target_market_cap`: 目标市值
- `start_time`: 开始时间
- `end_time`: 结束时间
- `timestamp`: 事件时间戳
- `signature`: 交易签名
- `created_at`: 数据库创建时间

### 2. 核心功能

#### 事件解析
- `EventParserService::parse_oath_created_event_from_log()`: 从交易日志解析 OathCreated 事件

#### 数据库操作
- `DatabaseService::save_oath_created_event()`: 保存事件到数据库
- `DatabaseService::get_oath_event_by_id()`: 根据 oath_id 查询
- `DatabaseService::get_oath_events_by_creator()`: 根据创建者查询
- `DatabaseService::get_oath_events_by_token()`: 根据 token 地址查询
- `DatabaseService::get_recent_oath_events()`: 获取最近的事件
- `DatabaseService::count_oath_events()`: 统计总数

#### WebSocket 监听
- 实时监听 Oath 合约的交易日志
- 自动解析 OathCreated 事件
- 自动保存到数据库

## 使用步骤

### 1. 初始化数据库

#### 创建数据库
```bash
# MySQL
mysql -u root -p
CREATE DATABASE oath_events CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 初始化表结构
```bash
cd backend/rust_backend
mysql -u root -p oath_events < data/init_oath_events.sql
```

### 2. 配置环境

修改 `config.oath.yaml`:

```yaml
solana:
  active_network: devnet
  networks:
    devnet:
      rpc_url: "https://solana-devnet.nodit.io/YOUR_API_KEY"

vault:
  # Oath 合约程序 ID
  program_id: "Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ"

listener:
  mode: "websocket"
  event_parse: "none"  # 不解析 pumpfun 事件

database:
  type: "mysql"
  mysql_host: "127.0.0.1"
  mysql_port: 3306
  mysql_user: "root"
  mysql_password: "root"
  mysql_database: "oath_events"
```

### 3. 启动监听器

```bash
cd backend/rust_backend

# 使用 Oath 合约配置启动
cargo run -- --config config.oath.yaml
```

### 4. 测试事件监听

在前端创建一个新的 Oath,监听器会自动:
1. 捕获交易日志
2. 解析 OathCreated 事件
3. 保存到数据库
4. 输出日志:

```
============================================================
🔐 OathCreatedEvent 详情
============================================================
Oath ID: 1
创建者: 8KqZ...
Token 地址: So11...
SOL 抵押: 1.5 SOL (1500000000 lamports)
目标市值: $1000000
开始时间: 1735017600
结束时间: 1767139200
创建时间戳: 1735017600
============================================================

💾 ✅ OathCreatedEvent 已成功保存到数据库
```

### 5. 查询数据库

```sql
-- 查询所有 Oath 事件
SELECT * FROM oath_created_events ORDER BY created_at DESC;

-- 查询特定创建者的 Oath
SELECT * FROM oath_created_events WHERE creator = '8KqZ...';

-- 查询特定 Token 的 Oath
SELECT * FROM oath_created_events WHERE token_address = 'So11...';

-- 统计总数
SELECT COUNT(*) FROM oath_created_events;

-- 查询最近 10 条
SELECT * FROM oath_created_events ORDER BY created_at DESC LIMIT 10;
```

## 文件清单

### 新增文件
1. `src/models/oath_created_event.rs` - OathCreatedEvent 结构体
2. `src/models/oath_created_event_entity.rs` - 数据库实体定义
3. `data/init_oath_events.sql` - 数据库初始化脚本
4. `config.oath.yaml` - Oath 合约监听配置

### 修改文件
1. `src/models/mod.rs` - 导出新模型
2. `src/services/event_parser.rs` - 添加 `parse_oath_created_event_from_log` 方法
3. `src/services/database_service.rs` - 添加 Oath 事件相关数据库操作
4. `src/services/websocket_service.rs` - 添加 Oath 合约事件监听逻辑

## 技术细节

### 事件鉴别器
Anchor 框架在事件数据前添加 8 字节的事件鉴别器,解析时需要跳过:
```rust
let event_data = &decoded_data[8..];  // 跳过前 8 字节
```

### Borsh 反序列化
OathCreatedEvent 使用 Borsh 格式序列化,需要使用 `BorshDeserialize::try_from_slice()` 解析。

### 唯一性检查
数据库使用 `oath_id` 作为唯一索引,相同的 Oath 不会重复保存。

### 自动表创建
使用 SeaORM 的 Schema Builder 自动创建表结构,首次运行时会自动初始化。

## 扩展功能

### 添加其他事件监听

可以类似地添加 `OathCompleted` 和 `OathSlashed` 事件监听:

1. 在 `models/` 创建对应的事件模型
2. 在 `event_parser.rs` 添加解析方法
3. 在 `database_service.rs` 添加保存方法
4. 在 `websocket_service.rs` 添加监听逻辑

### HTTP API 查询

可以添加 HTTP API 端点来查询 Oath 事件:

```rust
// 在 controllers/http_controller.rs 添加
async fn get_oath_events(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<OathCreatedEventModel>>, StatusCode> {
    match state.db.get_recent_oath_events(10).await {
        Ok(events) => Ok(Json(events)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
```

## 故障排查

### 连接失败
- 检查 RPC URL 是否正确
- 确认网络连接正常
- 验证 API 密钥有效

### 解析失败
- 确认 program_id 正确
- 检查 IDL 文件是否最新
- 验证事件结构与合约一致

### 数据库错误
- 检查数据库连接配置
- 确认表已创建
- 验证数据库用户权限

## 性能优化

### 数据库索引
已在以下字段创建索引:
- `creator` - 创建者查询
- `token_address` - Token 查询
- `created_at` - 时间排序

### 连接池
数据库连接池配置:
- `max_connections: 5`
- `min_connections: 1`

可根据负载调整。

## 安全建议

1. **API 密钥保护**: 不要在配置文件中硬编码 API 密钥,使用环境变量
2. **数据库密码**: 生产环境使用强密码
3. **访问控制**: 限制数据库访问权限
4. **日志记录**: 记录所有事件以便审计

## 总结

现在你已经有了一个完整的 Oath 合约事件监听系统:
- ✅ 实时监听 OathCreated 事件
- ✅ 自动解析事件数据
- ✅ 保存到数据库
- ✅ 提供查询接口
- ✅ 支持多种数据库 (MySQL/PostgreSQL/SQLite)

系统已准备好监听生产环境中的 Oath 创建事件!
