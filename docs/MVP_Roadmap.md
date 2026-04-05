# IronPal MVP Roadmap

## Executive Summary

IronPal is a vision-AI SaaS that automatically tracks gym workouts — exercises, weights, and reps — using cheap Android devices as cameras and a multimodal LLM (gpt-5-nano) for analysis. This roadmap covers the development and launch of an MVP deployed at a **single local gym** using **tripod-mounted cameras**, validating the core technology before scaling.

**MVP Goal:** Automatically log exercise type and rep count for the top 15 pin-loaded machine exercises at one partner gym, with manual weight input as a fallback. Deliver a post-session workout log to members via a mobile app.

**Target:** First paying gym within 6 months of project start.

---

## Scope Definition

### In Scope (MVP)

| Feature | Description |
|---|---|
| Exercise recognition | Top 15 pin-loaded machine exercises (lat pulldown, chest press, leg extension, leg curl, shoulder press, seated row, cable fly, tricep pushdown, bicep curl, leg press, pec deck, rear delt fly, hip abductor/adductor, cable crunch) |
| Rep counting | Automatic via on-device pose estimation + LLM verification |
| Weight detection | LLM-based vision reading of weight stack numbers; manual input fallback in app |
| Member identity | BLE proximity from member's phone + zone-based camera assignment |
| Workout log | Post-session delivery (within 5 minutes of workout end) via mobile app |
| Camera setup | Tripod-mounted used Android phones, 1 per machine zone |
| Single gym deployment | One partner gym, ~15-20 cameras |

### Out of Scope (v2+)

- Free-weight / barbell exercise recognition
- Dumbbell weight reading
- Multi-person tracking in open areas
- Real-time in-session feedback
- Form analysis / coaching features
- Coach/trainer dashboards
- Gym owner analytics (utilization heatmaps)
- Multi-gym deployment infrastructure
- Custom model training
- iOS app (Android-first)

---

## Phase Overview

| Phase | Duration | Milestones |
|---|---|---|
| **Phase 0 — Research & Validation** | Weeks 1-4 | Prompt engineering validated, partner gym secured |
| **Phase 1 — Core Engine** | Weeks 5-12 | Exercise recognition + rep counting pipeline working end-to-end |
| **Phase 2 — Device & Deployment** | Weeks 9-14 | Camera app, tripod rig, BLE identity, on-site installation |
| **Phase 3 — Mobile App & Integration** | Weeks 11-18 | Member app, workout log delivery, confirm/correct UX |
| **Phase 4 — Closed Beta** | Weeks 17-22 | Live at partner gym with 10-20 beta members |
| **Phase 5 — Refinement & Launch** | Weeks 21-26 | Bug fixes, accuracy tuning, gym-wide rollout |

> Phases overlap intentionally — parallel workstreams are expected.

---

## Phase 0 — Research & Validation (Weeks 1-4)

**Objective:** Prove the core technology works before writing production code. Establish the partner gym relationship.

### Deliverables

| # | Deliverable | Owner | Done When |
|---|---|---|---|
| 0.1 | **Prompt engineering test suite** — Collect 50+ gym video clips (self-recorded or public). Test gpt-5-nano with candidate prompts for exercise recognition, weight reading, and rep counting. Document accuracy per exercise type. | AI/Backend | Accuracy report complete, ≥75% exercise ID on pin-loaded machines |
| 0.2 | **Token & cost validation** — Measure actual token consumption per API call with real frames. Validate cost estimates from the challenges doc (~$0.006/session). | AI/Backend | Actual cost within 2x of estimate |
| 0.3 | **On-device feasibility test** — Run MediaPipe Pose on a used Android phone. Measure FPS, CPU/battery usage, keypoint quality. Determine if on-device pre-classification is viable on target hardware. | Mobile | MediaPipe runs ≥10 FPS on target device |
| 0.4 | **Partner gym agreement** — Identify and sign a local gym willing to host the MVP pilot. Negotiate terms: free/discounted service in exchange for access, member consent process, camera placement approval. | Business | Signed agreement with camera placement walkthrough complete |
| 0.5 | **Equipment audit** — Visit the partner gym. Catalog every pin-loaded machine (brand, model, weight stack range, number label condition). Photograph each from candidate tripod positions. | Business/AI | Equipment catalog with photos and candidate camera positions |
| 0.6 | **Privacy & consent framework** — Draft member consent form, data handling policy, and video retention rules. Consult with a privacy attorney if budget allows. | Business/Legal | Consent form and privacy policy documents ready |

