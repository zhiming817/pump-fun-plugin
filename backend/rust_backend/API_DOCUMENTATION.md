# HTTP API 服务器使用文档

## 🚀 启动方式

### 方式 1: 使用启动脚本（推荐）

```bash
cd /Users/work/workspace/solana_worspace/pump-fun-plugin/backend/rust_backend
./run_with_api.sh
```

### 方式 2: 使用环境变量

```bash
cd /Users/work/workspace/solana_worspace/pump-fun-plugin/backend/rust_backend
ENABLE_HTTP_API=true cargo run --bin rust_backend
```

### 方式 3: 仅启动 HTTP 服务器

```bash
cd /Users/work/workspace/solana_worspace/pump-fun-plugin/backend/rust_backend
cargo run --bin http_server
```

## 📋 API 端点

服务器默认运行在: `http://0.0.0.0:3000`

### 1. API 信息
```bash
GET http://localhost:3000/
```

### 2. 健康检查
```bash
GET http://localhost:3000/health
```

### 3. 获取所有事件（支持分页）
```bash
GET http://localhost:3000/api/events?page=1&page_size=10
```

**查询参数**:
- `page`: 页码（默认: 1）
- `page_size`: 每页数量（默认: 10）

**响应示例**:
```json
{
  "success": true,
  "data": [...],
  "error": null,
  "total": 100,
  "page": 1,
  "page_size": 10
}
```

**使用示例**:
```bash
# 获取第1页，每页10条
curl "http://localhost:3000/api/events?page=1&page_size=10" | jq '.'

# 获取第2页，每页20条
curl "http://localhost:3000/api/events?page=2&page_size=20" | jq '.'

# 不带参数，使用默认值（page=1, page_size=10）
curl "http://localhost:3000/api/events" | jq '.'
```

### 4. 获取最近的 N 条事件
```bash
GET http://localhost:3000/api/events/recent/10
```

### 5. 统计事件总数
```bash
GET http://localhost:3000/api/events/count
```

响应示例:
```json
{
  "success": true,
  "data": 100,
  "error": null,
  "total": null,
  "page": null,
  "page_size": null
}
```

### 6. 根据 mint 查询事件
```bash
GET http://localhost:3000/api/events/mint/{mint_address}
```

示例:
```bash
curl "http://localhost:3000/api/events/mint/HZWKVfammvEHaNfPnYTppEgXYppZWfqPiGgxwgAjEdVv" | jq '.'
```

### 7. 根据创建者查询事件（支持分页）
```bash
GET http://localhost:3000/api/events/creator/{creator_address}?page=1&page_size=10
```

**查询参数**:
- `page`: 页码（默认: 1）
- `page_size`: 每页数量（默认: 10）

**示例**:
```bash
# 获取创建者的第1页事件
curl "http://localhost:3000/api/events/creator/CjisaxtyK4n43PBhCATyydWQU93ruN1KJTRkcEhkGVyR?page=1&page_size=10" | jq '.'

# 不带分页参数
curl "http://localhost:3000/api/events/creator/CjisaxtyK4n43PBhCATyydWQU93ruN1KJTRkcEhkGVyR" | jq '.'
```

## 📖 分页说明

### 分页参数

所有支持分页的端点都接受以下查询参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | u64 | 1 | 页码，从 1 开始 |
| `page_size` | u64 | 10 | 每页返回的记录数 |

### 分页响应格式

```json
{
  "success": true,
  "data": [...],
  "error": null,
  "total": 100,          // 总记录数
  "page": 1,             // 当前页码
  "page_size": 10        // 每页记录数
}
```

### 分页计算

- **总页数** = `ceil(total / page_size)`
- **偏移量** = `(page - 1) * page_size`

### 示例场景

**场景 1: 浏览所有事件**
```bash
# 第1页
curl "http://localhost:3000/api/events?page=1&page_size=20"

# 第2页
curl "http://localhost:3000/api/events?page=2&page_size=20"

# 第3页
curl "http://localhost:3000/api/events?page=3&page_size=20"
```

**场景 2: 查看某个创建者的所有事件**
```bash
# 获取总数
curl "http://localhost:3000/api/events/count"

# 分页获取
curl "http://localhost:3000/api/events/creator/ADDRESS?page=1&page_size=50"
```

## 🧪 测试 API

### 使用 curl
```bash
# 获取所有事件（第1页）
curl "http://localhost:3000/api/events?page=1&page_size=10" | jq '.'

# 获取最近 5 条事件
curl "http://localhost:3000/api/events/recent/5" | jq '.'

# 统计总数
curl "http://localhost:3000/api/events/count" | jq '.'

# 根据创建者查询（分页）
curl "http://localhost:3000/api/events/creator/CjisaxtyK4n43PBhCATyydWQU93ruN1KJTRkcEhkGVyR?page=1&page_size=20" | jq '.'
```

### 使用浏览器
直接在浏览器中打开:
- http://localhost:3000
- http://localhost:3000/api/events
- http://localhost:3000/api/events?page=2&page_size=20
- http://localhost:3000/api/events/recent/10

## ⚙️ 配置

HTTP API 功能通过环境变量 `ENABLE_HTTP_API` 控制:
- `ENABLE_HTTP_API=true` - 启用 HTTP API（同时运行事件监听器）
- `ENABLE_HTTP_API=false` 或不设置 - 仅运行事件监听器

## 🔧 数据库配置

HTTP API 使用与主程序相同的数据库配置，在 `config.yaml` 中配置:

```yaml
database:
  type: sqlite  # 或 mysql, postgres
  sqlite_path: data/events.db
  max_connections: 5
  min_connections: 1
```

## 📦 功能特性

- ✅ CORS 支持（允许所有来源）
- ✅ JSON 响应格式
- ✅ 错误处理
- ✅ **分页支持**（page + page_size）
- ✅ 统一的响应结构
- ✅ 实时数据（直接从数据库读取）
- ✅ 灵活的查询参数

## 🎯 使用场景

1. **前端应用**: 在 Web/Mobile 应用中调用 API 展示事件数据，支持分页加载
2. **数据分析**: 使用 curl/Python 脚本获取数据进行分析
3. **监控面板**: 构建实时监控仪表板，分页展示大量数据
4. **第三方集成**: 允许其他系统访问事件数据

## 📝 分页最佳实践

1. **合理设置 page_size**: 根据网络情况和数据量，建议 10-50 条/页
2. **显示总页数**: 使用 `total` 和 `page_size` 计算总页数
3. **错误处理**: 页码超出范围时返回空数组
4. **性能优化**: 对于大数据量，使用索引优化查询
