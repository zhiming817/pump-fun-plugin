use borsh::BorshDeserialize;
use solana_sdk::pubkey::Pubkey;

/// OathCreatedEvent 事件结构体
#[derive(Debug, BorshDeserialize)]
pub struct OathCreatedEvent {
    pub oath_id: u64,
    pub creator: Pubkey,
    pub token_address: Pubkey,
    pub sol_collateral: u64,
    pub target_market_cap: u64,
    pub start_time: u64,
    pub end_time: u64,
    pub timestamp: i64,
}