### Key Decisions

- Which 15 exercises to support (based on equipment audit)
- Tripod placement positions per machine (finalized during equipment audit)
- Used Android phone model selection (buy 2-3 candidate models for testing)

### Budget: Phase 0

| Item | Cost |
|---|---|
| Test Android phones (3 models × 1 each) | ~$90 |
| Tripods for testing (3) | ~$60 |
| gpt-5-nano API credits (prompt testing) | ~$20 |
| Gym visits / travel | ~$50 |
| **Phase 0 total** | **~$220** |

---

## Phase 1 — Core Engine (Weeks 5-12)

**Objective:** Build the backend pipeline that converts camera frames into structured workout data.

### Deliverables

| # | Deliverable | Owner | Done When |
|---|---|---|---|
| 1.1 | **Frame extraction service** — Given a video stream from an Android device, extract key frames at set boundaries (movement start/stop) and during reps (peak/valley). Apply blur detection and deduplication. | Backend | Service accepts RTSP/HTTP stream, outputs selected frames |
| 1.2 | **LLM analysis pipeline** — Send selected frames to gpt-5-nano with optimized prompts. Parse structured JSON responses (exercise, weight, reps, confidence). Handle retries, timeouts, and malformed responses. | Backend | Pipeline processes a set's frames and returns structured result in <15s |
| 1.3 | **Exercise recognition module** — Finalized prompt templates for 15 target exercises. Confidence calibration (high/medium/low thresholds tuned on test data). Multi-signal fusion: combine LLM result + camera zone context + user history. | AI/Backend | ≥80% accuracy on test clips for supported exercises |
| 1.4 | **Rep counting module** — Primary: on-device MediaPipe Pose keypoint extraction → joint angle peak/valley counting. Fallback: LLM-based rep count from frame sequence. | AI/Backend | ±1 rep accuracy on ≥80% of test sets |
| 1.5 | **Weight detection module** — LLM-based weight stack OCR from best frames. Multi-frame consensus voting. Confidence scoring. | AI/Backend | ≥70% accuracy on clear weight stacks from test photos |
| 1.6 | **Session reconstruction** — Stitch individual set detections into a coherent workout session for a member: ordered exercise list, sets × reps × weight, rest periods, total duration. | Backend | Given a sequence of raw detections + member ID, produce a clean workout log |
| 1.7 | **API server** — REST API serving the mobile app. Endpoints: start session, get session status, get workout log, submit corrections. Auth via member ID. | Backend | API deployed to staging, documented |
| 1.8 | **Database schema** — Members, sessions, sets, exercises, corrections. Time-series friendly for future analytics. | Backend | Schema deployed, migrations scripted |

### Architecture

```
[Android Camera Devices]
    │ (WiFi — frames/keypoints)
    ▼
[Edge Processing Layer]  ← MediaPipe Pose, frame selection, BLE scan
    │ (selected frames + metadata)
    ▼
[Backend API Server]  ← Cloud VM or managed service
    │
    ├──→ [gpt-5-nano API]  ← Exercise + weight + rep analysis
    │
    ├──→ [Database]  ← Sessions, workout logs, member data
    │
    └──→ [Mobile App API]  ← Workout log delivery, corrections
```

### Budget: Phase 1

| Item | Cost |
|---|---|
| Cloud infrastructure (staging — small VM + DB) | ~$30/month × 2 months = $60 |
| gpt-5-nano API credits (development + testing) | ~$50 |
| **Phase 1 total** | **~$110** |

---

## Phase 2 — Device & Deployment (Weeks 9-14)

**Objective:** Build the camera-side Android app and physically deploy tripod-mounted cameras at the partner gym.

### Deliverables

