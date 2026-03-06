+++
author = "Jason Smith"
title = "Implementing Data-Aware Signing"
date = "2026-02-02"
linkedin = "https://www.linkedin.com/posts/j28smith_sbom-openssf-supplychainsecurity-activity-7424218592931405825-MBC5"
image = "img/thirdparty/2026-02-02-data-aware-sbom-signing.png"
+++

I recently argued that with SBOMs we need to stop signing the "container" (the file) and start signing the "content"
(the data). But how do we actually implement this without making verification a nightmare?

The answer lies in moving away from simple bit-for-bit hashing and toward Data-Aware Integrity. Here is the technical
breakdown of how we build a resilient chain of trust.

## 1. The Foundation: JCS

To sign data-aware JSON, you must first transform it into an "invariant format".
[RFC 8785: JSON Canonicalization Scheme (JCS)](https://www.rfc-editor.org/rfc/rfc8785) is the industry standard for
this. It ensures that no matter how a tool handles the file, the cryptographic input remains identical. The first
sentence of the RFC 8785 abstract says it all:

> Cryptographic operations like hashing and signing need the data to be expressed in an invariant format so that the
> operations are reliably repeatable.

The JCS process involves:

- **Deterministic Property Sorting:** Keys are sorted lexicographically (alphabetical or dictionary order).
- **Whitespace Removal:** All unnecessary spaces, tabs, and newlines are stripped.
- **Numeric Normalization:** Numbers are formatted consistently (1.0 vs 1).
- **Encoding:** The result MUST be encoded in UTF-8.

By running JCS before you hash, a minified SBOM and a pretty-printed SBOM result in the exact same signature.

## 2. Digital Signatures and the Role of JSF

CycloneDX natively supports **JSON Signature Format (JSF)** for document integrity, whereas the SPDX specification does
not explicitly define a standard for handling signatures. While SPDX typically relies on external, detached signature
files, CycloneDX allows for an **embedded signature** directly within the JSON structure.

A critical, albeit specialized, feature of JSF is **Property Exclusion**. This allows producers to cryptographically
lock the core components of an SBOM while leaving specific fields (such as vulnerabilities and VEX information)
unsigned. This enables security teams to enrich the SBOM with updated vulnerability context later in the lifecycle
without invalidating the original build-time signature.

How it works technically:

1. The producer defines a list of fields to be excluded from the signature.
2. During signing/verification, the tool removes these fields from the SBOM data.
3. The remaining data to be signed/verified is then passed through the JCS process to create the canonical hash.
4. The canonical hash is used to generate or verify the SBOM signature.

This ensures that the "facts" provided by the build system are cryptographically locked, even if the "context" around
them is enriched later in the lifecycle.

## 3. The "Embedded" Challenge

Because CycloneDX signatures can live inside the SBOM document itself, you have a recursive problem: you cannot sign or
verify a file directly that contains the signature itself. At a basic level, property exclusion is a functional
necessity and is implied for any embedded signature as the signature property itself must be excluded from the signing
and verification process to avoid a circular dependency during hashing.

This is why Data-Aware tools are a requirement as simple binary verifiers are structurally blind to the data model.

---

## Building the Standard

I am currently leading an initiative within the [OpenSSF](https://openssf.org/) SBOM Everywhere SIG to codify these
foundations into an SBOM Signing/Verification Best Practices Guide. We are moving past theory and into implementation.
We are building the reference implementations with "known-good" test vectors so the industry doesn't have to guess and
to ensure your tools are truly spec-compliant.

Want to see where we are? We currently have reference implementations completed in Go, Python, and Java, with
JavaScript and Rust coming soon (and other languages upon request).

💬👇 Comment "SBOM Signing Best Practices" below if you want a link to the current Work-in-Progress and the reference
code. Happy to get your feedback and input on this work while we are actively working on it.
