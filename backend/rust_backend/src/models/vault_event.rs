use borsh::BorshDeserialize;
use solana_sdk::pubkey::Pubkey;

/// Vault 创建事件（与合约中的定义保持一致）
#[derive(Debug, BorshDeserialize)]
pub struct VaultCreatedEvent {
    /// Vault ID
    pub id: u64,
    /// 创建者公钥
    pub creator: Pubkey,
    /// Vault 名称
    pub name: String,
    /// Vault 符号
    pub symbol: String,
    /// 目标 APY（基点表示，例如 850 = 8.5%）
    pub target_apy: u64,
    /// 初始存款（lamports）
    pub initial_deposit: u64,
    /// 策略类型
    pub strategy_type: String,
    /// 风险等级（0-10）
    pub risk_level: u8,
    /// 创建时间戳
    pub created_at: i64,
}
