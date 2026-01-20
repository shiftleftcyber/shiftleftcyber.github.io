+++
author = "Jason Smith"
title = "Stop Signing the Container 📦, Start Signing the Content"
date = "2026-01-19"
linkedin = "https://www.linkedin.com/pulse/stop-signing-container-start-content-jason-smith-ofx4e"
image = "img/thirdparty/2026-01-19-stop-signing-container-start-signing-content.png"
+++

In my current work with the
**[OpenSSF](https://openssf.org/) <abbr title="Software Bill of Materials">SBOM</abbr> Working Group**, I am leading a
group to create a best practices guide for <abbr title="Software Bill of Materials">SBOM</abbr> signing. The #1 hill I'm
prepared to die on? **Canonicalization is a MUST HAVE**.

Today, most tools treat an <abbr title="Software Bill of Materials">SBOM</abbr> like a generic "binary blob". If an
<abbr title="Integrated Development Environment">IDE</abbr> changes 2-space indents to 4, the signature breaks. If you
change between a "pretty-print" version and a "minified" version, the signature breaks. That's because these tools are
signing the **formatting** (the container), not the **data** (the content).

## 🛠️ The <abbr title="JSON Canonicalization Scheme">JCS</abbr> Standard (RFC 8785)

For <abbr title="JavaScript Object Notation">JSON</abbr>-based <abbr title="Software Bill of Materials">SBOM</abbr>s,
the industry standard for fixing this is [RFC 8785: <abbr title="JavaScript Object Notation">JSON</abbr> Canonicalization
Scheme (<abbr title="JSON Canonicalization Scheme">JCS</abbr>)](https://www.rfc-editor.org/rfc/rfc8785). The very first
sentence of the abstract says it all:

> **Cryptographic operations like hashing and signing need the data to be expressed in an invariant format so that the
operations are reliably repeatable.** One way to address this is to create a canonical representation of the data.
Canonicalization also permits data to be exchanged in its original form on the "wire" while cryptographic operations
performed on the canonicalized counterpart of the data in the producer and consumer endpoints generate consistent results.

By using <abbr title="JSON Canonicalization Scheme">JCS</abbr>, we ensure that the
<abbr title="JavaScript Object Notation">JSON</abbr> is normalized (deterministic property sorting, no whitespace, etc.)
before the hash is calculated for signing and verification to generate consistent results.

## 🤯 The "Verification Guesswork" Problem

Without a canonical "invariant format," verification becomes a game of guesswork. In my own
<abbr title="Software Bill of Materials">SBOM</abbr> verification library, I've had to implement "multi-pass" logic just
to handle the lack of industry consistency.

My current "guesswork" workflow:

1. **The Standard Path:** Canonicalize the <abbr title="JavaScript Object Notation">JSON</abbr>, normalize the data,
remove the "noise", compute the hash, and verify.
2. **The Fallback (The "Blob" Guess):** If the standard path fails, attempt a raw binary blob verification on the file as-is.
3. **The Failure:** If both methods fail, I conclude the signature is invalid.

But even this is a simplified view. In reality, the guesswork goes deeper. If verification fails, I find myself trying to
"fix" the file to find the original state. Was the <abbr title="Software Bill of Materials">SBOM</abbr> minified prior to
signing but delivered as a pretty-print version? Were the <abbr title="JavaScript Object Notation">JSON</abbr> properties
re-ordered by a middle-man tool? Did some other non-standard normalization occur?

This **"verification tax"** is exactly what we are trying to solve. In a mature ecosystem, there should be one path to
trust. A consumer shouldn't have to play detective to determine whether a producer signed the **data** or the **file**.

By adopting **RFC 8785 (<abbr title="JSON Canonicalization Scheme">JCS</abbr>)**, we ensure that as long as the facts remain
the same, the signature remains valid with no guesswork required.

The core problems we need to solve are:

1. **🔄 Repeatability:** Identical data always yields the same hash.
2. **🤝 Interoperability:** A producer in one environment and a consumer in another will reach the same result.
3. **🛡️ Resiliency:** The signature survives a trip across different filesystems and tools.

### 🔄 Repeatability

This is the mathematical "ground truth." It ensures that regardless of how many times a file is processed, as long as the
underlying information is the same, the resulting hash is identical. Without an invariant format like
<abbr title="JSON Canonicalization Scheme">JCS</abbr>, the signature becomes "one-time-use," failing the moment the file
is re-saved or slightly altered. Repeatability transforms signing from a fragile snapshot into a reliable identity.

### 🤝 Interoperability

This is about breaking "tool-lock." True interoperability means that a producer using a Go-based tool on a Linux server
and a consumer using a Python-based verifier on a Windows machine will always reach the same conclusion. By performing
cryptographic operations on a standardized canonical counterpart, we remove "language bias" and ensure that the software
supply chain isn't dependent on a single vendor's implementation.

### 🛡️ Resiliency

This is the ability of a signature to survive the "real world." In a modern
<abbr title="Continuous Integration/Continuous Delivery">CI/CD</abbr> pipeline,
<abbr title="Software Bill of Materials">SBOM</abbr>s are moved across different filesystems, uploaded to cloud storage,
and opened by various security tools - all of which might change line endings, property orderings, or indentation.
Crucially, a resilient signature survives the transition between a 'minified' version used for machine efficiency and a
'pretty-printed' version used for human review. A resilient signature ignores these "atmospheric" changes to the file and
remains valid as long as the core data remains untouched, allowing the chain of trust to stay intact from build to production.

## 🌪️ Why CycloneDX is the Gold Standard for This

CycloneDX doesn't just "support" signing, it is built for **data-aware integrity**. While SPDX treats signing as an
afterthought or an external "wrapper", CycloneDX uses two built-in architectural features that make it uniquely resilient:
embedded signatures and property exclusion. Because these features are baked into the formal CycloneDX specifications,
supporting them is not optional, it is a mandate for any tool claiming spec-compliance.

### Embedded Signatures

In CycloneDX, the signature may live inside the <abbr title="Software Bill of Materials">SBOM</abbr>. This makes a
traditional "blob" verification mathematically impossible. To verify the file, a tool must:

1. "Reach in" and locate the signature block.
2. Extract that block before performing the verification math.

**The Catch:** Once you remove the signature block, you are left with a "hole" in the file. Do you remove the trailing
comma? The extra newline? The surrounding whitespace?

Without <abbr title="JSON Canonicalization Scheme">JCS</abbr>, you are back to guesswork.
<abbr title="JSON Canonicalization Scheme">JCS</abbr> solves this by providing a deterministic way to re-normalize the
remaining data, ensuring the hash matches the producer's original intent regardless of how the file was edited to remove
the signature.

### Property Exclusion

The CycloneDX signature specification explicitly allows for property exclusion. This means a producer can choose to
exclude specific fields or objects from the cryptographic hash while still maintaining a valid signature for the rest of
the document.

The debate over ***why*** or ***if*** a file should be re-signed after a change is a moot point here. The reality is
that because the specification supports exclusion, the signing and verification process must be built to handle it.

**Why this necessitates <abbr title="JSON Canonicalization Scheme">JCS</abbr>:** When a property is excluded during the
signing or verification process, you aren't just "skipping" a line of text. You are computationally removing a piece of
a data structure. This creates a fundamental problem for "blob" signing:

* How do you handle the remaining whitespace or commas?
* How do you ensure the remaining data is structured exactly as it was when the hash was first calculated?

If you treat the <abbr title="Software Bill of Materials">SBOM</abbr> as a "blob," any exclusion instantly breaks the
byte-for-byte match. <abbr title="JSON Canonicalization Scheme">JCS</abbr> is the only way to fulfill the CycloneDX
specification. It allows the verifier to strip the excluded properties and then re-normalize the remaining data into a
"canonical" state.

Without <abbr title="JSON Canonicalization Scheme">JCS</abbr>, a verifier cannot support one of the core features of the
CycloneDX integrity model. To be spec-compliant, you must be data-aware.

## 🛣️ The Road Ahead

While I've focused heavily on CycloneDX and <abbr title="JavaScript Object Notation">JSON</abbr>, these principles of
data-aware integrity are universal. To achieve true global scale, the same logic must be applied across all formats:

* **SPDX:** Because SPDX currently lacks an internal signing specification, it relies on external tools (like
[Cosign](https://github.com/sigstore/cosign)) to handle signing and verification. For the ecosystem to scale and remain
interoperable, these tools **MUST** adopt these same data-aware best practices. If external tools only sign the "blob,"
they inherit all the fragility discussed here.
* **XML:** The logic remains identical. For XML-based <abbr title="Software Bill of Materials">SBOM</abbr>s, we achieve
repeatability and resiliency by using c14n11 (Canonical XML Version 1.1) to normalize the data before hashing.

**The Bottom Line:** If our signatures aren't repeatable and resilient to formatting changes, the "Chain of Trust" is an
illusion. It will break the moment it hits a different developer's machine, a different cloud provider, or a different
<abbr title="Continuous Integration/Continuous Delivery">CI/CD</abbr> tool. We need to move toward a future where we
sign the **facts**, not the **formatting**.

**What's your take?** Should a signature survive a "Pretty Print" command, or is a bit-for-bit file match the only way?
Would love to hear your opinion, especially if you disagree. 💬👇
