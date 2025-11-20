use chrono::{DateTime, Local};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workout {
    pub week: u32,
    pub day_of_week: u8,
    pub name: String,
    pub description: String,
    #[serde(default = "default_type")]
    pub r#type: String,
    #[serde(default = "default_category")]
    pub category: String,
    /// Local start time in ISO 8601 (Intervals.icu expects a local timestamp).
    pub start_date_local: String,
}

fn default_type() -> String {
    "Run".to_string()
}
fn default_category() -> String {
    "WORKOUT".to_string()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanRequest {
    /// ISO date to start from. If omitted, defaults to today.
    pub start_date: Option<DateTime<Local>>,
    /// Number of weeks; defaults to 16 in the prompt.
    pub weeks: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanResponse {
    pub workouts: Vec<Workout>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UploadRequest {
    pub workouts: Vec<Workout>,
    pub athlete_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UploadResult {
    pub status: String,
    pub message: Option<String>,
}
