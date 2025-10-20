# 事件解析配置说明

## 概述

新增了 `event_parse` 配置参数，用于控制 PumpFun 程序的事件解析行为。

## 配置参数

在 `config.yaml` 的 `listener` 部分添加：

```yaml
listener:
  mode: "websocket"
  poll_interval_secs: 5
  event_parse: "both"  # 事件解析模式
```

## 支持的值

| 值 | 说明 | 用途 |
|---|---|---|
| `both` | 解析所有事件 | 同时监听 CreateEvent 和 TradeEvent（默认） |
| `create` | 仅解析 CreateEvent | 只监听新币创建事件，适合监控新币发行 |
| `trade` | 仅解析 TradeEvent | 只监听交易事件，适合监控交易活动 |
| `none` | 不解析任何事件 | 关闭事件解析，仅记录原始日志 |

## 使用场景

### 1. 监控新币创建

使用配置文件 `config.create_only.yaml`：

```bash
cargo run --release
```

或使用环境变量：

```bash
EVENT_PARSE=create cargo run --release
```

**适用场景**：
- 追踪新币发行
- 记录币种创建数据
- 分析市场活跃度

### 2. 监控交易活动

使用配置文件 `config.trade_only.yaml`：

```bash
cargo run --release
```

或使用环境变量：

```bash
EVENT_PARSE=trade cargo run --release
```

**适用场景**：
- 监控买卖交易
- 分析交易量和价格
- 追踪大额交易

### 3. 完整监控

使用默认配置 `config.yaml`（event_parse: "both"）：

```bash
cargo run --release
```

**适用场景**：
- 完整的市场监控
- 数据采集和分析
- 综合信息追踪

### 4. 关闭事件解析

设置 `event_parse: "none"`：

**适用场景**：
- 调试原始日志
- 性能测试
- 仅需要交易签名信息

## 环境变量支持

可以通过环境变量 `EVENT_PARSE` 覆盖配置文件：

```bash
# 仅解析 CreateEvent
EVENT_PARSE=create cargo run --release

# 仅解析 TradeEvent
EVENT_PARSE=trade cargo run --release

# 解析所有事件
EVENT_PARSE=both cargo run --release

# 不解析事件
EVENT_PARSE=none cargo run --release
```

## 配置优先级

环境变量 > YAML 配置文件 > 默认值（both）

## 性能优化

根据实际需求选择合适的解析模式可以：

1. **减少 CPU 使用**: 只解析需要的事件类型
2. **降低数据库负载**: 减少不必要的数据写入
3. **提高响应速度**: 跳过不需要的解析逻辑

## 示例输出

### CreateEvent 模式

```
🎯 事件解析模式: Create
============================================================
🪙 CreateEvent 详情
============================================================
名称: MyToken
符号: MTK
...
```

### TradeEvent 模式

```
🎯 事件解析模式: Trade
============================================================
💱 TradeEvent 详情
============================================================
交易类型: 买入 🟢
...
```

### Both 模式

```
🎯 事件解析模式: Both
============================================================
🪙 CreateEvent 详情
============================================================
...
============================================================
💱 TradeEvent 详情
============================================================
...
```

## 配置文件示例

项目提供了以下配置文件模板：

- `config.yaml` - 默认配置（解析所有事件）
- `config.create_only.yaml` - 仅解析 CreateEvent
- `config.trade_only.yaml` - 仅解析 TradeEvent

可以复制并修改这些文件以适应不同的使用场景。
