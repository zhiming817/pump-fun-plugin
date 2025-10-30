use axum::{
    extract::{State, Query},
    http::StatusCode,
    response::IntoResponse,
    Json,
    Router,
    routing::get,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tower_http::cors::{CorsLayer, Any};

use crate::services::database_service::DatabaseService;
use crate::models::create_event_entity::Model as CreateEventModel;
use crate::models::oath_created_event_entity::Model as OathCreatedEventModel;

/// HTTP 服务器状态
#[derive(Clone)]
pub struct AppState {
    pub db_service: Arc<DatabaseService>,
}

/// API 响应结构
#[derive(Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub total: Option<u64>,
    pub page: Option<u64>,
    pub page_size: Option<u64>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            total: None,
            page: None,
            page_size: None,
        }
    }

    pub fn success_with_total(data: T, total: u64) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            total: Some(total),
            page: None,
            page_size: None,
        }
    }

    pub fn success_with_pagination(data: T, total: u64, page: u64, page_size: u64) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            total: Some(total),
            page: Some(page),
            page_size: Some(page_size),
        }
    }

    pub fn error(error: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
            total: None,
            page: None,
            page_size: None,
        }
    }
}

/// 分页参数
#[derive(Debug, Deserialize)]
pub struct PaginationParams {
    #[serde(default = "default_page")]
    pub page: u64,
    #[serde(default = "default_page_size")]
    pub page_size: u64,
}

fn default_page() -> u64 {
    1
}

fn default_page_size() -> u64 {
    10
}

impl PaginationParams {
    pub fn offset(&self) -> u64 {
        (self.page - 1) * self.page_size
    }

    pub fn limit(&self) -> u64 {
        self.page_size
    }
}

/// 创建 HTTP 路由
pub fn create_router(db_service: Arc<DatabaseService>) -> Router {
    let state = AppState { db_service };

    // 配置 CORS - 允许所有来源的跨域请求
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any)
        .allow_credentials(true)
        .expose_headers(Any);

    Router::new()
        .route("/", get(root_handler))
        .route("/health", get(health_handler))
        .route("/api/events", get(get_all_events_handler))
        .route("/api/events/", get(get_all_events_handler))
        .route("/api/events/recent/{limit}", get(get_recent_events_handler))
        .route("/api/events/count", get(count_events_handler))
        .route("/api/events/mint/{mint}", get(get_event_by_mint_handler))
        .route("/api/events/creator/{creator}", get(get_events_by_creator_handler))
        .route("/api/oath-events", get(get_all_oath_events_handler))
        .route("/api/oath-events/", get(get_all_oath_events_handler))
        .route("/api/oath-events/count", get(count_oath_events_handler))
        .layer(cors)
        .with_state(state)
}

/// 根路径处理器
async fn root_handler() -> impl IntoResponse {
    Json(serde_json::json!({
        "service": "PumpFun Oath Contract API",
        "version": "0.1.0",
        "endpoints": {
            "health": "/health",
            "all_events": "/api/events?page=1&page_size=10",
            "recent_events": "/api/events/recent/{limit}",
            "count": "/api/events/count",
            "by_mint": "/api/events/mint/{mint}",
            "by_creator": "/api/events/creator/{creator}?page=1&page_size=10",
            "oath_events": "/api/oath-events?page=1&page_size=10",
            "oath_events_count": "/api/oath-events/count"
        },
        "pagination": {
            "description": "Use query parameters: page (default: 1) and page_size (default: 10)",
            "example": "/api/events?page=2&page_size=20"
        }
    }))
}

/// 健康检查处理器
async fn health_handler() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

/// 获取所有事件处理器（支持分页）
async fn get_all_events_handler(
    State(state): State<AppState>,
    Query(params): Query<PaginationParams>,
) -> Result<Json<ApiResponse<Vec<CreateEventModel>>>, (StatusCode, Json<ApiResponse<Vec<CreateEventModel>>>)> {
    // 获取总数
    let total = match state.db_service.count_all().await {
        Ok(count) => count,
        Err(e) => {
            eprintln!("❌ 获取总数失败: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(format!("Failed to count events: {}", e)))
            ));
        }
    };

    // 分页获取事件
    match state.db_service.get_events_paginated(params.offset(), params.limit()).await {
        Ok(events) => {
            Ok(Json(ApiResponse::success_with_pagination(
                events,
                total,
                params.page,
                params.page_size
            )))
        }
        Err(e) => {
            eprintln!("❌ 获取事件失败: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(format!("Failed to fetch events: {}", e)))
            ))
        }
    }
}

