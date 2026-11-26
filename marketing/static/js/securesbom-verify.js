/*
 * SecureSBOM attestation verification core (securesbom-attestation-v1).
 *
 * Pure functions, no DOM: the /attestations guide uses it today and the
 * self-service verifier can reuse it. Everything runs locally with the Web
 * Crypto API; nothing is sent anywhere.
 *
 * Checks run in the same order, and fail with the same error codes, as
 * POST /api/v2/attestations/verify. Unlike the API, every check is reported
 * so a UI can show each layer that failed.
 *
 *   SecureSBOMVerify.verifyAttestation({
 *     envelope,        // object or JSON string (the "attestation")
 *     expectedDigest,  // sha256 hex of the artifact, computed by the caller
 *     publicKey,       // PEM, JWK (object or JSON string) or CryptoKey; optional
 *     keyId            // expected signer key id; optional
 *   }) -> Promise<{ verified, code, checks[], statement, statementText, statementSha256, keySource }>
 */
(function (root) {
  "use strict";

  var PAYLOAD_TYPE = "application/vnd.in-toto+json";
  var STATEMENT_TYPE = "https://in-toto.io/Statement/v1";
  var PREDICATE_TYPES = {
    "https://cyclonedx.org/bom": "CycloneDX",
    "https://spdx.dev/Document": "SPDX",
    "https://shiftleftcyber.io/attestation/ai-sbom/v1": "AI-SBOM"
  };

  /* Check ids, plain-language labels and the API error code each one maps to,
   * in API order. */
  var CHECKS = [
    { id: "digest", label: "Your artifact's fingerprint was provided", code: "expected_digest_required" },
    { id: "envelope", label: "The attestation is well formed", code: "invalid_envelope" },
    { id: "key", label: "Signed by the key you expect", code: "key_mismatch" },
    { id: "signature", label: "The signature matches the signer's public key", code: "signature_invalid" },
    { id: "canonical", label: "The signed content is in its exact, canonical form", code: "payload_not_canonical" },
    { id: "statement", label: "The statement is complete", code: "invalid_statement" },
    { id: "ptype", label: "The SBOM format is supported", code: "unsupported_predicate_type" },
    { id: "subject", label: "The attestation is for your artifact", code: "subject_mismatch" },
    { id: "predicate", label: "Optional extra SBOM signature", code: "predicate_signature_invalid" }
  ];

  var enc = new TextEncoder();
  var dec = new TextDecoder("utf-8", { fatal: true });

  /* ---------- encoding helpers ---------- */
  function b64ToBytes(s) {
    s = String(s).replace(/-/g, "+").replace(/_/g, "/").replace(/\s+/g, "");
    while (s.length % 4) s += "=";
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function bytesToB64(bytes) {
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function hex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) {
      return ("0" + b.toString(16)).slice(-2);
    }).join("");
  }
  function concat(parts) {
    var len = parts.reduce(function (n, p) { return n + p.length; }, 0);
    var out = new Uint8Array(len), off = 0;
    parts.forEach(function (p) { out.set(p, off); off += p.length; });
    return out;
  }
  /* SHA-256 hex of a string, bytes, ArrayBuffer or Blob/File. */
  async function sha256Hex(data) {
    if (typeof data === "string") data = enc.encode(data);
    else if (data && typeof data.arrayBuffer === "function") data = await data.arrayBuffer();
    return hex(await crypto.subtle.digest("SHA-256", data));
  }

  /* RFC 8785 JSON canonicalization: keys sorted by UTF-16 code units, no
   * whitespace, ECMAScript number and string serialization. */
  function canonicalize(v) {
    if (v === null || typeof v !== "object") return JSON.stringify(v);
    if (Array.isArray(v)) return "[" + v.map(canonicalize).join(",") + "]";
    return "{" + Object.keys(v).sort().map(function (k) {
      return JSON.stringify(k) + ":" + canonicalize(v[k]);
    }).join(",") + "}";
  }

  /* DSSE pre-authentication encoding: what the signature actually covers. */
  function pae(type, payload) {
    var t = enc.encode(type);
    return concat([enc.encode("DSSEv1 " + t.length + " "), t, enc.encode(" " + payload.length + " "), payload]);
  }

  /* ASN.1 DER ECDSA signature -> r||s, as Web Crypto expects. */
  function derToRaw(der) {
    var i = 0;
    if (der[i++] !== 0x30) throw new Error("signature is not DER encoded");
    var len = der[i++];
    if (len & 0x80) i += len & 0x7f;
    function readInt() {
      if (der[i++] !== 0x02) throw new Error("malformed signature");
      var l = der[i++], v = der.slice(i, i + l);
      i += l;
      while (v.length > 32 && v[0] === 0) v = v.slice(1);
      if (v.length > 32) throw new Error("signature is not P-256");
      var out = new Uint8Array(32);
      out.set(v, 32 - v.length);
      return out;
    }
    return concat([readInt(), readInt()]);
  }

  /* Accepts a PEM public key, a JWK (object or JSON string), a SecureSBOM
   * public key response (GET /api/v1/public/keys/{key_id}: public_key_jwk or
 * public_key_pem) or a CryptoKey. */
  function importPublicKey(src) {
    var alg = { name: "ECDSA", namedCurve: "P-256" };
    if (src && typeof src === "object" && src.type === "public" && src.algorithm) return Promise.resolve(src);
    if (src && typeof src === "object") {
      if (src.public_key_jwk) return importPublicKey(src.public_key_jwk);
      if (src.public_key_pem) return importPublicKey(src.public_key_pem);
      if (src.public_key) return importPublicKey(src.public_key);
      if (src.publicKey) return importPublicKey(src.publicKey);
      var jwk = { kty: src.kty, crv: src.crv, x: src.x, y: src.y, ext: true };
      return crypto.subtle.importKey("jwk", jwk, alg, false, ["verify"]);
    }
    var text = String(src || "").trim();
    if (!text) return Promise.reject(new Error("empty public key"));
    if (text.charAt(0) === "{") return importPublicKey(JSON.parse(text));
    var body = text.replace(/-----(BEGIN|END) PUBLIC KEY-----/g, "").replace(/\s+/g, "");
    return crypto.subtle.importKey("spki", b64ToBytes(body), alg, false, ["verify"]);
  }

  function es256Verify(key, derSig, data) {
    return crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, derToRaw(derSig), data);
  }

  /* Parses an envelope and decodes its payload. Throws with a readable message. */
  function decodeEnvelope(input) {
    var env = typeof input === "string" ? JSON.parse(input) : input;
    if (!env || typeof env !== "object" || Array.isArray(env)) throw new Error("The attestation must be a JSON object.");
    if (env.payloadType !== PAYLOAD_TYPE) throw new Error("payloadType must be " + PAYLOAD_TYPE + ".");
    if (typeof env.payload !== "string" || !Array.isArray(env.signatures) || !env.signatures.length || !env.signatures[0].sig) {
      throw new Error("It needs a payload and at least one signature.");
    }
    var bytes, text;
    try { bytes = b64ToBytes(env.payload); text = dec.decode(bytes); } catch (e) {
      throw new Error("payload is not valid base64 text.");
    }
    var statement = null;
    try { statement = JSON.parse(text); } catch (e) { /* reported by later checks */ }
    return { envelope: env, payloadBytes: bytes, payloadText: text, statement: statement };
  }

  /* Returns a copy of the envelope with a new payload (for editing demos). */
  function withPayload(envelope, payloadText) {
    var copy = JSON.parse(JSON.stringify(envelope));
    copy.payload = bytesToB64(enc.encode(payloadText));
    return copy;
  }

  function pass(detail) { return { status: "pass", detail: detail }; }
  function fail(detail) { return { status: "fail", detail: detail }; }
  function skip(detail) { return { status: "skip", detail: detail }; }
  function info(detail) { return { status: "info", detail: detail }; }

  async function verifyAttestation(opts) {
    opts = opts || {};
    var r = {}, out = { statement: null, statementText: null, statementSha256: null, keySource: null };

    var expected = String(opts.expectedDigest || "").trim().toLowerCase();
    r.digest = /^[0-9a-f]{64}$/.test(expected)
      ? pass("Comparing against " + expected.slice(0, 12) + "…")
      : fail(expected ? "It must be 64 hex characters (a SHA-256 hash)." : "Hash the artifact you are about to use and enter its SHA-256.");

    var d;
    try { d = decodeEnvelope(opts.envelope); } catch (e) {
      r.envelope = fail(e instanceof SyntaxError ? "Not valid JSON: " + e.message : e.message);
      return finish(r, out);
    }
    var env = d.envelope, sig = env.signatures[0];
    r.envelope = pass("Signed by key " + (sig.keyid || "(no key id)"));
    out.statementText = d.payloadText;
    out.statement = d.statement;
    out.statementSha256 = await sha256Hex(d.payloadBytes);

    if (opts.keyId) {
      r.key = sig.keyid === opts.keyId ? pass("Key " + opts.keyId) : fail("Signed by " + (sig.keyid || "an unnamed key") + ", not " + opts.keyId + ".");
    } else {
      r.key = skip("No expected key id given.");
    }

    var st = d.statement;
    var embedded = st && st.predicate && st.predicate.signature && st.predicate.signature.publicKey;
    var key = null;
    try {
      if (opts.publicKey) { key = await importPublicKey(opts.publicKey); out.keySource = "provided"; }
      else if (embedded) { key = await importPublicKey(embedded); out.keySource = "embedded"; }
    } catch (e) {
      r.signature = fail("Could not read the public key: " + e.message);
    }
    if (!r.signature) {
      if (!key) r.signature = skip("Add the signer's public key to check the signature.");
      else {
        try {
          var ok = await es256Verify(key, b64ToBytes(sig.sig), pae(env.payloadType, d.payloadBytes));
          r.signature = ok
            ? pass(out.keySource === "embedded"
              ? "Matches the key embedded in the SBOM. That proves nothing changed, not who signed it."
              : "Matches the public key you provided.")
            : fail("The content or the signature changed after signing, or a different key signed it.");
        } catch (e) { r.signature = fail("The signature could not be read: " + e.message); }
      }
    }

    if (!st) {
      r.canonical = fail("The signed content is not valid JSON.");
      r.statement = fail("The signed content is not valid JSON.");
      return finish(r, out);
    }
    var canon = canonicalize(st);
    r.canonical = canon === d.payloadText
      ? pass("Byte-for-byte identical to its canonical form.")
      : fail("It was re-formatted (spacing or key order), so it is " + Math.abs(d.payloadText.length - canon.length) + " bytes different from the canonical form.");

    var subjOk = Array.isArray(st.subject) && st.subject.length > 0 && st.subject.every(function (s) {
      return s && typeof s.name === "string" && s.digest && /^[0-9a-f]{64}$/.test(s.digest.sha256 || "");
    });
    if (st._type !== STATEMENT_TYPE) r.statement = fail("_type must be " + STATEMENT_TYPE + ".");
    else if (!subjOk) r.statement = fail("Every subject needs a name and a SHA-256 fingerprint.");
    else if (typeof st.predicateType !== "string" || !st.predicate || typeof st.predicate !== "object") r.statement = fail("predicateType and predicate are required.");
    else r.statement = pass(st.subject.length + " artifact(s), " + (PREDICATE_TYPES[st.predicateType] || st.predicateType) + " SBOM");
    if (r.statement.status !== "pass") return finish(r, out);

    r.ptype = PREDICATE_TYPES[st.predicateType]
      ? pass(PREDICATE_TYPES[st.predicateType])
      : fail(st.predicateType + " is not CycloneDX, SPDX or AI-SBOM.");

    if (r.digest.status === "pass") {
      var match = st.subject.filter(function (s) { return s.digest.sha256 === expected; })[0];
      r.subject = match ? pass("Matched " + match.name + ".") : fail("No artifact in the attestation has your fingerprint. It is not for the artifact you have.");
      out.matchedSubject = match || null;
    } else r.subject = skip("Needs your artifact's fingerprint.");

    var psig = st.predicate.signature;
    if (psig && psig.value && psig.publicKey) {
      try {
        var pkey = opts.publicKey ? key : await importPublicKey(psig.publicKey);
        var unsigned = JSON.parse(JSON.stringify(st.predicate));
        delete unsigned.signature.value;
        var pok = await es256Verify(pkey, b64ToBytes(psig.value), enc.encode(canonicalize(unsigned)));
        r.predicate = pok ? pass("The embedded SBOM signature is valid.") : fail("The SBOM changed after its own signature was made.");
      } catch (e) { r.predicate = fail("Could not check the embedded SBOM signature: " + e.message); }
    } else {
      r.predicate = info("Not present. That is the default: the attestation signature already covers the SBOM.");
    }
    return finish(r, out);
  }

  function finish(r, out) {
    out.checks = CHECKS.map(function (c) {
      var res = r[c.id] || { status: "skip", detail: "Not reached." };
      return { id: c.id, label: c.label, code: c.code, status: res.status, detail: res.detail };
    });
    var firstFail = out.checks.filter(function (c) { return c.status === "fail"; })[0];
    var sigChecked = r.signature && r.signature.status === "pass";
    out.code = firstFail ? firstFail.code : null;
    out.verified = !firstFail && sigChecked && r.subject && r.subject.status === "pass";
    return out;
  }

  root.SecureSBOMVerify = {
    PAYLOAD_TYPE: PAYLOAD_TYPE,
    STATEMENT_TYPE: STATEMENT_TYPE,
    PREDICATE_TYPES: PREDICATE_TYPES,
    CHECKS: CHECKS,
    canonicalize: canonicalize,
    sha256Hex: sha256Hex,
    importPublicKey: importPublicKey,
    decodeEnvelope: decodeEnvelope,
    withPayload: withPayload,
    verifyAttestation: verifyAttestation,
    _internal: { b64ToBytes: b64ToBytes, bytesToB64: bytesToB64, pae: pae, derToRaw: derToRaw }
  };
})(typeof window !== "undefined" ? window : globalThis);
