+++
title = "Introducing Attestation Signing: Binding SBOMs to Software Artifacts"
date = "2026-10-19"
description = "SecureSBOM is evolving from signing SBOM documents to signing verifiable claims that bind an SBOM to a specific software artifact."
image = "img/thirdparty/2026-10-19-bind-the-sbom-to-the-artifact.png"
+++

A signed Software Bill of Materials answers an important question:

> **Has this SBOM changed since an authorized key signed it?**

It does not necessarily answer a second question:

> **Is this SBOM about the exact software artifact I am evaluating?**

That distinction exposes an important gap in software supply chain trust. Signing an SBOM protects the document, but
the software and its SBOM are still two separate objects. Unless their relationship is also signed, a valid SBOM could
be presented with the wrong container image, binary, package, or firmware release.

SecureSBOM is addressing that gap by evolving from SBOM document signing toward **attestation signing**.

The key idea is simple: **sign the relationship between the SBOM and the artifact, not only the SBOM.**

## What Is an Attestation?

Attestation is still a new term for many software teams. In plain language:

> **An attestation is a verifiable, signed claim about an identified subject.**

An attestation brings four pieces together:

- **Subject:** The thing the claim is about, such as a container image identified by an immutable digest.
- **Claim:** What the signer asserts about that subject.
- **Evidence:** The information supporting the claim, either contained in or referenced by the attestation.
- **Trust mechanism:** The signature and signing identity that let a verifier determine who made the claim and whether
  it was altered.

For an artifact-bound SBOM attestation, the example is concrete:

- **Subject:** The exact container image identified by its SHA-256 manifest digest.
- **Claim:** "This SBOM describes this container image."
- **Evidence:** The CycloneDX SBOM containing the image's components and dependency relationships.
- **Trust mechanism:** The signature over the complete statement, including both the image digest and the SBOM.

A valid attestation proves that the identified signer made the claim, that the signed claim has not changed, and that
it names a particular artifact. It does not automatically prove that the claim is true or that the SBOM is complete.
The quality of the evidence and the authority of the signer must still be evaluated.

## The Gap in SBOM-Only Signing

SecureSBOM currently signs the SBOM document itself.

For CycloneDX and AI-BOM JSON, SecureSBOM supports embedded, data-aware signatures. For SPDX JSON, it supports a
detached signature. The current v2 path canonicalizes JSON before hashing and signing, allowing verification to focus
on the data rather than inconsequential changes to whitespace or property order.

That is stronger than treating an SBOM as an opaque byte blob. It provides portable, format-aware proof that the signed
SBOM content has not changed.

But the current signature's claim ends at the SBOM boundary. It does not require an immutable digest for the software
artifact described by the SBOM, place that digest and the SBOM inside one signed statement, or require the verifier to
compare the signed digest with the artifact under evaluation.

Consider two releases:

- Release A has no known vulnerable component and has a valid signed SBOM.
- Release B contains a vulnerable component and is distributed as a separate artifact.
- Release A's valid SBOM is presented beside release B.

The SBOM signature still verifies. It proves that the SBOM is authentic, but it does not prove that the SBOM describes
release B.

Names, tags, filenames, versions, download paths, and registry attachment metadata do not fully solve this problem.
They are mutable labels or unsigned associations. An immutable artifact digest inside the signed claim does.

## How Artifact-Bound Attestation Signing Works

The new model places the SBOM inside a standard signed statement. That statement also identifies the software artifact
by its immutable digest.

