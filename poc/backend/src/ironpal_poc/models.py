from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    LargeBinary,
    String,
    Text,
    Uuid,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.types import JSON


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class User(Base):
    """Founder + cross-user testers (decision Q2). Per-user bearer token (design §7 auth)."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=_uuid)
    role: Mapped[str] = mapped_column(String(16))  # 'founder' | 'tester'
    display_name: Mapped[str] = mapped_column(String(120), default="")
    token: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Template(Base):
    """Founder-authored fingerprints (decision Q1). Shared across all users.

    Ships BOTH representations (decision D7): feature_vector (kNN) + imu_series
    (resampled raw window, for normalized-DTW).
    """

    __tablename__ = "templates"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=_uuid)
    exercise_label: Mapped[str] = mapped_column(String(64))  # bulgarian_split_squat | triceps_pushdown | unknown
    take_id: Mapped[int] = mapped_column(Integer)
    device_orientation: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    sample_rate_hz: Mapped[int | None] = mapped_column(Integer, nullable=True)  # canonical/resampled rate
    feature_vector: Mapped[dict] = mapped_column(JSON)  # normalized, invariant (Q6/D4/D5)
    imu_series: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)  # resampled raw window
    version: Mapped[int] = mapped_column(BigInteger, index=True)  # for /templates/sync deltas
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class SessionSet(Base):
    """One completed set. detected_* vs corrected_* is the verdict-matrix backbone (Q9)."""

    __tablename__ = "session_sets"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    detected_exercise: Mapped[str | None] = mapped_column(String(64), nullable=True)
    exercise_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    exercise_source: Mapped[str | None] = mapped_column(String(16), nullable=True)  # imu|vision|fused|manual|unknown
    detected_reps: Mapped[int | None] = mapped_column(Integer, nullable=True)
    reps_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    reps_source: Mapped[str | None] = mapped_column(String(16), nullable=True)
    detected_weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    weight_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    weight_source: Mapped[str | None] = mapped_column(String(16), nullable=True)

    corrected_exercise: Mapped[str | None] = mapped_column(String(64), nullable=True)
    corrected_reps: Mapped[int | None] = mapped_column(Integer, nullable=True)
    corrected_weight: Mapped[float | None] = mapped_column(Float, nullable=True)

    is_rest_window: Mapped[bool] = mapped_column(Boolean, default=False)  # false-reps-at-rest KPI (Q4)

    # Device metadata — testers use own phones (D4); split KPIs by gyro (D5)
    device_model: Mapped[str | None] = mapped_column(String(120), nullable=True)
    sensor_info: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    sample_rate_hz: Mapped[int | None] = mapped_column(Integer, nullable=True)
    has_gyro: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    llm_calls: Mapped[int] = mapped_column(Integer, default=0)
    llm_cost_estimate: Mapped[float] = mapped_column(Float, default=0.0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    debug_captures: Mapped[list[DebugCapture]] = relationship(
        back_populates="session_set", cascade="all, delete-orphan"
    )


class DebugCapture(Base):
    """FOUNDER-ONLY, opt-in, failure analysis (decision D3). Purge at POC end.

    Testers' frames are NEVER written here.
    """

    __tablename__ = "debug_captures"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=_uuid)
    # nullable: vision-time captures may precede the session POST (linked later if desired)
    session_set_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("session_sets.id"), nullable=True
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("users.id"), nullable=True)
    kind: Mapped[str | None] = mapped_column(String(16), nullable=True)  # weight | recognize
    imu_raw: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    frame_refs: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    llm_request: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    llm_response: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    session_set: Mapped[SessionSet] = relationship(back_populates="debug_captures")