| # | Deliverable | Owner | Done When |
|---|---|---|---|
| 2.1 | **Android camera app** — Runs on used Android phone. Continuous capture, on-device frame selection (blur/duplicate filter), MediaPipe Pose keypoint extraction, BLE scanning for nearby member phones, uploads selected frames + keypoints to backend over WiFi. Runs as a foreground service, auto-starts on boot. | Mobile | App runs stable for 8+ hours on target device |
| 2.2 | **Device management setup** — MDM solution (Headwind MDM or similar free option) to remotely monitor, update, and restart camera devices. Health check dashboard: online/offline status, battery level, storage, last upload time. | Mobile/DevOps | All devices visible in MDM, remote app update works |
| 2.3 | **Tripod rig design** — Select tripod model, phone mount adaptor, and power cable routing for permanent tripod placement. Tripods must be stable, not easily knocked over, and positioned per the equipment audit (Phase 0.5). Consider cable management (USB power cable from nearest outlet to phone). | Hardware | Tripod rig tested and photographed, BOM finalized |
| 2.4 | **Procurement** — Purchase 15-20 used Android phones (same model), tripods, phone mounts, USB cables, power adaptors, surge protectors/power strips. | Hardware | All hardware received and inventoried |
| 2.5 | **On-site installation** — Set up all tripod-mounted cameras at partner gym. Connect to gym WiFi. Verify each camera's field of view covers the target machine + weight stack. Run a test workout through the full pipeline. | All | All cameras online, test workout processed successfully |
| 2.6 | **Power & network audit** — Verify power outlet availability near each machine. Test WiFi signal strength at each camera position. Address dead spots (WiFi extender if needed). | Hardware/DevOps | All positions have power and >5 Mbps upload |

### Tripod Setup Details

Since this is a single-gym MVP, tripod mounting is chosen over permanent wall/ceiling installation for:
- **Flexibility:** Positions can be adjusted daily during the beta as we learn optimal angles
- **No gym modifications:** No drilling, no landlord approval needed
- **Portability:** Equipment can be moved to another gym if the pilot doesn't work out

Tripod placement guidelines:
- Position 1.5-2m from the machine, at a 30-60° side angle
- Camera at ~1.2-1.5m height (seated user eye level for machine exercises)
- Weight stack must be visible in frame alongside the user's body
- Avoid mirror reflections in frame
- Route power cables along walls/baseboards with cable covers for safety

### Budget: Phase 2

| Item | Cost |
|---|---|
| Used Android phones (20 × $30) | $600 |
| Tripods with phone mounts (20 × $15) | $300 |
| USB cables + power adaptors (20 × $8) | $160 |
| Power strips / surge protectors (5) | $50 |
| Cable covers / management | $40 |
| WiFi extender (if needed) | $30 |
| MDM setup (free tier) | $0 |
| Spare devices (3 extra phones) | $90 |
| **Phase 2 total** | **~$1,270** |

---

## Phase 3 — Mobile App & Integration (Weeks 11-18)

**Objective:** Build the member-facing mobile app that delivers workout logs and collects corrections.

### Deliverables

| # | Deliverable | Owner | Done When |
|---|---|---|---|
| 3.1 | **Member app (Android)** — React Native app. Gym member installs on their phone. Features: sign up / log in, start workout (enables BLE broadcast), view workout history, view individual session details. | Mobile/Frontend | App installable, login + history screen working |
| 3.2 | **BLE identity broadcast** — App broadcasts a unique BLE identifier when the user starts a workout. Camera devices detect this signal to associate the person in-frame with a member account. | Mobile | BLE broadcast detected by camera device at 3m+ range |
| 3.3 | **Workout log screen** — Post-session screen showing detected exercises, sets, reps, and weight. Each entry is editable inline (tap to correct exercise name, reps, or weight). | Frontend | Screen renders mock data, edit + save works |
| 3.4 | **Correction feedback loop** — User corrections are stored and used to improve future prompts (few-shot examples) and calibrate confidence thresholds per exercise. | Backend | Corrections saved to DB, retrievable per member/exercise |
| 3.5 | **Push notifications** — Notify member when their workout log is ready (~5 min post-session). | Backend/Mobile | Notification received on test device |
| 3.6 | **Workout history & stats** — Basic stats: workouts per week, volume trends (total weight × reps over time), exercise frequency. Simple charts. | Frontend | Stats screen renders real data |

### Tech Stack

| Component | Technology |
|---|---|
| Mobile app | React Native (already in workspace as `ironpalapp`) |
| Backend API | Node.js or Python (FastAPI) |
| Database | PostgreSQL |
| BLE | Android BLE peripheral mode (member app) + BLE central mode (camera app) |
| Push notifications | Firebase Cloud Messaging |
| Hosting | Single cloud VM (DigitalOcean / Hetzner) or managed PaaS |

### Budget: Phase 3

| Item | Cost |
|---|---|
| Cloud infrastructure (staging + production) | ~$40/month × 2 months = $80 |
| Firebase (free tier) | $0 |
| Apple Developer (if iOS later) | Deferred |
| gpt-5-nano API (continued dev/test) | ~$30 |
| **Phase 3 total** | **~$110** |

