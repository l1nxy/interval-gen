use crate::config::AppConfig;
use crate::models::Workout;
use base64::{engine::general_purpose::STANDARD, Engine};
use reqwest::{Client, StatusCode};

const BASE_URL: &str = "https://intervals.icu/api/v1";

fn auth_header(api_key: &str) -> String {
    let token = STANDARD.encode(format!("API_KEY:{api_key}"));
    format!("Basic {token}")
}

pub async fn resolve_athlete_id(client: &Client, cfg: &AppConfig) -> anyhow::Result<String> {
    if let Some(id) = &cfg.default_athlete_id {
        return Ok(id.clone());
    }
    let key = cfg
        .intervals_api_key
        .as_ref()
        .ok_or_else(|| anyhow::anyhow!("INTERVALS_API_KEY missing"))?;

    let res = client
        .get(format!("{BASE_URL}/athlete/0"))
        .header("Authorization", auth_header(key))
        .send()
        .await?;

    if res.status().is_success() {
        let v: serde_json::Value = res.json().await?;
        if let Some(id) = v.get("id").and_then(|v| v.as_i64()) {
            return Ok(id.to_string());
        }
    }
    Err(anyhow::anyhow!(
        "Could not resolve athlete id from intervals.icu"
    ))
}

pub async fn upload_workouts(
    client: &Client,
    cfg: &AppConfig,
    workouts: &[Workout],
    athlete_id: Option<String>,
) -> anyhow::Result<()> {
    let key = cfg
        .intervals_api_key
        .as_ref()
        .ok_or_else(|| anyhow::anyhow!("INTERVALS_API_KEY is required for upload"))?;
    let athlete = match athlete_id {
        Some(id) => id,
        None => resolve_athlete_id(client, cfg).await?,
    };

    let url = format!("{BASE_URL}/athlete/{athlete}/events/bulk");
    let res = client
        .post(url)
        .header("Authorization", auth_header(key))
        .json(workouts)
        .send()
        .await?;

    match res.status() {
        StatusCode::OK | StatusCode::CREATED => Ok(()),
        status => {
            let text = res.text().await.unwrap_or_default();
            Err(anyhow::anyhow!("upload failed ({status}): {text}"))
        }
    }
}
