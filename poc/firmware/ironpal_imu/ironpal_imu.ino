/*
 * IronPal headband IMU — Arduino Nano 33 BLE Rev2 (nRF52840 + BMI270 + BMM150)
 *
 * Streams 6-axis IMU over BLE to the companion app in poc/mobile, which logs it
 * alongside the ELP camera's video for post-hoc alignment. Implements the packet
 * format and BLE service in docs/ironpal-imu-camera-sync-plan.md §2.
 *
 * WHY BLE AND NOT ONBOARD LOGGING (plan §2, decision Q1): 100 Hz x 6 axes x 2 B
 * = 1.2 kB/s = 4.3 MB/h against this board's 2 MB flash is ~28 minutes -- far
 * short of a session. BLE carries 1.2 kB/s trivially, and the live stream is
 * what lets the app gate session start on sync-nod detection.
 *
 * LIBRARY WARNING: this is the Rev2 board -- Arduino_BMI270_BMM150, NOT
 * Arduino_LSM9DS1 (which is for the original Nano 33 BLE). Using the wrong
 * library is the most common bring-up failure on this hardware.
 *
 * Build:
 *   arduino-cli lib install ArduinoBLE Arduino_BMI270_BMM150
 *   arduino-cli compile -b arduino:mbed_nano:nano33ble poc/firmware/ironpal_imu
 *   arduino-cli upload  -b arduino:mbed_nano:nano33ble -p <port> \
 *                       poc/firmware/ironpal_imu   (find <port> via `arduino-cli board list`)
 */
#include <ArduinoBLE.h>
#include <Arduino_BMI270_BMM150.h>

// ---------------------------------------------------------------- config ----
/* MEASURED 2026-08-05, and it overrides grill Q3's "100 Hz logged".
 * Benchmarked on hardware: each Arduino_BMI270_BMM150 read costs ~7.7 ms, so
 * accel+gyro tops out near 66 samples/s (accel alone: ~130). 100 Hz is simply
 * not reachable through this library's read path -- the limit is I2C
 * transaction cost, not the sensor, which reports 99.84 Hz and always has data
 * waiting. 60 Hz leaves ~10 % headroom and still clears the 50 Hz canonical
 * rate the DSP consumes. Reaching 100 Hz would need the BMI270's FIFO (bulk
 * read of many samples per transaction) -- see README.
 */
static const uint8_t  TARGET_ODR_HZ    = 60;
static const uint8_t  SAMPLES_PER_PKT  = 8;     // 12.5 notifications/s
static const uint16_t SAMPLE_PERIOD_US = 1000000UL / TARGET_ODR_HZ;

/* Fixed-point scales. The Bosch library hands us floats in g / dps, so rather
 * than forwarding raw sensor LSB (whose meaning depends on a library-internal
 * range setting) we quantise to scales WE define and advertise in the config
 * characteristic. Keeps the host parser independent of library internals.
 *   accel: 0.001 g/LSB   -> int16 spans +-32.7 g   (FSR of interest: +-8 g)
 *   gyro : 0.0625 dps/LSB-> int16 spans +-2047 dps (FSR of interest: +-1000 dps)
 * Grill Q3 chose +-8 g / +-1000 dps: enough for sharp sync nods and head
 * impacts without wasting resolution on range head motion never reaches.
 */
static const float ACCEL_SCALE_G_PER_LSB   = 0.001f;
static const float GYRO_SCALE_DPS_PER_LSB  = 0.0625f;

// Saturation counters: clipped data is a difference *in kind* from unclipped
// (see ironpal-poc-to-production-transfer.md §4.2), so the host must be able to
// see it rather than train on a flattened peak.
static uint16_t clipCount = 0;

// ------------------------------------------------------------------- BLE ----
// 128-bit UUIDs, IronPal-local. Keep in sync with the Kotlin backend.
#define SVC_UUID    "6e40a000-b5a3-f393-e0a9-e50e24dcca9e"
#define CHR_IMU     "6e40a001-b5a3-f393-e0a9-e50e24dcca9e"  // notify: sample packets
#define CHR_CONTROL "6e40a002-b5a3-f393-e0a9-e50e24dcca9e"  // write : start/stop
#define CHR_CONFIG  "6e40a003-b5a3-f393-e0a9-e50e24dcca9e"  // read  : scales, ODR, firmware

static const uint8_t PKT_HEADER_BYTES = 10;
static const uint8_t PKT_BYTES = PKT_HEADER_BYTES + SAMPLES_PER_PKT * 12;  // 106 B

BLEService            imuService(SVC_UUID);
BLECharacteristic     imuChar(CHR_IMU, BLENotify, PKT_BYTES);
BLEByteCharacteristic controlChar(CHR_CONTROL, BLEWrite);
BLECharacteristic     configChar(CHR_CONFIG, BLERead, 16);

// ------------------------------------------------------------ ring buffer ----
/* Never drop silently on BLE backpressure (plan §2.3): a silent gap becomes an
 * invisible time shift downstream. Buffer instead, and let `seq` expose any loss
 * that does happen so the host can invalidate rather than interpolate.
 */
