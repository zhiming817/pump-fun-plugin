# Rust Backend - MVC 架构说明

## 📋 项目概述

这是一个使用 **MVC (Model-View-Controller)** 架构模式的 Solana 事件监听器，用于监听并解析 Vault 合约的 `VaultCreatedEvent` 事件。

**✨ 新功能：** 现已支持**两种监听模式**：
- 🔄 **轮询模式（Polling）** - 稳定可靠，每 5 秒查询一次
- 📡 **WebSocket 模式** - 实时监听，零延迟接收事件

## 🚀 快速开始

```bash
# 使用默认轮询模式
cargo run

# 使用 WebSocket 实时监听
export LISTENER_MODE=websocket
cargo run

# 或使用交互式脚本
./run.sh
```

📚 **详细文档：**
- [快速开始指南](./QUICKSTART.md) - 立即上手
- [WebSocket 使用指南](./WEBSOCKET_GUIDE.md) - 实时监听配置
- [RPC 配置文档](./RPC_CONFIG.md) - 端点配置说明

## 🏗️ 架构设计

```
src/
├── main.rs                          # 应用入口
├── config.rs                        # 配置管理（支持双模式）
├── models/                          # 数据模型层
│   ├── mod.rs
│   └── vault_event.rs              # VaultCreatedEvent 数据结构
├── services/                        # 业务逻辑层
│   ├── mod.rs
│   ├── solana_service.rs           # Solana RPC 交互
│   ├── event_parser.rs             # 事件解析逻辑
│   └── websocket_service.rs        # 🆕 WebSocket 实时监听
├── controllers/                     # 控制器层
│   ├── mod.rs
│   ├── event_listener.rs           # 轮询事件监听控制器
│   └── websocket_listener.rs       # 🆕 WebSocket 监听控制器
└── utils/                           # 工具层
    ├── mod.rs
    └── view_formatter.rs            # 视图格式化（输出）
```

## 📦 各层职责

### 1. **Models (模型层)** - `src/models/`
- **职责**：定义数据结构
- **文件**：
  - `vault_event.rs`: VaultCreatedEvent 事件数据结构，使用 Borsh 反序列化
- **特点**：
  - 纯数据结构，无业务逻辑
  - 与合约定义保持一致
  - 使用 `#[derive(BorshDeserialize)]` 支持 Solana 数据反序列化

### 2. **Services (服务层)** - `src/services/`
- **职责**：处理业务逻辑
- **文件**：
  - `solana_service.rs`: 封装 Solana RPC 客户端，提供区块链交互方法
    - `fetch_signatures_for_address()`: 获取程序的最近交易签名
    - `get_transaction()`: 获取交易详情
  - `event_parser.rs`: 解析事件数据
    - `parse_from_log()`: 从日志中提取和解析事件
    - `parse_vault_event()`: 使用 Borsh 反序列化事件数据
- **特点**：
  - 无状态设计
  - 可测试性强
  - 职责单一

### 3. **Controllers (控制器层)** - `src/controllers/`
- **职责**：协调 Services 和 Utils，实现完整的业务流程
- **文件**：
  - `event_listener.rs`: 事件监听主控制器
    - `start()`: 启动事件监听循环
    - `process_transaction()`: 处理单个交易
- **特点**：
  - 协调各层组件
  - 管理应用状态（如 `last_signature`）
  - 实现轮询机制

### 4. **Utils (工具层)** - `src/utils/`
- **职责**：提供辅助功能（如格式化输出）
- **文件**：
  - `view_formatter.rs`: 格式化控制台输出
    - `print_vault_created_event()`: 打印事件详细信息
- **特点**：
  - 纯工具函数
  - 不依赖业务逻辑
  - 易于扩展

### 5. **Config (配置层)** - `src/config.rs`
- **职责**：管理应用配置
- **配置项**：
  - `rpc_url`: Solana RPC 端点
  - `program_id`: Vault 合约程序 ID
  - `poll_interval_secs`: 轮询间隔
- **特点**：
  - 支持环境变量覆盖 (`from_env()`)
  - 提供默认值

