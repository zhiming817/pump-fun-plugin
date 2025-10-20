use sea_orm::*;
use sea_orm::sea_query::OnConflict;
use std::time::Duration;

use crate::config::DatabaseConfig;
use crate::models::{CreateEvent, TradeEvent};
use crate::models::create_event_entity::{self, Entity as CreateEventEntity, Model as CreateEventModel};
use crate::models::trade_event_entity::{self, Entity as TradeEventEntity, Model as TradeEventModel};

/// 数据库服务 - 使用 SeaORM
pub struct DatabaseService {
    db: DatabaseConnection,
}

impl DatabaseService {
    /// 创建新的数据库服务实例
    pub async fn new(config: &DatabaseConfig) -> Result<Self, Box<dyn std::error::Error>> {
        let database_url = match config.db_type.as_str() {
            "sqlite" => {
                let sqlite_path = config.sqlite_path.as_ref()
                    .ok_or("SQLite path not configured")?;
                
                // 确保数据目录存在
                if let Some(parent) = std::path::Path::new(sqlite_path).parent() {
                    std::fs::create_dir_all(parent)?;
                }
                
                format!("sqlite:{}?mode=rwc", sqlite_path)
            }
            "postgres" => {
                config.postgres_url.as_ref()
                    .ok_or("PostgreSQL URL not configured")?
                    .clone()
            }
            "mysql" => {
                let host = config.mysql_host.as_ref()
                    .ok_or("MySQL host not configured")?;
                let port = config.mysql_port
                    .ok_or("MySQL port not configured")?;
                let user = config.mysql_user.as_ref()
                    .ok_or("MySQL user not configured")?;
                let password = config.mysql_password.as_ref()
                    .ok_or("MySQL password not configured")?;
                let database = config.mysql_database.as_ref()
                    .ok_or("MySQL database not configured")?;
                
                format!(
                    "mysql://{}:{}@{}:{}/{}",
                    user, password, host, port, database
                )
            }
            _ => return Err("Unsupported database type".into()),
        };

        // 创建数据库连接
        let mut opt = ConnectOptions::new(database_url);
        opt.max_connections(config.max_connections)
            .min_connections(config.min_connections)
            .connect_timeout(Duration::from_secs(8))
            .acquire_timeout(Duration::from_secs(8))
            .idle_timeout(Duration::from_secs(8))
            .max_lifetime(Duration::from_secs(8))
            .sqlx_logging(true);

        let db = Database::connect(opt).await?;
        
        let service = Self { db };
        
        // 初始化数据库表
        service.initialize_tables().await?;
        
        Ok(service)
    }

    /// 初始化数据库表
    async fn initialize_tables(&self) -> Result<(), Box<dyn std::error::Error>> {
        let backend = self.db.get_database_backend();
        let schema = sea_orm::Schema::new(backend);
        
        // 创建 create_events 表
        let create_event_stmt = schema.create_table_from_entity(CreateEventEntity);
        match self.db.execute(backend.build(&create_event_stmt)).await {
            Ok(_) => println!("✅ create_events 表初始化成功"),
            Err(e) => {
                if e.to_string().contains("already exists") || e.to_string().contains("Duplicate") {
                    println!("✅ create_events 表已存在");
                } else {
                    return Err(e.into());
                }
            }
        }
        
        // 创建 trade_events 表
        let trade_event_stmt = schema.create_table_from_entity(TradeEventEntity);
        match self.db.execute(backend.build(&trade_event_stmt)).await {
            Ok(_) => println!("✅ trade_events 表初始化成功"),
            Err(e) => {
                if e.to_string().contains("already exists") || e.to_string().contains("Duplicate") {
                    println!("✅ trade_events 表已存在");
                } else {
                    return Err(e.into());
                }
            }
        }
        
        Ok(())
    }

    /// 保存 CreateEvent 到数据库
    pub async fn save_create_event(
        &self,
        event: &CreateEvent,
        signature: Option<&str>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        // 先检查 mint 是否已存在
        let mint_str = event.mint.to_string();
        let exists = CreateEventEntity::find()
            .filter(create_event_entity::Column::Mint.eq(&mint_str))
            .one(&self.db)
            .await?;

        if exists.is_some() {
            println!("ℹ️  CreateEvent 已存在（mint: {}），跳过", mint_str);
            return Ok(());
        }

        // 如果不存在，插入新记录
        let active_model = create_event_entity::ActiveModel {
            id: NotSet,
            mint: Set(mint_str.clone()),
            name: Set(event.name.clone()),
            symbol: Set(event.symbol.clone()),
            uri: Set(event.uri.clone()),
            bonding_curve: Set(event.bonding_curve.to_string()),
            user_account: Set(event.user.to_string()),
            creator: Set(event.creator.to_string()),
            timestamp: Set(event.timestamp as i64),
            virtual_token_reserves: Set(event.virtual_token_reserves as i64),
            virtual_sol_reserves: Set(event.virtual_sol_reserves as i64),
            real_token_reserves: Set(event.real_token_reserves as i64),
            token_total_supply: Set(event.token_total_supply as i64),
            signature: Set(signature.map(|s| s.to_string())),
            created_at: Set(chrono::Utc::now().naive_utc()),
        };

        // 直接插入
        CreateEventEntity::insert(active_model)
            .exec(&self.db)
            .await?;

        println!("💾 CreateEvent 已保存到数据库");
        Ok(())
    }

    /// 检查 mint 是否已存在
    pub async fn mint_exists(&self, mint: &str) -> Result<bool, Box<dyn std::error::Error>> {
        let count = CreateEventEntity::find()
            .filter(create_event_entity::Column::Mint.eq(mint))
            .count(&self.db)
            .await?;

        Ok(count > 0)
    }

