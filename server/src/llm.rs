use crate::config::AppConfig;
use crate::models::{PlanRequest, Workout};
use chrono::{Duration, Local};
use reqwest::Client;
use serde_json::Value;

/// Generate a running plan via the OpenAI Chat Completions API without using the OpenAI crate.
/// Inspired by the request-building approach in the `codex` project (manual reqwest call, JSON payload).
pub async fn generate_plan(
    client: &Client,
    cfg: &AppConfig,
    request: PlanRequest,
) -> anyhow::Result<Vec<Workout>> {
    let start_date = request.start_date.unwrap_or_else(Local::now);
    let weeks = request.weeks.unwrap_or(16).max(1) as i64;
    let end_date = start_date + Duration::weeks(weeks);

    let system_prompt = format!(
        "You are a running coach.\n\
         Produce a {weeks}-week half-marathon style plan as pure JSON (no markdown). \
         Key rules: 3 build weeks + 1 recovery week cycle; default start time 06:00; \
         keep fields: week (1..n), day_of_week (1=Mon), name, description, type='Run', category='WORKOUT', start_date_local (ISO 8601). \
         The first day is {} and the window ends by {}.",
        start_date.date_naive(),
        end_date.date_naive()
    );

    let user_prompt = format!(
        "Return workouts scheduled from {}. Use ISO timestamp with local time at 06:00.",
        start_date.date_naive()
    );

    let url = format!(
        "{}/chat/completions",
        cfg.openai_base_url.trim_end_matches('/')
    );

    let body = serde_json::json!({
        "model": cfg.openai_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": { "type": "json_object" }
    });

    let raw: Value = client
        .post(url)
        .bearer_auth(&cfg.openai_api_key)
        .json(&body)
        .send()
        .await?
        .error_for_status()?
        .json()
        .await?;

    let content = raw
        .pointer("/choices/0/message/content")
        .and_then(|v| v.as_str())
        .ok_or_else(|| anyhow::anyhow!("missing completion content in OpenAI response"))?;

    // Attempt to parse the returned JSON string into workouts.
    let parsed: Value = serde_json::from_str(content)
        .map_err(|e| anyhow::anyhow!("invalid JSON in model response: {e}"))?;

    let workouts_value = match parsed {
        Value::Array(arr) => Value::Array(arr),
        Value::Object(obj) => obj
            .get("workouts")
            .cloned()
            .unwrap_or_else(|| obj.get("plan").cloned().unwrap_or(Value::Array(vec![]))),
        _ => Value::Array(vec![]),
    };

    let workouts: Vec<Workout> = serde_json::from_value(workouts_value)
        .map_err(|e| anyhow::anyhow!("failed to deserialize workouts: {e}"))?;

    Ok(workouts)
}