struct Sample { int16_t ax, ay, az, gx, gy, gz; };
static const uint8_t RING_LEN = 64;          // 0.64 s of slack at 100 Hz
static Sample   ring[RING_LEN];
static uint32_t ringTsUs[RING_LEN];
static volatile uint8_t ringHead = 0, ringTail = 0;

static inline uint8_t ringCount() {
  return (uint8_t)((ringHead - ringTail) & (RING_LEN - 1));
}

static bool streaming = false;
static uint16_t seq = 0;
static uint32_t nextSampleUs = 0;
static uint16_t droppedSamples = 0;

static int16_t quantise(float v, float scale, bool *clipped) {
  long q = lroundf(v / scale);
  if (q >  32767) { q =  32767; *clipped = true; }
  if (q < -32768) { q = -32768; *clipped = true; }
  return (int16_t)q;
}

static void publishConfig() {
  // Little-endian. Host reads this once and needs no library knowledge.
  uint8_t c[16] = {0};
  uint16_t aScale = (uint16_t)lroundf(ACCEL_SCALE_G_PER_LSB  * 1000000.0f); // µg/LSB
  uint16_t gScale = (uint16_t)lroundf(GYRO_SCALE_DPS_PER_LSB * 10000.0f);   // 1e-4 dps/LSB
  c[0] = TARGET_ODR_HZ;
  c[1] = SAMPLES_PER_PKT;
  c[2] = (uint8_t)(aScale & 0xFF); c[3] = (uint8_t)(aScale >> 8);
  c[4] = (uint8_t)(gScale & 0xFF); c[5] = (uint8_t)(gScale >> 8);
  c[6] = 8;    // accel FSR, g
  c[7] = 0;    // gyro FSR / 100 dps -> set below
  c[7] = 10;   // 10 * 100 = 1000 dps
  c[8] = 1;    // firmware major
  c[9] = 0;    // firmware minor
  configChar.writeValue(c, sizeof(c));
}

void setup() {
  Serial.begin(115200);
  // Do NOT block on Serial: the unit runs headless on a headband. Only wait
  // briefly so a bench session over USB still catches the banner.
  for (uint32_t t0 = millis(); !Serial && millis() - t0 < 1500; ) {}

  if (!IMU.begin()) {
    Serial.println(F("FATAL: IMU.begin() failed -- wrong library for this board?"));
    Serial.println(F("Rev2 needs Arduino_BMI270_BMM150, not Arduino_LSM9DS1."));
    while (1) { delay(1000); }
  }
  Serial.print(F("accel ODR (Hz): ")); Serial.println(IMU.accelerationSampleRate());
  Serial.print(F("gyro  ODR (Hz): ")); Serial.println(IMU.gyroscopeSampleRate());

  if (!BLE.begin()) {
    Serial.println(F("FATAL: BLE.begin() failed"));
    while (1) { delay(1000); }
  }
  BLE.setLocalName("IronPal-IMU");
  BLE.setDeviceName("IronPal-IMU");
  BLE.setAdvertisedService(imuService);
  imuService.addCharacteristic(imuChar);
  imuService.addCharacteristic(controlChar);
  imuService.addCharacteristic(configChar);
  BLE.addService(imuService);
  publishConfig();

  // Short connection interval (plan §2.2): long intervals batch notifications
  // and add latency jitter, which widens alignment uncertainty directly.
  BLE.setConnectionInterval(6, 12);   // units of 1.25 ms -> 7.5–15 ms

  BLE.advertise();
  Serial.println(F("advertising as IronPal-IMU"));
}

