"""Kling AI (v2) image-to-video API client."""

import time

import jwt
import requests

from .base import BaseVideoClient, GenerationResult

API_BASE = "https://api.klingai.com/v1"


class KlingClient(BaseVideoClient):
    """Client for Kling AI image-to-video API.

    Kling uses Access Key / Secret Key authentication via JWT tokens.
    Pass the access key as api_key and secret key as secret_key.
    """

    def __init__(self, api_key: str, secret_key: str):
        super().__init__(api_key)
        self.secret_key = secret_key
        self._token: str | None = None
        self._token_expiry: float = 0

    @property
    def platform_name(self) -> str:
        return "Kling AI"

    def _get_token(self) -> str:
        """Generate or return cached JWT token."""
        now = time.time()
        # Refresh 5 minutes before expiry
        if self._token and now < self._token_expiry - 300:
            return self._token

        now_int = int(now)
        payload = {
            "iss": self.api_key,  # Access Key
            "exp": now_int + 1800,  # 30 min validity
            "nbf": now_int - 5,  # 5s clock skew tolerance
        }
        self._token = jwt.encode(
            payload,
            self.secret_key,
            algorithm="HS256",
            headers={"alg": "HS256", "typ": "JWT"},
        )
        self._token_expiry = now_int + 1800
        return self._token

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self._get_token()}",
            "Content-Type": "application/json",
        }

    VALID_DURATIONS = [5, 10]

    def _clamp_duration(self, duration: int) -> int:
        """Kling only accepts 5 or 10. Round up to nearest valid."""
        for valid in self.VALID_DURATIONS:
            if duration <= valid:
                return valid
        return self.VALID_DURATIONS[-1]

    def submit_job(self, image_url: str, prompt: str,
                   duration: int, **kwargs) -> str:
        actual_duration = self._clamp_duration(duration)
        if actual_duration != duration:
            self.logger.info(
                f"Kling duration clamped: {duration}s -> {actual_duration}s"
            )
        body = {
            "model_name": kwargs.get("model", "kling-v1-6"),
            "mode": kwargs.get("mode", "pro"),
            "duration": str(actual_duration),
            "image": image_url,
            "prompt": prompt,
            "aspect_ratio": kwargs.get("aspect_ratio", "16:9"),
            "cfg_scale": kwargs.get("cfg_scale", 0.5),
        }

        image_tail_url = kwargs.get("image_tail")
        if image_tail_url:
            body["image_tail"] = image_tail_url

        negative_prompt = kwargs.get("negative_prompt")
        if negative_prompt:
            body["negative_prompt"] = negative_prompt

        resp = requests.post(
            f"{API_BASE}/videos/image2video",
            headers=self._headers(),
            json=body,
        )
        if not resp.ok:
            self.logger.error(
                f"Kling submit failed ({resp.status_code}): {resp.text}"
            )
            resp.raise_for_status()
        data = resp.json()

        if data.get("code") != 0:
            raise RuntimeError(
                f"Kling API error: {data.get('message', 'Unknown')}"
            )

        return data["data"]["task_id"]

    def check_status(self, job_id: str) -> GenerationResult:
        resp = requests.get(
            f"{API_BASE}/videos/image2video/{job_id}",
            headers=self._headers(),
        )
        resp.raise_for_status()
        data = resp.json()

        if data.get("code") != 0:
            return GenerationResult(
                job_id=job_id,
                status="failed",
                error=data.get("message", "API error"),
            )

        task_data = data.get("data", {})
        task_status = task_data.get("task_status", "unknown")

        if task_status == "succeed":
            videos = task_data.get("task_result", {}).get("videos", [])
            video_url = videos[0]["url"] if videos else None
            return GenerationResult(
                job_id=job_id,
                status="completed",
                video_url=video_url,
            )
        elif task_status == "failed":
            return GenerationResult(
                job_id=job_id,
                status="failed",
                error=task_data.get("task_status_msg", "Unknown error"),
            )
        else:
            # submitted or processing
            return GenerationResult(
                job_id=job_id,
                status="pending",
            )
