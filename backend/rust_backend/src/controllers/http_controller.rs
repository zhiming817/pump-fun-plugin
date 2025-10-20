use axum::{
    extract::State,
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
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            total: None,
        }
    }

    pub fn success_with_total(data: T, total: u64) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            total: Some(total),
        }
    }

    pub fn error(error: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
            total: None,
        }
    }
}

/// 创建 HTTP 路由
pub fn create_router(db_service: Arc<DatabaseService>) -> Router {
    let state = AppState { db_service };

    // 配置 CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .route("/", get(root_handler))
        .route("/health", get(health_handler))
        .route("/api/events", get(get_all_events_handler))
        .route("/api/events/recent/{limit}", get(get_recent_events_handler))
        .route("/api/events/count", get(count_events_handler))
        .route("/api/events/mint/{mint}", get(get_event_by_mint_handler))
        .route("/api/events/creator/{creator}", get(get_events_by_creator_handler))
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
            "all_events": "/api/events",
            "recent_events": "/api/events/recent/:limit",
            "count": "/api/events/count",
            "by_mint": "/api/events/mint/:mint",
            "by_creator": "/api/events/creator/:creator"
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

/// 获取所有事件处理器
async fn get_all_events_handler(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<CreateEventModel>>>, (StatusCode, Json<ApiResponse<Vec<CreateEventModel>>>)> {
    match state.db_service.get_all_events().await {
        Ok(events) => {
            let total = events.len() as u64;
            Ok(Json(ApiResponse::success_with_total(events, total)))
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

/// 根据创建者查询事件处理器
async fn get_events_by_creator_handler(
    State(state): State<AppState>,
    axum::extract::Path(creator): axum::extract::Path<String>,
) -> Result<Json<ApiResponse<Vec<CreateEventModel>>>, (StatusCode, Json<ApiResponse<Vec<CreateEventModel>>>)> {
    match state.db_service.get_events_by_creator(&creator).await {
        Ok(events) => {
            let count = events.len() as u64;
            Ok(Json(ApiResponse::success_with_total(events, count)))
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
