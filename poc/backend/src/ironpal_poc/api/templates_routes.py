from __future__ import annotations

import base64

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ironpal_poc.auth import get_current_user, is_founder
from ironpal_poc.db import get_db
from ironpal_poc.models import Template, User
from ironpal_poc.schemas import TemplateIn, TemplateOut, TemplateSyncResponse

router = APIRouter(prefix="/templates", tags=["templates"])

VALID_LABELS = {"bulgarian_split_squat", "triceps_pushdown", "unknown"}


def _to_out(t: Template) -> TemplateOut:
    return TemplateOut(
        id=str(t.id),
        exercise_label=t.exercise_label,
        take_id=t.take_id,
        device_orientation=t.device_orientation,
        sample_rate_hz=t.sample_rate_hz,
        feature_vector=t.feature_vector,
        imu_series_b64=base64.b64encode(t.imu_series).decode() if t.imu_series else None,
        version=t.version,
    )


@router.post("", response_model=TemplateOut, status_code=201)
def create_template(
    body: TemplateIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> TemplateOut:
    """Founder-only enrollment (decision Q1). Stores both representations (D7)."""
    if not is_founder(user):
        raise HTTPException(status_code=403, detail="Only the founder may enroll templates")
    if body.exercise_label not in VALID_LABELS:
        raise HTTPException(status_code=422, detail=f"label must be one of {sorted(VALID_LABELS)}")

    next_version = (db.scalar(select(func.max(Template.version))) or 0) + 1
    raw = base64.b64decode(body.imu_series_b64) if body.imu_series_b64 else None
    t = Template(
        exercise_label=body.exercise_label,
        take_id=body.take_id,
        device_orientation=body.device_orientation,
        sample_rate_hz=body.sample_rate_hz,
        feature_vector=body.feature_vector,
        imu_series=raw,
        version=next_version,
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return _to_out(t)


@router.get("/sync", response_model=TemplateSyncResponse)
def sync_templates(
    since: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> TemplateSyncResponse:
    """Return founder templates changed since `since` (delta sync for the on-device cache).

    Any authenticated user (founder or tester) may pull — testers match against the founder's
    shared library read-only (decisions Q1/Q2). Returns BOTH representations (D7).
    """
    rows = list(
        db.scalars(select(Template).where(Template.version > since).order_by(Template.version))
    )
    max_version = max((t.version for t in rows), default=since)
    return TemplateSyncResponse(version=max_version, templates=[_to_out(t) for t in rows])