---

## Phase 4 — Closed Beta (Weeks 17-22)

**Objective:** Run the full system live at the partner gym with real members. Collect accuracy data, find bugs, and iterate.

### Deliverables

| # | Deliverable | Owner | Done When |
|---|---|---|---|
| 4.1 | **Beta member recruitment** — Recruit 10-20 gym members willing to test. Provide onboarding: install app, explain consent, walk through confirm/correct flow. | Business | 10+ members onboarded and using the system |
| 4.2 | **Accuracy tracking dashboard** — Internal dashboard showing: auto-detection accuracy (% of sets correctly identified without correction), correction rate per exercise, weight detection success rate, common failure modes. | Backend/Data | Dashboard live, updating daily |
| 4.3 | **Daily monitoring & triage** — Monitor camera health (uptime, frame quality), API errors, LLM response quality, user corrections. Fix issues same-day. | All | Documented daily log of issues and fixes |
| 4.4 | **Prompt iteration** — Based on real-world accuracy data, refine LLM prompts. Add few-shot examples from common failure cases. Adjust confidence thresholds. | AI/Backend | Accuracy improves measurably week-over-week |
| 4.5 | **User feedback sessions** — Interview 5+ beta members. Understand: Is the workout log useful? What's missing? What's annoying? Would they pay? | Business/UX | Feedback documented with actionable insights |
| 4.6 | **Camera position tuning** — Adjust tripod positions based on real-world results (weight stack visibility, occlusion patterns, lighting at different times of day). | Hardware | All cameras in final optimized positions |

### Success Criteria for Beta

| Metric | Target |
|---|---|
| Exercise recognition accuracy (auto, no correction) | ≥80% |
| Exercise recognition accuracy (after user correction) | ≥95% |
| Rep count accuracy (±1 rep) | ≥80% |
| Weight detection accuracy (when visible) | ≥65% |
| Session log delivery time | <5 minutes post-workout |
| System uptime (cameras online) | ≥95% during gym hours |
| Beta member retention (still using after 3 weeks) | ≥60% |

### Budget: Phase 4

| Item | Cost |
|---|---|
| Cloud infrastructure (production) | ~$50/month × 1.5 months = $75 |
| gpt-5-nano API (live traffic — 10-20 members) | ~$5/month × 1.5 = $8 |
| Device replacements (if any fail) | ~$60 |
| **Phase 4 total** | **~$143** |

---

## Phase 5 — Refinement & Launch (Weeks 21-26)

**Objective:** Polish based on beta learnings. Roll out to all gym members willing to opt in. Establish the recurring SaaS billing relationship with the gym.

### Deliverables

| # | Deliverable | Owner | Done When |
|---|---|---|---|
| 5.1 | **Accuracy improvements** — Incorporate all beta learnings into prompts, confidence thresholds, and frame selection logic. Target accuracy improvements per beta metrics. | AI/Backend | All beta success criteria met |
| 5.2 | **Gym-wide rollout** — Open the service to all consenting gym members. Onboarding flow in-app (consent + tutorial). | Business/Frontend | Any gym member can sign up and start tracking |
| 5.3 | **Billing integration** — Set up SaaS billing for the gym (Stripe or similar). Monthly invoice to gym owner. | Backend/Business | First invoice sent and paid |
| 5.4 | **Operational runbook** — Document: how to add/replace a camera device, how to monitor system health, how to handle common failures, escalation process. | DevOps | Runbook reviewed and tested |
| 5.5 | **Performance optimization** — Implement smart frame selection and prompt caching optimizations from the cost analysis to bring LLM costs down to the $8-13/month target range. | Backend/AI | Monthly LLM cost within target |
| 5.6 | **Gym owner dashboard (basic)** — Simple web page for the gym owner showing: active members, system health, member satisfaction (correction rates trending down). | Frontend | Dashboard accessible and showing live data |

### Budget: Phase 5

| Item | Cost |
|---|---|
| Cloud infrastructure | ~$50/month × 1.5 months = $75 |
| gpt-5-nano API (full gym traffic) | ~$20/month × 1.5 = $30 |
| Stripe fees (first month) | ~$5 |
| **Phase 5 total** | **~$110** |

---

## Resource Requirements

### Team