    /// 获取所有 CreateEvent 记录
    pub async fn get_all_events(&self) -> Result<Vec<CreateEventModel>, Box<dyn std::error::Error>> {
        let events = CreateEventEntity::find()
            .order_by_desc(create_event_entity::Column::CreatedAt)
            .all(&self.db)
            .await?;

        Ok(events)
    }

    /// 分页获取 CreateEvent 记录
    pub async fn get_events_paginated(&self, offset: u64, limit: u64) -> Result<Vec<CreateEventModel>, Box<dyn std::error::Error>> {
        let events = CreateEventEntity::find()
            .order_by_desc(create_event_entity::Column::CreatedAt)
            .offset(offset)
            .limit(limit)
            .all(&self.db)
            .await?;

        Ok(events)
    }

    /// 根据 mint 查询事件
    pub async fn get_event_by_mint(&self, mint: &str) -> Result<Option<CreateEventModel>, Box<dyn std::error::Error>> {
        let event = CreateEventEntity::find()
            .filter(create_event_entity::Column::Mint.eq(mint))
            .one(&self.db)
            .await?;

        Ok(event)
    }

    /// 获取最近的 N 条记录
    pub async fn get_recent_events(&self, limit: u64) -> Result<Vec<CreateEventModel>, Box<dyn std::error::Error>> {
        let events = CreateEventEntity::find()
            .order_by_desc(create_event_entity::Column::CreatedAt)
            .limit(limit)
            .all(&self.db)
            .await?;

        Ok(events)
    }

    /// 根据创建者查询事件
    pub async fn get_events_by_creator(&self, creator: &str) -> Result<Vec<CreateEventModel>, Box<dyn std::error::Error>> {
        let events = CreateEventEntity::find()
            .filter(create_event_entity::Column::Creator.eq(creator))
            .order_by_desc(create_event_entity::Column::CreatedAt)
            .all(&self.db)
            .await?;

        Ok(events)
    }

    /// 分页根据创建者查询事件
    pub async fn get_events_by_creator_paginated(&self, creator: &str, offset: u64, limit: u64) -> Result<Vec<CreateEventModel>, Box<dyn std::error::Error>> {
        let events = CreateEventEntity::find()
            .filter(create_event_entity::Column::Creator.eq(creator))
            .order_by_desc(create_event_entity::Column::CreatedAt)
            .offset(offset)
            .limit(limit)
            .all(&self.db)
            .await?;

        Ok(events)
    }

    /// 统计创建者的事件总数
    pub async fn count_by_creator(&self, creator: &str) -> Result<u64, Box<dyn std::error::Error>> {
        let count = CreateEventEntity::find()
            .filter(create_event_entity::Column::Creator.eq(creator))
            .count(&self.db)
            .await?;

        Ok(count)
    }

    /// 统计总记录数
    pub async fn count_all(&self) -> Result<u64, Box<dyn std::error::Error>> {
        let count = CreateEventEntity::find()
            .count(&self.db)
            .await?;

        Ok(count)
    }

    /// 保存 TradeEvent 到数据库
    pub async fn save_trade_event(&self, event: &TradeEvent, signature: Option<&str>) -> Result<(), Box<dyn std::error::Error>> {
        let trade_event = trade_event_entity::ActiveModel {
            mint: Set(event.mint.to_string()),
            sol_amount: Set(event.sol_amount as i64),
            token_amount: Set(event.token_amount as i64),
            is_buy: Set(event.is_buy),
            user: Set(event.user.to_string()),
            timestamp: Set(event.timestamp as i64),
            virtual_sol_reserves: Set(event.virtual_sol_reserves as i64),
            virtual_token_reserves: Set(event.virtual_token_reserves as i64),
            real_sol_reserves: Set(event.real_sol_reserves as i64),
            real_token_reserves: Set(event.real_token_reserves as i64),
            fee_recipient: Set(event.fee_recipient.to_string()),
            fee_basis_points: Set(event.fee_basis_points as i64),
            fee: Set(event.fee as i64),
            creator: Set(event.creator.to_string()),
            creator_fee_basis_points: Set(event.creator_fee_basis_points as i64),
            creator_fee: Set(event.creator_fee as i64),
            track_volume: Set(event.track_volume),
            total_unclaimed_tokens: Set(event.total_unclaimed_tokens as i64),
            total_claimed_tokens: Set(event.total_claimed_tokens as i64),
            current_sol_volume: Set(event.current_sol_volume as i64),
            last_update_timestamp: Set(event.last_update_timestamp as i64),
            signature: Set(signature.map(|s| s.to_string())),
            created_at: Set(chrono::Utc::now().naive_utc()),
            ..Default::default()
        };

        TradeEventEntity::insert(trade_event)
            .exec(&self.db)
            .await?;

        Ok(())
    }

    /// 获取指定 mint 的所有交易事件
    pub async fn get_trade_events_by_mint(&self, mint: &str) -> Result<Vec<TradeEventModel>, Box<dyn std::error::Error>> {
        let events = TradeEventEntity::find()
            .filter(trade_event_entity::Column::Mint.eq(mint))
            .order_by_desc(trade_event_entity::Column::CreatedAt)
            .all(&self.db)
            .await?;

        Ok(events)
    }

    /// 获取最近的交易事件
    pub async fn get_recent_trade_events(&self, limit: u64) -> Result<Vec<TradeEventModel>, Box<dyn std::error::Error>> {
        let events = TradeEventEntity::find()
            .order_by_desc(trade_event_entity::Column::CreatedAt)
            .limit(limit)
            .all(&self.db)
            .await?;

        Ok(events)
    }
}
