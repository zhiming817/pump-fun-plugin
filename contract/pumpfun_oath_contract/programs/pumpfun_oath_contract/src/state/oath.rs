use anchor_lang::prelude::*;

/// 誓言状态枚举
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum OathStatus {
    Active = 0,     // 活跃中
    Completed = 1,  // 已完成
    Expired = 2,    // 已过期
    Failed = 3,     // 失败
}

/// 抵押代币结构体
/// 记录用户在誓言中抵押的各种代币信息
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct CollateralToken {
    pub symbol: String,        // 代币符号 (如: USDC, APT)
    pub amount: u64,          // 抵押数量
    pub address: String,      // 代币合约地址
    pub usd_value: u64,       // USD 价值
    pub locked_time: u64,     // 锁定时间戳
}

/// 削减信息结构体
/// 当用户违约时记录惩罚信息
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct SlashingInfo {
    pub slashed_amount: u64,    // 被削减的金额
    pub slashing_time: u64,     // 削减发生时间
    pub reason: String,         // 削减原因
}

/// 补偿信息结构体
/// 当系统需要补偿用户时记录相关信息
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct CompensationInfo {
    pub compensation_amount: u64,  // 补偿金额
    pub compensation_time: u64,    // 补偿时间
    pub compensated_to: Pubkey,    // 补偿接收者地址
}

/// Oath 誓言结构体
/// 表示用户创建的去中心化誓言，包含承诺内容、抵押信息和执行状态
#[account]
pub struct Oath {
    // 基本信息
    pub id: u64,                                        // 誓言唯一标识符
    pub creator: Pubkey,                                // 创建者地址
    
    // 时间信息
    pub start_time: u64,                                // 誓言开始时间戳
    pub end_time: u64,                                  // 誓言结束时间戳
    
    // 抵押相关 (仅支持 SOL)
    pub sol_collateral: u64,                            // SOL抵押数量（单位：lamports）
    
    // PumpFun 相关
    pub token_address: Pubkey,                          // 关联的 pumpfun token 地址（必填）
    pub target_market_cap: u64,                         // 目标市值（单位：USDC，例如 78320 表示 $78,320）
    
    // 状态和证据
    pub status: OathStatus,                             // 誓言状态
    pub evidence: String,                               // 完成证据
    
    // 风险管理
    pub slashing_info: Option<SlashingInfo>,            // 削减信息（如果被惩罚）-
    pub compensation_info: Option<CompensationInfo>,     // 补偿信息（如果需要赔偿）
    
    // 内部管理字段
    pub bump: u8,                                       // PDA bump seed
    pub created_at: i64,                                // 创建时间
    pub updated_at: i64,                                // 更新时间
}

impl Oath {
    pub const MAXIMUM_SIZE: usize = 8  // discriminator
        + 8                            // id
        + 32                           // creator
        + 8                            // start_time
        + 8                            // end_time
        + 8                            // sol_collateral
        + 32                           // token_address (必填)
        + 8                            // target_market_cap
        + 1                            // status
        + (4 + 500)                    // evidence (max 500 chars)
        + (1 + 8 + 8 + 4 + 200)       // slashing_info (Option)
        + (1 + 8 + 8 + 32)            // compensation_info (Option)
        + 1                            // bump
        + 8                            // created_at
        + 8;                           // updated_at
}

/// 全局状态账户
/// 用于管理合约的全局设置和统计信息
#[account]
pub struct GlobalState {
    pub authority: Pubkey,          // 合约管理员
    pub next_oath_id: u64,         // 下一个誓言ID
    pub total_oaths: u64,          // 总誓言数量
    pub total_collateral: u64,     // 总抵押金额
    pub is_paused: bool,           // 合约是否暂停
    pub bump: u8,                  // PDA bump seed
}

impl GlobalState {
    pub const MAXIMUM_SIZE: usize = 8  // discriminator
        + 32                           // authority
        + 8                            // next_oath_id
        + 8                            // total_oaths
        + 8                            // total_collateral
        + 1                            // is_paused
        + 1;                           // bump
}