| Role | Commitment | Skills Required |
|---|---|---|
| **AI / Prompt Engineer** | Full-time (or primary founder) | Multimodal LLM prompt design, image processing, understanding of computer vision concepts. Does NOT need ML training experience — no custom models. |
| **Backend Developer** | Full-time | API design, database, cloud infrastructure, video/image processing pipelines. Python or Node.js. |
| **Mobile Developer** | Part-time (Phase 0-1), full-time (Phase 2-5) | React Native, Android native (for camera app), BLE, background services. |
| **Business / Gym Liaison** | Part-time throughout | Gym partnership negotiation, member onboarding, user research, privacy/legal coordination. |

A team of **2-3 people** can execute this roadmap. For a solo founder, the timeline roughly doubles.

### Infrastructure

| Service | Provider (Suggested) | Monthly Cost |
|---|---|---|
| Backend server | DigitalOcean Droplet / Hetzner VPS | $20-40 |
| Database | Managed PostgreSQL (or self-hosted on same VM) | $0-15 |
| Object storage (frames) | S3-compatible (Backblaze B2 / DO Spaces) | $5-10 |
| LLM API | OpenAI (gpt-5-nano) | $8-23 (depending on optimization) |
| Push notifications | Firebase (free tier) | $0 |
| MDM | Headwind MDM (free self-hosted) | $0 |
| **Total monthly infra** | | **~$33-88** |

---

## Total Budget Summary

### Development Phase (Months 1-6)

| Category | Cost |
|---|---|
| Phase 0 — Research & Validation | $220 |
| Phase 1 — Core Engine | $110 |
| Phase 2 — Device & Deployment | $1,270 |
| Phase 3 — Mobile App & Integration | $110 |
| Phase 4 — Closed Beta | $143 |
| Phase 5 — Refinement & Launch | $110 |
| **Total development cost** | **~$1,963** |

> This excludes team salaries/compensation. Hardware ($1,270) is the largest line item.

### Monthly Operational Cost (Post-Launch)

| Item | Monthly |
|---|---|
| LLM API (optimized) | $8-13 |
| Cloud infrastructure | $33-55 |
| Device replacement (~20%/year) | ~$15 |
| **Total operational** | **~$56-83/month** |

### Revenue Target

| Pricing Tier | Monthly Fee | Gross Margin (at $70/month cost) |
|---|---|---|
| **Basic** (up to 200 members) | $149/month | ~53% |
| **Standard** (up to 500 members) | $249/month | ~72% |
| **Premium** (unlimited + analytics) | $399/month | ~82% |

**Break-even:** Month 1-2 post-launch on the Basic tier (hardware payback in ~10 months).

---

## Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Exercise recognition accuracy too low (<70%)** — gpt-5-nano can't reliably distinguish similar exercises from tripod camera angles | Medium | Critical | Phase 0 validates this before any hardware spend. If accuracy is insufficient, pivot to a simpler scope (fewer exercises) or supplement with user-initiated logging per exercise. |
| R2 | **Weight stack numbers unreadable** — Worn labels, poor lighting, or camera distance makes OCR unreliable | High | Medium | Manual weight input is the default fallback. Weight detection is a "nice to have" for MVP — the core value is exercise + rep tracking. Iterate on camera positioning during beta. |
| R3 | **Partner gym backs out** — Gym owner changes mind about cameras, members object, or business changes | Low | Critical | Maintain relationships with 2-3 candidate gyms. Keep the hardware portable (tripods, not wall mounts). Ensure the contract allows reasonable exit terms. |
| R4 | **BLE identity association fails in practice** — Signal interference, members forget to start workout, multiple members in one zone | Medium | High | Zone-based assignment (1 camera per machine = 1 person at a time) reduces dependency on BLE. Add a fallback: member taps "I'm at machine X" in the app. |
| R5 | **Camera devices overheat or fail** — Used phones running continuously in a gym | Medium | Medium | Budget for 15-20% spare inventory. Monitor via MDM. Set up auto-restart on crash. Disable battery charging above 80%. Position away from direct sunlight. |
| R6 | **Gym members don't adopt the app** — Members find the correction UX annoying or don't see enough value | Medium | High | Beta feedback sessions (Phase 4.5) catch this early. Focus on making the "happy path" delightful (push notification → tap → see your workout in 2 seconds). Gamification (streaks, PRs) adds stickiness. |
| R7 | **Privacy backlash** — Members uncomfortable with cameras | Medium | High | Strong consent process. Emphasize: no facial recognition, no video storage, pose-data only leaves the device. Allow members to opt out entirely. Signage explaining what the cameras do. |
| R8 | **Tripods get knocked over or moved** — Gym environment is high-traffic | Medium | Low | Use weighted tripod bases or sandbag anchors. Position in corners/against walls where possible. Staff education during installation. Quick re-alignment procedure in the runbook. |
| R9 | **LLM API outage or pricing change** — OpenAI service disruption or gpt-5-nano price increase | Low | High | Design the system to degrade gracefully (on-device rep counting still works, just no exercise/weight ID). Abstract the LLM provider behind an interface — can swap to Gemini or Claude if needed. |
| R10 | **WiFi reliability at gym** — Gym's network can't handle 15-20 devices streaming data | Low | Medium | Phase 2.6 audits this before beta. Frames are small (JPEG, ~200KB each, sent in bursts not streams). Total bandwidth is modest (~5-10 Mbps peak). Bring a dedicated WiFi access point if the gym's network is insufficient. |