An [in-toto Statement](https://github.com/in-toto/attestation/blob/main/spec/v1/statement.md) provides a strong,
vendor-neutral structure for this relationship:

- `subject` identifies the artifact by digest;
- `predicateType` identifies the kind of claim being made; and
- `predicate` contains the claim's evidence, such as a CycloneDX SBOM.

SecureSBOM will sign the complete statement. Because the artifact digest and SBOM are both inside the signed content,
an attacker cannot replace either one without invalidating the signature.

Verification then performs two essential checks:

1. Verify the signature over the statement using a trusted public key and an approved algorithm.
2. Confirm that the statement's subject digest equals the digest of the artifact being evaluated.

Both checks must pass. A valid signature for the wrong artifact must fail verification.

## Integrity, Identity, and Discovery Are Different Controls

Attestation signing separates three properties that are often conflated:

| Control | What it proves | What it does not prove |
|---|---|---|
| SBOM signature | The SBOM is authentic and unchanged | The SBOM belongs to the artifact being verified |
| Signed subject digest | The claim is bound to one immutable artifact | Where the attestation is stored or found |
| Registry attachment | Related metadata can be discovered beside an artifact | That the relationship is trustworthy |

SecureSBOM already provides the first control. Attestation signing adds the second. Registry integrations can provide
the third without becoming the trust boundary.

For example, a signed attestation can be published as an OCI referrer beside a container image. The referrer makes the
attestation discoverable, but its location does not make it trustworthy. Trust comes from verifying the signature and
matching the signed subject digest to the container image digest.

## The SecureSBOM Attestation Solution

SecureSBOM's existing architecture provides the foundation for artifact-bound attestations. It already has versioned
signing and verification APIs, JSON canonicalization, managed signing keys, detached and embedded signatures, and an
offline Go verifier.

The next capability will introduce a first-class **SBOM attestation** contract:

1. **Require an immutable subject digest.** A signing request will identify the artifact using a supported digest
   algorithm, initially SHA-256. Container tags and filenames will not be treated as security identities.
2. **Use a standard statement.** SecureSBOM will use an in-toto Statement rather than inventing a proprietary wrapper.
3. **Preserve data-aware SBOM handling.** The SBOM predicate will retain SecureSBOM's format validation and
   deterministic JSON processing. The complete statement will have a documented canonicalization and signing profile.
4. **Verify the expected subject.** The verifier will require the expected artifact digest from the caller. A missing
   or mismatched subject will fail closed with a distinct result.
5. **Keep storage separate from trust.** SecureSBOM can return or store the attestation, and integrations can publish
   it to an artifact registry. The signed statement remains the source of truth.
6. **Preserve existing signatures.** Current CycloneDX, SPDX, and AI-BOM signatures will remain verifiable. Attestation
   signing will be an explicit new operation rather than a silent change to existing signature semantics.

The attestation APIs will sit alongside the existing v2 SBOM operations:

```text
POST /api/v2/attestations/sign
POST /api/v2/attestations/verify
```

The existing `/api/v2/sign` and `/api/v2/verify` operations will continue to sign and verify standalone SBOMs. Keeping
the operations separate prevents clients from confusing document integrity with artifact-bound verification.

## Verification Must Communicate the Full Decision

Attestation verification is more than a mathematical signature check. SecureSBOM's verification result will
distinguish at least:

- whether the signature is valid;
- whether the signing key is trusted;
- whether the predicate type is supported;
- whether the subject digest is present; and
- whether the subject digest matches the artifact being evaluated.

The overall result should be verified only when every required check passes. Collapsing these decisions into a single
signature-valid value would invite consumers to authorize an artifact without checking whether the attestation belongs
to it.

## SBOMs Are the First Attestation Type

This architecture creates room for additional software supply chain claims. A subject can be a container image,
binary, package, firmware image, source archive, model, or another artifact identified by a digest. A predicate could
eventually contain an SBOM, AI-BOM, vulnerability assessment, build provenance, test result, or policy decision.

That does not mean SecureSBOM should immediately become a generic service that signs arbitrary JSON. Each supported
predicate type needs explicit validation, size limits, canonicalization rules, authorization policy, and verification
semantics. Otherwise, a flexible attestation endpoint could become an ungoverned signing oracle.

SecureSBOM will begin with the domain it already understands: validated, artifact-bound SBOM attestations. Broader
attestation types can be introduced deliberately as their trust models are defined.

## What an Attestation Still Does Not Prove

A cryptographically bound SBOM can still be incomplete or factually wrong. The attestation proves who made a claim,
that the claim has not changed, and which artifact the claim names. It does not prove that an SBOM generator found every
component or that every field is accurate.

Generation quality, validation, signing identity, key governance, and verification policy remain separate layers of
the trust model. Attestation signing strengthens the relationship between those layers; it does not replace them.

## The Next Trust Boundary

SecureSBOM's current signatures answer:

> **Is this the SBOM the signer approved?**

An artifact-bound attestation adds:

> **Is this the SBOM the signer approved for this exact artifact?**

That is the next evolution of SecureSBOM: moving from signing software supply chain documents to issuing and verifying
cryptographically bound claims about software artifacts.

The durable design is not simply "attach an SBOM to an image." It is:

> **Identify the artifact by digest, place that identity and the SBOM in one signed claim, verify both the signature
> and the subject, then use the registry or repository to make the claim discoverable.**

That turns an authentic document into verifiable evidence about a specific software release.
