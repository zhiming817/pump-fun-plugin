# PumpFun Oath Contract

## 概述

PumpFun Oath Contract 是一个基于 Solana 区块链的去中心化誓言智能合约。用户可以创建带有抵押的承诺，通过提供证据来完成誓言，或因违约而被削减抵押。

## 功能特性

- ✅ 创建带抵押的誓言
- ✅ 完成誓言并提供证据
- ✅ 管理员削减违约誓言
- ✅ 查询誓言列表
- ✅ 支持多种抵押代币
- ✅ 用户抵押管理
- ✅ 全局状态管理

## 合约架构

### 目录结构

```
src/
├── lib.rs                  # 主程序入口
├── state/                  # 状态定义
│   ├── mod.rs
│   ├── oath.rs            # 誓言相关状态
│   └── collateral.rs      # 抵押相关状态
├── instructions/          # 指令处理
│   ├── mod.rs
│   ├── initialize.rs      # 初始化合约
│   ├── create_oath.rs     # 创建誓言
│   ├── complete_oath.rs   # 完成誓言
│   ├── slash_oath.rs      # 削减誓言
│   └── get_oath_list.rs   # 查询誓言列表
├── utils/                 # 工具函数
│   ├── mod.rs
│   ├── constants.rs       # 常量定义
│   └── helpers.rs         # 辅助函数
└── errors.rs              # 错误定义
```

### 核心数据结构

#### Oath (誓言)
```rust
pub struct Oath {
    pub id: u64,                                    // 誓言唯一标识符
    pub creator: Pubkey,                            // 创建者地址
    pub content: String,                            // 誓言内容描述
    pub category: String,                           // 誓言分类
    pub category_id: String,                        // 誓言分类ID
    pub start_time: u64,                            // 誓言开始时间戳
    pub end_time: u64,                              // 誓言结束时间戳
    pub stable_collateral: u64,                     // 稳定币抵押数量
    pub collateral_tokens: Vec<CollateralToken>,    // 其他抵押代币列表
    pub is_over_collateralized: bool,               // 是否过度抵押
    pub token_address: Option<Pubkey>,              // 关联的 PumpFun token 地址
    pub target_apy: Option<u64>,                    // 目标年化收益率
    pub current_apy: Option<u64>,                   // 当前年化收益率
    pub status: OathStatus,                         // 誓言状态
    pub evidence: String,                           // 完成证据
    pub slashing_info: Option<SlashingInfo>,        // 削减信息
    pub compensation_info: Option<CompensationInfo>, // 补偿信息
    // ... 其他字段
}
```

#### OathStatus (誓言状态)
```rust
pub enum OathStatus {
    Active,     // 活跃中
    Completed,  // 已完成
    Expired,    // 已过期
    Failed,     // 失败
}
```

## 主要功能

### 1. 初始化合约
```rust
pub fn initialize(ctx: Context<Initialize>) -> Result<()>
```
- 初始化全局状态和抵押池
- 设置合约管理员

### 2. 创建誓言
```rust
pub fn create_oath(ctx: Context<CreateOath>, args: CreateOathArgs) -> Result<()>
```
- 创建新的誓言
- 设置抵押金额和代币
- 验证时间参数和内容长度

### 3. 完成誓言
```rust
pub fn complete_oath(ctx: Context<CompleteOath>, args: CompleteOathArgs) -> Result<()>
```
- 用户提供证据完成誓言
- 释放抵押资产
- 更新誓言状态为已完成

### 4. 削减誓言
```rust
pub fn slash_oath(ctx: Context<SlashOath>, args: SlashOathArgs) -> Result<()>
```
- 管理员对违约誓言进行削减
- 记录削减信息和原因
- 更新相关状态

### 5. 查询誓言列表
```rust
pub fn get_oath_list(ctx: Context<GetOathList>, args: GetOathListArgs) -> Result<()>
```
- 验证查询参数
- 支持分页和过滤

## 使用示例

### 部署和测试

1. **构建合约**
```bash
anchor build
```

2. **部署到本地网络**
```bash
anchor deploy --provider.cluster localnet
```

3. **运行测试**
```bash
anchor test
```

### 客户端使用

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PumpfunOathContract } from "./target/types/pumpfun_oath_contract";

// 初始化程序
const program = anchor.workspace.PumpfunOathContract as Program<PumpfunOathContract>;

// 创建誓言
const createOathArgs = {
  content: "我将学习 Solana 开发",
  category: "教育",
  categoryId: "edu_001",
  startTime: new anchor.BN(Date.now() / 1000),
  endTime: new anchor.BN(Date.now() / 1000 + 86400), // 24小时后
  stableCollateral: new anchor.BN(100), // $100
  collateralTokens: [],
  isOverCollateralized: false,
  tokenAddress: null,
  targetApy: null
};

await program.methods
  .createOath(createOathArgs)
  .accounts({
    // ... 账户
  })
  .rpc();
```

## 安全考虑

1. **权限控制**: 只有合约管理员可以执行削减操作
2. **时间验证**: 严格验证誓言的开始和结束时间
3. **抵押验证**: 确保最小抵押金额和代币数量限制
4. **状态管理**: 防止重复操作和状态不一致
5. **溢出保护**: 所有数学运算都包含溢出检查

## 常量配置

- `MIN_COLLATERAL_USD`: 最小抵押金额 (100 USD)
- `MAX_CONTENT_LENGTH`: 誓言内容最大长度 (200字符)
- `MAX_COLLATERAL_TOKENS`: 最大抵押代币数量 (10个)
- `MAX_ACTIVE_OATHS_PER_USER`: 每用户最大活跃誓言数 (50个)

## 错误处理

合约定义了详细的错误类型：
- `ContractPaused`: 合约暂停
- `InvalidStartTime`: 无效开始时间
- `InvalidEndTime`: 无效结束时间
- `InsufficientCollateral`: 抵押不足
- `Unauthorized`: 未授权操作
- 等等...

## 开发和贡献

1. 克隆仓库
2. 安装依赖: `npm install`
3. 构建合约: `anchor build`
4. 运行测试: `anchor test`
5. 提交 PR

## 许可证

MIT License