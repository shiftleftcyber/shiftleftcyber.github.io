+++
author = "Jason Smith"
title = "🔀 Convergence in SBOM Signing"
date = "2026-03-16"
linkedin = "https://www.linkedin.com/posts/j28smith_cyclonedx-spdx-sbom-activity-7436868417690746881-Ywy6/"
image = "img/thirdparty/2026-03-16-convergence-in-sbom-signing.png"
+++

"Don't roll your own crypto." It's the first rule of security engineering, and it turns out it's also the best way to
build a global standard. 🤝

The last few weeks of work on SBOM Signing Best Practices have been a masterclass in the power of open-source
community collaboration. What started as a technical draft has evolved into real-time alignment between
[CycloneDX](https://cyclonedx.org/) and [SPDX](https://spdx.dev/).

Here are the major updates and lessons learned:

## 1️⃣ From JSF to JSS (The CycloneDX Evolution)

While CycloneDX currently uses [JSF (JSON Signature Format)](https://cyberphone.github.io/doc/security/jsf.html), a
conversation with [Steve Springett](https://www.linkedin.com/in/stevespringett/) led me to the authors of the specs,
[Anders Rundgren](https://www.linkedin.com/in/andersrundgren/) and
[Bret Jordan, MS, CISSP](https://www.linkedin.com/in/bretjordan/).

I learned JSF evolved into [JSS (JSON Signature Scheme)](https://www.itu.int/rec/T-REC-X.590/en), which was formally
standardized by the [ITU](https://www.itu.int/) as [X.590](https://www.itu.int/rec/T-REC-X.590/en). With CycloneDX
moving toward JSON-only in v2 later this year, it was the perfect time to suggest a move to this formal standard. Steve
agreed, and a PoC is already in the works to make JSS the signature standard for the next generation of CycloneDX. 🚀

🔗 Track the Issue Here:
[https://github.com/CycloneDX/specification/issues/851](https://github.com/CycloneDX/specification/issues/851)

## 2️⃣ Bringing Consistency to SPDX

Following a presentation to the [OpenSSF](https://openssf.org/) SBOM Everywhere SIG,
[Kate Stewart](https://www.linkedin.com/in/katestewartaustin/) invited me to share these findings with the SPDX Tech
Call. The feedback was fantastic and has led to new initiatives within the SPDX model:

SPDX is considering using JCS for underlying data consistency.

🔗 Track the Issue Here:
[https://github.com/spdx/spdx-spec/issues/1362](https://github.com/spdx/spdx-spec/issues/1362)

SPDX is exploring JSS (X.590) as an option for introducing cryptographic signatures to the SPDX 3.0 model.

🔗 Track the Issue Here:
[https://github.com/spdx/spdx-3-model/issues/1065](https://github.com/spdx/spdx-3-model/issues/1065#issuecomment-3953855076)

## 3️⃣ The Road to Formal Standardization (ITU)

A common concern with new specs is "Who owns this"? I'm excited to share that Bret Jordan is also leading an initiative
to formally standardize JCS within the ITU.

Moving JCS to a formal ITU standard provides the regulatory-grade foundation that global enterprises and governments
require for long-term supply chain trust.

## 🤔 Why This Matters: A Unified Path

The technical stars are aligning. By leveraging JSS and JCS, we are building a unified path for the industry.

**🎯 Core Support:** JCS is heavily used across many industries. It was recently added as a core function in Go with
existing libraries available in many other languages, enabling dependency-light implementations.

**🔁 Interoperability:** This drives consistency between SPDX and CycloneDX, offering a standardized approach that
works across the entire software supply chain.

**🙅‍♂️ No Custom Logic:** This approach leverages existing, supported international standards rather than
"rolling our own".

A huge thank you to the open source community on the collaboration and the sanity checks on this journey.

The benchmark for SBOM integrity is being built right now. Are you ready for a standardized future?

\#SBOM #SupplyChainSecurity \#Cryptography \#JCS \#JSS
