# Model licence log

This is the pre-ship gate from neural design v2 §9. Every model binary or model library in the app
is listed here with its licence before a build that contains it ships. **AGPL is never allowed.**
That rules out Ultralytics YOLO.

| Component | Where in the app | Licence | Source |
|---|---|---|---|
| MoViNet-A0-Stream, Kinetics-600, float16 TFLite | `mobile/android/app/src/main/assets/models/movinet_a0_stream_fp16.tflite` | Apache 2.0 | Kaggle `google/movinet` → `tfLite/a0-stream-kinetics-600-classification-tflite-float16/1` (TF Model Garden) |
| MediaPipe Pose Landmarker Lite (float16) | `mobile/android/app/src/main/assets/models/pose_landmarker_lite.task` | Apache 2.0 | `storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/` |
| LiteRT runtime `com.google.ai.edge.litert:litert:1.4.2` | Gradle dependency | Apache 2.0 | Google Maven |
| MediaPipe Tasks Vision `com.google.mediapipe:tasks-vision:1.1.0` | Gradle dependency | Apache 2.0 | Google Maven |
| Whitening and z-score statistics (`mobile/src/model/embed_params.json`) | bundled JSON | own work | fitted by `scripts/model/embed_fit.py` on the KB clips, without labels |

The app's notices screen must carry the Apache 2.0 attributions for the first four rows before
any public release.
