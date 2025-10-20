mod config;
mod controllers;
mod models;
mod services;
mod utils;

use std::sync::Arc;
use config::{AppConfig, ListenerMode};
use controllers::{EventListenerController, WebSocketListenerController, create_router};
use services::database_service::DatabaseService;

#[tokio::main]
async fn main() {
    println!("🚀 启动 Solana Vault 事件监听器...\n");

    // 加载配置（优先级：环境变量 > YAML 文件 > 默认值）
    let config = AppConfig::from_yaml_with_env("config.yaml");
    
    // 显示当前激活的网络
    println!("🌐 激活网络: {:?}", config.active_network);
    println!("🔗 RPC 端点: {}", config.get_rpc_url());
    println!("🎯 事件解析模式: {:?}", config.event_parse_mode);
    println!();

    // 检查是否启用 HTTP API 服务器（通过环境变量）
    let enable_http = std::env::var("ENABLE_HTTP_API")
        .unwrap_or_else(|_| "false".to_string())
        .parse::<bool>()
        .unwrap_or(false);

    // 如果启用了 HTTP API，启动服务器
    if enable_http {
        let db_config = config.database.clone();
        tokio::spawn(async move {
            println!("🌐 启动 HTTP API 服务器...");
            
            let db_service = match DatabaseService::new(&db_config).await {
                Ok(service) => Arc::new(service),
                Err(e) => {
                    eprintln!("❌ 数据库连接失败: {}", e);
                    return;
                }
            };
            
            let app = create_router(db_service);
            
            let addr = "0.0.0.0:3000";
            let listener = match tokio::net::TcpListener::bind(addr).await {
                Ok(l) => l,
                Err(e) => {
                    eprintln!("❌ 无法绑定端口 {}: {}", addr, e);
                    return;
                }
            };
            
            println!("✅ HTTP API 服务器运行在: http://{}", addr);
            println!("\n📋 可用的 API 端点:");
            println!("  GET  http://{}                      - API 信息", addr);
            println!("  GET  http://{}/health              - 健康检查", addr);
            println!("  GET  http://{}/api/events          - 获取所有事件", addr);
            println!("  GET  http://{}/api/events/recent/{{limit}} - 获取最近的 N 条事件", addr);
            println!("  GET  http://{}/api/events/count    - 统计事件总数", addr);
            println!("  GET  http://{}/api/events/mint/{{mint}} - 根据 mint 查询", addr);
            println!("  GET  http://{}/api/events/creator/{{creator}} - 根据创建者查询\n", addr);
            
            if let Err(e) = axum::serve(listener, app).await {
                eprintln!("❌ HTTP 服务器错误: {}", e);
            }
        });
        
        // 等待一秒让 HTTP 服务器输出完成
        tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
    }

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
