#!/usr/bin/env python3
"""CLI entry point for the IronPal AI video generation pipeline.

Usage:
    # Generate all shots
    python generate.py

    # Generate specific shots
    python generate.py --shots S1,S4a,S7

    # Generate only shots assigned to a platform
    python generate.py --platform luma

    # Override attempt count
    python generate.py --shots S7 --attempts 2

    # Dry run — verify config and image URLs
    python generate.py --dry-run
"""

import argparse
import logging
import os
import sys

import requests
from dotenv import load_dotenv

from pipeline import Pipeline


def setup_logging(verbose: bool = False):
    """Configure logging to console and file."""
    level = logging.DEBUG if verbose else logging.INFO
    fmt = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    datefmt = "%H:%M:%S"

    logging.basicConfig(level=level, format=fmt, datefmt=datefmt)

    # Also log to file
    os.makedirs("logs", exist_ok=True)
    fh = logging.FileHandler("logs/generate.log")
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(logging.Formatter(fmt, datefmt=datefmt))
    logging.getLogger().addHandler(fh)


def dry_run(pipeline: Pipeline):
    """Verify config and image URL accessibility without generating."""
    logger = logging.getLogger("dry-run")
    logger.info("Dry run — checking config and image URLs...")

    errors = 0
    for shot_id, config in pipeline.shots.items():
        url = pipeline._get_image_url(config["source_image"])
        platform = config["platform"]
        try:
            resp = requests.head(url, timeout=10, allow_redirects=True)
            status = resp.status_code
            if status == 200:
                logger.info(f"  {shot_id:5s} [{platform:6s}] {url} — OK")
            else:
                logger.warning(
                    f"  {shot_id:5s} [{platform:6s}] {url} — HTTP {status}"
                )
                errors += 1
        except requests.RequestException as e:
            logger.error(f"  {shot_id:5s} [{platform:6s}] {url} — {e}")
            errors += 1

    # Check API clients
    logger.info("")
    for platform in ["runway", "luma", "kling"]:
        try:
            pipeline._get_client(platform)
            logger.info(f"  {platform:6s} client — configured")
        except ValueError:
            logger.warning(f"  {platform:6s} client — NOT configured")

    if errors:
        logger.error(f"\n{errors} image URL(s) not accessible.")
        logger.error("Is the Cloudflare tunnel running?")
        sys.exit(1)
    else:
        logger.info("\nAll checks passed. Ready to generate.")


def main():
    parser = argparse.ArgumentParser(
        description="IronPal AI video generation pipeline"
    )
    parser.add_argument(
        "--config", default="config.yaml",
        help="Path to config YAML (default: config.yaml)"
    )
    parser.add_argument(
        "--shots",
        help="Comma-separated shot IDs to generate (e.g. S1,S4a,S7)"
    )
    parser.add_argument(
        "--platform",
        choices=["runway", "luma", "kling"],
        help="Only generate shots for this platform"
    )
    parser.add_argument(
        "--attempts", type=int,
        help="Override number of attempts per shot"
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Check config and image URLs without generating"
    )
    parser.add_argument(
        "-v", "--verbose", action="store_true",
        help="Enable debug logging"
    )

    args = parser.parse_args()

    # Load .env from project root (scripts/video-gen/) and repo root
    load_dotenv()
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

    setup_logging(args.verbose)
    logger = logging.getLogger("generate")

    try:
        pipeline = Pipeline(args.config)
    except ValueError as e:
        logger.error(str(e))
        sys.exit(1)

    if args.dry_run:
        dry_run(pipeline)
        return

    shot_filter = args.shots.split(",") if args.shots else None

    logger.info(f"Starting video generation pipeline")
    logger.info(f"  Image base URL: {pipeline.image_base_url}")
    logger.info(f"  Shots: {', '.join(shot_filter) if shot_filter else 'all'}")
    if args.platform:
        logger.info(f"  Platform filter: {args.platform}")
    if args.attempts:
        logger.info(f"  Attempts override: {args.attempts}")
    logger.info("")

    pipeline.run(
        shot_filter=shot_filter,
        platform_filter=args.platform,
        max_attempts=args.attempts,
    )


if __name__ == "__main__":
    main()
