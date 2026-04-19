"""Runway Gen-4 image-to-video API client."""

import requests

from .base import BaseVideoClient, GenerationResult

API_BASE = "https://api.dev.runwayml.com/v1"
API_VERSION = "2024-11-06"


class RunwayClient(BaseVideoClient):
    """Client for Runway Gen-4 image-to-video API."""

    @property
    def platform_name(self) -> str:
        return "Runway"

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "X-Runway-Version": API_VERSION,
        }

    def submit_job(self, image_url: str, prompt: str,
                   duration: int, **kwargs) -> str:
        model = kwargs.get("model", "gen4_turbo")
        body = {
            "model": model,
            "promptImage": image_url,
            "promptText": prompt,
            "ratio": "1280:720",
            "duration": duration,
        }

        resp = requests.post(
            f"{API_BASE}/image_to_video",
            headers=self._headers(),
            json=body,
        )
        if not resp.ok:
            self.logger.error(
                f"Runway submit failed ({resp.status_code}): {resp.text}"
            )
            resp.raise_for_status()
        data = resp.json()
        return data["id"]

    def check_status(self, job_id: str) -> GenerationResult:
        resp = requests.get(
            f"{API_BASE}/tasks/{job_id}",
            headers=self._headers(),
        )
        resp.raise_for_status()
        data = resp.json()

        status = data.get("status", "PENDING")

        if status == "SUCCEEDED":
            output = data.get("output", [])
            video_url = output[0] if output else None
            return GenerationResult(
                job_id=job_id,
                status="completed",
                video_url=video_url,
            )
        elif status == "FAILED":
            return GenerationResult(
                job_id=job_id,
                status="failed",
                error=data.get("failure", "Unknown error"),
            )
        else:
            # PENDING, THROTTLED, RUNNING
            progress = data.get("progress")
            if progress is not None:
                self.logger.debug(
                    f"Job {job_id} progress: {progress:.0%}"
                )
            return GenerationResult(
                job_id=job_id,
                status="pending",
            )
