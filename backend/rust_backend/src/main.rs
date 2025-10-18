mod config;
mod controllers;
mod models;
mod services;
mod utils;

use config::{AppConfig, ListenerMode};
use controllers::{EventListenerController, WebSocketListenerController};

#[tokio::main]
async fn main() {
    println!("🚀 启动 Solana Vault 事件监听器...\n");

    // 加载配置（优先级：环境变量 > YAML 文件 > 默认值）
    let config = AppConfig::from_yaml_with_env("config.yaml");
    
    // 显示当前激活的网络
    println!("🌐 激活网络: {:?}", config.active_network);
    println!("🔗 RPC 端点: {}", config.get_rpc_url());
    println!();

    // 根据配置选择监听模式
    match config.listener_mode {
        ListenerMode::WebSocket => {
            println!("📡 使用 WebSocket 模式 (实时监听)\n");
            match WebSocketListenerController::new(config).await {
                Ok(controller) => {
                    if let Err(e) = controller.start().await {
                        eprintln!("❌ WebSocket 监听失败: {}", e);
                    }
                }
                Err(e) => {
                    eprintln!("❌ 无法创建 WebSocket 控制器: {}", e);
                }
            }
        }
        ListenerMode::Polling => {
            println!("🔄 使用轮询模式 (每 {} 秒检查一次)\n", config.poll_interval_secs);
            let controller = EventListenerController::new(config);
            controller.start().await;
        }
    }
}
