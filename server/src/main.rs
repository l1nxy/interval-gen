mod config;
mod intervals;
mod llm;
mod models;

use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use config::AppConfig;
use llm::generate_plan;
use models::{PlanRequest, PlanResponse, UploadRequest, UploadResult};
use std::net::SocketAddr;
use std::time::Duration;
use tracing::{error, info};

#[derive(Clone)]
struct AppState {
    cfg: AppConfig,
    client: reqwest::Client,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .with_target(false)
        .compact()
        .init();

    let cfg = AppConfig::from_env()?;
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(60))
        .build()?;
    let state = AppState { cfg, client };

    let app = Router::new()
        .route("/health", get(|| async { "ok" }))
        .route("/plan", post(plan_handler))
        .route("/upload", post(upload_handler))
        .with_state(state);

    let addr: SocketAddr = "0.0.0.0:8080".parse()?;
    info!("server listening on {addr}");
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;
    Ok(())
}

async fn plan_handler(
    State(state): State<AppState>,
    Json(payload): Json<PlanRequest>,
) -> impl IntoResponse {
    match generate_plan(&state.client, &state.cfg, payload).await {
        Ok(workouts) => {
            let resp = PlanResponse { workouts };
            (StatusCode::OK, Json(resp)).into_response()
        }
        Err(err) => {
            error!("plan generation failed: {err:?}");
            (
                StatusCode::BAD_GATEWAY,
                Json(serde_json::json!({ "error": err.to_string() })),
            )
                .into_response()
        }
    }
}

async fn upload_handler(
    State(state): State<AppState>,
    Json(payload): Json<UploadRequest>,
) -> impl IntoResponse {
    match intervals::upload_workouts(
        &state.client,
        &state.cfg,
        &payload.workouts,
        payload.athlete_id.clone(),
    )
    .await
    {
        Ok(_) => (
            StatusCode::OK,
            Json(UploadResult {
                status: "ok".to_string(),
                message: None,
            }),
        )
            .into_response(),
        Err(err) => {
            error!("upload failed: {err:?}");
            (
                StatusCode::BAD_GATEWAY,
                Json(UploadResult {
                    status: "error".to_string(),
                    message: Some(err.to_string()),
                }),
            )
                .into_response()
        }
    }
}
