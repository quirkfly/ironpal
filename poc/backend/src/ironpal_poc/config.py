from __future__ import annotations

import logging
from pathlib import Path

from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

# Repo root = .../ironpal (this file is poc/backend/src/ironpal_poc/config.py → up 4)
REPO_ROOT = Path(__file__).resolve().parents[4]


def _load_openai_key(explicit: str = "") -> str:
    """Resolve the OpenAI API key.

    Order (per design §4.2 / decisions D1, R8 — key lives server-side only):
      1. credentials/openai.key (repo-root relative) — as instructed in TASK.md
      2. OPENAI_API_KEY env / .env
    Never logged. Empty string means "not configured" → vision runs in mock/degraded mode.
    """
    key_file = REPO_ROOT / "credentials" / "openai.key"
    if key_file.is_file():
        val = key_file.read_text(encoding="utf-8").strip()
        if val:
            logger.info("OpenAI key loaded from credentials/openai.key")
            return val
    if explicit:
        logger.info("OpenAI key loaded from OPENAI_API_KEY env")
        return explicit
    logger.warning(
        "No OpenAI key found (credentials/openai.key or OPENAI_API_KEY). "
        "Vision endpoints will run in MOCK mode."
    )
    return ""


class Settings(BaseSettings):
    # --- Database ---
    # Default targets the docker-compose Postgres; tests override with sqlite.
    database_url: str = "postgresql+psycopg://ironpal:ironpal@localhost:5544/ironpal_poc"

    # --- LLM (gpt-5-nano per spec; verify multimodal + cost at M4 — design DR6) ---
    vision_model: str = "gpt-5-nano"
    openai_api_key: str = ""
    # When true (or no key present), vision returns deterministic mock results instead
    # of calling OpenAI — lets the pipeline be exercised without spend (design DR6).
    vision_mock: bool = False

    # --- Frame retention (decision D3) ---
    # Founder user id whose sessions may persist debug_captures (frames + LLM I/O).
    # All other users' frames are deleted immediately after inference.
    founder_user_id: str = ""

    # --- Service ---
    port: int = 8000
    log_level: str = "INFO"

    model_config = {"env_file": ".env", "extra": "ignore"}

    @property
    def resolved_openai_key(self) -> str:
        return _load_openai_key(self.openai_api_key)

    @property
    def vision_enabled(self) -> bool:
        """Live vision is possible only with a key and mock disabled."""
        return bool(self.resolved_openai_key) and not self.vision_mock


settings = Settings()
