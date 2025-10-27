use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "oath_created_events")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    pub id: i32,
    
    /// Oath ID (唯一标识)
    #[sea_orm(unique)]
    pub oath_id: i64,
    
    /// 创建者地址
    #[sea_orm(indexed)]
    pub creator: String,
    
    /// Token 地址
    #[sea_orm(indexed)]
    pub token_address: String,
    
    /// SOL 抵押金额 (lamports)
    pub sol_collateral: i64,
    
    /// 目标市值 (USDC, 6 decimals)
    pub target_market_cap: i64,
    
    /// 开始时间 (Unix timestamp)
    pub start_time: i64,
    
    /// 结束时间 (Unix timestamp)
    pub end_time: i64,
    
    /// 事件时间戳
    pub timestamp: i64,
    
    /// 交易签名（可选）
    pub signature: Option<String>,
    
    /// 创建时间
    pub created_at: DateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
