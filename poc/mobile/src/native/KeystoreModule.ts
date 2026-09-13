import {NativeModules} from 'react-native';

// JS wrapper over the Kotlin `KeystoreModule` (design §7.1, §8): device-bound AES-GCM key
// wrapping for the store key and file keys, and ECDSA P-256 verification of model packages.

interface KeystoreNative {
  getOrCreateKey(): Promise<string>;
  newWrappedKey(): Promise<string>;
  wrap(plainB64: string): Promise<string>;
  unwrap(wrappedB64: string): Promise<string>;
  destroy(): Promise<boolean>;
  verifyEcdsaP256(dataB64: string, sigB64: string, pubDerB64: string): Promise<boolean>;
  sha256(dataB64: string): Promise<string>;
}

const native = NativeModules.KeystoreModule as KeystoreNative | undefined;

function assertNative(): KeystoreNative {
  if (!native) {
    throw new Error('[KeystoreModule] Native module not linked; the encrypted store needs an APK build.');
  }
  return native;
}

export const KeystoreModule = {
  isAvailable: () => !!native,
  getOrCreateKey: () => assertNative().getOrCreateKey(),
  newWrappedKey: () => assertNative().newWrappedKey(),
  wrap: (plainB64: string) => assertNative().wrap(plainB64),
  unwrap: (wrappedB64: string) => assertNative().unwrap(wrappedB64),
  destroy: () => assertNative().destroy(),
  verifyEcdsaP256: (dataB64: string, sigB64: string, pubDerB64: string) =>
    assertNative().verifyEcdsaP256(dataB64, sigB64, pubDerB64),
  sha256: (dataB64: string) => assertNative().sha256(dataB64),
};
