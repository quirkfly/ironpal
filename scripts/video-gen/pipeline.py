"""Batch orchestration: submit all shots, poll, download, organize."""

import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path

import requests
import yaml

from clients import KlingClient, LumaClient, RunwayClient
from clients.base import BaseVideoClient

logger = logging.getLogger(__name__)


class Pipeline:
    """Orchestrates video generation across multiple AI platforms."""

    def __init__(self, config_path: str):
        with open(config_path) as f:
            self.config = yaml.safe_load(f)

        self.settings = self.config["settings"]
        self.shots = self.config["shots"]

        # Resolve image base URL from env var (Cloudflare tunnel URL)
        self.image_base_url = os.environ.get(
            "IMAGE_BASE_URL", ""
        ).rstrip("/")
        if not self.image_base_url:
            raise ValueError(
                "IMAGE_BASE_URL not set. Start the Cloudflare tunnel first:\n"
                "  cloudflared tunnel --url http://localhost:8080"
            )

        self._clients: dict[str, BaseVideoClient] = {}
        self._init_clients()

        self.run_log = {
            "started_at": datetime.now(timezone.utc).isoformat(),
            "image_base_url": self.image_base_url,
            "shots": {},
            "total_cost": 0.0,
            "total_clips": 0,
            "total_failures": 0,
        }

    def _init_clients(self):
        """Initialize API clients from environment variables."""
        runway_key = os.environ.get("RUNWAY_API_KEY", "")
        luma_key = os.environ.get("LUMA_API_KEY", "")
        kling_access = os.environ.get("KLING_ACCESS_KEY", "")
        kling_secret = os.environ.get("KLING_SECRET_KEY", "")

        if runway_key:
            self._clients["runway"] = RunwayClient(runway_key)
        if luma_key:
            self._clients["luma"] = LumaClient(luma_key)
        if kling_access and kling_secret:
            self._clients["kling"] = KlingClient(kling_access, kling_secret)

    def _get_client(self, platform: str) -> BaseVideoClient:
        """Get the client for a given platform."""
        client = self._clients.get(platform)
        if not client:
            raise ValueError(
                f"No API key configured for platform '{platform}'. "
                f"Check your .env file."
            )
        return client

    def _get_image_url(self, relative_path: str) -> str:
        """Construct full image URL from Cloudflare tunnel base + relative path."""
        return f"{self.image_base_url}/{relative_path}"

    def run(self, shot_filter: list[str] | None = None,
            platform_filter: str | None = None,
            max_attempts: int | None = None):
        """Run generation for all shots (or filtered subset).

        Args:
            shot_filter: Only generate these shot IDs (e.g. ["S1", "S4a"])
            platform_filter: Only generate shots for this platform
            max_attempts: Override attempts count per shot
        """
        for shot_id, shot_config in self.shots.items():
            if shot_filter and shot_id not in shot_filter:
                continue
            if platform_filter and shot_config["platform"] != platform_filter:
                continue
            self._process_shot(shot_id, shot_config, max_attempts)

        self._finalize()

    def _process_shot(self, shot_id: str, config: dict,
                      max_attempts: int | None = None):
        """Generate N attempts for a single shot."""
        platform = config["platform"]
        client = self._get_client(platform)
        output_dir = Path(self.settings["output_dir"]) / shot_id
        output_dir.mkdir(parents=True, exist_ok=True)

        attempts = max_attempts or config["attempts"]
        shot_log = {
            "platform": platform,
            "model": config.get("model", "default"),
            "attempts": [],
            "successes": 0,
            "failures": 0,
        }

        logger.info(
            f"=== {shot_id} ({platform}) — generating {attempts} variants ==="
        )

        for i in range(attempts):
            attempt_num = i + 1
            logger.info(f"{shot_id} attempt {attempt_num}/{attempts}")
            try:
                result = client.generate(
                    image_url=self._get_image_url(config["source_image"]),
                    prompt=config["prompt"],
                    duration=config["duration"],
                    poll_interval=self.settings["poll_interval_seconds"],
                    timeout=self.settings["poll_timeout_seconds"],
                    model=config.get("model"),
                    mode=config.get("mode"),
                    aspect_ratio=self.settings.get("aspect_ratio", "16:9"),
                )
                # Download video
                video_path = output_dir / f"{shot_id}_v{attempt_num}.mp4"
                self._download(result.video_url, video_path)
                file_size = video_path.stat().st_size

                shot_log["attempts"].append({
                    "variant": attempt_num,
                    "status": "success",
                    "path": str(video_path),
                    "file_size_bytes": file_size,
                    "job_id": result.job_id,
                })
                shot_log["successes"] += 1
                logger.info(
                    f"{shot_id} v{attempt_num} downloaded "
                    f"({file_size / 1024:.0f} KB)"
                )

            except Exception as e:
                logger.error(f"{shot_id} attempt {attempt_num} failed: {e}")
                shot_log["attempts"].append({
                    "variant": attempt_num,
                    "status": "failed",
                    "error": str(e),
                })
                shot_log["failures"] += 1

        self.run_log["shots"][shot_id] = shot_log
        self.run_log["total_clips"] += shot_log["successes"]
        self.run_log["total_failures"] += shot_log["failures"]

        logger.info(
            f"=== {shot_id} complete: "
            f"{shot_log['successes']} ok, {shot_log['failures']} failed ==="
        )

    def _download(self, url: str, path: Path):
        """Download video from URL to local file."""
        resp = requests.get(url, stream=True, timeout=120)
        resp.raise_for_status()
        with open(path, "wb") as f:
            for chunk in resp.iter_content(8192):
                f.write(chunk)

    def _finalize(self):
        """Save run log and print summary."""
        self.run_log["completed_at"] = datetime.now(timezone.utc).isoformat()
        self._save_log()

        total = self.run_log["total_clips"]
        failed = self.run_log["total_failures"]
        logger.info(f"\n{'='*60}")
        logger.info(f"Pipeline complete: {total} clips generated, {failed} failures")
        logger.info(f"Output: {self.settings['output_dir']}")
        logger.info(f"{'='*60}")

    def _save_log(self):
        """Save the run log to a JSON file."""
        log_dir = Path(self.settings["log_dir"])
        log_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H%M%S")
        log_path = log_dir / f"run_{timestamp}.json"
        with open(log_path, "w") as f:
            json.dump(self.run_log, f, indent=2)
        logger.info(f"Run log saved to {log_path}")
