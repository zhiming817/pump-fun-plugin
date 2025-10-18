use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// TradeEvent 实体模型
/// 对应 SQL 表结构
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "trade_events")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i64,
    
    #[sea_orm(column_type = "String(StringLen::N(255))")]
    pub mint: String,
    
    pub sol_amount: i64,
    pub token_amount: i64,
    pub is_buy: bool,
    
    #[sea_orm(column_type = "String(StringLen::N(255))")]
    pub user: String,
    
    pub timestamp: i64,
    pub virtual_sol_reserves: i64,
    pub virtual_token_reserves: i64,
    pub real_sol_reserves: i64,
    pub real_token_reserves: i64,
    
    #[sea_orm(column_type = "String(StringLen::N(255))")]
    pub fee_recipient: String,
    
    pub fee_basis_points: i64,
    pub fee: i64,
    
    #[sea_orm(column_type = "String(StringLen::N(255))")]
    pub creator: String,
    
    pub creator_fee_basis_points: i64,
    pub creator_fee: i64,
    pub track_volume: bool,
    pub total_unclaimed_tokens: i64,
    pub total_claimed_tokens: i64,
    pub current_sol_volume: i64,
    pub last_update_timestamp: i64,
    
    #[sea_orm(column_type = "String(StringLen::N(255))", nullable)]
    pub signature: Option<String>,
    
    pub created_at: DateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
