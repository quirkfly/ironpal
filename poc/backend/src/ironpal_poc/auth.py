from __future__ import annotations

import secrets

from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ironpal_poc.config import settings
from ironpal_poc.db import get_db
from ironpal_poc.models import User


def mint_token() -> str:
    return secrets.token_urlsafe(32)


def get_current_user(
    authorization: str = Header(...),
    db: Session = Depends(get_db),
) -> User:
    """Per-user bearer token auth (design §7). Not production-grade; sufficient for POC."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization[7:].strip()
    user = db.scalar(select(User).where(User.token == token))
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user


def is_founder(user: User) -> bool:
    """Founder either by role or by the configured founder_user_id (decision D3)."""
    if user.role == "founder":
        return True
    return bool(settings.founder_user_id) and str(user.id) == settings.founder_user_id
