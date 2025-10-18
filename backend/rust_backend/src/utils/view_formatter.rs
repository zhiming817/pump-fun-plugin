use crate::models::VaultCreatedEvent;

/// 视图格式化工具
pub struct ViewFormatter;

impl ViewFormatter {
    /// 打印 VaultCreatedEvent 事件信息
    pub fn print_vault_created_event(event: &VaultCreatedEvent) {
        println!("\n{}", "=".repeat(60));
        println!("🏦 Vault 创建事件详情");
        println!("{}", "=".repeat(60));
        println!("📊 Vault ID: {}", event.id);
        println!("👤 创建者: {}", event.creator);
        println!("📝 名称: {}", event.name);
        println!("🔖 符号: {}", event.symbol);
        println!("📈 目标 APY: {}%", event.target_apy as f64 / 100.0);
        println!(
            "💰 初始存款: {} SOL",
            event.initial_deposit as f64 / 1_000_000_000.0
        );
        println!("🎯 策略类型: {}", event.strategy_type);
        println!("⚠️  风险等级: {}", event.risk_level);
        println!("⏰ 创建时间: {}", event.created_at);
        println!("{}\n", "=".repeat(60));
    }
}
