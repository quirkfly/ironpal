# AI Video Generation API Options — Automated Step 3 Execution

**Context:** Evaluating API-based automation for Step 3 (AI Video Generation) of the [Video Production Execution Plan](./video-production-execution-plan.md). The goal is to programmatically generate 50-80 image-to-video clips from approved storyboard key frames, replacing the manual process of using web UIs one shot at a time.

**Date:** 2026-04-19

---

## Requirements Summary

From the execution plan, Step 3 needs:

- **Image-to-video generation** from 14 approved storyboard key frames
- **Multiple variations per shot** (3-8 attempts each, ~50-80 total runs)
- **4-10 second clips** per shot
- **720p-1080p resolution** minimum
- **Character consistency** across shots S4a, S4b, S4c, S5 (same male athlete)
- **Three different AI tools** currently specified: Luma Dream Machine, Runway Gen-4, Kling AI
- **Warm cinematic lighting** preservation from source images
- **Motion control** — slow, controlled gym movements (bench press, cable fly, curls)

---

## Platform Evaluation

### 1. Runway ML (Gen-4 / Gen-4.5)

| Factor | Assessment |
|---|---|
| **API Available** | Yes — [dev.runwayml.com](https://dev.runwayml.com/) |
| **Documentation** | [docs.dev.runwayml.com](https://docs.dev.runwayml.com/) — comprehensive, Python + Node.js SDKs |
| **Image-to-Video** | `POST /v1/image_to_video` — single reference image + text prompt |
| **Models** | `gen4_turbo` (fast/cheap), `gen4_aleph` (highest quality), `gen4.5` (latest) |
| **Resolution** | 720p (1280x720) standard, up to 1080p. Aspect ratios: 16:9, 9:16, 1:1 |
| **Duration** | 5s or 10s per generation at 24fps |
| **Character Consistency** | Excellent — Gen-4's headline feature. Single reference image locks character across multiple generations with different prompts, lighting, and scenes |
| **Pricing** | Credit-based ($0.01/credit). `gen4_turbo`: $0.05/sec, `gen4_aleph`: $0.15/sec, `gen4.5`: $0.12/sec |
| **Cost Estimate (our project)** | 70 clips x 10s x $0.05-$0.15/sec = **$35-$105** |
| **Integration Effort** | Low — clean REST API, async pattern (submit job, poll for result), well-documented SDKs |

**Strengths for IronPal:**
- Best character consistency system — critical for our S4a-S5 same-athlete requirement
- Already specified in the execution plan for S4b and S7
- Realistic camera controls (dolly, pan) useful for product beauty shot S7
- Most mature API with robust documentation

**Weaknesses:**
- Max 10s per generation (fine for our 4-10s clips)
- No direct text rendering in video (IronPal logo will need post-compositing regardless)
- Mid-range pricing (not the cheapest)

**Verdict: PRIMARY RECOMMENDATION for automation**

---

### 2. Luma AI (Dream Machine / Ray)

| Factor | Assessment |
|---|---|
| **API Available** | Yes — [docs.lumalabs.ai](https://docs.lumalabs.ai/docs/api) |
| **Documentation** | Good — REST API with webhook support |
| **Image-to-Video** | `POST /dream-machine/v1/generations` — supports `frame0` (start image) and `frame1` (end image) for interpolation |
| **Models** | `ray-flash-2` (fast), `ray-2` (quality). Ray 3.14 available on web but API availability for latest model is uncertain |
| **Resolution** | 540p, 720p, 1080p, 4K options |
| **Duration** | Configurable (e.g., "5s") |
| **Character Consistency** | Good — Ray 3/3.14 supports character reference on web platform. API-level support is documented for image generation but less clear for video |
| **Pricing** | ~$0.20 per video generation task |
| **Cost Estimate (our project)** | 70 clips x $0.20 = **~$14** |
| **Integration Effort** | Low-Medium — clean REST API, async pattern, webhook callbacks available |

**Strengths for IronPal:**
- Most affordable option by far
- Start + end keyframe support (frame0/frame1) — could be useful for S3 gym bag reveal
- 4K option if needed for marketing materials beyond the video
- Already specified in the execution plan for most shots (S2a, S2b, S3, S4a, S4c, S6a-c)
- Looping video option useful for social media clips

**Weaknesses:**
- Ray 3.14 (latest/best model) API availability is uncertain — may be limited to Ray 2 models via API
- Character consistency via API is less documented than Runway
- API pricing is separate from web subscription (no credit sharing)

**Verdict: STRONG SECONDARY — best price/value, ideal for bulk generation of shots that don't need character consistency**

---

### 3. Kling AI

| Factor | Assessment |
|---|---|
| **API Available** | Yes — [Official API](https://app.klingai.com/global/dev/document-api/) + third-party providers (fal.ai, PiAPI, Segmind) |
| **Documentation** | Moderate — official docs exist but are less polished than Runway/Luma. Third-party providers offer cleaner SDKs |
| **Image-to-Video** | Async API: POST generation request, poll with task_id |
| **Models** | Standard and Pro modes. Versions: 1.6, 2.0, 2.1, 3.0 |
| **Resolution** | 360p-1080p depending on model version and mode |
| **Duration** | 5s or 10s (up to 15s with v3.0) |
| **Character Consistency** | Very good — v2.0 "Master" mode has facial micro-expression system, v3.0 has multi-shot character + prop consistency |
| **Pricing** | ~$0.07-$0.14 per second depending on mode/resolution. Pro 1080p 10s ~$1.40 |
| **Cost Estimate (our project)** | 70 clips x 10s x $0.07-$0.14/sec = **$49-$98** |
| **Integration Effort** | Medium — official API works but documentation is less mature. Using via fal.ai is smoother |

**Strengths for IronPal:**
- Kling 3.0 multi-shot storyboarding with scene-aware generation is directly relevant
- Longest clip duration (15s with v3.0) — useful for extended shots
- Already specified in the execution plan for S4d (weight stack POV)
- Motion control API can transfer motion from reference video

**Weaknesses:**
- Official API documentation less polished than competitors
- 1080p not available on all model versions/modes — need to verify for Pro mode
- Enterprise API has custom (non-transparent) pricing
- Multiple model versions with different capability sets can be confusing

**Verdict: SPECIALIST USE — best for S4d POV shot and any shots needing >10s duration**

---

### 4. Pika Labs (Pika 2.2)

| Factor | Assessment |
|---|---|
| **API Available** | Yes — primarily through [fal.ai](https://fal.ai) as hosted inference provider |
| **Image-to-Video** | Pika 2.2 image-to-video, PikaScenes (multi-image composition), PikaFrames (keyframe interpolation) |
| **Resolution** | 720p and 1080p |
| **Duration** | 5-10s per generation |
| **Character Consistency** | Limited — no dedicated character reference system at API level |
| **Pricing** | ~$0.07/sec, ~$0.45-$0.70 per 1080p clip |
| **Cost Estimate (our project)** | 70 clips x $0.50 = **~$35** |
| **Integration Effort** | Medium — API access through third-party (fal.ai), not Pika's own infrastructure |

**Strengths:** PikaScenes multi-image composition, competitive pricing.  
**Weaknesses:** Third-party API dependency, limited character consistency, less documentation.

**Verdict: NOT RECOMMENDED — no clear advantage over Runway/Luma/Kling for our use case**

---

### 5. Synthesia

| Factor | Assessment |
|---|---|
| **API Available** | Yes — restricted to Creator ($89/mo) and Enterprise plans |
| **Image-to-Video** | **NO** — Synthesia is an avatar-based platform. You provide a script, and an AI avatar delivers it as a talking-head video. It does NOT animate still images into motion. |
| **Pricing** | Creator: $89/mo (30 min/mo), Enterprise: custom |

**Verdict: NOT SUITABLE — Synthesia generates talking-head presenter videos, not cinematic motion from still images. Wrong tool category entirely for our storyboard-to-video workflow.**

---

### 6. Pictory AI

| Factor | Assessment |
|---|---|
| **API Available** | Yes — for enterprise/subscription customers |
| **Image-to-Video** | **NO** — Pictory assembles videos from stock footage, text overlays, and AI voiceover. It is a video editing/assembly tool, not a generative video model. |
| **Pricing** | Subscription-based with video count limits |

**Verdict: NOT SUITABLE — Pictory creates videos by assembling stock footage and text, not by animating still images. Wrong tool category for our needs.**

---

### 7. Stability AI (Stable Video Diffusion)

| Factor | Assessment |
|---|---|
| **API Available** | **DEPRECATED** — hosted API was shut down July 24, 2025 |
| **Self-Hosted** | Open-source model weights still on HuggingFace, but max 4s at 576x1024. No text control, no character consistency. |

**Verdict: NOT VIABLE — API deprecated, and even self-hosted quality is far below current competitors.**

---

## Comparison Matrix (Viable Platforms Only)

| Factor | Runway Gen-4 | Luma AI (Ray) | Kling AI | Pika Labs |
|---|---|---|---|---|
| **API Maturity** | Excellent | Good | Moderate | Moderate |
| **Image-to-Video Quality** | Excellent | Very Good | Very Good | Good |
| **Character Consistency** | Excellent | Good (uncertain via API) | Very Good (v3.0) | Limited |
| **Max Duration** | 10s | ~10s | 15s (v3.0) | 10s |
| **Max Resolution** | 1080p | 4K | 1080p | 1080p |
| **Cost (70 clips, 10s each)** | $35-$105 | ~$14 | $49-$98 | ~$35 |
| **SDK/Documentation** | Python, Node.js, excellent docs | REST API, good docs | REST API, moderate docs | Via fal.ai |
| **Camera Controls** | Yes | Limited | Yes (v3.0) | Limited |
| **Already in Execution Plan** | S4b, S7 | S2a, S2b, S3, S4a, S4c, S6a-c | S4d | No |

---

## Detailed Cost Analysis

### Shot-by-Shot Generation Requirements

Based on the execution plan's generation table, here are the exact requirements per shot:

| Shot | Duration | Attempts | Total Seconds | AI Tool (Execution Plan) | Notes |
|---|---|---|---|---|---|
| S1 | 5s | 4 | 20s | Runway Gen-4 | Phone close-up + composite |
| S2a | 4s | 6 | 24s | Luma Dream Machine | Athlete with phone |
| S2b | 4s | 6 | 24s | Luma Dream Machine | Cable machine + phone |
| S2c | 3s | 1 | — | Screen recording | Not AI-generated |
| S3 | 5s | 6 | 30s | Luma Dream Machine | Headband from gym bag |
| S4a | 5s | 6 | 30s | Luma/Runway | Bench press, character consistency needed |
| S4b | 5s | 6 | 30s | Runway Gen-4 | Cable fly, character consistency needed |
| S4c | 5s | 6 | 30s | Luma/Runway | Dumbbell curls, character consistency needed |
| S4d | 4s | 4 | 16s | Kling AI | Weight stack POV |
| S5 | 7s | 6 | 42s | Runway + composite | Payoff scene, character consistency needed |
| S6a | 3s | 5 | 15s | Luma Dream Machine | Kettlebell swings |
| S6b | 3s | 5 | 15s | Luma Dream Machine | Pull-ups with cap |
| S6c | 3s | 5 | 15s | Luma Dream Machine | Box jumps |
| S7 | 5s | 4 | 20s | Runway Gen-4 | Product beauty shot |
| **Total** | | **70** | **311s** | | S2c excluded (screen recording) |

### Scenario 1: All Runway Gen-4

If every AI-generated shot were produced on Runway Gen-4:

| Model Tier | Cost/Second | Total Seconds | Generation Cost | Notes |
|---|---|---|---|---|
| `gen4_turbo` | $0.05 | 311s | **$15.55** | Fast, good quality |
| `gen4.5` | $0.12 | 311s | **$37.32** | Latest model |
| `gen4_aleph` | $0.15 | 311s | **$46.65** | Highest quality |

**Pros:** Simplest integration (one API), best character consistency across all shots.  
**Cons:** Overkill for simple shots (S6a-c montage, S4d POV). No per-shot optimization.

### Scenario 2: All Luma AI

If every AI-generated shot were produced on Luma AI:

| Pricing Model | Cost/Generation | Total Generations | Generation Cost | Notes |
|---|---|---|---|---|
| Per-task (~$0.20) | $0.20 | 70 | **$14.00** | Cheapest option by far |

**Pros:** Lowest cost, 4K option, start+end keyframe support.  
**Cons:** Character consistency via API is less reliable than Runway. May need more attempts for S4a-S5 same-athlete chain, increasing total cost.

### Scenario 3: All Kling AI

If every AI-generated shot were produced on Kling AI:

| Mode | Cost/Second | Total Seconds | Generation Cost | Notes |
|---|---|---|---|---|
| Standard | $0.07 | 311s | **$21.77** | Lower quality |
| Pro | $0.14 | 311s | **$43.54** | Higher quality, better consistency |

**Pros:** Longest clips (15s), good character consistency in v3.0, motion control.  
**Cons:** API documentation less polished, 1080p not always available, pricing less transparent.

### Scenario 4: Multi-Platform (Recommended)

Optimized assignment leveraging each platform's strengths:

| Shot | Platform | Model/Mode | Duration | Attempts | Seconds | Cost/Sec | Shot Cost |
|---|---|---|---|---|---|---|---|
| S1 | Kling AI | Pro | 5s | 4 | 20s | $0.14 | $2.80 |
| S2a | Luma AI | Ray 2 | 4s | 6 | 24s | ~$0.04* | $1.20 |
| S2b | Luma AI | Ray 2 | 4s | 6 | 24s | ~$0.04* | $1.20 |
| S3 | Luma AI | Ray 2 | 5s | 6 | 30s | ~$0.04* | $1.20 |
| S4a | Runway | gen4_turbo | 5s | 6 | 30s | $0.05 | $1.50 |
| S4b | Runway | gen4_turbo | 5s | 6 | 30s | $0.05 | $1.50 |
| S4c | Runway | gen4_turbo | 5s | 6 | 30s | $0.05 | $1.50 |
| S4d | Kling AI | Pro | 4s | 4 | 16s | $0.14 | $2.24 |
| S5 | Runway | gen4_turbo | 7s | 6 | 42s | $0.05 | $2.10 |
| S6a | Luma AI | Ray 2 | 3s | 5 | 15s | ~$0.04* | $1.00 |
| S6b | Luma AI | Ray 2 | 3s | 5 | 15s | ~$0.04* | $1.00 |
| S6c | Luma AI | Ray 2 | 3s | 5 | 15s | ~$0.04* | $1.00 |
| S7 | Runway | gen4_turbo | 5s | 4 | 20s | $0.05 | $1.00 |
| **Total** | | | | **70** | **311s** | | **$19.24** |

*\* Luma pricing is ~$0.20 per generation task, not per-second. For a 5s clip this is ~$0.04/sec; for a 3s clip ~$0.067/sec.*

**Platform cost breakdown:**

| Platform | Shots | Clips | Total Seconds | Subtotal |
|---|---|---|---|---|
| Runway Gen-4 (`gen4_turbo`) | S4a, S4b, S4c, S5, S7 | 28 | 152s | $7.60 |
| Luma AI (Ray 2) | S2a, S2b, S3, S6a, S6b, S6c | 33 | 123s | $6.60 |
| Kling AI (Pro) | S1, S4d | 8 | 36s | $5.04 |
| **Total** | **13 shots** | **69 clips** | **311s** | **$19.24** |

### Scenario 5: Multi-Platform with Higher Quality Runway Model

Same as Scenario 4, but using `gen4_aleph` ($0.15/sec) for character-critical shots:

| Platform | Shots | Clips | Total Seconds | Subtotal |
|---|---|---|---|---|
| Runway Gen-4 (`gen4_aleph`) | S4a, S4b, S4c, S5, S7 | 28 | 152s | $22.80 |
| Luma AI (Ray 2) | S2a, S2b, S3, S6a, S6b, S6c | 33 | 123s | $6.60 |
| Kling AI (Pro) | S1, S4d | 8 | 36s | $5.04 |
| **Total** | **13 shots** | **69 clips** | **311s** | **$34.44** |

### Cost Comparison Summary

| Scenario | Total Cost | Quality | Complexity | Recommendation |
|---|---|---|---|---|
| All Runway (`gen4_turbo`) | $15.55 | Good | Low (1 API) | Simple but no per-shot optimization |
| All Runway (`gen4_aleph`) | $46.65 | Excellent | Low (1 API) | Overspend on simple shots |
| All Luma AI | $14.00 | Good | Low (1 API) | Cheapest, but character consistency risk |
| All Kling AI (Pro) | $43.54 | Very Good | Low (1 API) | Expensive, weaker docs |
| **Multi-Platform (turbo)** | **$19.24** | **Good-Excellent** | **Medium (3 APIs)** | **Best value** |
| **Multi-Platform (aleph)** | **$34.44** | **Excellent** | **Medium (3 APIs)** | **Best quality/value** |

### Additional Costs to Consider

| Item | Cost | Notes |
|---|---|---|
| **Re-generation budget (20% buffer)** | +$4-$7 | Some shots may need extra attempts beyond plan |
| **Image hosting for API upload** | ~$0 | AWS S3 free tier or pre-signed URLs sufficient for ~14 images |
| **Runway API signup** | $0 | Pay-as-you-go, no subscription required |
| **Luma API signup (Build tier)** | $0-$30/mo | May require subscription for API access |
| **Kling API signup** | $7-$30/mo | Standard/Pro subscription for API key |
| **Post-production (After Effects)** | Existing tool | Already in the workflow for compositing |
| **Total with subscriptions + buffer** | **$30-$72** | Worst case with all subscriptions + 20% regen buffer |

### Comparison vs. Manual Web UI Approach

| Factor | Manual (Web UI) | Automated (API) |
|---|---|---|
| **Generation cost** | Same pricing per clip | Same pricing per clip |
| **Time investment** | 2-4 days (execution plan estimate) | ~4-6 hours total (1-2h setup + 2-4h generation/polling) |
| **Human effort** | ~8-16 hours of manual clicking, waiting, downloading | ~2 hours setup + ~2 hours review/selection |
| **Consistency** | Parameters may drift between manual runs | Identical parameters every time |
| **Re-run capability** | Must redo everything manually | One command to regenerate any shot |
| **Batch processing** | One-at-a-time in browser | Concurrent submissions (Luma: 10 parallel) |

---

## Recommendation: Multi-Platform API Strategy

Rather than choosing a single platform, the recommended approach mirrors the execution plan's existing multi-tool strategy but automates it via APIs. This leverages each platform's strengths.

### Recommended Platform Assignment

| Platform | Shots | Rationale |
|---|---|---|
| **Runway Gen-4** (primary) | S4a, S4b, S4c, S5, S7 | Character consistency is critical for the "IronPal way" montage. These 4 shots must read as the same athlete. Use Gen-4's character reference to lock the face from a single reference image. Also S7 for camera controls. |
| **Luma AI Ray** (bulk) | S2a, S2b, S3, S6a, S6b, S6c | No character consistency needed (different athletes or transition shots). Luma is the most affordable and handles cinematic motion well. Best price for bulk generation. |
| **Kling AI** (specialist) | S4d, S1 | S4d weight stack POV benefits from Kling's motion control. S1 phone close-up is a simple animation. |
| **Screen recording** | S2c, S5 (phone overlay) | Per execution plan — Figma mockup screen recording, not AI-generated. |

### Recommended Budget

| Tier | Runway Model | Total Cost | Use Case |
|---|---|---|---|
| **Budget** | `gen4_turbo` | ~$19 + $4 buffer = **$23** | Good enough for most purposes |
| **Recommended** | `gen4_aleph` for S4a-S5, `gen4_turbo` for S7 | ~$27 + $5 buffer = **$32** | Best quality where it matters |
| **Premium** | `gen4_aleph` for all Runway shots | ~$34 + $7 buffer = **$41** | Maximum quality across the board |

---

## Implementation Plan

### Architecture

```
storyboard-to-video.py
    |
    +-- config.yaml          # Shot assignments, prompts, platform per shot
    +-- clients/
    |   +-- runway_client.py  # Runway Gen-4 API wrapper
    |   +-- luma_client.py    # Luma AI API wrapper  
    |   +-- kling_client.py   # Kling AI API wrapper
    +-- pipeline.py           # Orchestration: submit, poll, download, organize
    +-- output/               # Generated clips organized by shot
        +-- S1/
        +-- S2a/
        +-- ...
```

### Setup Steps

1. **Obtain API keys:**
   - Runway: Sign up at [dev.runwayml.com](https://dev.runwayml.com/), get API key from dashboard
   - Luma: Sign up at [lumalabs.ai](https://lumalabs.ai/), get API key from Build tier
   - Kling: Sign up at [klingai.com](https://klingai.com/), get API key from developer portal

2. **Install SDKs:**
   ```bash
   pip install runwayml  # Runway Python SDK
   # Luma and Kling: use requests library with REST API directly
   ```

3. **Create config file** mapping each shot to:
   - Source image path (approved storyboard key frame)
   - Target platform (runway/luma/kling)
   - Text prompt (from execution plan)
   - Number of variants to generate
   - Duration and resolution parameters

4. **Build API clients** with:
   - Async job submission
   - Polling with exponential backoff
   - Result downloading and organization
   - Error handling and retry logic

5. **Run pipeline:**
   ```bash
   python storyboard-to-video.py --config config.yaml --output output/
   ```

### API Integration Examples

**Runway Gen-4 (Image-to-Video):**
```python
import runwayml

client = runwayml.RunwayML(api_key="RUNWAY_API_KEY")

# Submit image-to-video job
task = client.image_to_video.create(
    model="gen4_turbo",
    prompt_image="https://storage.example.com/S4a_selected.jpg",
    prompt_text="Athletic male performing bench press, smooth controlled motion, warm vibrant gym lighting, cinematic",
    duration=10,
    ratio="16:9"
)

# Poll for completion
import time
while task.status not in ["SUCCEEDED", "FAILED"]:
    time.sleep(10)
    task = client.tasks.retrieve(task.id)

# Download result
video_url = task.output[0]
```

**Luma AI (Image-to-Video):**
```python
import requests

headers = {"Authorization": "Bearer LUMA_API_KEY"}

# Submit generation
response = requests.post(
    "https://api.lumalabs.ai/dream-machine/v1/generations",
    headers=headers,
    json={
        "prompt": "Hand reaching into gym bag pulling out headband, teal LED lights up, warm golden lighting",
        "keyframes": {
            "frame0": {
                "type": "image",
                "url": "https://storage.example.com/S3_selected.jpg"
            }
        },
        "aspect_ratio": "16:9",
        "resolution": "1080p",
        "duration": "5s"
    }
)
task_id = response.json()["id"]

# Poll for completion
while True:
    status = requests.get(
        f"https://api.lumalabs.ai/dream-machine/v1/generations/{task_id}",
        headers=headers
    ).json()
    if status["state"] == "completed":
        video_url = status["assets"]["video"]
        break
    time.sleep(10)
```

**Kling AI (Image-to-Video):**
```python
import requests

headers = {"Authorization": "Bearer KLING_API_KEY"}

# Submit generation
response = requests.post(
    "https://api.klingai.com/v1/videos/image2video",
    headers=headers,
    json={
        "model_name": "kling-v2",
        "mode": "pro",
        "image": "https://storage.example.com/S4d_selected.jpg",
        "prompt": "First-person POV, hand moving yellow pin into weight stack slot 50, smooth motion",
        "duration": "5",
        "aspect_ratio": "16:9"
    }
)
task_id = response.json()["data"]["task_id"]

# Poll for completion
while True:
    result = requests.get(
        f"https://api.klingai.com/v1/videos/image2video/{task_id}",
        headers=headers
    ).json()
    if result["data"]["task_status"] == "succeed":
        video_url = result["data"]["task_result"]["videos"][0]["url"]
        break
    time.sleep(15)
```

---

## Potential Challenges

| Challenge | Mitigation |
|---|---|
| **Rate limiting** | All platforms have rate limits. Implement exponential backoff and queue management. Luma allows 10 concurrent generations on Build tier. |
| **Async job management** | All platforms use async generation (submit, poll, download). Build a robust polling pipeline with timeout handling. |
| **Character consistency via API** | Runway's character reference is the most reliable via API. For Luma/Kling, accept that character consistency may be weaker and plan for more attempts + manual curation. |
| **Image upload** | APIs typically require images hosted at a public URL, not local files. Use a temporary S3 bucket or pre-signed URLs. Runway SDK handles this. |
| **Cost overruns** | Set per-shot attempt limits in config. Monitor credit/token consumption. The total budget ($29-$59) is low enough that 2x overrun is still affordable. |
| **Video quality variance** | AI video generation is non-deterministic. Plan for human review of all outputs — the pipeline generates candidates, a person selects the best. |
| **API changes/deprecation** | Pin SDK versions. The Stability AI SVD deprecation shows this is a real risk. Runway and Luma are the most stable/funded platforms. |
| **Motion artifacts** | Gym footage (barbells, cables, hands) is prone to AI warping. Generate slow-motion output, trim best 2-4s windows. Budget more attempts for complex motion shots (S4a bench press, S4b cable fly). |

---

## Final Recommendation

**Go with the multi-platform API approach:**

1. **Runway Gen-4** for character-critical shots (S4a, S4b, S4c, S5, S7) — best consistency
2. **Luma AI** for bulk/diverse shots (S2a, S2b, S3, S6a-c) — best price
3. **Kling AI** for specialist shots (S4d, S1) — best motion control and POV handling

**Estimated total cost: $29-$59** for ~76 generated clips (vs. hours of manual web UI work).

**Estimated implementation time:** 1-2 days to build the pipeline, then ~2-4 hours of generation time (most of it automated polling). Human review and selection of best variants adds ~2-4 hours.

**Net time savings vs. manual:** The execution plan estimates 2-4 days for manual generation. The automated pipeline reduces this to ~1 day (including pipeline setup), with the added benefit of consistent parameters across attempts and easy re-runs if shots need more variants.
