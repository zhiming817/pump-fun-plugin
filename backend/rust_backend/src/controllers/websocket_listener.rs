use solana_sdk::pubkey::Pubkey;
use std::str::FromStr;

use crate::config::AppConfig;
use crate::services::{WebSocketService, DatabaseService};

/// WebSocket 事件监听控制器
///
/// 使用 Anchor PubsubClient 实现实时事件监听
pub struct WebSocketListenerController {
    websocket_service: WebSocketService,
}

impl WebSocketListenerController {
    /// 创建新的 WebSocket 事件监听控制器
    ///
    /// # Arguments
    /// * `config` - 应用配置
    pub async fn new(config: AppConfig) -> Result<Self, Box<dyn std::error::Error>> {
        // 优先使用配置的 WebSocket URL，否则从 RPC URL 转换
        let rpc_url = config.get_rpc_url();
        let wss_url = config
            .get_wss_url()
            .map(|s| s.to_string())
            .unwrap_or_else(|| Self::convert_to_wss_url(rpc_url));
        
        let program_id = Pubkey::from_str(&config.program_id)?;
        
        // 初始化数据库服务
        let db_service = match DatabaseService::new(&config.database).await {
            Ok(db) => {
                println!("✅ 数据库连接成功");
                Some(db)
            }
            Err(e) => {
                eprintln!("⚠️  数据库连接失败: {}，将不保存数据", e);
                None
            }
        };
        
        let websocket_service = WebSocketService::new(&wss_url, program_id, db_service);

        Ok(Self { websocket_service })
    }

    /// 将 HTTP(S) RPC URL 转换为 WebSocket URL
    ///
    /// # Arguments
    /// * `rpc_url` - HTTP(S) RPC 端点
    ///
    /// # Returns
    /// WebSocket URL (wss://)
    ///
    /// # 支持的格式
    /// - ZAN 节点: `https://api.zan.top/node/v1/...` → `wss://api.zan.top/node/ws/v1/...`
    /// - 标准节点: `https://api.devnet.solana.com` → `wss://api.devnet.solana.com`
    fn convert_to_wss_url(rpc_url: &str) -> String {
        // 特殊处理 ZAN 节点的 URL 格式
        if rpc_url.contains("api.zan.top") && rpc_url.contains("/node/v1/") {
            rpc_url
                .replace("https://", "wss://")
                .replace("http://", "ws://")
                .replace("/node/v1/", "/node/ws/v1/")
        } else {
            // 标准的协议替换
            rpc_url
                .replace("https://", "wss://")
                .replace("http://", "ws://")
        }
    }

    /// 启动 WebSocket 日志监听
    ///
    /// 订阅程序日志，实时接收 VaultCreatedEvent 事件
    pub async fn start(&self) -> Result<(), Box<dyn std::error::Error>> {
        self.websocket_service.start_log_listener().await
    }

    /// 订阅特定账户的更新
    ///
    /// # Arguments
    /// * `account_address` - 账户地址字符串
    pub async fn subscribe_account(
        &self,
        account_address: &str,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let account_pubkey = Pubkey::from_str(account_address)?;
        self.websocket_service
            .subscribe_account(&account_pubkey)
            .await
    }
}
