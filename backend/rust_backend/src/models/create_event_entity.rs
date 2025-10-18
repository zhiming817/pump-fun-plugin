use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// CreateEvent 实体模型
/// 对应 SQL:
/// - id: BIGINT AUTO_INCREMENT PRIMARY KEY
/// - mint: VARCHAR(255) NOT NULL UNIQUE
/// - name: VARCHAR(255) NOT NULL
/// - symbol: VARCHAR(100) NOT NULL
/// - uri: TEXT NOT NULL
/// - bonding_curve: VARCHAR(255) NOT NULL
/// - user_account: VARCHAR(255) NOT NULL
/// - creator: VARCHAR(255) NOT NULL
/// - timestamp: BIGINT NOT NULL
/// - virtual_token_reserves: BIGINT NOT NULL
/// - virtual_sol_reserves: BIGINT NOT NULL
/// - real_token_reserves: BIGINT NOT NULL
/// - token_total_supply: BIGINT NOT NULL
/// - signature: VARCHAR(255)
/// - created_at: DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "create_events")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i64,
    
    #[sea_orm(column_type = "String(StringLen::N(100))", unique)]
    pub mint: String,
    
    #[sea_orm(column_type = "String(StringLen::N(255))")]
    pub name: String,
    
    #[sea_orm(column_type = "String(StringLen::N(100))")]
    pub symbol: String,
    
    #[sea_orm(column_type = "Text")]
    pub uri: String,
    
    #[sea_orm(column_type = "String(StringLen::N(255))")]
    pub bonding_curve: String,
    
    #[sea_orm(column_type = "String(StringLen::N(255))")]
    pub user_account: String,
    
    #[sea_orm(column_type = "String(StringLen::N(255))")]
    pub creator: String,
    
    pub timestamp: i64,
    pub virtual_token_reserves: i64,
    pub virtual_sol_reserves: i64,
    pub real_token_reserves: i64,
    pub token_total_supply: i64,
    
    #[sea_orm(column_type = "String(StringLen::N(100))", nullable)]
    pub signature: Option<String>,
    
    pub created_at: DateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
