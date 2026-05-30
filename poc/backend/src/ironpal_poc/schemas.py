from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

# ---------------- Auth ----------------


class TokenRequest(BaseModel):
    # POC-grade: identify by role + name; backend mints a bearer token.
    role: str = Field(pattern="^(founder|tester)$")
    display_name: str = ""


class TokenResponse(BaseModel):
    user_id: str
    role: str
    token: str


# ---------------- Templates ----------------


class TemplateIn(BaseModel):
    exercise_label: str  # bulgarian_split_squat | triceps_pushdown | unknown
    take_id: int
    device_orientation: dict | None = None
    sample_rate_hz: int | None = None
    feature_vector: dict
    # base64-encoded resampled raw IMU window (decision D7); optional
    imu_series_b64: str | None = None


class TemplateOut(BaseModel):
    id: str
    exercise_label: str
    take_id: int
    device_orientation: dict | None
    sample_rate_hz: int | None
    feature_vector: dict
    imu_series_b64: str | None  # resampled raw window (D7)
    version: int


class TemplateSyncResponse(BaseModel):
    version: int  # max version in this payload (client stores as its cursor)
    templates: list[TemplateOut]


# ---------------- Vision ----------------


class WeightVisionRequest(BaseModel):
    exercise_hint: str | None = None  # e.g. triceps_pushdown (pin stack) / bulgarian_split_squat (dumbbell)
    frame_b64: str  # single sharpest glance frame (decision Q5)
    # Persist a debug_capture only if this is the founder + opt-in (decision D3)
    keep_debug: bool = False


class WeightVisionResponse(BaseModel):
    weight: float | None
    unit: str = "kg"
    confidence: float
    source: str = "vision"
    llm_calls: int = 1
    llm_cost_estimate: float = 0.0
    model: str | None = None


class RecognizeVisionRequest(BaseModel):
    frames_b64: list[str]  # short sequence during the set
    orientation: str | None = None  # upright|supine|bent-over...
    keep_debug: bool = False


class RecognizeVisionResponse(BaseModel):
    exercise: str | None  # bulgarian_split_squat | triceps_pushdown | unknown
    reps: int | None
    confidence: float
    source: str = "vision"
    llm_calls: int = 1
    llm_cost_estimate: float = 0.0
    model: str | None = None


# ---------------- Sessions ----------------


class SessionIn(BaseModel):
    started_at: datetime | None = None
    ended_at: datetime | None = None

    detected_exercise: str | None = None
    exercise_confidence: float | None = None
    exercise_source: str | None = None
    detected_reps: int | None = None
    reps_confidence: float | None = None
    reps_source: str | None = None
    detected_weight: float | None = None
    weight_confidence: float | None = None
    weight_source: str | None = None

    corrected_exercise: str | None = None
    corrected_reps: int | None = None
    corrected_weight: float | None = None

    is_rest_window: bool = False

    device_model: str | None = None
    sensor_info: dict | None = None
    sample_rate_hz: int | None = None
    has_gyro: bool | None = None

    llm_calls: int = 0
    llm_cost_estimate: float = 0.0
    notes: str | None = None


class SessionOut(SessionIn):
    id: str
    user_id: str
    created_at: datetime


class SessionCreatedResponse(BaseModel):
    id: str
