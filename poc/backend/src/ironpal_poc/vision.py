"""gpt-5-nano vision integration: weight OCR + pushdown recognition.

Design refs: §4.4 (AI integration), §6 (API contract), architecture doc §1/§2 (egocentric
prompts). Decisions: Q5 (single guaranteed-readable glance frame), Q7 (dumbbell label vs pin
stack), DR6 (model/cost unverified — verify at M4; until then `vision_mock` gives deterministic
output so the pipeline is exercisable without spend).
"""

from __future__ import annotations

import json
import logging

from ironpal_poc.config import settings

logger = logging.getLogger(__name__)

# Rough gpt-5-nano pricing from architecture doc §8 (VERIFY at M4 — DR6). USD per token.
_INPUT_USD_PER_TOKEN = 0.05 / 1_000_000
_OUTPUT_USD_PER_TOKEN = 0.40 / 1_000_000

EXERCISE_LABELS = ("bulgarian_split_squat", "triceps_pushdown", "unknown")

WEIGHT_SYSTEM = (
    "You are analysing a single still frame from a camera mounted on a gym-goer's head "
    "(egocentric, first-person view). The user has just glanced at the weight they selected. "
    "Read the selected weight. For a pin-loaded stack, read the number on the plate where the pin "
    "is inserted. For dumbbells, read the number printed on the dumbbell head. "
    'Respond ONLY with JSON: {"weight": <number|null>, "unit": "kg"|"lb", "confidence": <0..1>}. '
    "If you cannot read it, weight=null and confidence<=0.3."
)

RECOGNIZE_SYSTEM = (
    "You are analysing a short sequence of frames from a camera mounted on a gym-goer's head "
    "(egocentric, first-person view). Identify the exercise and count the completed repetitions "
    "from the visual motion pattern. The candidate exercises are: "
    "'bulgarian_split_squat', 'triceps_pushdown', or 'unknown' (rest, walking, or any other "
    "activity). The head moves little during triceps pushdown — rely on the cable/attachment and "
    "the forearm pushdown motion in the lower frame. "
    'Respond ONLY with JSON: {"exercise": "bulgarian_split_squat"|"triceps_pushdown"|"unknown", '
    '"reps": <integer|null>, "confidence": <0..1>}.'
)


def _data_uri(b64: str) -> str:
    return f"data:image/jpeg;base64,{b64}"


def _estimate_cost(usage) -> float:
    try:
        return (
            (usage.prompt_tokens or 0) * _INPUT_USD_PER_TOKEN
            + (usage.completion_tokens or 0) * _OUTPUT_USD_PER_TOKEN
        )
    except Exception:
        return 0.0


_client = None


def _get_client():
    global _client
    if _client is None:
        from openai import OpenAI

        _client = OpenAI(api_key=settings.resolved_openai_key)
    return _client


def _chat_json(system: str, frames_b64: list[str], user_text: str) -> tuple[dict, dict, float]:
    """Low-level multimodal call → (parsed_json, raw_response_meta, cost_usd).

    Patched in tests; in mock mode the higher-level callers short-circuit before reaching here.
    """
    content: list[dict] = [{"type": "text", "text": user_text}]
    for b64 in frames_b64:
        content.append({"type": "image_url", "image_url": {"url": _data_uri(b64)}})

    client = _get_client()
    resp = client.chat.completions.create(
        model=settings.vision_model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": content},
        ],
        response_format={"type": "json_object"},
    )
    text = resp.choices[0].message.content or "{}"
    parsed = json.loads(text)
    cost = _estimate_cost(getattr(resp, "usage", None))
    raw = {"model": settings.vision_model, "content": text}
    return parsed, raw, cost


# ---------------- public API ----------------


def read_weight(frame_b64: str, exercise_hint: str | None) -> dict:
    """Returns {weight, unit, confidence, llm_calls, llm_cost_estimate, model, _raw_request, _raw_response}."""
    hint = f"Exercise context: {exercise_hint}. " if exercise_hint else ""
    if not settings.vision_enabled:
        # Deterministic mock (DR6): a plausible mid-range weight, flagged low-ish confidence.
        return {
            "weight": 20.0,
            "unit": "kg",
            "confidence": 0.5,
            "llm_calls": 0,
            "llm_cost_estimate": 0.0,
            "model": "mock",
            "_raw_request": {"system": WEIGHT_SYSTEM, "hint": hint, "mock": True},
            "_raw_response": {"mock": True},
        }
    parsed, raw, cost = _chat_json(
        WEIGHT_SYSTEM, [frame_b64], hint + "Read the selected weight from this frame."
    )
    return {
        "weight": parsed.get("weight"),
        "unit": parsed.get("unit", "kg"),
        "confidence": float(parsed.get("confidence", 0.0)),
        "llm_calls": 1,
        "llm_cost_estimate": cost,
        "model": settings.vision_model,
        "_raw_request": {"system": WEIGHT_SYSTEM, "hint": hint},
        "_raw_response": raw,
    }


def recognize(frames_b64: list[str], orientation: str | None) -> dict:
    """Returns {exercise, reps, confidence, llm_calls, llm_cost_estimate, model, _raw_*}."""
    ori = f"Body orientation: {orientation}. " if orientation else ""
    if not settings.vision_enabled:
        # Deterministic mock (DR6): pushdown is the vision-led exercise in the POC.
        return {
            "exercise": "triceps_pushdown",
            "reps": 10,
            "confidence": 0.6,
            "llm_calls": 0,
            "llm_cost_estimate": 0.0,
            "model": "mock",
            "_raw_request": {"system": RECOGNIZE_SYSTEM, "orientation": ori, "mock": True},
            "_raw_response": {"mock": True},
        }
    parsed, raw, cost = _chat_json(
        RECOGNIZE_SYSTEM,
        frames_b64,
        ori + "Identify the exercise and count the completed reps from these sequential frames.",
    )
    ex = parsed.get("exercise")
    if ex not in EXERCISE_LABELS:
        ex = "unknown"
    return {
        "exercise": ex,
        "reps": parsed.get("reps"),
        "confidence": float(parsed.get("confidence", 0.0)),
        "llm_calls": 1,
        "llm_cost_estimate": cost,
        "model": settings.vision_model,
        "_raw_request": {"system": RECOGNIZE_SYSTEM, "orientation": ori},
        "_raw_response": raw,
    }
