# IronPal POC v1 — Backend

FastAPI + PostgreSQL backend for the IronPal POC. Stores the founder-authored exercise
fingerprint templates, ingests workout sessions, and proxies vision calls to `gpt-5-nano`
(weight OCR + triceps-pushdown recognition). Implements the design in
[`../../docs/ironpal-poc-v1-design.md`](../../docs/ironpal-poc-v1-design.md) and decisions
D1–D7 / Q1–Q9.

## Stack
- **FastAPI** (routes under `/api/v1`), **SQLAlchemy 2.0**, **PostgreSQL** (psycopg3).
- **OpenAI `gpt-5-nano`** for vision — called **only from here** so the API key never ships in
  the app (design §7 / risk R8).
- `uv` for env management (mirrors `coolteen/cultee-ai-service`).

## Quick start
```bash
cd poc/backend
uv venv --python 3.10
uv pip install -e ".[dev]"

# Postgres (host port 5544)
docker compose up -d

# Run
cp .env.example .env          # optional; defaults already target the compose DB
.venv/bin/uvicorn ironpal_poc.main:app --reload --port 8000
# → http://127.0.0.1:8000/health   and   /docs (OpenAPI)
```

## Tests
```bash
.venv/bin/pytest -q          # 11 tests, sqlite-backed, vision mocked (no spend)
```

## OpenAI key (decision D3 / DR6)
Key resolution order (server-side only, never returned to clients):
1. `credentials/openai.key` (repo root) — the path named in `TASK.md`.
2. `OPENAI_API_KEY` env / `.env`.

If **no key** is found, or `VISION_MOCK=true`, the vision endpoints return **deterministic mock
results** so the whole pipeline is exercisable without spend. This is the recommended default
**until the M4 model-verification gate** (design DR6) confirms `gpt-5-nano` is multimodal and the
cost numbers hold. To go live: place the key at `credentials/openai.key`, set `VISION_MOCK=false`,
restart.

## API (all under `/api/v1`, Bearer auth except `/auth/token`)
| Method | Path | Purpose | Notes |
|---|---|---|---|
| POST | `/auth/token` | Mint a per-user bearer token | role `founder`\|`tester` (D-auth) |
| POST | `/templates` | Enroll a fingerprint template | **founder only** (Q1); stores feature vector + raw window (D7) |
| GET | `/templates/sync?since=<v>` | Delta-sync the shared founder library | any user, read-only (Q1/Q2) |
| POST | `/vision/weight` | Weight OCR on the glance frame | gpt-5-nano (Q5/Q7); frame deleted post-inference (D3) |
| POST | `/vision/recognize` | Pushdown name + reps from frames | vision-led (spec §6) |
| POST | `/sessions` | Ingest a completed set | detected + corrected = ground truth (Q9); device metadata (D4/D5) |
| GET | `/sessions/export` | Dump sessions for the verdict matrix | spec §11/§12 |

### Frame retention (decision D3)
Uploaded frames are **deleted immediately after inference**. A `debug_capture` (frame + LLM I/O)
is persisted **only** for the founder with `keep_debug=true`; **testers' frames are never
stored**. Purge `debug_captures` at POC end.

## Schema
`users`, `templates`, `session_sets`, `debug_captures` — see `src/ironpal_poc/models.py`
(matches design §4.3, incl. `device_model` / `sensor_info` / `sample_rate_hz` / `has_gyro` for the
cross-user / gyro-split analysis, D4/D5).

## Deployment (decision D2)
Self-hosted, internet-facing over **HTTPS** (reverse proxy — Caddy/nginx + Let's Encrypt).
Bind PostgreSQL to localhost; expose only FastAPI; rate-limit `/vision/*`. Testers reach it over
the public internet to sync templates and post sessions.