void loop() {
  BLEDevice central = BLE.central();

  /* Idle heartbeat. USB CDC output is discarded while no host is attached, so a
   * banner printed once in setup() is invisible to anyone who opens the port
   * afterwards — which is always, on a board that boots the moment it is
   * plugged in. Re-emitting status while advertising makes bench bring-up
   * work regardless of attach timing, and costs nothing in the field.
   */
  if (!central) {
    static uint32_t lastBeat = 0;
    if (millis() - lastBeat >= 2000) {
      lastBeat = millis();
      Serial.print(F("[idle] advertising as IronPal-IMU | accel ODR "));
      Serial.print(IMU.accelerationSampleRate());
      Serial.print(F(" Hz | gyro ODR "));
      Serial.print(IMU.gyroscopeSampleRate());
      Serial.print(F(" Hz | target "));
      Serial.print(TARGET_ODR_HZ);
      Serial.println(F(" Hz"));
    }
    return;
  }

  Serial.print(F("connected: ")); Serial.println(central.address());
  streaming = true;                  // stream on connect; control char can pause
  seq = 0; ringHead = ringTail = 0; clipCount = 0; droppedSamples = 0;
  nextSampleUs = micros();

  while (central.connected()) {
    if (controlChar.written()) {
      streaming = (controlChar.value() != 0);
      Serial.print(F("streaming=")); Serial.println(streaming);
    }

    // ---- sample on a fixed micros() schedule -------------------------------
    // micros(), never millis(): 1 ms resolution would be a quarter of the whole
    // 40 ms alignment budget (plan §2.3).
    uint32_t now = micros();
    if (streaming && (int32_t)(now - nextSampleUs) >= 0) {
      float ax, ay, az, gx, gy, gz;
      /* MEASURED 2026-08-05: the BMI270 reports 99.84 Hz, not exactly 100. Polling
       * a 99.84 Hz source on a 100 Hz schedule leaves data unready roughly every
       * 6 s. Advancing the schedule anyway would silently drop that sample while
       * the packet still claimed n evenly-spaced samples — a slow, invisible
       * timing error, which is precisely what the <40 ms alignment budget cannot
       * absorb. So: only advance the schedule when a sample is actually taken.
       */
      /* MEASURED 2026-08-05: requiring BOTH flags in one iteration halved the
       * effective rate to 47 Hz. On the BMI270 accel and gyro share one sample
       * clock and one data-ready status, so reading either clears it for both --
       * gating on the conjunction means sampling only every other cycle. Gate on
       * accel alone and read both; they belong to the same sample period.
       */
      /* No availability check: the bench showed every poll found data ready
       * (got == polls), so it only added ~2 ms of I2C cost per sample. We now
       * sample well below the sensor's 99.84 Hz, so every read is fresh.
       */
      {
        IMU.readAcceleration(ax, ay, az);
        IMU.readGyroscope(gx, gy, gz);

        bool clipped = false;
        Sample s;
        s.ax = quantise(ax, ACCEL_SCALE_G_PER_LSB, &clipped);
        s.ay = quantise(ay, ACCEL_SCALE_G_PER_LSB, &clipped);
        s.az = quantise(az, ACCEL_SCALE_G_PER_LSB, &clipped);
        s.gx = quantise(gx, GYRO_SCALE_DPS_PER_LSB, &clipped);
        s.gy = quantise(gy, GYRO_SCALE_DPS_PER_LSB, &clipped);
        s.gz = quantise(gz, GYRO_SCALE_DPS_PER_LSB, &clipped);
        if (clipped && clipCount < 0xFFFF) { clipCount++; }

        uint8_t next = (uint8_t)((ringHead + 1) & (RING_LEN - 1));
        if (next == ringTail) {
          // Buffer full: the host will see it as a seq/count mismatch rather
          // than a silent hole.
          if (droppedSamples < 0xFFFF) { droppedSamples++; }
        } else {
          ring[ringHead] = s;
          ringTsUs[ringHead] = now;
          ringHead = next;
        }

        nextSampleUs += SAMPLE_PERIOD_US;
        // If we fell behind (BLE stack stole time), resynchronise rather than
        // spinning to catch up and emitting a burst of wrongly-timed samples.
        if ((int32_t)(micros() - nextSampleUs) > (int32_t)(4 * SAMPLE_PERIOD_US)) {
          nextSampleUs = micros() + SAMPLE_PERIOD_US;
        }
      }
    }

    // ---- emit one packet per SAMPLES_PER_PKT ------------------------------
    if (ringCount() >= SAMPLES_PER_PKT) {
      uint8_t pkt[PKT_BYTES];
      uint32_t firstTs = ringTsUs[ringTail];
      uint8_t  lastIdx = (uint8_t)((ringTail + SAMPLES_PER_PKT - 1) & (RING_LEN - 1));
      uint32_t spanUs  = ringTsUs[lastIdx] - firstTs;      // wrap-safe: uint32 arithmetic
      uint16_t dtUs    = (uint16_t)(spanUs / (SAMPLES_PER_PKT - 1));
      pkt[0] = (uint8_t)(seq & 0xFF);
      pkt[1] = (uint8_t)(seq >> 8);
      pkt[2] = (uint8_t)(firstTs & 0xFF);
      pkt[3] = (uint8_t)((firstTs >> 8) & 0xFF);
      pkt[4] = (uint8_t)((firstTs >> 16) & 0xFF);
      pkt[5] = (uint8_t)((firstTs >> 24) & 0xFF);
      pkt[6] = SAMPLES_PER_PKT;
      pkt[7] = TARGET_ODR_HZ;          // nominal, for sanity-checking only
      pkt[8] = (uint8_t)(dtUs & 0xFF); // MEASURED mean spacing — use THIS to place samples
      pkt[9] = (uint8_t)(dtUs >> 8);

      uint8_t o = PKT_HEADER_BYTES;
      for (uint8_t i = 0; i < SAMPLES_PER_PKT; i++) {
        Sample *s = &ring[ringTail];
        int16_t vals[6] = { s->ax, s->ay, s->az, s->gx, s->gy, s->gz };
        for (uint8_t v = 0; v < 6; v++) {
          pkt[o++] = (uint8_t)(vals[v] & 0xFF);
          pkt[o++] = (uint8_t)((vals[v] >> 8) & 0xFF);
        }
        ringTail = (uint8_t)((ringTail + 1) & (RING_LEN - 1));
      }
      imuChar.writeValue(pkt, PKT_BYTES);
      seq++;
    }
  }

  streaming = false;
  Serial.print(F("disconnected. dropped=")); Serial.print(droppedSamples);
  Serial.print(F(" clipped=")); Serial.println(clipCount);
  BLE.advertise();
}
