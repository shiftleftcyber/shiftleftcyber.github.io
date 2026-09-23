+++
author = "Jason Smith"
title = "SLSA Secures the Build. Who Secures the SBOM?"
date = "2026-09-23"
description = "SLSA provides verifiable build provenance. SecureSBOM protects the authenticity and integrity of the SBOM delivered with the software."
image = "img/thirdparty/2026-09-23-slsa-and-securesbom.png"
+++

Modern software supply chain security is built on evidence.

Organizations need confidence in what software contains, where it came from, how it was built, and whether the
information describing it can be trusted. That is why [SLSA](https://slsa.dev/) and SecureSBOM belong in the same
conversation.

They do not solve the same problem.

**SLSA provides verifiable evidence about how a software artifact was produced. SecureSBOM provides cryptographic
evidence that the SBOM a producer signed is authentic and has not been changed.**

Used together, they extend trust from the build process into the software supply chain documentation shared with
customers, partners, regulators, and downstream consumers.

## SLSA Protects the Build

SLSA, or Supply-chain Levels for Software Artifacts, is a framework for incrementally improving software supply chain
security. Its build track defines increasing levels of assurance for build provenance and the build platform that
produces it.

That provenance can identify the source, builder, build process, inputs, and resulting artifact. A consumer can verify
the provenance and compare it with policy for an expected release.

SLSA helps answer an important question:

> **Was this artifact produced from the expected source by the expected build process?**

The exact assurance depends on the SLSA level, the build platform, and whether the consumer verifies the provenance.
But the purpose is clear: make the journey from source to artifact visible and verifiable.

The artifact is only one part of a modern software release.

Increasingly, producers also distribute a Software Bill of Materials alongside it.

## SecureSBOM Protects the SBOM

An SBOM may travel much farther than the environment where it was generated.

It may be uploaded to customer portals, stored in artifact repositories, sent to regulators, exchanged with partners,
consumed by vulnerability management systems, or retained for years as compliance evidence.

Once the SBOM leaves the producer's environment, another question emerges:

> **Is this the SBOM the identified producer actually signed, and has its signed content changed?**

That is where SecureSBOM fits.

SecureSBOM cryptographically signs SBOMs so downstream consumers can verify their authenticity and integrity. For
supported CycloneDX SBOMs, the signature can be embedded directly in the SBOM so it travels with the document.
SecureSBOM also supports detached signatures where the format or distribution model requires them.

This proves that the signed content has not been altered since signing and identifies the signing key used. It does not,
by itself, prove that an SBOM is complete or that every fact inside it is correct. Those properties depend on how the
SBOM was generated and validated.

That distinction matters. Trustworthy evidence starts with precise claims.

## Two Different Layers of Trust

SLSA and SecureSBOM address complementary parts of the software delivery chain:

**Source → Build → Software Artifact → SBOM → Consumer**

SLSA provides evidence about the path from source to artifact.

SecureSBOM preserves verifiable authenticity and integrity as the SBOM moves from the producer to downstream
consumers.

One does not replace the other. Strong build provenance does not automatically protect a separately distributed SBOM.
A signed SBOM does not establish how the accompanying software was built.

## Why Both Matter

Imagine a producer generates SLSA provenance for every software release and publishes a CycloneDX SBOM alongside it.

The provenance may provide strong evidence about how the software artifact was created. But if the accompanying SBOM
is later modified, replaced, or distributed through another channel, a consumer still needs a reliable way to determine
whether it is the SBOM the producer signed.

Signing the SBOM closes that gap.

The producer can distribute:

- **Software artifact** identified by an immutable digest
- **SLSA provenance** describing how that artifact was produced
- **Signed SBOM** describing the artifact's components

The consumer can then verify the artifact's provenance and independently verify the SBOM's integrity and authenticity.

Verification policy should also bind the evidence together. The artifact digest referenced by the provenance should be
the artifact being evaluated, and the SBOM should identify that same release or artifact. Otherwise, three individually
valid files could still describe different things.

## Preserve Trust Beyond the Build

Software supply chain trust should not end when the build completes.

SLSA provides a foundation for verifiable software provenance. SecureSBOM extends verifiable evidence to one of the
most important documents accompanying modern software: the SBOM.

**SLSA helps prove how software was built.**

**SecureSBOM helps prove that the SBOM a consumer received is the SBOM the producer signed.**

Together, they provide complementary layers of trust across increasingly complex software supply chains.

See the full [SLSA and SecureSBOM overview](/securesbom/slsa-and-securesbom/) for a side-by-side explanation of their
roles, evidence, and verification boundaries.
