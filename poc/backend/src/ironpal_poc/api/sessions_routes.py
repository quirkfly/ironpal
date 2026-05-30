from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ironpal_poc.auth import get_current_user
from ironpal_poc.db import get_db
from ironpal_poc.models import SessionSet, User
from ironpal_poc.schemas import SessionCreatedResponse, SessionIn, SessionOut

router = APIRouter(prefix="/sessions", tags=["sessions"])

_FIELDS = (
    "started_at ended_at detected_exercise exercise_confidence exercise_source "
    "detected_reps reps_confidence reps_source detected_weight weight_confidence weight_source "
    "corrected_exercise corrected_reps corrected_weight is_rest_window device_model sensor_info "
    "sample_rate_hz has_gyro llm_calls llm_cost_estimate notes"
).split()


@router.post("", response_model=SessionCreatedResponse, status_code=201)
def create_session(
    body: SessionIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SessionCreatedResponse:
    """Ingest a completed set (detected + corrected = ground truth, decision Q9)."""
    row = SessionSet(user_id=user.id, **{f: getattr(body, f) for f in _FIELDS})
    db.add(row)
    db.commit()
    db.refresh(row)
    return SessionCreatedResponse(id=str(row.id))


@router.get("/export", response_model=list[SessionOut])
def export_sessions(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[SessionOut]:
    """Dump all sessions for verdict-matrix analysis (spec §11/§12)."""
    rows = list(db.scalars(select(SessionSet).order_by(SessionSet.created_at)))
    out: list[SessionOut] = []
    for r in rows:
        data = {f: getattr(r, f) for f in _FIELDS}
        out.append(SessionOut(id=str(r.id), user_id=str(r.user_id), created_at=r.created_at, **data))
    return out
