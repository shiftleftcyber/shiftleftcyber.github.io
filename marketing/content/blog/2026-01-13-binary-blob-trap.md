+++
author = "Jason Smith"
title = "The Binary Blob Trap in SBOM Signing 🪤"
date = "2026-01-13"
linkedin = "https://www.linkedin.com/pulse/binary-blob-trap-sbom-signing-jason-smith-rwfhe/"
image = "img/thirdparty/2026-01-13-sbom-binary-blob-trap.png"
+++

Is the industry's favourite <abbr title="Software Bill of Materials">SBOM</abbr> signing tool actually creating a
verification nightmare? 🤔

While the industry is slowly waking up to <abbr title="Software Bill of Materials">SBOM</abbr> signing, we've completel
ignored the other side of the coin: Verification. We rarely talk about the "Verification Tax" we're placing on the
consumer - and it's a tax that most organizations aren't prepared to pay. 💸

Currently, the most popular tool in the shed, [Cosign](https://github.com/sigstore/cosign), treats an
<abbr title="Software Bill of Materials">SBOM</abbr> as a generic binary blob. This makes sense for container images
(where layers are immutable), but it's a mismatch for the "living document" nature of an
<abbr title="Software Bill of Materials">SBOM</abbr>. Cosign hashes the file as-is and creates a detached signature (a
separate file). This is a requirement for [SPDX](https://spdx.dev/), but [CycloneDX](https://cyclonedx.org/) also allows
for embedded signatures (the signature lives inside the <abbr title="Software Bill of Materials">SBOM</abbr> itself).
Because Cosign lacks the internal context of the <abbr title="Software Bill of Materials">SBOM</abbr> structure, it
simply isn't built to handle these embedded signatures. 🛠️

## ⚠️ The Problem

Software data is rarely immutable. If a developer opens the file and their IDE automatically applies a style preference
(ie. re-ordering properties, changing 2-space indents to 4, or even just adding a trailing newline) the "blob" has
changed. The semantic content is identical, but the cryptographic signature is now invalid. ❌

## 😰 The CycloneDX Complication

Unlike SPDX, CycloneDX allows signatures to be "embedded" directly inside the
<abbr title="Software Bill of Materials">SBOM</abbr> file itself. This is elegant (and I prefer it), but it creates a
mathematical puzzle: you cannot include the signature itself in the data used to create the hash. To verify it, you need
<abbr title="Software Bill of Materials">SBOM</abbr>-aware tooling that knows how to "reach in" and ignore the signature
block before checking the math. It's a step many generic tools simply aren't built to handle. 🧩

## 💡 The Solution

If we want <abbr title="Software Bill of Materials">SBOM</abbr> signing to scale in 2026, we have to stop signing
"files" and start signing "data." This requires a three-step standard process:

### 1️⃣ Canonicalize & Normalize

Force the JSON/XML into a strict, repeatable format (like [JCS - RFC 8785](https://www.rfc-editor.org/rfc/rfc8785)).
This ensures alphabetical ordering and zero whitespace, regardless of which tool generated the file.

### 2️⃣ Remove the Noise

Explicitly exclude the signature block and (optionally) other volatile properties. This allows the
<abbr title="Software Bill of Materials">SBOM</abbr> to be "enriched" with new data (like VEX) downstream without
destroying the original integrity.

### 3️⃣ Sign the Normalized Hash

Only then do you create a signature that can actually survive a trip across different systems - creating a repeatable
pattern that makes verification instant and reliable without any guesswork.

This three-step process is standard for almost every mature signing/verification protocol in existence. So how did it
get overlooked for <abbr title="Software Bill of Materials">SBOM</abbr>s? 🤨

## 📌 The Bottom Line

Signing is the easier part. But if the verification process doesn't perfectly mirror the signing process, the chain of
trust breaks the moment the file hits a different filesystem. ⛓️💥

Are we over-simplifying <abbr title="Software Bill of Materials">SBOM</abbr> integrity by relying on "blob signing"? Was
this an oversight in the current specs or just the path of least resistance? Without standardized signing and
verification protocols for <abbr title="Software Bill of Materials">SBOM</abbr>s, SBOM signing will never achieve the
scale or interoperability the industry needs in 2026. 🧐

What's your take? Is SBOM "blob signing" good enough, or are we headed for a verification crisis? 💬👇

\#SBOM \#SupplyChainSecurity \#CycloneDX \#SPDX \#AppSec \#DevSecOps \#JCS \#Interoperability \#CyberResilienceAct
\#DigitalTrust \#CISA \#Cryptography