---

## Timeline Visualization

```
Week:  1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26
       ├───────────────┤
       Phase 0: Research & Validation
                       ├───────────────────────────────┤
                       Phase 1: Core Engine
                                       ├───────────────────────┤
                                       Phase 2: Device & Deployment
                                                   ├───────────────────────────────┤
                                                   Phase 3: Mobile App
                                                                       ├───────────────────────┤
                                                                       Phase 4: Closed Beta
                                                                                   ├───────────────────────┤
                                                                                   Phase 5: Launch
                                                                                                           │
                                                                                                     🚀 LIVE
```

---

## Key Decision Points (Go/No-Go Gates)

### Gate 1: End of Phase 0 (Week 4)
**Question:** Does gpt-5-nano achieve ≥75% exercise recognition accuracy on test clips?
- **Go:** Proceed to Phase 1 with confidence.
- **No-Go:** Pivot scope (fewer exercises, different approach), test alternative models (gpt-5-mini, Gemini Flash), or reassess feasibility.

### Gate 2: End of Phase 1 (Week 12)
**Question:** Does the end-to-end pipeline (frame → LLM → structured log) work reliably on recorded test footage?
- **Go:** Proceed to hardware procurement and gym deployment.
- **No-Go:** Identify the bottleneck (frame quality? prompt? latency?) and extend Phase 1 by 2-4 weeks.

### Gate 3: End of Phase 4, Week 2 (Week 19)
**Question:** Are beta members finding the workout log useful? Is accuracy meeting beta targets?
- **Go:** Continue beta, prepare for launch.
- **No-Go / Partial:** Extend beta, narrow scope further (e.g., fewer exercises), or pivot to semi-manual approach (user selects exercise, system counts reps only).

---

## Post-MVP Roadmap (v2 and Beyond)

Once the MVP is validated at the partner gym, the following features are prioritized for subsequent releases:

| Priority | Feature | Rationale |
|---|---|---|
| v2.0 | **Automatic weight detection** (improved accuracy) | Reduce manual input; biggest user friction point |
| v2.0 | **Free-weight support** (barbell + squat rack) | Covers the most popular exercises missing from MVP |
| v2.1 | **Permanent mounting** (wall/ceiling brackets replacing tripods) | Production-grade gym deployment |
| v2.1 | **Multi-gym deployment** | Second and third gyms; validate scaling |
| v2.2 | **Dumbbell exercise support** | Hardest category — requires improved body-motion analysis |
| v2.2 | **Gym owner analytics dashboard** | Equipment utilization, peak hours, member engagement |
| v3.0 | **Form analysis & coaching** | Rep quality scoring, tempo tracking, range-of-motion feedback |
| v3.0 | **Coach/trainer features** | Trainer can view client workouts, assign programs, track adherence |
| v3.1 | **iOS app** | Expand member reach |
| v4.0 | **On-device LLM** | Eliminate cloud LLM dependency, reduce cost to near-zero |

---

## Appendix: Key Assumptions

1. **gpt-5-nano** supports multimodal (vision) input and maintains current pricing: $0.05/1M input, $0.005/1M cached, $0.40/1M output.
2. Used Android phones with serviceable cameras are available at $20-40/unit in bulk.
3. The partner gym has adequate WiFi coverage and power outlets near target machines.
4. Gym members are willing to install an Android app and opt into camera-based tracking.
5. A team of 2-3 developers is available to execute the roadmap.
6. The gym has ≥15 pin-loaded machines to justify the deployment.
7. MediaPipe Pose runs adequately on 2-3 year old Android devices.
