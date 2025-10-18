use solana_client::nonblocking::rpc_client::RpcClient;
use solana_commitment_config::CommitmentConfig;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signature::Signature;
use solana_transaction_status::{EncodedConfirmedTransactionWithStatusMeta, UiTransactionEncoding};
use std::str::FromStr;

/// Solana 区块链服务
pub struct SolanaService {
    rpc_client: RpcClient,
    program_id: Pubkey,
}

impl SolanaService {
    /// 创建新的 Solana 服务实例
    pub fn new(rpc_url: &str, program_id_str: &str) -> Self {
        let rpc_client = RpcClient::new_with_commitment(
            rpc_url.to_string(),
            CommitmentConfig::confirmed(),
        );
        let program_id = Pubkey::from_str(program_id_str)
            .expect("Invalid program ID");

        Self {
            rpc_client,
            program_id,
        }
    }

    /// 获取程序 ID
    pub fn program_id(&self) -> &Pubkey {
        &self.program_id
    }

    /// 获取地址的最近交易签名
    pub async fn fetch_signatures_for_address(
        &self,
    ) -> Result<Vec<solana_client::rpc_response::RpcConfirmedTransactionStatusWithSignature>, Box<dyn std::error::Error>> {
        let signatures = self
            .rpc_client
            .get_signatures_for_address(&self.program_id)
            .await?;
        Ok(signatures)
    }

    /// 获取交易详情
    pub async fn get_transaction(
        &self,
        signature: &Signature,
    ) -> Result<EncodedConfirmedTransactionWithStatusMeta, Box<dyn std::error::Error>> {
        let transaction = self
            .rpc_client
            .get_transaction(signature, UiTransactionEncoding::Json)
            .await?;
        Ok(transaction)
    }
}
