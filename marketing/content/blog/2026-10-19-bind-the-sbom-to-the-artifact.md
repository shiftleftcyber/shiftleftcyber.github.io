+++
title = "A Valid Signature Is Not Enough: Bind the SBOM to the Artifact"
date = "2026-10-19"
description = "AWS's ML-DSA example exposes an important SBOM security gap: integrity is not the same as artifact identity. Here is what SecureSBOM should add next."
image = "img/thirdparty/2026-10-19-bind-the-sbom-to-the-artifact.png"
+++

A signed Software Bill of Materials answers an important question:

> **Has this SBOM changed since an authorized key signed it?**

It does not necessarily answer a second question:

> **Is this SBOM about the exact software artifact I am evaluating?**

That distinction is the most useful lesson in AWS's recent article,
[Quantum-resistant signing on AWS, Part 1](https://aws.amazon.com/blogs/security/quantum-resistant-signing-on-aws-part-1-build-a-software-supply-chain-with-ml-dsa/).
The post presents a broad post-quantum software supply chain architecture using ML-DSA, AWS KMS, AWS Private CA, IAM
Roles Anywhere, and OCI registries. Its SBOM design is valuable even for teams that are not ready to adopt ML-DSA or
build the rest of that AWS architecture.

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

That final boundary matters. A valid attestation proves that the identified signer made the claim, that the signed claim
has not changed, and that it names a particular artifact. It does not automatically prove that the claim is true or that
the SBOM is complete. The quality of the evidence and the authority of the signer must still be evaluated.

## What AWS Is Doing

AWS begins with a CycloneDX SBOM generated for a container image addressed by its immutable manifest digest. It then
places that SBOM inside an [in-toto Statement](https://github.com/in-toto/attestation/blob/main/spec/v1/statement.md).

The Statement contains three important elements:

- a `subject` that identifies the container image by its SHA-256 digest;
- a `predicateType` that identifies the predicate as a CycloneDX SBOM; and
- a `predicate` containing the SBOM itself.

AWS signs the complete Statement with an ML-DSA key held in AWS KMS. The image digest is therefore inside the signed
bytes. An attacker cannot replace the digest or the SBOM without invalidating the signature.

The Statement and signature are then attached to the container image as an OCI referrer. OCI referrers make related
artifacts discoverable in a registry, but discovery is not the security boundary. A publisher controls the referrer's
`subject` field, so that field alone does not prove that the SBOM belongs to the image. The cryptographic binding comes
from the artifact digest inside the signed in-toto Statement.

Verification must consequently perform two checks:

1. Verify the signature over the Statement using a trusted public key and algorithm policy.
2. Confirm that the Statement's subject digest equals the digest of the artifact being admitted or deployed.

Both checks must pass. A valid signature for the wrong artifact must fail policy.

## How SecureSBOM Works Today

SecureSBOM currently signs the SBOM document itself.

For CycloneDX and AI-BOM JSON, SecureSBOM supports embedded, data-aware signatures. For SPDX JSON, it supports a
detached signature. The current v2 path canonicalizes JSON before hashing and signing, which allows verification to
focus on the data instead of inconsequential changes to whitespace or property order.

That is stronger than treating the SBOM as an opaque byte blob. It provides portable, format-aware proof that the
signed SBOM content has not changed.

But the signature's claim ends at the SBOM boundary. SecureSBOM does not currently require an immutable digest for the
software artifact described by the SBOM, place that digest beside the SBOM inside one signed envelope, or require the
verifier to compare it with the artifact under evaluation.

This leaves a substitution gap. Suppose a producer has two releases:

- release A has no known vulnerable component and has a valid signed SBOM;
- release B contains a vulnerable component and also has a valid signed artifact; and
- an attacker presents release A's valid SBOM beside release B.

The SBOM signature still verifies. It proves that the SBOM is authentic, but it does not prove that the SBOM describes
release B.

Names, tags, filenames, versions, download paths, and registry attachment metadata do not fully solve this problem.
They are mutable labels or unsigned associations. An immutable artifact digest placed inside the signed claim does.

## Integrity, Identity, and Discovery Are Different Controls

It helps to separate the three properties involved:

| Control | What it proves | What it does not prove |
|---|---|---|
| SBOM signature | The SBOM is authentic and unchanged | The SBOM belongs to the artifact being verified |
| Signed subject digest | The claim is bound to one immutable artifact | Where the attestation is stored or found |
| OCI referrer | The registry can discover related metadata beside an image | That the relationship is trustworthy |

AWS combines all three. SecureSBOM already has the first control. The next useful version should add the second and
support the third as a distribution option.

## What SecureSBOM Should Add Next

The existing SecureSBOM architecture is a practical foundation for an artifact-bound signing mode. It already has
versioned signing and verification APIs, JSON canonicalization, managed signing keys, detached-signature support, and
an offline Go verifier. This is an extension of the trust claim, not a reason to replace the current product.

A next version should introduce a first-class **SBOM attestation** contract with the following properties:

1. **Require an immutable subject digest.** The request should accept a normalized artifact identity with a supported
   digest algorithm, initially SHA-256. Container images should be resolved by manifest digest before signing. Tags
   should never be signed as the security identity.
2. **Use a standard envelope.** An in-toto Statement v1 is a strong fit because it explicitly binds a predicate to one
   or more immutable subjects. SecureSBOM should avoid inventing a proprietary wrapper.
3. **Preserve data-aware SBOM handling.** The SBOM predicate should retain SecureSBOM's format validation and
   deterministic JSON handling. The complete Statement also needs one documented canonicalization and signing profile
   so independent implementations sign and verify the same bytes.
4. **Verify the expected subject, not merely the signature.** The verifier API and offline CLI should require the
   caller's expected artifact digest. Missing or mismatched subjects must fail closed with a distinct result.
5. **Keep storage separate from trust.** The signed attestation may be returned to the caller, stored by SecureSBOM,
   or published as an OCI referrer. Registry publication is useful, but the signed Statement remains the source of
   truth.
6. **Version the change.** Existing CycloneDX, SPDX, and AI-BOM signatures should remain verifiable. Artifact-bound
   attestations should be an explicit new mode or API version rather than a silent change to existing signature
   semantics.

The minimum verification result should distinguish at least:

- signature valid or invalid;
- signing key trusted or untrusted;
- predicate type supported or unsupported;
- subject digest present or missing; and
- subject digest matched or mismatched.

Collapsing these outcomes into a single `verified: true` value would invite consumers to treat signature validity as a
complete authorization decision.

## What Should Not Be Copied Blindly

AWS's example is an architecture demonstration, not a universal SecureSBOM specification.

ML-DSA is important for long-lived software and post-quantum planning, but artifact binding and post-quantum
cryptography are separate design decisions. SecureSBOM can add the binding now with its existing managed ECDSA keys,
then add vetted post-quantum algorithms when the key providers, certificate model, interoperability requirements, and
customer policies are ready.

Likewise, OCI should not become the only supported transport. SecureSBOM serves SBOMs that accompany containers,
binaries, packages, firmware, and other artifacts. The in-toto subject model applies to all of them, while OCI
referrers are especially useful for registry-hosted objects.

The AWS walkthrough also signs a serialized Statement. SecureSBOM's existing focus on deterministic, data-aware JSON
means a new signing profile needs an explicit canonicalization rule. Without one, harmless reserialization could break
verification or different implementations could disagree about the signed representation.

Finally, a cryptographically bound SBOM can still be incomplete or factually wrong. The attestation proves who made a
claim, that the claim has not changed, and which artifact the claim names. It does not prove that the SBOM generator
found every component. Generation quality, validation, signing identity, and verification policy remain separate
layers.

## The Next Trust Boundary

SecureSBOM's current signatures answer, "Is this the SBOM the signer approved?"

An artifact-bound attestation adds, "Is this the SBOM the signer approved **for this exact artifact**?"

That is a meaningful next step. It closes a real substitution risk, fits the existing SecureSBOM signing and verifier
architecture, and uses standards that work beyond a single cloud or registry.

The durable design is not "attach an SBOM to an image." It is:

> **Identify the artifact by digest, place that identity and the SBOM in one signed claim, verify both the signature
> and the subject, then use the registry to make the claim discoverable.**

That turns an authentic document into evidence about a specific software release.
