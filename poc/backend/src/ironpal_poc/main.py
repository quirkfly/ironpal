from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from ironpal_poc.api.router import router
from ironpal_poc.config import settings
from ironpal_poc.db import init_db

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="IronPal POC v1 Backend", version="0.1.0", lifespan=lifespan)
app.include_router(router, prefix="/api/v1")


@app.get("/health")
def health() -> dict:
    return {
        "status": "UP",
        "vision_model": settings.vision_model,
        "vision_enabled": settings.vision_enabled,  # False => mock mode (no key / DR6)
    }
