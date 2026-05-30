from __future__ import annotations

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from ironpal_poc.config import settings
from ironpal_poc.models import Base

_engine = None
_SessionLocal: sessionmaker | None = None


def _make_engine(url: str):
    connect_args = {}
    if url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    return create_engine(url, connect_args=connect_args, future=True)


def init_engine(url: str | None = None) -> None:
    """(Re)initialise the engine + session factory. Call once at startup or per test."""
    global _engine, _SessionLocal
    _engine = _make_engine(url or settings.database_url)
    _SessionLocal = sessionmaker(bind=_engine, autoflush=False, expire_on_commit=False, future=True)


def init_db() -> None:
    if _engine is None:
        init_engine()
    Base.metadata.create_all(_engine)


def get_session() -> Session:
    if _SessionLocal is None:
        init_engine()
    assert _SessionLocal is not None
    return _SessionLocal()


def get_db() -> Iterator[Session]:
    """FastAPI dependency."""
    db = get_session()
    try:
        yield db
    finally:
        db.close()
