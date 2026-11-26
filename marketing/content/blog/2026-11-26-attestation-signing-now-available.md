+++
title = "Attestation Signing Is Now Available: Bind Your SBOM to the Artifact"
date = "2026-11-26"
description = "SecureSBOM now signs and verifies artifact-bound SBOM attestations. Try it in your browser: change a signed attestation and watch verification fail."
image = "img/attestations/attestation-signing-now-available.png"
+++

In [Introducing Attestation Signing](/blog/2026-10-19-bind-the-sbom-to-the-artifact/), we described the gap between
two questions. A signed SBOM answers the first:

> **Is this the SBOM the signer approved?**

An artifact-bound attestation answers the second:

> **Is this the SBOM the signer approved for this exact artifact?**

Attestation signing is now available in SecureSBOM. You can sign an SBOM together with the digest of the artifact it
describes, publish that signed claim beside the artifact, and verify both the signature and the subject before you
trust it.

The fastest way to understand it is to break it.

## Try It Now, in Your Browser

The [SBOM attestation guide](/attestations/) includes a live verification panel that runs the same checks as the
SecureSBOM API, in the same order, with the same error codes. It runs entirely in your browser. Nothing is uploaded.

Start with a real attestation signed by SecureSBOM. It verifies. Then change something:

- **Change a component version in the SBOM.** The signature no longer matches.
- **Point the statement at a different artifact.** The signature no longer matches.
- **Re-format the payload.** The signed content is no longer in its canonical form.
- **Corrupt the signature.** It fails.
- **Use someone else's public key.** It fails.
- **Check a different artifact.** The signature is still valid, but the subject does not match, so verification fails.

That last case is the one SBOM-only signing cannot catch. A valid signature for the wrong artifact must fail
verification, and here it does.

You can also edit the decoded statement directly and watch each check respond. Every check is reported, so you can see
exactly which layer broke and why.

**[Try it in your browser →](/attestations/#att-live)**

## What Shipped

The attestation APIs sit alongside the existing v2 SBOM operations:

```text
POST /api/v2/attestations/sign
POST /api/v2/attestations/verify
```

The design follows the contract described in the original post:

1. **An immutable subject digest is required.** A signing request identifies the artifact by its SHA-256 digest.
   Container tags and filenames are not treated as security identities.
2. **It uses a standard statement.** The SBOM is placed in an
   [in-toto Statement](https://github.com/in-toto/attestation/blob/main/spec/v1/statement.md), which is signed inside a
   DSSE envelope. There is no proprietary wrapper.
3. **SBOM handling stays data-aware.** CycloneDX, SPDX, and AI-BOM predicates are validated before signing, and the
   complete statement is canonicalized with RFC 8785 before it is signed.
4. **Verification requires the expected subject.** The caller must supply the digest of the artifact being evaluated.
   A missing or mismatched subject fails closed with a distinct result.
5. **Attestation keys are separate.** Attestations are signed with a dedicated attestation key. A standard SBOM signing
   key cannot sign an attestation, and an attestation key cannot sign a plain SBOM.
6. **Existing signatures are unchanged.** `/api/v2/sign` and `/api/v2/verify` continue to sign and verify standalone
   SBOMs.

By default, the attestation carries a single signature. The SBOM is placed in the statement exactly as it was sent, and
the attestation signature covers every byte of it. Teams that also need the SBOM to verify on its own after it is
extracted can request an embedded or detached SBOM signature as well.

## Verification Communicates the Full Decision

The original post argued that attestation verification is more than a signature check. The verify response reports
each check separately:

- whether the signature is valid for the expected key;
- whether the signed content is in its canonical form;
- whether the subject digest matches the artifact being evaluated; and
- whether an optional SBOM-level signature, if present, is valid.

The result is `verified: true` only when every required check passes. A failure returns a distinct code such as
`signature_invalid`, `key_mismatch`, or `subject_mismatch`, so a pipeline can tell a tampered attestation apart from an
attestation for a different release.

The [attestation guide](/attestations/) walks through every field of the sign and verify requests and responses in
plain language, with checklists for producers and consumers and a table of every error code.

## Getting Started

Attestation keys are created through the SecureSBOM API:

```bash
curl -X POST "$SECURESBOM_API_URL/api/v1/keys" \
  -H "X-API-Key: $SECURESBOM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"key_type": "attestation"}'
```

Sign the SBOM together with the digest of the artifact it describes:

```json
{
  "key_id": "<attestation key id>",
  "subject": [
    { "name": "registry.example.com/app", "digest": { "sha256": "<artifact digest>" } }
  ],
  "sbom": { "bomFormat": "CycloneDX", "specVersion": "1.6", "...": "..." }
}
```

Publish the returned attestation beside the artifact. Consumers then verify it against the digest of the artifact
**they** have:

```json
{
  "key_id": "<producer's attestation key id>",
  "attestation": { "...": "the attestation, unchanged" },
  "expected_digest": { "sha256": "<digest you computed>" }
}
```

Never copy the expected digest out of the attestation. The check only proves something when the consumer computes it
from the artifact they are about to use.

## The Durable Design

The goal was never simply to attach an SBOM to an image. It is:

> **Identify the artifact by digest, place that identity and the SBOM in one signed claim, verify both the signature
> and the subject, then use the registry or repository to make the claim discoverable.**

That design is now available in SecureSBOM. [See it fail in your browser](/attestations/#att-live), then
[contact us](/contactus/) to add attestation signing to your release pipeline.
