---
title: "SLSA and SecureSBOM"
description: "Learn how SLSA build provenance and SecureSBOM signing provide complementary evidence for software artifacts and the SBOMs that describe them."
date: 2026-09-23
draft: false
---

SLSA and SecureSBOM protect different parts of the software supply chain.

**SLSA provides verifiable evidence about how a software artifact was produced. SecureSBOM provides cryptographic
evidence that the SBOM a producer signed is authentic and has not been changed.**

Used together, they extend verifiable trust from the build process to the SBOM delivered to customers, partners,
regulators, and downstream consumers.

---

## Primary Purpose

| Technology | Primary Question |
|---|---|
| **SLSA** | Was this artifact produced from the expected source by the expected build process? |
| **SecureSBOM** | Is this the SBOM the identified producer signed, and has its signed content changed? |

---

## Evidence Provided

| Technology | Evidence |
|---|---|
| **SLSA** | Build provenance describing the artifact, source, builder, build process, and inputs, with assurance increasing by SLSA level. |
| **SecureSBOM** | A cryptographic signature over the SBOM's signed content, with the information required to identify the signing key and verify integrity. |

---

## Protected Object

| Technology | Focus |
|---|---|
| **SLSA** | The software artifact and the process used to produce it. |
| **SecureSBOM** | The SBOM document distributed with or independently from the software artifact. |

---

## What Verification Establishes

| Technology | Verification Result |
|---|---|
| **SLSA** | The provenance is authentic, applies to the artifact being evaluated, and can be checked against an expected source, builder, and build policy. |
| **SecureSBOM** | The SBOM's signed content has not changed since signing and the signature can be traced to the identified signing key. |

---

## What It Does Not Establish by Itself

| Technology | Boundary |
|---|---|
| **SLSA** | Build provenance does not automatically authenticate a separately distributed SBOM or prove that its contents are complete. |
| **SecureSBOM** | An authentic, unmodified SBOM is not necessarily complete or factually correct, and its signature does not establish how the software artifact was built. |

---

## How They Work Together

A release can carry three complementary pieces of evidence:

1. **Software artifact** identified by an immutable digest
2. **SLSA provenance** describing how that artifact was produced
3. **Signed SBOM** describing the artifact's components

The evidence should be bound to the same release or artifact. Consumers should verify the artifact digest in the
provenance, confirm the expected source and builder, verify the SBOM signature, and confirm that the SBOM describes the
artifact being evaluated.

This creates a broader chain of verifiable evidence:

**Source → Build → Software Artifact → SBOM → Consumer**

SLSA strengthens the path from source to artifact. SecureSBOM helps preserve the authenticity and integrity of the SBOM
as it moves from producer to consumer.

---

## Summary

- **SLSA** establishes progressively stronger assurance for build provenance and build systems.
- **SecureSBOM** provides SBOM-specific signing and verification, including embedded signatures for supported CycloneDX SBOMs and detached signatures where required.
- **Together**, they let consumers verify both how software was produced and whether its accompanying SBOM is the one the producer signed.

---

Want to learn more?

- [Read: SLSA Secures the Build. Who Secures the SBOM?](/blog/2026-09-23-slsa-secures-build-who-secures-sbom/)
- [SecureSBOM Overview](/securesbom/)
- [Open the SecureSBOM Portal](https://app.securesbom.com/)
- [SLSA Project](https://slsa.dev/)
