use std::env;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub openai_api_key: String,
    pub openai_base_url: String,
    pub openai_model: String,
    pub intervals_api_key: Option<String>,
    pub default_athlete_id: Option<String>,
}

impl AppConfig {
    pub fn from_env() -> anyhow::Result<Self> {
        let openai_api_key = env::var("OPENAI_API_KEY")
            .map_err(|_| anyhow::anyhow!("OPENAI_API_KEY is required for plan generation"))?;
        Ok(Self {
            openai_api_key,
            openai_base_url: env::var("OPENAI_BASE_URL")
                .unwrap_or_else(|_| "https://api.openai.com/v1".to_string()),
            openai_model: env::var("OPENAI_MODEL").unwrap_or_else(|_| "gpt-4o-mini".to_string()),
            intervals_api_key: env::var("INTERVALS_API_KEY").ok(),
            default_athlete_id: env::var("INTERVALS_ATHLETE_ID").ok(),
        })
    }
}
