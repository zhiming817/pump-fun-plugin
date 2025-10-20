use std::sync::Arc;
use rust_backend::config::AppConfig;
use rust_backend::services::database_service::DatabaseService;
use rust_backend::controllers::create_router;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 启动 PumpFun Oath HTTP API 服务器...");

    // 加载配置
    let config = AppConfig::from_yaml_or_default("config.yaml");
    println!("✅ 配置加载成功");

    // 初始化数据库服务
    let db_service = Arc::new(DatabaseService::new(&config.database).await?);
    println!("✅ 数据库连接成功");

    // 创建路由
    let app = create_router(db_service);

    // 绑定地址和端口
    let addr = "0.0.0.0:3000";
    let listener = tokio::net::TcpListener::bind(addr).await?;
    
    println!("🌐 HTTP API 服务器运行在: http://{}", addr);
    println!("\n📋 可用的 API 端点:");
    println!("  GET  http://{}           - API 信息", addr);
    println!("  GET  http://{}/health           - 健康检查", addr);
    println!("  GET  http://{}/api/events       - 获取所有事件", addr);
    println!("  GET  http://{}/api/events/recent/{{limit}} - 获取最近的 N 条事件", addr);
    println!("  GET  http://{}/api/events/count - 统计事件总数", addr);
    println!("  GET  http://{}/api/events/mint/{{mint}} - 根据 mint 查询", addr);
    println!("  GET  http://{}/api/events/creator/{{creator}} - 根据创建者查询", addr);
    println!("\n按 Ctrl+C 停止服务器\n");

    // 启动服务器
    axum::serve(listener, app).await?;

    Ok(())
}
