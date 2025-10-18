use futures_util::StreamExt;
use solana_pubsub_client::nonblocking::pubsub_client::PubsubClient;
use solana_client::rpc_config::{RpcTransactionLogsConfig, RpcTransactionLogsFilter};
use solana_commitment_config::CommitmentConfig;
use solana_sdk::pubkey::Pubkey;

use crate::services::{EventParserService, DatabaseService};
use crate::utils::ViewFormatter;

/// WebSocket 服务 - 使用 Solana PubsubClient 实现实时日志监听
pub struct WebSocketService {
    wss_url: String,
    program_id: Pubkey,
    event_parser: EventParserService,
    db_service: Option<DatabaseService>,
}

impl WebSocketService {
    /// 创建新的 WebSocket 服务实例
    ///
    /// # Arguments
    /// * `wss_url` - WebSocket 端点 URL (wss://)
    /// * `program_id` - 要监听的程序 ID
    /// * `db_service` - 数据库服务（可选）
    pub fn new(wss_url: &str, program_id: Pubkey, db_service: Option<DatabaseService>) -> Self {
        Self {
            wss_url: wss_url.to_string(),
            program_id,
            event_parser: EventParserService::new(),
            db_service,
        }
    }

    /// 启动 WebSocket 日志监听
    ///
    /// 使用 Solana PubsubClient 订阅程序日志，实时接收事件
    pub async fn start_log_listener(&self) -> Result<(), Box<dyn std::error::Error>> {
        println!("📡 启动 WebSocket 日志监听...");
        println!("🔗 WebSocket URL: {}", self.wss_url);
        println!("📍 监听程序 ID: {}", self.program_id);
        println!("⏳ 等待事件...\n");

        // 创建 PubsubClient
        let listener_client = PubsubClient::new(&self.wss_url).await?;

        // 配置日志订阅过滤器
        let logs_config = RpcTransactionLogsConfig {
            commitment: Some(CommitmentConfig::confirmed()),
        };

        // 订阅程序日志
        let logs_filter = RpcTransactionLogsFilter::Mentions(vec![self.program_id.to_string()]);
        
        let (mut stream, shutdown_handle) = listener_client
            .logs_subscribe(logs_filter, logs_config)
            .await?;

        println!("✅ WebSocket 连接成功，开始监听事件...\n");

        // 处理日志流
        while let Some(log_result) = stream.next().await {
            // 检查日志内容（logs 是 Vec<String>，不是 Option）
            let logs = &log_result.value.logs;
            let mut has_program_data = false;

            // 判断是监听哪个程序
            let is_pumpfun_program = self.program_id.to_string() == "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";

            // 检查是否包含 Program data（这是最可靠的标记）
            for log in logs {
                if log.contains("Program data:") {
                    has_program_data = true;
                    println!("📝 检测到新交易: {}", log_result.value.signature);
                    break;
                }
            }

            if !has_program_data {
                continue;
            }

            // 如果是 pump.fun 程序，尝试解析 CreateEvent 和 TradeEvent
            if is_pumpfun_program {
                for log in logs {
                    if log.contains("Program data:") {
                        // 先尝试解析 CreateEvent
                        if let Some(event) = self.event_parser.parse_create_event_from_log(log) {
                            println!("============================================================");
                            println!("🪙 CreateEvent 详情");
                            println!("============================================================");
                            println!("名称: {}", event.name);
                            println!("符号: {}", event.symbol);
                            println!("URI: {}", event.uri);
                            println!("Mint: {}", event.mint);
                            println!("BondingCurve: {}", event.bonding_curve);
                            println!("User: {}", event.user);
                            println!("Creator: {}", event.creator);
                            println!("时间戳: {}", event.timestamp);
                            println!("虚拟Token储备: {}", event.virtual_token_reserves);
                            println!("虚拟Sol储备: {}", event.virtual_sol_reserves);
                            println!("真实Token储备: {}", event.real_token_reserves);
                            println!("Token总供应: {}", event.token_total_supply);
                            println!("============================================================\n");

                            // 保存到数据库
                            if let Some(ref db) = self.db_service {
                                let signature = log_result.value.signature.as_str();
                                match db.save_create_event(&event, Some(signature)).await {
                                    Ok(_) => {
                                        println!("💾 ✅ CreateEvent 已成功保存到数据库");
                                    }
                                    Err(e) => {
                                        eprintln!("❌ 保存 CreateEvent 失败: {}", e);
                                    }
                                }
                            }
                            continue; // CreateEvent 解析成功，跳过 TradeEvent 尝试
                        }

                        // 再尝试解析 TradeEvent
                        if let Some(event) = self.event_parser.parse_trade_event_from_log(log) {
                            println!("============================================================");
                            println!("💱 TradeEvent 详情");
                            println!("============================================================");
                            println!("交易类型: {}", if event.is_buy { "买入 🟢" } else { "卖出 🔴" });
                            println!("Mint: {}", event.mint);
                            println!("SOL数量: {}", event.sol_amount);
                            println!("Token数量: {}", event.token_amount);
                            println!("用户: {}", event.user);
                            println!("时间戳: {}", event.timestamp);
                            println!("虚拟SOL储备: {}", event.virtual_sol_reserves);
                            println!("虚拟Token储备: {}", event.virtual_token_reserves);
                            println!("真实SOL储备: {}", event.real_sol_reserves);
                            println!("真实Token储备: {}", event.real_token_reserves);
                            println!("手续费: {}", event.fee);
                            println!("创建者: {}", event.creator);
                            println!("============================================================\n");

                            // 保存到数据库
                            if let Some(ref db) = self.db_service {
                                let signature = log_result.value.signature.as_str();
                                match db.save_trade_event(&event, Some(signature)).await {
                                    Ok(_) => {
                                        println!("💾 ✅ TradeEvent 已成功保存到数据库");
                                    }
                                    Err(e) => {
                                        eprintln!("❌ 保存 TradeEvent 失败: {}", e);
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                // 解析 VaultCreatedEvent 数据
                for log in logs {
                    if log.contains("Program data:") {
                        println!("  📊 发现程序数据日志");

                        // 解析事件
                        if let Some(event) = self.event_parser.parse_from_log(log) {
                            ViewFormatter::print_vault_created_event(&event);
                        }
                    }
                }

                // 打印完整日志
                // println!("\n  📋 完整交易日志:");
                // for log in logs {
                //     println!("    {}", log);
                // }
                // println!();
            }
        }

        // 关闭 WebSocket 连接
        shutdown_handle();
        println!("🔌 WebSocket 连接已关闭");

        Ok(())
    }

    /// 订阅特定账户的更新
    ///
    /// # Arguments
    /// * `account_pubkey` - 要订阅的账户公钥
    ///
    /// # Example
    /// ```rust,ignore
    /// let account = Pubkey::from_str("...")?;
    /// websocket_service.subscribe_account(&account).await?;
    /// ```
    pub async fn subscribe_account(
        &self,
        account_pubkey: &Pubkey,
    ) -> Result<(), Box<dyn std::error::Error>> {
        println!("📡 订阅账户更新: {}", account_pubkey);

        // 创建 PubsubClient
        let listener_client = PubsubClient::new(&self.wss_url).await?;

        // 订阅账户更新
        let (mut stream, shutdown_handle) = listener_client
            .account_subscribe(account_pubkey, None)
            .await?;

        println!("✅ 账户订阅成功\n");

        // 处理账户更新流
        while let Some(account_data) = stream.next().await {
            println!("📥 收到账户更新!");
            // UiAccountData 可能是不同的格式，需要匹配具体的数据类型
            println!("  账户数据: {:?}", account_data.value.data);
            println!("  Lamports: {}", account_data.value.lamports);
            println!("  Owner: {}", account_data.value.owner);
            println!();
        }

        // 关闭 WebSocket 连接
        shutdown_handle();
        println!("🔌 WebSocket 连接已关闭");

        Ok(())
    }
}
