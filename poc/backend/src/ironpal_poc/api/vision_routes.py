from __future__ import annotations

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ironpal_poc import vision
from ironpal_poc.auth import get_current_user, is_founder
from ironpal_poc.db import get_db
from ironpal_poc.models import DebugCapture, User
from ironpal_poc.schemas import (
    RecognizeVisionRequest,
    RecognizeVisionResponse,
    WeightVisionRequest,
    WeightVisionResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/vision", tags=["vision"])


def _maybe_keep_debug(
    db: Session,
    user: User,
    keep_debug: bool,
    kind: str,
    frame_b64s: list[str],
    result: dict,
) -> None:
    """Frame retention policy (decision D3).

    Default: the frame is discarded after inference (it only ever lived in memory — we simply
    never persist it). EXCEPTION: founder + opt-in keeps a debug_capture for failure analysis.
    Testers' frames are NEVER stored.
    """
    if not (keep_debug and is_founder(user)):
        return  # frame discarded; nothing persisted
    cap = DebugCapture(
        user_id=user.id,
        kind=kind,
        frame_refs={"frames_b64": frame_b64s},
        llm_request=result.get("_raw_request"),
        llm_response=result.get("_raw_response"),
    )
    db.add(cap)
    db.commit()


@router.post("/weight", response_model=WeightVisionResponse)
def vision_weight(
    body: WeightVisionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> WeightVisionResponse:
    """Weight OCR on the single sharpest glance frame (decisions Q5, Q7)."""
    result = vision.read_weight(body.frame_b64, body.exercise_hint)
    _maybe_keep_debug(db, user, body.keep_debug, "weight", [body.frame_b64], result)
    return WeightVisionResponse(
        weight=result["weight"],
        unit=result["unit"],
        confidence=result["confidence"],
        llm_calls=result["llm_calls"],
        llm_cost_estimate=result["llm_cost_estimate"],
        model=result["model"],
    )


@router.post("/recognize", response_model=RecognizeVisionResponse)
def vision_recognize(
    body: RecognizeVisionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> RecognizeVisionResponse:
    """Vision-led recognition + rep count (triceps pushdown is vision-led — spec §6)."""
    result = vision.recognize(body.frames_b64, body.orientation)
    _maybe_keep_debug(db, user, body.keep_debug, "recognize", body.frames_b64, result)
    return RecognizeVisionResponse(
        exercise=result["exercise"],
        reps=result["reps"],
        confidence=result["confidence"],
        llm_calls=result["llm_calls"],
        llm_cost_estimate=result["llm_cost_estimate"],
        model=result["model"],
    )
