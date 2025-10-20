use rust_backend::config::AppConfig;
use rust_backend::services::database_service::DatabaseService;
use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 URI 元数据解析工具\n");

    // 加载配置
    let config = AppConfig::from_yaml_or_default("config.yaml");
    println!("✅ 配置加载成功\n");

    // 连接数据库
    let db_service = DatabaseService::new(&config.database).await?;
    println!("✅ 数据库连接成功\n");

    // 获取命令行参数
    let args: Vec<String> = env::args().collect();

    if args.len() > 1 {
        // 处理单个 mint
        let mint = &args[1];
        println!("🎯 处理单个记录: {}\n", mint);
        
        match db_service.fetch_and_update_metadata(mint).await {
            Ok(_) => println!("\n✅ 完成"),
            Err(e) => eprintln!("\n❌ 失败: {}", e),
        }
    } else {
        // 批量处理所有记录
        println!("🔄 批量处理所有未解析的记录\n");
        
        match db_service.fetch_and_update_all_metadata().await {
            Ok((success, fail)) => {
                println!("\n✅ 批量处理完成");
                println!("  成功: {}", success);
                println!("  失败: {}", fail);
            }
            Err(e) => eprintln!("\n❌ 批量处理失败: {}", e),
        }
    }

    Ok(())
}