### 6. **Main (入口)** - `src/main.rs`
- **职责**：应用启动和依赖注入
- **流程**：
  1. 加载配置
  2. 创建 EventListenerController
  3. 启动事件监听

## 🔄 数据流

```
                       ┌─────────────┐
                       │   main.rs   │
                       │  (启动应用)  │
                       └──────┬──────┘
                              │
                              ▼
                       ┌─────────────┐
                       │   Config    │
                       │ (加载配置)   │
                       └──────┬──────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │ EventListenerController│
                   │   (协调各层)           │
                   └──────────┬─────────────┘
                              │
                    ┌─────────┴──────────┐
                    ▼                     ▼
          ┌─────────────────┐   ┌────────────────┐
          │ SolanaService   │   │ EventParser    │
          │ (RPC 交互)       │   │ (事件解析)      │
          └────────┬─────────┘   └────────┬───────┘
                   │                       │
                   ▼                       ▼
          [获取交易签名]           [解析 base64 数据]
          [获取交易详情]           [Borsh 反序列化]
                   │                       │
                   └───────────┬───────────┘
                               ▼
                      ┌─────────────────┐
                      │ ViewFormatter   │
                      │ (格式化输出)     │
                      └────────┬────────┘
                               ▼
                         [控制台输出]
```

## ✨ 设计优势

1. **关注点分离 (Separation of Concerns)**
   - 每一层只关注自己的职责
   - 修改一层不影响其他层

2. **可测试性 (Testability)**
   - Services 层无状态，易于单元测试
   - Controllers 可以注入 mock services 进行测试

3. **可维护性 (Maintainability)**
   - 清晰的目录结构
   - 每个文件职责单一，易于理解和修改

4. **可扩展性 (Scalability)**
   - 添加新事件类型：在 Models 和 EventParser 中扩展
   - 添加新功能：在 Services 中添加新服务
   - 修改输出格式：只需修改 ViewFormatter

5. **依赖注入 (Dependency Injection)**
   - Controller 接收 Config 作为参数
   - 便于配置管理和环境切换

## 🚀 运行方式

```bash
# 编译项目
cargo build

# 运行事件监听器
cargo run

# 运行测试（未来添加）
cargo test
```

## 📊 事件监听流程

1. **启动**: 加载配置，创建 Controller
2. **轮询**: 每 5 秒查询一次程序的最新交易
3. **过滤**: 跳过已处理的交易
4. **解析**: 
   - 检测 "Instruction: CreateVault"
   - 提取 "Program data:" 日志
   - Base64 解码
   - Borsh 反序列化
5. **展示**: 格式化输出事件详情

## 🔧 技术栈

- **Rust**: 1.x
- **Tokio**: 异步运行时
- **Solana SDK**: 3.0.x
  - `solana-client`: RPC 交互
  - `solana-sdk`: 核心数据类型
  - `solana-commitment-config`: 交易确认配置
  - `solana-transaction-status`: 交易状态
- **Borsh**: Solana 数据序列化/反序列化
- **Base64**: 解码程序数据日志
- **Serde JSON**: JSON 处理

## 📝 配置说明

### 默认配置
```rust
AppConfig {
    rpc_url: "https://solana-devnet.nodit.io/...",
    program_id: "HZWKVfammvEHaNfPnYTppEgXYppZWfqPiGgxwgAjEdVv",
    poll_interval_secs: 5,
}
```

### 环境变量覆盖
```bash
export SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
export VAULT_PROGRAM_ID="YOUR_PROGRAM_ID"
export POLL_INTERVAL_SECS="10"
```

## 🎯 下一步改进

1. **测试覆盖**
   - 为 EventParser 添加单元测试
   - 为 SolanaService 添加集成测试

2. **错误处理**
   - 统一错误类型
   - 添加重试机制

3. **日志系统**
   - 集成 `tracing` 或 `log` 库
   - 支持日志级别配置

4. **性能优化**
   - 并发处理多个交易
   - 缓存已处理的签名

5. **扩展功能**
   - 支持多种事件类型
   - 添加事件通知机制（如 Webhook）
   - 持久化事件数据

## 📄 License

MIT
