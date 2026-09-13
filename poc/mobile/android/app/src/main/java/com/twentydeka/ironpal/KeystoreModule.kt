package com.twentydeka.ironpal

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.security.KeyFactory
import java.security.KeyStore
import java.security.MessageDigest
import java.security.SecureRandom
import java.security.Signature
import java.security.spec.X509EncodedKeySpec
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * Device-bound key operations for the model store (design §7.1) and package verification (§8).
 *
 * - An AES-256-GCM key lives in the Android Keystore (hardware-backed where the device offers it)
 *   and never leaves it. It WRAPS the random database key and per-file keys; the wrapped blobs are
 *   what the JS layer stores. Erasure = [destroy] → any remaining ciphertext is unrecoverable.
 * - Package signatures are ECDSA P-256 over SHA-256 (ledger Q4): in `java.security` on every
 *   supported API level, no dependency added.
 */
class KeystoreModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "KeystoreModule"

  private val alias = "ironpal.model.store.v1"
  private val provider = "AndroidKeyStore"

  private fun keyStore(): KeyStore = KeyStore.getInstance(provider).also { it.load(null) }

  private fun getOrCreate(): SecretKey {
    val ks = keyStore()
    (ks.getKey(alias, null) as? SecretKey)?.let { return it }
    val gen = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, provider)
    gen.init(
      KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .setKeySize(256)
        .setRandomizedEncryptionRequired(true)
        .build(),
    )
    return gen.generateKey()
  }

  @ReactMethod
  fun getOrCreateKey(promise: Promise) {
    try { getOrCreate(); promise.resolve(alias) } catch (e: Exception) { promise.reject("KEYSTORE_CREATE", e.message, e) }
  }

  /** Generate a fresh random 32-byte key and return it wrapped (base64 of iv||ciphertext). */
  @ReactMethod
  fun newWrappedKey(promise: Promise) {
    try {
      val raw = ByteArray(32).also { SecureRandom().nextBytes(it) }
      promise.resolve(wrapBytes(raw))
    } catch (e: Exception) { promise.reject("KEYSTORE_NEWKEY", e.message, e) }
  }

  @ReactMethod
  fun wrap(plainB64: String, promise: Promise) {
    try { promise.resolve(wrapBytes(Base64.decode(plainB64, Base64.NO_WRAP))) } catch (e: Exception) { promise.reject("KEYSTORE_WRAP", e.message, e) }
  }

  @ReactMethod
  fun unwrap(wrappedB64: String, promise: Promise) {
    try {
      val blob = Base64.decode(wrappedB64, Base64.NO_WRAP)
      val iv = blob.copyOfRange(0, 12)
      val ct = blob.copyOfRange(12, blob.size)
      val c = Cipher.getInstance("AES/GCM/NoPadding")
      c.init(Cipher.DECRYPT_MODE, getOrCreate(), GCMParameterSpec(128, iv))
      promise.resolve(Base64.encodeToString(c.doFinal(ct), Base64.NO_WRAP))
    } catch (e: Exception) { promise.reject("KEYSTORE_UNWRAP", e.message, e) }
  }

  /** Destroy the device key: every blob wrapped with it becomes unrecoverable (erasure). */
  @ReactMethod
  fun destroy(promise: Promise) {
    try { keyStore().deleteEntry(alias); promise.resolve(true) } catch (e: Exception) { promise.reject("KEYSTORE_DESTROY", e.message, e) }
  }

  /** ECDSA P-256 / SHA-256 verification of a model package (ledger Q4). Public key = DER SubjectPublicKeyInfo. */
  @ReactMethod
  fun verifyEcdsaP256(dataB64: String, sigB64: String, pubDerB64: String, promise: Promise) {
    try {
      val pub = KeyFactory.getInstance("EC").generatePublic(X509EncodedKeySpec(Base64.decode(pubDerB64, Base64.NO_WRAP)))
      val s = Signature.getInstance("SHA256withECDSA")
      s.initVerify(pub)
      s.update(Base64.decode(dataB64, Base64.NO_WRAP))
      promise.resolve(s.verify(Base64.decode(sigB64, Base64.NO_WRAP)))
    } catch (e: Exception) { promise.reject("KEYSTORE_VERIFY", e.message, e) }
  }

  @ReactMethod
  fun sha256(dataB64: String, promise: Promise) {
    try {
      val d = MessageDigest.getInstance("SHA-256").digest(Base64.decode(dataB64, Base64.NO_WRAP))
      promise.resolve(d.joinToString("") { "%02x".format(it) })
    } catch (e: Exception) { promise.reject("KEYSTORE_SHA", e.message, e) }
  }

  private fun wrapBytes(raw: ByteArray): String {
    val c = Cipher.getInstance("AES/GCM/NoPadding")
    c.init(Cipher.ENCRYPT_MODE, getOrCreate())
    val ct = c.doFinal(raw)
    return Base64.encodeToString(c.iv + ct, Base64.NO_WRAP)
  }
}
