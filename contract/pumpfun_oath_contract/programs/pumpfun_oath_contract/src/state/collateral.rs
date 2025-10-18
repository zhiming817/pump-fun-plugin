use anchor_lang::prelude::*;

/// 抵押池账户
/// 用于管理所有抵押资产
#[account]
pub struct CollateralPool {
    pub authority: Pubkey,              // 池管理员
    pub total_stable_collateral: u64,   // 总稳定币抵押
    pub total_token_collateral: u64,    // 总代币抵押价值
    pub supported_tokens: Vec<Pubkey>,  // 支持的抵押代币列表
    pub bump: u8,                       // PDA bump seed
}

impl CollateralPool {
    pub const MAXIMUM_SIZE: usize = 8  // discriminator
        + 32                           // authority
        + 8                            // total_stable_collateral
        + 8                            // total_token_collateral
        + (4 + 20 * 32)               // supported_tokens (max 20 tokens)
        + 1;                           // bump
}

/// 用户抵押信息
/// 记录单个用户的抵押历史和状态
#[account]
pub struct UserCollateral {
    pub user: Pubkey,                       // 用户地址
    pub total_collateral_value: u64,        // 用户总抵押价值
    pub active_oaths: Vec<u64>,             // 用户活跃的誓言ID列表
    pub total_slashed: u64,                 // 用户总被削减金额
    pub bump: u8,                           // PDA bump seed
}

impl UserCollateral {
    pub const MAXIMUM_SIZE: usize = 8  // discriminator
        + 32                           // user
        + 8                            // total_collateral_value
        + (4 + 50 * 8)                // active_oaths (max 50 active oaths per user)
        + 8                            // total_slashed
        + 1;                           // bump
}