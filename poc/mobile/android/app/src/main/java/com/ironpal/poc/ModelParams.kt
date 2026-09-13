package com.ironpal.poc

import org.json.JSONObject

/**
 * Every tunable the signal engine reads (design §3.6). Defaults reproduce the POC's
 * hard-coded constants exactly (package `2026.09.0`), so switching the engine over to
 * injected params changes no behaviour until a package or a fit overrides a value.
 *
 * Pure Kotlin — no Android imports — so it is unit-testable on the JVM.
 */
data class FeatureWeights(
  val axis: Double = 2.0,
  val cadence: Double = 0.8,
  val duty: Double = 1.2,
  val asym: Double = 1.0,
  val flat: Double = 1.0,
  val jerk: Double = 0.8,
  val gyro: Double = 1.5,
)

/** Per-exercise fitted values (design §4.2). Null = "use the global default". */
data class ExerciseParams(
  val cadenceLowHz: Double? = null,
  val cadenceHighHz: Double? = null,
  /** Absolute peak-amplitude threshold on the band-passed rep channel. */
  val aMin: Double? = null,
  /** 0..2 = accel axis, -1 = band-passed magnitude, null = engine picks the dominant axis. */
  val dominantChannel: Int? = null,
  val setDurationMedianSec: Double? = null,
  val setDurationIqrSec: Double? = null,
)

data class ModelParams(
  val canonicalRateHz: Double = 50.0,
  val repBandLowHz: Double = 0.2,
  val repBandHighHz: Double = 1.5,
  // Gate (design §3.2). POC used 0.3 / 0.02 with no hysteresis.
  val gatePOn: Double = 0.35,
  val gatePOff: Double = 0.25,
  val gateEOn: Double = 0.02,
  val gateArmTicks: Int = 2,
  val closingGraceSec: Double = 1.5,
  // Rep clock (design §3.3).
  val sConfMsMin: Int = 150,
  val sConfMsMax: Int = 400,
  val peakHeightRmsFactor: Double = 0.35,
  // Decision thresholds (fusion ladder, src/config).
  val tReject: Double = 0.45,
  val tImuHigh: Double = 0.7,
  val tVisHigh: Double = 0.65,
  val tOcr: Double = 0.6,
  // Matcher.
  val wKnn: Double = 0.6,
  val wDtw: Double = 0.4,
  val featureWeights: FeatureWeights = FeatureWeights(),
  val topK: Int = 8,
  val dtwBand: Double = 0.2,
  /** Prior templates' distance is inflated by (1 + nOwn * priorPenaltyPerOwn). */
  val priorPenaltyPerOwn: Double = 1.0 / 3.0,
  // Engine cadence.
  val tickMs: Long = 400,
  val windowSec: Double = 4.0,
  /** Ring of non-periodic windows kept for negative harvesting, per session. */
  val negativesPerSession: Int = 5,
  val perExercise: Map<String, ExerciseParams> = emptyMap(),
) {
  fun exercise(id: String?): ExerciseParams? = if (id == null) null else perExercise[id]

  companion object {
    val DEFAULT = ModelParams()

    /** Parse the flat JSON emitted by src/model/params.ts `toEngineJson`. Missing keys keep defaults. */
    fun fromJson(json: String): ModelParams {
      val o = JSONObject(json)
      val d = DEFAULT
      val fw = o.optJSONObject("feature_weights")
      val per = HashMap<String, ExerciseParams>()
      o.optJSONObject("per_exercise")?.let { pe ->
        for (key in pe.keys()) {
          val e = pe.getJSONObject(key)
          per[key] = ExerciseParams(
            cadenceLowHz = e.optDoubleOrNull("cadence_low_hz"),
            cadenceHighHz = e.optDoubleOrNull("cadence_high_hz"),
            aMin = e.optDoubleOrNull("a_min"),
            dominantChannel = if (e.has("dominant_channel") && !e.isNull("dominant_channel")) e.getInt("dominant_channel") else null,
            setDurationMedianSec = e.optDoubleOrNull("set_duration_median_sec"),
            setDurationIqrSec = e.optDoubleOrNull("set_duration_iqr_sec"),
          )
        }
      }
      return ModelParams(
        canonicalRateHz = o.optDouble("canonical_rate_hz", d.canonicalRateHz),
        repBandLowHz = o.optDouble("rep_band_low_hz", d.repBandLowHz),
        repBandHighHz = o.optDouble("rep_band_high_hz", d.repBandHighHz),
        gatePOn = o.optDouble("gate_p_on", d.gatePOn),
        gatePOff = o.optDouble("gate_p_off", d.gatePOff),
        gateEOn = o.optDouble("gate_e_on", d.gateEOn),
        gateArmTicks = o.optInt("gate_arm_ticks", d.gateArmTicks),
        closingGraceSec = o.optDouble("closing_grace_sec", d.closingGraceSec),
        sConfMsMin = o.optInt("s_conf_ms_min", d.sConfMsMin),
        sConfMsMax = o.optInt("s_conf_ms_max", d.sConfMsMax),
        peakHeightRmsFactor = o.optDouble("peak_height_rms_factor", d.peakHeightRmsFactor),
        tReject = o.optDouble("t_reject", d.tReject),
        tImuHigh = o.optDouble("t_imu_high", d.tImuHigh),
        tVisHigh = o.optDouble("t_vis_high", d.tVisHigh),
        tOcr = o.optDouble("t_ocr", d.tOcr),
        wKnn = o.optDouble("w_knn", d.wKnn),
        wDtw = o.optDouble("w_dtw", d.wDtw),
        featureWeights = if (fw == null) d.featureWeights else FeatureWeights(
          axis = fw.optDouble("axis", d.featureWeights.axis),
          cadence = fw.optDouble("cadence", d.featureWeights.cadence),
          duty = fw.optDouble("duty", d.featureWeights.duty),
          asym = fw.optDouble("asym", d.featureWeights.asym),
          flat = fw.optDouble("flat", d.featureWeights.flat),
          jerk = fw.optDouble("jerk", d.featureWeights.jerk),
          gyro = fw.optDouble("gyro", d.featureWeights.gyro),
        ),
        topK = o.optInt("top_k", d.topK),
        dtwBand = o.optDouble("dtw_band", d.dtwBand),
        priorPenaltyPerOwn = o.optDouble("prior_penalty_per_own", d.priorPenaltyPerOwn),
        tickMs = o.optLong("tick_ms", d.tickMs),
        windowSec = o.optDouble("window_sec", d.windowSec),
        negativesPerSession = o.optInt("negatives_per_session", d.negativesPerSession),
        perExercise = per,
      )
    }

    private fun JSONObject.optDoubleOrNull(key: String): Double? =
      if (has(key) && !isNull(key)) getDouble(key) else null
  }
}
