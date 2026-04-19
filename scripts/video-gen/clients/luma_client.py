"""Luma AI Dream Machine (Ray-2) API client."""

import requests

from .base import BaseVideoClient, GenerationResult

API_BASE = "https://api.lumalabs.ai/dream-machine/v1"


class LumaClient(BaseVideoClient):
    """Client for Luma AI Dream Machine image-to-video API."""

    @property
    def platform_name(self) -> str:
        return "Luma AI"

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    VALID_DURATIONS = [5, 9, 10]

    def _clamp_duration(self, duration: int) -> int:
        """Luma only accepts 5s, 9s, or 10s. Round up to nearest valid."""
        for valid in self.VALID_DURATIONS:
            if duration <= valid:
                return valid
        return self.VALID_DURATIONS[-1]

    def submit_job(self, image_url: str, prompt: str,
                   duration: int, **kwargs) -> str:
        actual_duration = self._clamp_duration(duration)
        if actual_duration != duration:
            self.logger.info(
                f"Luma duration clamped: {duration}s -> {actual_duration}s"
            )

        body = {
            "prompt": prompt,
            "model": kwargs.get("model", "ray-2"),
            "keyframes": {
                "frame0": {
                    "type": "image",
                    "url": image_url,
                }
            },
            "duration": f"{actual_duration}s",
            "aspect_ratio": kwargs.get("aspect_ratio", "16:9"),
        }
        if kwargs.get("resolution"):
            body["resolution"] = kwargs["resolution"]

        resp = requests.post(
            f"{API_BASE}/generations",
            headers=self._headers(),
            json=body,
        )
        if not resp.ok:
            self.logger.error(
                f"Luma submit failed ({resp.status_code}): {resp.text}"
            )
            resp.raise_for_status()
        data = resp.json()
        return data["id"]

    def check_status(self, job_id: str) -> GenerationResult:
        resp = requests.get(
            f"{API_BASE}/generations/{job_id}",
            headers=self._headers(),
        )
        resp.raise_for_status()
        data = resp.json()

        state = data.get("state", "unknown")
        if state == "completed":
            video_url = data.get("assets", {}).get("video")
            return GenerationResult(
                job_id=job_id,
                status="completed",
                video_url=video_url,
            )
        elif state == "failed":
            return GenerationResult(
                job_id=job_id,
                status="failed",
                error=data.get("failure_reason", "Unknown error"),
            )
        else:
            # queued or dreaming — still in progress
            return GenerationResult(
                job_id=job_id,
                status="pending",
            )
