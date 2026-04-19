"""Abstract base for all AI video API clients."""

import time
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class GenerationResult:
    """Result of a video generation job."""
    job_id: str
    status: str  # "completed" or "failed"
    video_url: str | None = None
    error: str | None = None
    cost: float = 0.0
    duration_seconds: int = 0


class BaseVideoClient(ABC):
    """Base class for AI video generation API clients."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.logger = logging.getLogger(self.__class__.__name__)

    @abstractmethod
    def submit_job(self, image_url: str, prompt: str,
                   duration: int, **kwargs) -> str:
        """Submit image-to-video job. Returns job_id."""

    @abstractmethod
    def check_status(self, job_id: str) -> GenerationResult:
        """Check job status. Returns GenerationResult."""

    @property
    @abstractmethod
    def platform_name(self) -> str:
        """Human-readable platform name."""

    def generate(self, image_url: str, prompt: str, duration: int,
                 poll_interval: int = 15, timeout: int = 600,
                 **kwargs) -> GenerationResult:
        """Submit and poll until complete."""
        job_id = self.submit_job(image_url, prompt, duration, **kwargs)
        self.logger.info(f"Submitted job {job_id} on {self.platform_name}")

        elapsed = 0
        while elapsed < timeout:
            result = self.check_status(job_id)
            if result.status == "completed":
                self.logger.info(f"Job {job_id} completed")
                return result
            elif result.status == "failed":
                raise RuntimeError(
                    f"Job {job_id} failed: {result.error}"
                )
            time.sleep(poll_interval)
            elapsed += poll_interval

        raise TimeoutError(
            f"Job {job_id} timed out after {timeout}s on {self.platform_name}"
        )
