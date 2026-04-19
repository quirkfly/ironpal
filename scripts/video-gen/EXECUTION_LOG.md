# AI Video Generation — Pipeline Execution Log

**Date:** 2026-04-19 / 2026-04-20  
**Operator:** AVP (automated pipeline)  
**Total clips generated:** 66  
**Total output size:** 174 MB  
**Quality check:** 66/66 OK

---

## Final Inventory

| Shot | Platform | Model | Clips | Size | Notes |
|------|----------|-------|-------|------|-------|
| S1 | Kling | kling-v1-6 pro | 4/4 | 30 MB | Phone close-up |
| S2a | Luma | ray-2 | 6/6 | 13 MB | Frustrated male on bench |
| S2b | Luma | ray-2 | 5/6 | 8 MB | 1 Luma-side failure |
| S3 | Luma | ray-2 | 6/6 | 17 MB | Gym bag reveal |
| S4a | Runway | gen4_turbo | 6/6 | 8 MB | Bench press with headband |
| S4b | Runway | gen4_turbo | 6/6 | 7 MB | Cable fly with headband |
| S4c | Runway | gen4_turbo | 6/6 | 10 MB | Dumbbell curls (16 KG) |
| S4d | Kling | kling-v1-6 pro | 4/4 | 30 MB | Weight stack POV |
| S5 | Runway | gen4_turbo | 5/6 | 9 MB | 1 Runway-side failure |
| S6a | Luma | ray-2 | 5/5 | 10 MB | Kettlebell swings |
| S6b | Luma | ray-2 | 5/5 | 14 MB | Pull-ups with cap |
| S6c | Luma | ray-2 | 5/5 | 14 MB | Box jumps |
| S7 | Runway | gen4_turbo | 3/4 | 4 MB | 1 Runway-side failure |
| **Total** | | | **66** | **174 MB** | |

## Success Rate

- **Overall:** 66/69 attempts succeeded (95.7%)
- **Runway:** 26/28 (92.9%) — 2 generic "unexpected error" failures
- **Luma:** 32/33 (97.0%) — 1 failure on S2b (before credit issue)
- **Kling:** 8/8 (100%) — after fixes applied

## Challenges Encountered & Resolutions

### 1. Runway — No Credits
- **Issue:** First test returned `"You do not have enough credits to run this task."`
- **Resolution:** User topped up credits at dev.runwayml.com. Pipeline code was correct.

### 2. Luma — Duration Validation
- **Issue:** Luma only accepts `5s`, `9s`, or `10s`. Config had 3s and 4s durations for short montage shots.
- **Error:** `"Invalid request: Input should be '5s', '9s' or '10s' duration"`
- **Resolution:** Added `_clamp_duration()` to LumaClient — rounds up to nearest valid value. 3s->5s, 4s->5s.

### 3. Kling — Model Name Invalid
- **Issue:** Config specified `kling-v2` but this model doesn't exist in the API.
- **Error:** `"model is not supported"`
- **Resolution:** Tested model names systematically. `kling-v1-6` is valid (also `kling-v1`, `kling-v1-5`, `kling-v2-master`). Updated config.yaml.

### 4. Kling — Duration Validation
- **Issue:** Same as Luma — Kling only accepts `"5"` or `"10"`. S4d had duration 4.
- **Error:** `"duration value '4' is invalid"`
- **Resolution:** Added `_clamp_duration()` to KlingClient (same pattern as Luma fix). Re-ran S4d successfully.

### 5. Kling — No Balance
- **Issue:** `"Account balance not enough"` on first test.
- **Resolution:** User purchased API credits at klingai.com/global/dev/model/video.

### 6. Luma — Credits Exhausted Mid-Batch
- **Issue:** Luma credits ran out after generating S2a, S2b, S3, S6a (22 clips). S6b and S6c got 0 clips.
- **Error:** `"Insufficient credits"`
- **Resolution:** User topped up Luma credits. Re-ran `--shots S6b,S6c` successfully (10/10).

### 7. Symlink Path Error
- **Issue:** `selected.jpg` symlinks in storyboard folders pointed to `S7/gpt-image-...` (relative path including parent dir), but they were *inside* the S7 folder already, resulting in broken paths.
- **Resolution:** Recreated all 14 symlinks using `basename` only.

### 8. ffprobe Not Installed
- **Issue:** `quality_check.py` relies on ffprobe for detailed metadata (resolution, duration, codec). Not installed on this system.
- **Resolution:** Added fallback — checks MP4 `ftyp` header bytes for basic validation. All 66 files passed.

## Insights for Future Runs

1. **Duration APIs are strict.** Both Luma (5/9/10s) and Kling (5/10s) reject arbitrary durations. Always clamp in the client layer.
2. **Model names change.** `kling-v2` doesn't exist yet even though the config was based on current docs. Test with a throwaway call before committing to a batch.
3. **Budget credits carefully.** Luma ran out mid-batch. For 33 Luma clips at 5s each, budget at least $10-15. Pre-check credit balance before starting.
4. **Kling produces larger files.** ~7.5 MB per clip vs Runway ~1.3 MB and Luma ~2.3 MB. Factor into storage planning.
5. **Sequential-per-shot is fine.** Even running one clip at a time, the full 66-clip run completed in ~2 hours wall clock. Parallelism would help but isn't critical at this scale.
6. **Error logging is essential.** Adding `resp.text` to error logs immediately identified every issue. The original `raise_for_status()` alone was opaque.

## Next Steps

- [ ] AVP reviews all 66 clips, selects best variant per shot
- [ ] CD reviews selected sequence for narrative flow
- [ ] Post-production compositing (phone screens on S1/S2a/S2b/S5, teal LED enhancement, IronPal text overlay)
- [ ] Install ffprobe (`sudo apt install ffmpeg`) for detailed quality metrics on future runs
