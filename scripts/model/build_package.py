#!/usr/bin/env python3
"""Assemble (and sign) an IronPal model package (design §8).

Sources:
  - params:       poc/model/package/params.json        (engine + level defaults; POC constants)
  - campaign map: docs/video-analysis-kb/ontology.json  (Tier-1 exercises by rep_signal)
  - explanations: poc/model/package/explanations.json
  - priors:       poc/model/package/priors/*.json       (optional; founder templates as
                  {id, exercise_id, features, window_f16, channels})
Output:
  poc/mobile/assets/model_package.json   (bundled with the app)
  poc/backend/model_packages/<version>.json  (served by GET /model/package)

Signing: ECDSA P-256 / SHA-256 over the canonical JSON without the `signature` field
(ledger Q4). Key: credentials/model_signing_key.pem (generated on first run when the
`cryptography` package is importable); the DER public key is printed for
src/model/packageManager.ts PACKAGE_PUBLIC_KEY_DER_B64. Without `cryptography` the package
is written unsigned, which the app accepts only for the bundled dev package.

Usage:
  python3 scripts/model/build_package.py --version 2026.09.0
"""
import argparse, base64, glob, json, os, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PKG_DIR = os.path.join(ROOT, "poc/model/package")
ONTOLOGY = os.path.join(ROOT, "docs/video-analysis-kb/ontology.json")
OUT_APP = os.path.join(ROOT, "poc/mobile/assets/model_package.json")
OUT_BACKEND_DIR = os.path.join(ROOT, "poc/backend/model_packages")
KEY_PATH = os.path.join(ROOT, "credentials/model_signing_key.pem")


def campaign_map():
    d = json.load(open(ONTOLOGY))
    out = {"imu": [], "fusion": [], "vision": [], "hard": []}
    names = {}
    for e in d["exercises"]:
        if e.get("tier") != 1:
            continue
        out[e["rep_signal"]].append(e["id"])
        names[e["id"]] = e["canonical_name"]
    for k in out:
        out[k].sort()
    return out, names


def canonical(pkg):
    body = {k: v for k, v in pkg.items() if k != "signature"}
    # Must match JSON.stringify(rest) in packageManager.ts: no spaces, insertion order preserved.
    return json.dumps(body, separators=(",", ":"), ensure_ascii=False)


def sign(payload: bytes):
    try:
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import ec
    except ImportError:
        return None, None
    if os.path.exists(KEY_PATH):
        key = serialization.load_pem_private_key(open(KEY_PATH, "rb").read(), password=None)
    else:
        key = ec.generate_private_key(ec.SECP256R1())
        os.makedirs(os.path.dirname(KEY_PATH), exist_ok=True)
        with open(KEY_PATH, "wb") as f:
            f.write(key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))
        os.chmod(KEY_PATH, 0o600)
    sig = key.sign(payload, ec.ECDSA(hashes.SHA256()))
    pub = key.public_key().public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo)
    return base64.b64encode(sig).decode(), base64.b64encode(pub).decode()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--version", required=True)
    ap.add_argument("--unsigned", action="store_true")
    args = ap.parse_args()

    params = json.load(open(os.path.join(PKG_DIR, "params.json")))
    explanations = json.load(open(os.path.join(PKG_DIR, "explanations.json")))
    cmap, names = campaign_map()
    priors = []
    for f in sorted(glob.glob(os.path.join(PKG_DIR, "priors", "*.json"))):
        priors.extend(json.load(open(f)))

    pkg = {
        "package_version": args.version,
        "engine_min": "1.0.0",
        "store_schema_version": 1,
        "extractor_version": "fx-1",
        "signed_at": int(time.time()),
        "params": params,
        "campaign_map": cmap,
        "exercise_names": names,
        "ontology_ref": "docs/video-analysis-kb/ontology.json",
        "priors": priors,
        "explanations": explanations,
        "smoke": [],
    }
    payload = canonical(pkg).encode("utf-8")
    if not args.unsigned:
        sig, pub = sign(payload)
        if sig:
            pkg["signature"] = "ecdsa-p256:" + sig
            print("public key (DER, base64) for packageManager.ts:\n" + pub)
        else:
            print("cryptography not installed — package written UNSIGNED", file=sys.stderr)

    os.makedirs(os.path.dirname(OUT_APP), exist_ok=True)
    os.makedirs(OUT_BACKEND_DIR, exist_ok=True)
    for path in (OUT_APP, os.path.join(OUT_BACKEND_DIR, args.version + ".json")):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(pkg, f, indent=1, ensure_ascii=False)
        print("wrote", path, "(%d priors, %d Tier-1 exercises)" % (len(priors), sum(len(v) for v in cmap.values())))
    with open(os.path.join(OUT_BACKEND_DIR, "latest"), "w") as f:
        f.write(args.version)


if __name__ == "__main__":
    main()
