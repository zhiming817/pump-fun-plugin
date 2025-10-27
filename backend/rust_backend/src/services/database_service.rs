use sea_orm::*;
use sea_orm::sea_query::OnConflict;
use std::time::Duration;

use crate::config::DatabaseConfig;
use crate::models::{CreateEvent, TradeEvent, OathCreatedEvent};
use crate::models::create_event_entity::{self, Entity as CreateEventEntity, Model as CreateEventModel};
use crate::models::trade_event_entity::{self, Entity as TradeEventEntity, Model as TradeEventModel};
use crate::models::oath_created_event_entity::{self, Entity as OathCreatedEventEntity, Model as OathCreatedEventModel};
use crate::services::metadata_parser::{MetadataParserService, UriMetadata};

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
        
        // 创建 oath_created_events 表
        let oath_created_event_stmt = schema.create_table_from_entity(OathCreatedEventEntity);
        match self.db.execute(backend.build(&oath_created_event_stmt)).await {
            Ok(_) => println!("✅ oath_created_events 表初始化成功"),
            Err(e) => {
                if e.to_string().contains("already exists") || e.to_string().contains("Duplicate") {
                    println!("✅ oath_created_events 表已存在");
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
            twitter: NotSet,
            telegram: NotSet,
            website: NotSet,
            image: NotSet,
            created_at: Set(chrono::Utc::now().naive_utc()),
        };

        // 直接插入
        let insert_result = CreateEventEntity::insert(active_model)
            .exec(&self.db)
            .await?;

        println!("💾 CreateEvent 已保存到数据库");

        // 异步获取并更新元数据（不阻塞主流程）
        let mint_clone = mint_str.clone();
        let uri_clone = event.uri.clone();
        let db_clone = self.db.clone();
        
        tokio::spawn(async move {
            println!("📥 开始异步获取元数据: {}", mint_clone);
            let metadata_service = MetadataParserService::new();
            
            match metadata_service.fetch_metadata_with_retry(&uri_clone, 3).await {
                Ok(metadata) => {
                    // 更新数据库
                    if let Ok(Some(event_model)) = CreateEventEntity::find()
                        .filter(create_event_entity::Column::Mint.eq(&mint_clone))
                        .one(&db_clone)
                        .await
                    {
                        let mut active_model: create_event_entity::ActiveModel = event_model.into();
                        active_model.twitter = Set(metadata.twitter);
                        active_model.telegram = Set(metadata.telegram);
                        active_model.website = Set(metadata.website);
                        active_model.image = Set(metadata.image);

                        if let Err(e) = active_model.update(&db_clone).await {
                            eprintln!("❌ 更新元数据失败 {}: {}", mint_clone, e);
                        } else {
                            println!("✅ 元数据已更新: {}", mint_clone);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("❌ 获取元数据失败 {}: {}", mint_clone, e);
                }
            }
        });

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

    /// 从 URI 解析元数据并更新到数据库
    ///
    /// # Arguments
    /// * `mint` - Token mint 地址
    ///
    /// # Returns
    /// * `Result<(), Box<dyn std::error::Error>>` - 成功返回 Ok，失败返回错误
    ///
    /// # Example
    /// ```ignore
    /// db_service.fetch_and_update_metadata("HZWKVfammvEHaNfPnYTppEgXYppZWfqPiGgxwgAjEdVv").await?;
    /// ```
    pub async fn fetch_and_update_metadata(&self, mint: &str) -> Result<(), Box<dyn std::error::Error>> {
        // 1. 从数据库获取事件记录
        let event = CreateEventEntity::find()
            .filter(create_event_entity::Column::Mint.eq(mint))
            .one(&self.db)
            .await?;

        let event = match event {
            Some(e) => e,
            None => {
                return Err(format!("未找到 mint: {} 的记录", mint).into());
            }
        };

        // 检查是否已经有元数据
        if event.twitter.is_some() || event.telegram.is_some() || event.website.is_some() || event.image.is_some() {
            println!("ℹ️  记录 {} 已有元数据，跳过", mint);
            return Ok(());
        }

        // 2. 获取并解析 URI 元数据
        let metadata_service = MetadataParserService::new();
        let metadata = metadata_service
            .fetch_metadata_with_retry(&event.uri, 3)
            .await?;

        // 3. 更新数据库记录
        let mut active_model: create_event_entity::ActiveModel = event.into();
        active_model.twitter = Set(metadata.twitter);
        active_model.telegram = Set(metadata.telegram);
        active_model.website = Set(metadata.website);
        active_model.image = Set(metadata.image);

        active_model.update(&self.db).await?;

        println!("✅ 元数据已更新到数据库: {}", mint);
        Ok(())
    }

    /// 批量处理所有未解析元数据的记录
    ///
    /// # Returns
    /// * `Result<(usize, usize), Box<dyn std::error::Error>>` - 返回 (成功数, 失败数)
    pub async fn fetch_and_update_all_metadata(&self) -> Result<(usize, usize), Box<dyn std::error::Error>> {
        println!("🔄 开始批量获取元数据...");

        // 查询所有未解析元数据的记录
        let events = CreateEventEntity::find()
            .filter(
                create_event_entity::Column::Twitter.is_null()
                    .and(create_event_entity::Column::Telegram.is_null())
                    .and(create_event_entity::Column::Website.is_null())
                    .and(create_event_entity::Column::Image.is_null())
            )
            .all(&self.db)
            .await?;

        if events.is_empty() {
            println!("✅ 所有记录都已有元数据");
            return Ok((0, 0));
        }

        println!("📊 找到 {} 条待处理记录", events.len());

        let mut success_count = 0;
        let mut fail_count = 0;
        let metadata_service = MetadataParserService::new();

        for (index, event) in events.iter().enumerate() {
            println!("\n[{}/{}] 处理: {} ({})", index + 1, events.len(), event.name, event.mint);

            match metadata_service.fetch_metadata_with_retry(&event.uri, 3).await {
                Ok(metadata) => {
                    // 更新数据库
                    let mut active_model: create_event_entity::ActiveModel = event.clone().into();
                    active_model.twitter = Set(metadata.twitter);
                    active_model.telegram = Set(metadata.telegram);
                    active_model.website = Set(metadata.website);
                    active_model.image = Set(metadata.image);

                    match active_model.update(&self.db).await {
                        Ok(_) => {
                            println!("✅ 元数据已更新");
                            success_count += 1;
                        }
                        Err(e) => {
                            eprintln!("❌ 数据库更新失败: {}", e);
                            fail_count += 1;
                        }
                    }
                }
                Err(e) => {
                    eprintln!("❌ 获取元数据失败: {}", e);
                    fail_count += 1;
                }
            }

            // 避免请求过快，每次请求后休眠
            if index < events.len() - 1 {
                tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
            }
        }

        println!("\n📊 批量处理完成:");
        println!("  ✅ 成功: {}", success_count);
        println!("  ❌ 失败: {}", fail_count);

        Ok((success_count, fail_count))
    }

    /// 保存 OathCreatedEvent 到数据库
    /// 
    /// # Arguments
    /// * `event` - OathCreatedEvent 事件数据
    /// * `signature` - 可选的交易签名
    /// 
    /// # Returns
    /// * `Result<(), Box<dyn std::error::Error>>` - 成功返回 Ok，失败返回错误
    pub async fn save_oath_created_event(
        &self,
        event: &OathCreatedEvent,
        signature: Option<&str>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        // 检查 oath_id 是否已存在
        let exists = OathCreatedEventEntity::find()
            .filter(oath_created_event_entity::Column::OathId.eq(event.oath_id as i64))
            .one(&self.db)
            .await?;

        if exists.is_some() {
            println!("ℹ️  OathCreatedEvent 已存在（oath_id: {}），跳过", event.oath_id);
            return Ok(());
        }

        // 插入新记录
        let active_model = oath_created_event_entity::ActiveModel {
            id: NotSet,
            oath_id: Set(event.oath_id as i64),
            creator: Set(event.creator.to_string()),
            token_address: Set(event.token_address.to_string()),
            sol_collateral: Set(event.sol_collateral as i64),
            target_market_cap: Set(event.target_market_cap as i64),
            start_time: Set(event.start_time as i64),
            end_time: Set(event.end_time as i64),
            timestamp: Set(event.timestamp),
            signature: Set(signature.map(|s| s.to_string())),
            created_at: Set(chrono::Utc::now().naive_utc()),
        };

        OathCreatedEventEntity::insert(active_model)
            .exec(&self.db)
            .await?;

        println!("💾 OathCreatedEvent 已保存到数据库 (oath_id: {})", event.oath_id);
        Ok(())
    }

    /// 根据 oath_id 查询事件
    pub async fn get_oath_event_by_id(&self, oath_id: u64) -> Result<Option<OathCreatedEventModel>, Box<dyn std::error::Error>> {
        let event = OathCreatedEventEntity::find()
            .filter(oath_created_event_entity::Column::OathId.eq(oath_id as i64))
            .one(&self.db)
            .await?;

        Ok(event)
    }

    /// 根据创建者查询 Oath 事件
    pub async fn get_oath_events_by_creator(&self, creator: &str) -> Result<Vec<OathCreatedEventModel>, Box<dyn std::error::Error>> {
        let events = OathCreatedEventEntity::find()
            .filter(oath_created_event_entity::Column::Creator.eq(creator))
            .order_by_desc(oath_created_event_entity::Column::CreatedAt)
            .all(&self.db)
            .await?;

        Ok(events)
    }

    /// 根据 token 地址查询 Oath 事件
    pub async fn get_oath_events_by_token(&self, token_address: &str) -> Result<Vec<OathCreatedEventModel>, Box<dyn std::error::Error>> {
        let events = OathCreatedEventEntity::find()
            .filter(oath_created_event_entity::Column::TokenAddress.eq(token_address))
            .order_by_desc(oath_created_event_entity::Column::CreatedAt)
            .all(&self.db)
            .await?;

        Ok(events)
    }

    /// 获取最近的 Oath 事件
    pub async fn get_recent_oath_events(&self, limit: u64) -> Result<Vec<OathCreatedEventModel>, Box<dyn std::error::Error>> {
        let events = OathCreatedEventEntity::find()
            .order_by_desc(oath_created_event_entity::Column::CreatedAt)
            .limit(limit)
            .all(&self.db)
            .await?;

        Ok(events)
    }

    /// 统计 Oath 事件总数
    pub async fn count_oath_events(&self) -> Result<u64, Box<dyn std::error::Error>> {
        let count = OathCreatedEventEntity::find()
            .count(&self.db)
            .await?;

        Ok(count)
    }

    /// 分页获取 Oath 事件
    pub async fn get_oath_events_paginated(&self, offset: u64, limit: u64) -> Result<Vec<OathCreatedEventModel>, Box<dyn std::error::Error>> {
        let events = OathCreatedEventEntity::find()
            .order_by_desc(oath_created_event_entity::Column::CreatedAt)
            .offset(offset)
            .limit(limit)
            .all(&self.db)
            .await?;

        Ok(events)
    }

    /// 统计创建者的 Oath 事件总数
    pub async fn count_oath_events_by_creator(&self, creator: &str) -> Result<u64, Box<dyn std::error::Error>> {
        let count = OathCreatedEventEntity::find()
            .filter(oath_created_event_entity::Column::Creator.eq(creator))
            .count(&self.db)
            .await?;

        Ok(count)
    }

    /// 分页根据创建者查询 Oath 事件
    pub async fn get_oath_events_by_creator_paginated(&self, creator: &str, offset: u64, limit: u64) -> Result<Vec<OathCreatedEventModel>, Box<dyn std::error::Error>> {
        let events = OathCreatedEventEntity::find()
            .filter(oath_created_event_entity::Column::Creator.eq(creator))
            .order_by_desc(oath_created_event_entity::Column::CreatedAt)
            .offset(offset)
            .limit(limit)
            .all(&self.db)
            .await?;

        Ok(events)
    }

    /// 统计 token 的 Oath 事件总数
    pub async fn count_oath_events_by_token(&self, token_address: &str) -> Result<u64, Box<dyn std::error::Error>> {
        let count = OathCreatedEventEntity::find()
            .filter(oath_created_event_entity::Column::TokenAddress.eq(token_address))
            .count(&self.db)
            .await?;

        Ok(count)
    }

    /// 分页根据 token 地址查询 Oath 事件
    pub async fn get_oath_events_by_token_paginated(&self, token_address: &str, offset: u64, limit: u64) -> Result<Vec<OathCreatedEventModel>, Box<dyn std::error::Error>> {
        let events = OathCreatedEventEntity::find()
            .filter(oath_created_event_entity::Column::TokenAddress.eq(token_address))
            .order_by_desc(oath_created_event_entity::Column::CreatedAt)
            .offset(offset)
            .limit(limit)
            .all(&self.db)
            .await?;

        Ok(events)
    }
}
