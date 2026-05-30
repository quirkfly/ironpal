from __future__ import annotations

import base64


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "UP"
    assert body["vision_enabled"] is False  # mock mode in tests


def test_auth_required(client):
    # No token → 401/403 (FastAPI Header(...) missing → 422; with header missing Bearer → 401)
    r = client.get("/api/v1/templates/sync")
    assert r.status_code in (401, 422)
    r = client.get("/api/v1/templates/sync", headers={"Authorization": "Bearer nope"})
    assert r.status_code == 401


# ---------------- templates (Q1 founder-only enrollment, D7 both reps) ----------------


def _make_template(label="bulgarian_split_squat", take=1):
    return {
        "exercise_label": label,
        "take_id": take,
        "device_orientation": {"pitch": 5, "roll": 0},
        "sample_rate_hz": 50,
        "feature_vector": {"axis_energy_ratio": [0.7, 0.2, 0.1], "cadence_hz": 0.45},
        "imu_series_b64": base64.b64encode(b"\x01\x02\x03raw-resampled-window").decode(),
    }


def test_founder_can_enroll_tester_cannot(client, founder_auth, tester_auth):
    # tester forbidden (Q1)
    r = client.post("/api/v1/templates", json=_make_template(), headers=tester_auth)
    assert r.status_code == 403

    # founder ok
    r = client.post("/api/v1/templates", json=_make_template(), headers=founder_auth)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["version"] == 1
    assert body["imu_series_b64"] is not None  # raw window returned (D7)
    assert body["feature_vector"]["cadence_hz"] == 0.45  # feature vector returned (D7)


def test_invalid_label_rejected(client, founder_auth):
    r = client.post("/api/v1/templates", json=_make_template(label="bench_press"), headers=founder_auth)
    assert r.status_code == 422


def test_template_sync_delta(client, founder_auth, tester_auth):
    for i, label in enumerate(["bulgarian_split_squat", "triceps_pushdown", "unknown"], start=1):
        r = client.post("/api/v1/templates", json=_make_template(label, take=i), headers=founder_auth)
        assert r.status_code == 201

    # tester may pull the shared founder library read-only (Q2)
    r = client.get("/api/v1/templates/sync", headers=tester_auth)
    assert r.status_code == 200
    body = r.json()
    assert body["version"] == 3
    assert len(body["templates"]) == 3
    # both representations present (D7)
    assert all(t["imu_series_b64"] for t in body["templates"])

    # delta: since=2 returns only version 3
    r = client.get("/api/v1/templates/sync?since=2", headers=founder_auth)
    body = r.json()
    assert [t["version"] for t in body["templates"]] == [3]


# ---------------- vision (mock) ----------------


def test_vision_weight_mock(client, founder_auth):
    r = client.post(
        "/api/v1/vision/weight",
        json={"exercise_hint": "triceps_pushdown", "frame_b64": "Zm9v"},
        headers=founder_auth,
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["unit"] == "kg"
    assert body["model"] == "mock"
    assert body["weight"] is not None


def test_vision_recognize_mock(client, founder_auth):
    r = client.post(
        "/api/v1/vision/recognize",
        json={"frames_b64": ["Zm9v", "YmFy"], "orientation": "upright"},
        headers=founder_auth,
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["exercise"] in ("bulgarian_split_squat", "triceps_pushdown", "unknown")
    assert body["reps"] is not None


# ---------------- D3: founder-only frame/debug retention ----------------


def _count_debug_captures():
    from ironpal_poc import db as dbmod
    from ironpal_poc.models import DebugCapture

    with dbmod.get_session() as s:
        return s.query(DebugCapture).count()


def test_founder_keep_debug_persists(client, founder_auth):
    before = _count_debug_captures()
    client.post(
        "/api/v1/vision/weight",
        json={"exercise_hint": "bulgarian_split_squat", "frame_b64": "Zm9v", "keep_debug": True},
        headers=founder_auth,
    )
    assert _count_debug_captures() == before + 1


def test_tester_keep_debug_never_persists(client, tester_auth):
    # testers can't enroll, but they DO call vision during their runs (Q2)
    before = _count_debug_captures()
    client.post(
        "/api/v1/vision/weight",
        json={"exercise_hint": "triceps_pushdown", "frame_b64": "Zm9v", "keep_debug": True},
        headers=tester_auth,
    )
    assert _count_debug_captures() == before  # frame discarded; nothing stored (D3)


def test_founder_without_keep_debug_discards(client, founder_auth):
    before = _count_debug_captures()
    client.post(
        "/api/v1/vision/weight",
        json={"frame_b64": "Zm9v", "keep_debug": False},
        headers=founder_auth,
    )
    assert _count_debug_captures() == before


# ---------------- sessions (Q9 verdict-matrix data, D4/D5 device metadata) ----------------


def test_session_roundtrip(client, tester_auth):
    payload = {
        "detected_exercise": "bulgarian_split_squat",
        "exercise_confidence": 0.88,
        "exercise_source": "imu",
        "detected_reps": 8,
        "reps_confidence": 0.95,
        "reps_source": "imu",
        "detected_weight": 12.0,
        "weight_confidence": 0.5,
        "weight_source": "vision",
        "corrected_exercise": "bulgarian_split_squat",
        "corrected_reps": 8,
        "corrected_weight": 12.5,
        "is_rest_window": False,
        "device_model": "Pixel 6a",
        "sensor_info": {"accel": True, "gyro": False},
        "sample_rate_hz": 50,
        "has_gyro": False,
        "llm_calls": 1,
        "llm_cost_estimate": 0.004,
        "notes": "tester own phone, gyro-less",
    }
    r = client.post("/api/v1/sessions", json=payload, headers=tester_auth)
    assert r.status_code == 201, r.text
    sid = r.json()["id"]

    r = client.get("/api/v1/sessions/export", headers=tester_auth)
    assert r.status_code == 200
    rows = r.json()
    assert len(rows) == 1
    row = rows[0]
    assert row["id"] == sid
    assert row["has_gyro"] is False  # D5 split
    assert row["device_model"] == "Pixel 6a"  # D4
    assert row["corrected_weight"] == 12.5  # ground truth (Q9)
