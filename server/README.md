# Interval Server (Rust)

Rust reimplementation of the Python interval generator/uploader, exposed as a small HTTP service.

## Endpoints
- `GET /health` – liveness check.
- `POST /plan` – body: `{ "start_date": "2025-01-05T00:00:00+08:00", "weeks": 16 }` (fields optional). Returns `{ "workouts": [...] }` generated via OpenAI Chat Completions.
- `POST /upload` – body: `{ "workouts": [...], "athlete_id": "12345" }`; uploads to Intervals.icu using bulk endpoint.

## Env vars
- `OPENAI_API_KEY` (required)
- `OPENAI_BASE_URL` (optional, default `https://api.openai.com/v1`)
- `OPENAI_MODEL` (optional, default `gpt-4o-mini`)
- `INTERVALS_API_KEY` (needed for upload)
- `INTERVALS_ATHLETE_ID` (optional; fetched via `/athlete/0` if missing)

## Run
```bash
cd server
cargo run
# server listens on 0.0.0.0:8080
```

## Implementation notes
- OpenAI calls are built manually with `reqwest` (no OpenAI crate) following the codex-style pattern of posting to `/chat/completions` with `response_format = json_object`.
- Upload uses Intervals.icu bulk API with `Basic` auth (`API_KEY:<token>` base64).*** End Patch