/// 获取最近的 N 条事件处理器
async fn get_recent_events_handler(
    State(state): State<AppState>,
    axum::extract::Path(limit): axum::extract::Path<u64>,
) -> Result<Json<ApiResponse<Vec<CreateEventModel>>>, (StatusCode, Json<ApiResponse<Vec<CreateEventModel>>>)> {
    match state.db_service.get_recent_events(limit).await {
        Ok(events) => {
            let count = events.len() as u64;
            Ok(Json(ApiResponse::success_with_total(events, count)))
        }
        Err(e) => {
            eprintln!("❌ 获取最近事件失败: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(format!("Failed to fetch recent events: {}", e)))
            ))
        }
    }
}

/// 统计事件总数处理器
async fn count_events_handler(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<u64>>, (StatusCode, Json<ApiResponse<u64>>)> {
    match state.db_service.count_all().await {
        Ok(count) => Ok(Json(ApiResponse::success(count))),
        Err(e) => {
            eprintln!("❌ 统计事件失败: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(format!("Failed to count events: {}", e)))
            ))
        }
    }
}

/// 根据 mint 查询事件处理器
async fn get_event_by_mint_handler(
    State(state): State<AppState>,
    axum::extract::Path(mint): axum::extract::Path<String>,
) -> Result<Json<ApiResponse<Option<CreateEventModel>>>, (StatusCode, Json<ApiResponse<Option<CreateEventModel>>>)> {
    match state.db_service.get_event_by_mint(&mint).await {
        Ok(event) => Ok(Json(ApiResponse::success(event))),
        Err(e) => {
            eprintln!("❌ 查询事件失败: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(format!("Failed to fetch event: {}", e)))
            ))
        }
    }
}

/// 根据创建者查询事件处理器（支持分页）
async fn get_events_by_creator_handler(
    State(state): State<AppState>,
    axum::extract::Path(creator): axum::extract::Path<String>,
    Query(params): Query<PaginationParams>,
) -> Result<Json<ApiResponse<Vec<CreateEventModel>>>, (StatusCode, Json<ApiResponse<Vec<CreateEventModel>>>)> {
    // 获取该创建者的事件总数
    let total = match state.db_service.count_by_creator(&creator).await {
        Ok(count) => count,
        Err(e) => {
            eprintln!("❌ 统计创建者事件失败: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(format!("Failed to count events: {}", e)))
            ));
        }
    };

    // 分页查询
    match state.db_service.get_events_by_creator_paginated(&creator, params.offset(), params.limit()).await {
        Ok(events) => {
            Ok(Json(ApiResponse::success_with_pagination(
                events,
                total,
                params.page,
                params.page_size
            )))
        }
        Err(e) => {
            eprintln!("❌ 查询创建者事件失败: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(format!("Failed to fetch events by creator: {}", e)))
            ))
        }
    }
}

/// 获取所有 Oath 事件处理器（支持分页）
async fn get_all_oath_events_handler(
    State(state): State<AppState>,
    Query(params): Query<PaginationParams>,
) -> Result<Json<ApiResponse<Vec<OathCreatedEventModel>>>, (StatusCode, Json<ApiResponse<Vec<OathCreatedEventModel>>>)> {
    // 获取总数
    let total = match state.db_service.count_oath_events().await {
        Ok(count) => count,
        Err(e) => {
            eprintln!("❌ 获取 Oath 事件总数失败: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(format!("Failed to count oath events: {}", e)))
            ));
        }
    };

    // 分页获取 Oath 事件
    match state.db_service.get_oath_events_paginated(params.offset(), params.limit()).await {
        Ok(events) => {
            Ok(Json(ApiResponse::success_with_pagination(
                events,
                total,
                params.page,
                params.page_size
            )))
        }
        Err(e) => {
            eprintln!("❌ 获取 Oath 事件失败: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(format!("Failed to fetch oath events: {}", e)))
            ))
        }
    }
}

/// 统计 Oath 事件总数处理器
async fn count_oath_events_handler(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<u64>>, (StatusCode, Json<ApiResponse<u64>>)> {
    match state.db_service.count_oath_events().await {
        Ok(count) => Ok(Json(ApiResponse::success(count))),
        Err(e) => {
            eprintln!("❌ 统计 Oath 事件失败: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::error(format!("Failed to count oath events: {}", e)))
            ))
        }
    }
}
