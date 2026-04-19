# AI Video Generation — Automated Pipeline Execution Plan

**Based on:** [AI Video Generation Options](./ai-video-generation-options.md) (Scenario 4: Multi-Platform Recommended)  
**Implements:** Step 3 of the [Video Production Execution Plan](./video-production-execution-plan.md)  
**Owner:** AVP (Artistic Visual Producer)  
**Reviewers:** CD (Creative Director)  
**Date:** 2026-04-19  
**Status:** Draft — pending team feedback

---

## Executive Summary

This plan automates the generation of ~70 AI video clips from 13 approved storyboard key frames using APIs from three platforms: Runway Gen-4, Luma AI, and Kling AI. The pipeline replaces 2-4 days of manual web UI work with a ~1-day automated process at an estimated cost of $23-$41, and produces organized output ready for human review and post-production.

---

## Phase 1: Environment Setup (Day 1, ~2 hours)

### 1.1 API Account Registration & Key Provisioning

| Platform | Action | URL | Expected Cost | Key Format |
|---|---|---|---|---|
| Runway ML | Create developer account, obtain API key | [dev.runwayml.com](https://dev.runwayml.com/) | $0 (pay-as-you-go) | `rw_...` |
| Luma AI | Sign up, activate Build tier for API access | [lumalabs.ai](https://lumalabs.ai/) | $0-$30/mo | Bearer token |
| Kling AI | Register at developer portal, obtain API key | [klingai.com/dev](https://app.klingai.com/global/dev/) | $7-$30/mo | Bearer token |

**Acceptance criteria:** All three API keys are obtained, stored in `.env` file (gitignored), and each can successfully return a 200 response on a health/info endpoint.

### 1.2 Development Environment

```bash
# Create project directory
mkdir -p ironpal/scripts/video-gen
cd ironpal/scripts/video-gen

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install runwayml requests pyyaml python-dotenv aiohttp

# Create .env file (gitignored)
cat > .env << 'EOF'
RUNWAY_API_KEY=rw_your_key_here
LUMA_API_KEY=your_luma_key_here
KLING_API_KEY=your_kling_key_here
EOF

# Verify .gitignore
echo ".env" >> ../../.gitignore
```

### 1.3 Image Hosting Setup

All three APIs require source images at publicly accessible URLs. Options:

| Option | Setup Time | Cost | Recommended |
|---|---|---|---|
| **AWS S3 bucket + pre-signed URLs** | 15 min | ~$0 (free tier) | Yes — most reliable |
| Cloudflare R2 | 15 min | $0 (10GB free) | Alternative |
| GitHub raw URLs (public repo) | 0 min | $0 | Only if images aren't sensitive |
| Base64 inline (Runway SDK) | 0 min | $0 | Runway only, not cross-platform |

**Recommended:** Create a private S3 bucket `ironpal-storyboard-assets`, upload the 13 selected key frame images, generate pre-signed URLs with 24-hour expiry.

**Acceptance criteria:** All 13 selected storyboard images are accessible via URL and return HTTP 200.

---

## Phase 2: Pipeline Development (Day 1, ~3-4 hours)

### 2.1 Project Structure

```
scripts/video-gen/
├── .env                    # API keys (gitignored)
├── config.yaml             # Shot definitions, prompts, platform assignments
├── generate.py             # Main entry point
├── clients/
│   ├── __init__.py
│   ├── base.py             # Abstract base client with polling logic
│   ├── runway_client.py    # Runway Gen-4 API wrapper
│   ├── luma_client.py      # Luma AI API wrapper
│   └── kling_client.py     # Kling AI API wrapper
├── pipeline.py             # Orchestration: batch submit, poll, download
├── quality_check.py        # Post-generation quality metrics
├── output/                 # Generated clips organized by shot
│   ├── S1/
│   ├── S2a/
│   └── ...
└── logs/                   # Generation logs with timestamps and costs
    └── run_2026-04-XX.json
```

### 2.2 Configuration File (config.yaml)

```yaml
# Global settings
settings:
  output_dir: "./output"
  log_dir: "./logs"
  max_concurrent_jobs: 10      # Luma allows 10, others less
  poll_interval_seconds: 15
  poll_timeout_seconds: 600    # 10 minute timeout per job
  retry_max: 2                 # Retry failed jobs up to 2 times
  resolution: "1080p"
  aspect_ratio: "16:9"

# Shot definitions
shots:
  S1:
    platform: kling
    model: "kling-v2"
    mode: "pro"
    source_image: "input/kickstarter/storyboarding/S1/selected.jpg"
    prompt: >
      Close-up of smartphone screen, thumb slowly tapping a weight
      stepper control, slight finger movement, gym bench blurred in
      background, cool desaturated lighting, photorealistic
    duration: 5
    attempts: 4
    notes: "Phone close-up. Composite Figma app screen in post."

  S2a:
    platform: luma
    model: "ray-2"
    source_image: "input/kickstarter/storyboarding/S2a/selected.jpg"
    prompt: >
      Athletic male sitting on bench, looking down at phone with
      frustrated expression, slight head movement, cool blue-gray gym
      lighting, cinematic slow motion
    duration: 4
    attempts: 6
    notes: "Old way beat. Different athlete from S4a-S5 is fine."

  S2b:
    platform: luma
    model: "ray-2"
    source_image: "input/kickstarter/storyboarding/S2b/selected.jpg"
    prompt: >
      Athletic female standing beside cable machine, looking down at
      phone with impatient expression, free hand on hip, scrolling
      motion, cool desaturated gym lighting, cinematic
    duration: 4
    attempts: 6
    notes: "Old way beat. Cable handle hanging unused."

  S3:
    platform: luma
    model: "ray-2"
    source_image: "input/kickstarter/storyboarding/S3/selected.jpg"
    prompt: >
      Hand reaching into black gym bag, pulling out matte black
      headband, teal LED lights up with subtle glow, warm golden gym
      lighting, cinematic close-up, slow deliberate motion
    duration: 5
    attempts: 6
    notes: "Transition moment. Color shift from cool to warm."

  S4a:
    platform: runway
    model: "gen4_turbo"
    source_image: "input/kickstarter/storyboarding/S4a/selected.jpg"
    prompt: >
      Athletic male performing bench press, smooth controlled pressing
      motion, matte black headband with teal IronPal text visible, warm
      vibrant gym lighting, cinematic, focused expression
    duration: 5
    attempts: 6
    character_ref: true
    notes: "Character consistency group C. Same athlete as S4b, S4c, S5."

  S4b:
    platform: runway
    model: "gen4_turbo"
    source_image: "input/kickstarter/storyboarding/S4b/selected.jpg"
    prompt: >
      Athletic female performing cable fly, smooth pulling motion,
      matte black headband with teal IronPal text visible, warm
      cinematic lighting, focused and confident
    duration: 5
    attempts: 6
    notes: "IronPal montage. Cable motion should be smooth."

  S4c:
    platform: runway
    model: "gen4_turbo"
    source_image: "input/kickstarter/storyboarding/S4c/selected.jpg"
    prompt: >
      Close-up of athlete performing dumbbell curl, smooth controlled
      curling motion, matte black headband with teal IronPal text
      visible, 16 KG label visible on dumbbell, warm vibrant gym
      lighting, cinematic
    duration: 5
    attempts: 6
    character_ref: true
    notes: "Character consistency group C. Weight label must stay readable."

  S4d:
    platform: kling
    model: "kling-v2"
    mode: "pro"
    source_image: "input/kickstarter/storyboarding/S4d/selected.jpg"
    prompt: >
      First-person POV, hand reaching toward weight stack, fingers
      gripping yellow pin, sliding it into the 50 slot, slight hand
      tremor, warm lighting on metal plates, numbers clearly visible
    duration: 4
    attempts: 4
    notes: "Simulated camera POV. Kling for motion control."

  S5:
    platform: runway
    model: "gen4_turbo"
    source_image: "input/kickstarter/storyboarding/S5/selected.jpg"
    prompt: >
      Athletic male sitting on gym bench, looking at phone with relaxed
      impressed smile, slight head nod, headband with teal IronPal text
      around neck, towel on shoulder, warm amber gym lighting, cinematic
    duration: 7
    attempts: 6
    character_ref: true
    notes: "Payoff moment. Character consistency group C. Phone screen composited in post."

  S6a:
    platform: luma
    model: "ray-2"
    source_image: "input/kickstarter/storyboarding/S6a/selected.jpg"
    prompt: >
      Athletic female performing kettlebell swing, explosive upward
      motion, matte black headband with IronPal text visible, modern
      bright gym, warm lighting, cinematic, powerful and focused
    duration: 3
    attempts: 5
    notes: "Social proof montage. Quick cut."

  S6b:
    platform: luma
    model: "ray-2"
    source_image: "input/kickstarter/storyboarding/S6b/selected.jpg"
    prompt: >
      Athletic male performing pull-up, upward pulling motion, matte
      black baseball cap with teal IronPal text and camera module,
      gritty industrial gym, warm lighting, cinematic, intense expression
    duration: 3
    attempts: 5
    notes: "Social proof montage. Cap variant for product diversity."

  S6c:
    platform: luma
    model: "ray-2"
    source_image: "input/kickstarter/storyboarding/S6c/selected.jpg"
    prompt: >
      Athletic female performing box jump, explosive upward motion,
      landing on plyo box, matte black headband with IronPal text
      visible, bright CrossFit gym, warm lighting, cinematic, dynamic
    duration: 3
    attempts: 5
    notes: "Social proof montage. Most dynamic motion."

  S7:
    platform: runway
    model: "gen4_turbo"
    source_image: "input/kickstarter/storyboarding/S7/selected.jpg"
    prompt: >
      Slow dramatic lighting sweep across IronPal headband and baseball
      cap on dark slate surface, teal LED glowing, camera module
      between products, subtle light movement, product photography,
      cinematic
    duration: 5
    attempts: 4
    notes: "End card beauty shot. Slow, controlled lighting sweep."
```

### 2.3 Core Pipeline Components

#### Base Client (clients/base.py)

```python
"""Abstract base for all AI video API clients."""
import time
import logging
from abc import ABC, abstractmethod

class BaseVideoClient(ABC):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.logger = logging.getLogger(self.__class__.__name__)

    @abstractmethod
    def submit_job(self, image_url: str, prompt: str, 
                   duration: int, **kwargs) -> str:
        """Submit image-to-video job. Returns job_id."""
        pass

    @abstractmethod
    def check_status(self, job_id: str) -> dict:
        """Check job status. Returns {status, video_url, error}."""
        pass

    def generate(self, image_url, prompt, duration,
                 poll_interval=15, timeout=600, **kwargs):
        """Submit and poll until complete."""
        job_id = self.submit_job(image_url, prompt, duration, **kwargs)
        self.logger.info(f"Submitted job {job_id}")

        elapsed = 0
        while elapsed < timeout:
            result = self.check_status(job_id)
            if result["status"] == "completed":
                self.logger.info(f"Job {job_id} completed")
                return result
            elif result["status"] == "failed":
                raise RuntimeError(f"Job {job_id} failed: {result.get('error')}")
            time.sleep(poll_interval)
            elapsed += poll_interval

        raise TimeoutError(f"Job {job_id} timed out after {timeout}s")
```

#### Orchestrator (pipeline.py)

```python
"""Batch orchestration: submit all shots, poll, download, organize."""
import os
import json
import yaml
import logging
import requests
from datetime import datetime
from pathlib import Path

class Pipeline:
    def __init__(self, config_path: str):
        with open(config_path) as f:
            self.config = yaml.safe_load(f)
        self.settings = self.config["settings"]
        self.shots = self.config["shots"]
        self.run_log = {
            "started_at": datetime.utcnow().isoformat(),
            "shots": {},
            "total_cost": 0.0,
            "total_clips": 0
        }

    def run(self, shot_filter=None):
        """Run generation for all shots (or filtered subset)."""
        for shot_id, shot_config in self.shots.items():
            if shot_filter and shot_id not in shot_filter:
                continue
            self._process_shot(shot_id, shot_config)
        self._save_log()

    def _process_shot(self, shot_id, config):
        """Generate N attempts for a single shot."""
        client = self._get_client(config["platform"])
        output_dir = Path(self.settings["output_dir"]) / shot_id
        output_dir.mkdir(parents=True, exist_ok=True)

        shot_log = {"attempts": [], "successes": 0, "failures": 0}

        for i in range(config["attempts"]):
            try:
                result = client.generate(
                    image_url=self._get_image_url(config["source_image"]),
                    prompt=config["prompt"],
                    duration=config["duration"],
                    poll_interval=self.settings["poll_interval_seconds"],
                    timeout=self.settings["poll_timeout_seconds"],
                    model=config.get("model"),
                    mode=config.get("mode")
                )
                # Download video
                video_path = output_dir / f"{shot_id}_v{i+1}.mp4"
                self._download(result["video_url"], video_path)
                shot_log["attempts"].append({
                    "variant": i + 1,
                    "status": "success",
                    "path": str(video_path),
                    "cost": result.get("cost", 0)
                })
                shot_log["successes"] += 1
            except Exception as e:
                logging.error(f"{shot_id} attempt {i+1} failed: {e}")
                shot_log["attempts"].append({
                    "variant": i + 1,
                    "status": "failed",
                    "error": str(e)
                })
                shot_log["failures"] += 1

        self.run_log["shots"][shot_id] = shot_log
        self.run_log["total_clips"] += shot_log["successes"]

    def _download(self, url, path):
        resp = requests.get(url, stream=True)
        resp.raise_for_status()
        with open(path, "wb") as f:
            for chunk in resp.iter_content(8192):
                f.write(chunk)

    def _save_log(self):
        log_dir = Path(self.settings["log_dir"])
        log_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.utcnow().strftime("%Y-%m-%d_%H%M%S")
        log_path = log_dir / f"run_{timestamp}.json"
        with open(log_path, "w") as f:
            json.dump(self.run_log, f, indent=2)
        logging.info(f"Run log saved to {log_path}")
```

### 2.4 Development Tasks

| # | Task | Est. Time | Output |
|---|---|---|---|
| 2.4.1 | Implement `BaseVideoClient` with polling and retry logic | 30 min | `clients/base.py` |
| 2.4.2 | Implement `RunwayClient` with Gen-4 image-to-video + character reference | 45 min | `clients/runway_client.py` |
| 2.4.3 | Implement `LumaClient` with Ray 2 image-to-video | 45 min | `clients/luma_client.py` |
| 2.4.4 | Implement `KlingClient` with Pro mode image-to-video | 45 min | `clients/kling_client.py` |
| 2.4.5 | Implement `Pipeline` orchestrator with batch management | 45 min | `pipeline.py` |
| 2.4.6 | Create `config.yaml` with all 13 shot definitions | 30 min | `config.yaml` |
| 2.4.7 | Implement `generate.py` CLI entry point | 15 min | `generate.py` |
| 2.4.8 | Implement `quality_check.py` — file size, duration, resolution validation | 30 min | `quality_check.py` |

---

## Phase 3: Testing (Day 1-2, ~2 hours)

### 3.1 Unit Tests — API Connectivity

For each platform, submit a single minimal generation to verify:

| Test | Platform | Input | Expected Output | Pass Criteria |
|---|---|---|---|---|
| `test_runway_connectivity` | Runway | S7 image, 5s, `gen4_turbo` | MP4 video file | 200 response, video downloads, >0 bytes |
| `test_luma_connectivity` | Luma | S6a image, 3s, `ray-2` | MP4 video file | 200 response, video downloads, >0 bytes |
| `test_kling_connectivity` | Kling | S4d image, 4s, Pro mode | MP4 video file | 200 response, video downloads, >0 bytes |

**Estimated test cost:** 3 clips x ~$0.20 avg = **$0.60**

### 3.2 Integration Test — Single Shot Pipeline

Run the full pipeline for one shot to validate end-to-end:

```bash
python generate.py --config config.yaml --shots S7 --attempts 2
```

**Validates:**
- Config loading
- Image URL resolution
- Job submission and polling
- Video download and file organization
- Log generation
- Error handling (intentionally submit one with a bad image URL)

**Estimated test cost:** 2 clips x ~$0.25 = **$0.50**

### 3.3 Character Consistency Test

Before running the full batch, validate Runway Gen-4's character reference across two shots:

```bash
python generate.py --config config.yaml --shots S4a,S4c --attempts 1
```

**Validates:**
- Same character reference image produces visually similar athlete across bench press and dumbbell curl scenes
- Headband remains visible in both
- Visual similarity is acceptable for the final video

**Estimated test cost:** 2 clips x $0.50 = **$1.00**

### 3.4 Test Phase Budget

| Test | Clips | Cost |
|---|---|---|
| Connectivity (3 platforms) | 3 | $0.60 |
| Integration (S7 x2) | 2 | $0.50 |
| Character consistency (S4a, S4c) | 2 | $1.00 |
| **Total test budget** | **7** | **$2.10** |

---

## Phase 4: Production Run (Day 2, ~3-4 hours elapsed)

### 4.1 Execution Sequence

Run in platform-grouped batches to manage rate limits and enable focused review:

**Batch 1 — Luma AI (33 clips, ~40 min generation time)**

```bash
python generate.py --config config.yaml --platform luma
```

| Shot | Attempts | Duration | Est. Time |
|---|---|---|---|
| S2a | 6 | 4s each | ~8 min |
| S2b | 6 | 4s each | ~8 min |
| S3 | 6 | 5s each | ~8 min |
| S6a | 5 | 3s each | ~6 min |
| S6b | 5 | 3s each | ~6 min |
| S6c | 5 | 3s each | ~6 min |

Luma allows 10 concurrent generations — these can run largely in parallel. Estimated wall-clock time: **~10-15 min**.

**Batch 2 — Runway Gen-4 (28 clips, ~50 min generation time)**

```bash
python generate.py --config config.yaml --platform runway
```

| Shot | Attempts | Duration | Est. Time |
|---|---|---|---|
| S4a | 6 | 5s each | ~10 min |
| S4b | 6 | 5s each | ~10 min |
| S4c | 6 | 5s each | ~10 min |
| S5 | 6 | 7s each | ~12 min |
| S7 | 4 | 5s each | ~8 min |

Character reference should be set from S4a's source image for S4a, S4c, and S5 (Group C). Estimated wall-clock time: **~20-30 min** (depends on Runway concurrency limits).

**Batch 3 — Kling AI (8 clips, ~15 min generation time)**

```bash
python generate.py --config config.yaml --platform kling
```

| Shot | Attempts | Duration | Est. Time |
|---|---|---|---|
| S1 | 4 | 5s each | ~8 min |
| S4d | 4 | 4s each | ~7 min |

Estimated wall-clock time: **~10-15 min**.

### 4.2 Total Production Run Timeline

| Batch | Start | Duration | End |
|---|---|---|---|
| Batch 1 (Luma) | T+0 | ~15 min | T+15 min |
| Batch 2 (Runway) | T+15 min | ~30 min | T+45 min |
| Batch 3 (Kling) | T+45 min | ~15 min | T+60 min |
| **Total generation** | | | **~1 hour** |

Note: Batches can run concurrently (different APIs, no shared rate limits), reducing total to ~30-45 min. Sequential execution is recommended for first run to isolate issues.

### 4.3 Production Run Budget

| Platform | Clips | Cost |
|---|---|---|
| Luma AI | 33 | $6.60 |
| Runway Gen-4 (`gen4_turbo`) | 28 | $7.60 |
| Kling AI (Pro) | 8 | $5.04 |
| **Total production** | **69** | **$19.24** |

---

## Phase 5: Quality Review & Selection (Day 2, ~2-3 hours)

### 5.1 Automated Quality Checks

Run `quality_check.py` immediately after generation to flag obvious failures:

```bash
python quality_check.py --input output/
```

| Check | Threshold | Action if Failed |
|---|---|---|
| File exists and >0 bytes | >100KB | Flag as corrupt, trigger re-generation |
| Video duration | Within 1s of target | Flag if too short (generation truncated) |
| Resolution | >= 720p | Flag if below minimum |
| Format | MP4 / H.264 | Flag if unexpected codec |

### 5.2 Human Review Process (AVP + CD)

For each shot, the AVP reviews all generated variants and selects the best:

| Review Criteria | Weight | Description |
|---|---|---|
| **Motion quality** | 30% | Smooth, natural motion without warping, jittering, or morphing artifacts |
| **Character/product fidelity** | 25% | Headband, cap, IronPal branding remain visible and recognizable |
| **Source image fidelity** | 20% | Output closely matches the composition, lighting, and framing of the source key frame |
| **Emotional beat** | 15% | The motion and expression sell the narrative moment (frustration for S2x, focus for S4x, satisfaction for S5) |
| **Technical quality** | 10% | Resolution, sharpness, color accuracy |

**Review workflow:**
1. AVP opens all variants per shot side-by-side
2. Eliminate any with obvious artifacts (hand warping, face morphing, barbell bending)
3. Rank remaining by the criteria above
4. Select top 1-2 per shot
5. CD reviews the selected sequence for narrative flow
6. CD approves or requests re-generation for specific shots

### 5.3 Selection Log

Record selections in `output/selections.yaml`:

```yaml
selections:
  S1:
    selected_variant: 2
    file: "output/S1/S1_v2.mp4"
    notes: "Cleanest thumb motion, no screen artifacts"
    status: approved
  S4a:
    selected_variant: 4
    file: "output/S4a/S4a_v4.mp4"
    notes: "Best bench press motion, headband stays visible"
    status: approved
  # ...
```

---

## Phase 6: Re-Generation (Day 2-3, if needed)

### 6.1 Triggers for Re-Generation

| Trigger | Action |
|---|---|
| All variants for a shot have artifacts | Modify prompt (add "slow motion" or simplify motion description), regenerate 4 more variants |
| Character consistency fails across S4a/S4c/S5 | Try `gen4_aleph` model ($0.15/sec) for higher quality, or adjust character reference approach |
| Duration too short | Increase duration parameter by 2s and regenerate |
| Wrong motion direction | Add explicit motion cues to prompt ("pressing upward", "curling toward shoulder") |

### 6.2 Re-Generation Budget

| Scenario | Est. Additional Clips | Cost |
|---|---|---|
| 2-3 shots need re-gen (4 variants each) | 8-12 | $2-$5 |
| Character consistency retry with `gen4_aleph` | 6-12 | $5-$10 |
| **Re-generation budget cap** | **~20 clips** | **$7-$15** |

---

## Phase 7: Handoff to Post-Production (Day 3)

### 7.1 Deliverables

| Deliverable | Format | Location |
|---|---|---|
| Selected video clips (13 shots) | MP4, 1080p, 24fps | `output/{shot}/selected.mp4` |
| Selection log | YAML | `output/selections.yaml` |
| Full generation log | JSON | `logs/run_YYYY-MM-DD.json` |
| Cost report | In generation log | Breakdown by platform and shot |
| Rejected variants (for reference) | MP4 | `output/{shot}/` (non-selected files) |

### 7.2 Post-Production Handoff Checklist

- [ ] All 13 shots have a selected variant
- [ ] Selected clips are renamed to `{shot}_final.mp4`
- [ ] Character consistency across S4a, S4c, S5 verified by CD
- [ ] Generation log includes cost breakdown
- [ ] Clips are organized in the execution plan's expected structure
- [ ] Post-production team briefed on which shots need composite work:
  - S1: Figma competitor app screen composited onto phone
  - S2a, S2b: Figma competitor app screen composited onto phone
  - S5: Figma IronPal app screen composited onto phone
  - All headband shots: teal LED glow enhancement in After Effects
  - All headband shots: "IronPal" text overlay if AI rendering is blurry

---

## Monitoring & Evaluation Framework

### Real-Time Monitoring (During Generation)

| Metric | How to Monitor | Alert Threshold |
|---|---|---|
| **Job success rate** | Count in run log | <80% success rate triggers investigation |
| **Generation time per clip** | Timestamps in run log | >5 min per clip may indicate API issues |
| **Cost accumulation** | Credit/cost tracking per API call | >$50 total triggers budget review |
| **Rate limit errors** | HTTP 429 responses in logs | Any 429 triggers concurrency reduction |
| **Timeout rate** | Timeout exceptions in logs | >10% timeout rate triggers poll interval adjustment |

### Post-Generation Quality Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| **Usable variant rate** | >= 50% of generated clips are usable (no major artifacts) | Manual review count |
| **First-variant-usable rate** | >= 30% of first attempts are good enough | Manual review count |
| **Character consistency score** | S4a, S4c, S5 read as the same person | Subjective CD assessment (pass/fail) |
| **Motion artifact rate** | <= 20% of clips have barbell/hand warping | Manual review count |
| **Prompt adherence** | >= 80% of clips match the intended composition | Manual review count |

### Success Criteria for the Automated Pipeline

| Criteria | Target | Status |
|---|---|---|
| All 13 shots have at least 1 usable variant | 13/13 | Pending |
| Total cost within budget ($41 cap) | <= $41 | Pending |
| Total elapsed time (setup through selection) | <= 8 hours | Pending |
| CD approves final sequence | Approved | Pending |
| No manual web UI fallback needed | 0 shots | Pending (aspirational) |

### Retrospective (After Completion)

After the pipeline run, document:
1. **Actual vs. estimated cost** — per platform and total
2. **Actual vs. estimated time** — per phase
3. **Which prompts worked best** — for future video projects
4. **Which platform produced the best results per shot type** — inform future tool selection
5. **Pipeline improvements** — bugs, UX issues, features to add

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **API outage during generation** | Low | Medium | Retry logic with exponential backoff. Run batches sequentially so one platform's outage doesn't block others. |
| **Rate limiting** | Medium | Low | Respect rate limits in client code. Luma: max 10 concurrent. Start conservative, increase if stable. |
| **Character consistency failure** | Medium | High | Use Runway Gen-4 (best consistency). Fall back to `gen4_aleph` for higher quality. Accept minor variation — headband anchors identity. Worst case: use the same key frame image for all Group C shots as a stronger reference. |
| **Motion artifacts on gym equipment** | High | Medium | Budget 6 attempts per complex shot. Use "slow motion" in prompts. Trim best 2-4s window from each clip. Barbells and cables are known weak points. |
| **API pricing changes** | Low | Low | Total budget is small ($20-$40). Even 2x increase is manageable. Pin to specific model versions in config. |
| **Source image rejected by API** | Low | Medium | Some APIs have content/safety filters. Test all 13 images in Phase 3 connectivity tests. Have backup crops ready. |
| **Luma Ray 3.14 not available via API** | Medium | Low | Fall back to Ray 2 which is confirmed available. Quality is slightly lower but sufficient for non-character-critical shots. |
| **Pipeline script bugs** | Medium | Low | Phase 3 testing catches most issues. Log everything. Manual fallback to web UI is always available for individual shots. |

---

## Timeline Summary

| Phase | Day | Duration | Deliverable |
|---|---|---|---|
| 1. Environment Setup | Day 1 | ~2h | API keys, dependencies, image hosting |
| 2. Pipeline Development | Day 1 | ~3-4h | Working pipeline code |
| 3. Testing | Day 1-2 | ~2h | Verified connectivity, character consistency test |
| 4. Production Run | Day 2 | ~1h (automated) | 69 generated clips |
| 5. Quality Review | Day 2 | ~2-3h | 13 selected clips, approved by CD |
| 6. Re-Generation | Day 2-3 | ~1-2h (if needed) | Replacement clips for rejected shots |
| 7. Handoff | Day 3 | ~30 min | Organized clips ready for post-production |
| **Total** | **1-3 days** | **~12-15h work** | **13 final clips + logs** |

---

## Budget Summary

| Category | Budget | Premium |
|---|---|---|
| API subscriptions (Luma + Kling) | $7-$60 | One-time monthly cost |
| Testing phase | $2.10 | Fixed |
| Production run | $19.24 | $34.44 with `gen4_aleph` |
| Re-generation buffer (20%) | $4-$7 | $7-$15 |
| **Total** | **$32-$88** | First month only; subsequent runs are production cost only |

For comparison: manual web UI generation has the same per-clip API cost but requires 2-4 days (8-16 hours) of manual human effort vs. ~4 hours with this pipeline.
