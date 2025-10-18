use borsh::{BorshDeserialize, BorshSerialize};
use solana_sdk::pubkey::Pubkey;
use serde::{Deserialize, Serialize};

/// TradeEvent - 交易事件
/// 
/// 对应 Solana 程序中的 TradeEvent 结构
/// 包含交易的所有相关信息：代币、数量、用户、储备等
#[derive(Debug, Clone, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
pub struct TradeEvent {
    /// Mint 地址
    pub mint: Pubkey,
    
    /// SOL 交易数量
    pub sol_amount: u64,
    
    /// Token 交易数量
    pub token_amount: u64,
    
    /// 是否为买入交易
    pub is_buy: bool,
    
    /// 用户地址
    pub user: Pubkey,
    
    /// 时间戳
    pub timestamp: u64,
    
    /// 虚拟 SOL 储备
    pub virtual_sol_reserves: u64,
    
    /// 虚拟 Token 储备
    pub virtual_token_reserves: u64,
    
    /// 真实 SOL 储备
    pub real_sol_reserves: u64,
    
    /// 真实 Token 储备
    pub real_token_reserves: u64,
    
    /// 手续费接收者
    pub fee_recipient: Pubkey,
    
    /// 手续费基点
    pub fee_basis_points: u64,
    
    /// 手续费金额
    pub fee: u64,
    
    /// 创建者地址
    pub creator: Pubkey,
    
    /// 创建者手续费基点
    pub creator_fee_basis_points: u64,
    
    /// 创建者手续费金额
    pub creator_fee: u64,
    
    /// 是否跟踪交易量
    pub track_volume: bool,
    
    /// 未领取代币总数
    pub total_unclaimed_tokens: u64,
    
    /// 已领取代币总数
    pub total_claimed_tokens: u64,
    
    /// 当前 SOL 交易量
    pub current_sol_volume: u64,
    
    /// 最后更新时间戳
    pub last_update_timestamp: u64,
}
