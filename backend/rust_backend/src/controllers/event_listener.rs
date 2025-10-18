use solana_sdk::signature::Signature;
use serde_json;
use tokio::time::{sleep, Duration};

use crate::config::AppConfig;
use crate::services::{EventParserService, SolanaService};
use crate::utils::ViewFormatter;

/// 事件监听控制器
pub struct EventListenerController {
    solana_service: SolanaService,
    event_parser: EventParserService,
    poll_interval: Duration,
}

impl EventListenerController {
    /// 创建新的事件监听控制器
    pub fn new(config: AppConfig) -> Self {
        let rpc_url = config.get_rpc_url().to_string();
        let solana_service = SolanaService::new(&rpc_url, &config.program_id);
        let event_parser = EventParserService::new();
        let poll_interval = Duration::from_secs(config.poll_interval_secs);

        Self {
            solana_service,
            event_parser,
            poll_interval,
        }
    }

    /// 启动事件监听器
    pub async fn start(&self) {
        println!("📍 监听程序 ID: {}", self.solana_service.program_id());
        println!("⏳ 使用轮询方式监听 VaultCreatedEvent 事件...\n");

        let mut last_signature: Option<Signature> = None;

        loop {
            // 获取程序的最近交易签名
            match self.solana_service.fetch_signatures_for_address().await {
                Ok(signatures) => {
                    for sig_info in signatures.iter() {
                        match sig_info.signature.parse::<Signature>() {
                            Ok(signature) => {
                                // 跳过已经处理过的交易
                                if let Some(last_sig) = last_signature {
                                    if signature == last_sig {
                                        break;
                                    }
                                }

                                println!("📝 发现新交易: {}", signature);

                                // 处理交易
                                self.process_transaction(&signature).await;

                                // 更新最后处理的签名（只在第一次迭代）
                                if last_signature.is_none() {
                                    last_signature = Some(signature);
                                }
                            }
                            Err(e) => {
                                eprintln!("  ❌ 签名解析失败: {}", e);
                            }
                        }
                    }

                    // 更新最后处理的签名
                    if let Some(first_sig) = signatures.first() {
                        if let Ok(sig) = first_sig.signature.parse::<Signature>() {
                            last_signature = Some(sig);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("❌ 获取交易签名失败: {}", e);
                }
            }

            // 等待后再次轮询
            sleep(self.poll_interval).await;
        }
    }

    /// 处理单个交易
    async fn process_transaction(&self, signature: &Signature) {
        match self.solana_service.get_transaction(signature).await {
            Ok(transaction) => {
                if let Some(meta) = transaction.transaction.meta {
                    let meta_json = serde_json::to_value(&meta).unwrap_or_default();
                    if let Some(logs) = meta_json.get("logMessages").and_then(|v| v.as_array()) {
                        let mut found_create_event = false;
                        for log_val in logs {
                            if let Some(log_line) = log_val.as_str() {
                                // 检查是否是 CreateEvent 指令
                                if log_line.contains("Instruction: CreateEvent") {
                                    found_create_event = true;
                                    println!("  🎯 检测到 CreateEvent 指令!");
                                }
                                // 只处理目标 program_id
                                if self.solana_service.program_id().to_string() == "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P" {
                                    // 尝试解析 CreateEvent 数据
                                    if log_line.contains("Program data:") {
                                        println!("  📊 发现 CreateEvent 数据日志");
                                        if let Some(event) = self.event_parser.parse_create_event_from_log(log_line) {
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
                                        }
                                    }
                                }
                            }
                        }
                        if found_create_event {
                            // println!("\n  📋 完整交易日志:");
                            // for log_val in logs {
                            //     if let Some(log) = log_val.as_str() {
                            //         println!("    {}", log);
                            //     }
                            // }
                            // println!();
                        }
                    }
                }
            }
            Err(e) => {
                eprintln!("  ❌ 获取交易失败: {}", e);
            }
        }
    }
}
