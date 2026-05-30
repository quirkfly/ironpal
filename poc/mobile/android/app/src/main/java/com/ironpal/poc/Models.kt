package com.ironpal.poc

import org.json.JSONArray
import org.json.JSONObject

/** Mirrors the TS FeatureVector (src/types/domain.ts). */
data class FeatureVector(
  val axisEnergyRatio: DoubleArray,
  val normalizedCadenceHz: Double,
  val motionDutyRatio: Double,
  val peakAsymmetry: Double,
  val spectralFlatness: Double,
  val normalizedJerk: Double,
  val gyroEnergyRatio: DoubleArray?,
  val hasGyro: Boolean,
) {
  fun toJson(): JSONObject {
    val o = JSONObject()
    o.put("axisEnergyRatio", JSONArray(axisEnergyRatio.toList()))
    o.put("normalizedCadenceHz", normalizedCadenceHz)
    o.put("motionDutyRatio", motionDutyRatio)
    o.put("peakAsymmetry", peakAsymmetry)
    o.put("spectralFlatness", spectralFlatness)
    o.put("normalizedJerk", normalizedJerk)
    if (gyroEnergyRatio != null) {
      o.put("gyroEnergyRatio", JSONArray(gyroEnergyRatio.toList()))
    }
    o.put("hasGyro", hasGyro)
    return o
  }

  companion object {
    fun fromJson(o: JSONObject): FeatureVector {
      val aer = o.getJSONArray("axisEnergyRatio")
      val axis = DoubleArray(3) { aer.getDouble(it) }
      var gyro: DoubleArray? = null
      if (o.has("gyroEnergyRatio") && !o.isNull("gyroEnergyRatio")) {
        val g = o.getJSONArray("gyroEnergyRatio")
        gyro = DoubleArray(3) { g.getDouble(it) }
      }
      return FeatureVector(
        axisEnergyRatio = axis,
        normalizedCadenceHz = o.optDouble("normalizedCadenceHz", 0.0),
        motionDutyRatio = o.optDouble("motionDutyRatio", 0.0),
        peakAsymmetry = o.optDouble("peakAsymmetry", 0.0),
        spectralFlatness = o.optDouble("spectralFlatness", 0.0),
        normalizedJerk = o.optDouble("normalizedJerk", 0.0),
        gyroEnergyRatio = gyro,
        hasGyro = o.optBoolean("hasGyro", gyro != null),
      )
    }
  }
}

/** Mirrors the TS Template (src/types/domain.ts). */
data class Template(
  val id: String,
  val exerciseLabel: String,
  val takeId: Int,
  val sampleRateHz: Int,
  val featureVector: FeatureVector,
  /** Resampled raw window [N][C] (D7). */
  val imuSeriesResampled: Array<DoubleArray>,
  val version: Long,
) {
  companion object {
    fun listFromJson(json: String): List<Template> {
      val arr = JSONArray(json)
      val out = ArrayList<Template>(arr.length())
      for (i in 0 until arr.length()) {
        val o = arr.getJSONObject(i)
        val seriesArr = o.getJSONArray("imuSeriesResampled")
        val series = Array(seriesArr.length()) { r ->
          val row = seriesArr.getJSONArray(r)
          DoubleArray(row.length()) { c -> row.getDouble(c) }
        }
        out.add(
          Template(
            id = o.getString("id"),
            exerciseLabel = o.getString("exerciseLabel"),
            takeId = o.optInt("takeId", 0),
            sampleRateHz = o.optInt("sampleRateHz", 50),
            featureVector = FeatureVector.fromJson(o.getJSONObject("featureVector")),
            imuSeriesResampled = series,
            version = o.optLong("version", 0L),
          ),
        )
      }
      return out
    }
  }
}
