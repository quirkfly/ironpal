package com.ironpal.poc

import java.util.Base64

/**
 * IEEE 754 half-precision encode/decode for stored IMU windows (design §4.1, ledger Q11).
 * Layout: little-endian int16 halves, row-major [N][C]. Mirrored in src/model/f16.ts.
 */
object F16 {
  fun toHalf(f: Float): Int {
    val bits = java.lang.Float.floatToIntBits(f)
    val sign = (bits ushr 16) and 0x8000
    var value = (bits and 0x7fffffff) + 0x1000
    if (value >= 0x47800000) {
      if ((bits and 0x7fffffff) >= 0x47800000) {
        if (value < 0x7f800000) return sign or 0x7c00
        return sign or 0x7c00 or ((bits and 0x007fffff) ushr 13)
      }
      return sign or 0x7bff
    }
    if (value >= 0x38800000) return sign or ((value - 0x38000000) ushr 13)
    if (value < 0x33000000) return sign
    value = (bits and 0x7fffffff) ushr 23
    return sign or ((((bits and 0x7fffff) or 0x800000) + (0x800000 ushr (value - 102))) ushr (126 - value))
  }

  fun fromHalf(h: Int): Float {
    var mant = h and 0x03ff
    var exp = h and 0x7c00
    if (exp == 0x7c00) {
      exp = 0x3fc00
    } else if (exp != 0) {
      exp += 0x1c000
      if (mant == 0 && exp > 0x1c400) {
        return java.lang.Float.intBitsToFloat(((h and 0x8000) shl 16) or (exp shl 13) or 0x3ff)
      }
    } else if (mant != 0) {
      exp = 0x1c400
      do {
        mant = mant shl 1
        exp -= 0x400
      } while ((mant and 0x400) == 0)
      mant = mant and 0x3ff
    }
    return java.lang.Float.intBitsToFloat(((h and 0x8000) shl 16) or ((exp or mant) shl 13))
  }

  /** Encode [N][C] doubles → base64 of little-endian halves. */
  fun encode(series: Array<DoubleArray>): String {
    if (series.isEmpty()) return ""
    val c = series[0].size
    val out = ByteArray(series.size * c * 2)
    var k = 0
    for (row in series) for (j in 0 until c) {
      val h = toHalf(row[j].toFloat())
      out[k++] = (h and 0xff).toByte()
      out[k++] = ((h ushr 8) and 0xff).toByte()
    }
    return Base64.getEncoder().encodeToString(out)
  }

  /** Decode base64 halves → [N][channels]. */
  fun decode(b64: String, channels: Int): Array<DoubleArray> {
    if (b64.isEmpty() || channels <= 0) return emptyArray()
    val bytes = Base64.getDecoder().decode(b64)
    val n = bytes.size / (2 * channels)
    return Array(n) { i ->
      DoubleArray(channels) { j ->
        val k = (i * channels + j) * 2
        val h = (bytes[k].toInt() and 0xff) or ((bytes[k + 1].toInt() and 0xff) shl 8)
        fromHalf(h).toDouble()
      }
    }
  }
}
