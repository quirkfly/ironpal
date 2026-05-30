from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ironpal_poc.auth import mint_token
from ironpal_poc.db import get_db
from ironpal_poc.models import User
from ironpal_poc.schemas import TokenRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token", response_model=TokenResponse)
def issue_token(body: TokenRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """POC-grade provisioning: create a user (founder|tester) and mint a bearer token."""
    user = User(role=body.role, display_name=body.display_name, token=mint_token())
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(user_id=str(user.id), role=user.role, token=user.token)
