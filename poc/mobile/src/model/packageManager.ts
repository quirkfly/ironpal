// Model package handling (design §8). P0 scope: load the bundled package, record it, expose
// its params / campaign map / priors. Signature verification uses the Keystore module's ECDSA
// P-256 verify when a signature and public key are present. Fetch-from-backend, migrations and
// smoke tests are P2 (design §14).

import {Buffer} from 'buffer';
import {KeystoreModule} from '../native/KeystoreModule';
import {MODEL_SCHEMA_VERSION} from './schema';
import * as store from './store';
import type {ModelPackage} from '../types/model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const BUNDLED: ModelPackage = require('../../assets/model_package.json');

/** IronPal package-signing public key (DER SubjectPublicKeyInfo, base64). Empty = unsigned dev builds. */
export const PACKAGE_PUBLIC_KEY_DER_B64 =
  'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEeUHKrmDwZith4xduRUI7hetRuh5pTd/BO308Llosn7VsPGDqG2ayzDqums2VzP5Vbbz5CNBT3bRJ33xCwfdCFA==';

export function bundledPackage(): ModelPackage {
  return BUNDLED;
}

export async function activePackage(): Promise<ModelPackage> {
  const v = await store.getMeta('active_package');
  if (!v) {
    return BUNDLED;
  }
  const blob = await store.getMeta(`package:${v}`);
  return blob ? (JSON.parse(blob) as ModelPackage) : BUNDLED;
}

/** Canonical bytes that were signed: the package JSON without its `signature` field. */
export function signedPayload(pkg: ModelPackage): string {
  const {signature, ...rest} = pkg;
  void signature;
  return JSON.stringify(rest);
}

export async function verify(pkg: ModelPackage): Promise<boolean | null> {
  if (!pkg.signature || !PACKAGE_PUBLIC_KEY_DER_B64) {
    return null; // unsigned / unverifiable — allowed for the bundled dev package only
  }
  if (!KeystoreModule.isAvailable()) {
    return null;
  }
  const data = Buffer.from(signedPayload(pkg), 'utf8').toString('base64');
  const sig = pkg.signature.replace(/^ecdsa-p256:/, '');
  return KeystoreModule.verifyEcdsaP256(data, sig, PACKAGE_PUBLIC_KEY_DER_B64);
}

/**
 * Apply a package: verify (when possible), check the store schema version, record it, and make
 * it active. Anything that throws leaves the previous package active.
 */
export async function apply(pkg: ModelPackage): Promise<{applied: boolean; reason?: string}> {
  const sigOk = await verify(pkg);
  if (sigOk === false) {
    await store.audit(null, {event: 'package_rejected', version: pkg.package_version, reason: 'bad signature'}, null);
    return {applied: false, reason: 'bad signature'};
  }
  if (pkg.store_schema_version > MODEL_SCHEMA_VERSION) {
    await store.audit(null, {event: 'package_rejected', version: pkg.package_version, reason: 'schema too new'}, null);
    return {applied: false, reason: 'schema too new'};
  }
  const previous = await store.getMeta('active_package');
  try {
    await store.transaction(async () => {
      await store.setMeta(`package:${pkg.package_version}`, JSON.stringify(pkg));
      await store.setMeta('active_package', pkg.package_version);
    });
    await store.audit(null, {event: 'package_applied', version: pkg.package_version, previous, signatureOk: sigOk}, null);
    return {applied: true};
  } catch (e) {
    if (previous) {
      await store.setMeta('active_package', previous);
    }
    await store.audit(null, {event: 'package_rollback', version: pkg.package_version, error: String(e)}, null);
    return {applied: false, reason: String(e)};
  }
}

/** Ensure the bundled package is recorded on first run. */
export async function ensureBundled(): Promise<ModelPackage> {
  const active = await store.getMeta('active_package');
  if (!active) {
    await apply(BUNDLED);
  }
  return activePackage();
}

/** Which campaign (rep-signal class) an exercise belongs to, per the active package's map. */
export function repSignalOf(pkg: ModelPackage, exerciseId: string): 'imu' | 'fusion' | 'vision' | 'hard' | null {
  for (const k of ['imu', 'fusion', 'vision', 'hard'] as const) {
    if (pkg.campaign_map[k]?.includes(exerciseId)) {
      return k;
    }
  }
  return null;
}

/** The set of exercises whose stores form one campaign for the integrity check (design §4.4). */
export function campaignOf(pkg: ModelPackage, exerciseId: string): string[] {
  const rs = repSignalOf(pkg, exerciseId);
  if (rs === 'imu' || rs === 'fusion') {
    return [...pkg.campaign_map.imu, ...pkg.campaign_map.fusion];
  }
  if (rs === 'vision') {
    return [...pkg.campaign_map.vision];
  }
  if (rs === 'hard') {
    return [...pkg.campaign_map.hard];
  }
  return [exerciseId];
}
