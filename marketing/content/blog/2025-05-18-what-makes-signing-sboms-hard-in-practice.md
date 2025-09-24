+++
author = "Jason Smith"
title = "🔐 What Makes Signing SBOMs Hard in Practice?"
date = "2025-05-18"
linkedin = "https://www.linkedin.com/posts/j28smith_sbom-supplychainsecurity-softwaresecurity-activity-7333912094414618624-AB-Y"
image = "img/thirdparty/2025-05-18-hidden-complexity-sbom-signing.jpeg"
+++

Everyone agrees SBOMs should be signed.

But actually doing it? That's where things get messy.

Let's talk about why.

🔑 Key Management Is Not Fun

Where do the keys live?  Are they stored in software or secured in hardware (HSMs)?  Who manages them and who has access?  How are they rotated?  Is there proper auditability?

⚖️ Trust Models Are Inconsistent

Are you using your internal CA? A third-party like Sigstore?  Something else?  What do consumers actually trust?

🔄 CI/CD Integration Isn't Always Straightforward

You need to sign automatically as part of your pipeline, but build tools, permissions, and environments vary wildly.

👤 Identity Binding Matters

It's not just that something was signed, but who signed it? And verifying that identity isn't always easy.

🏢 Enterprises Want Control

Many larger organizations hesitate to use public, community-run signing services. They want auditability, offline modes, and policy enforcement.

Signing is essential for SBOM integrity but we need to make it realistically adoptable.

There's no one-size-fits-all approach here - and that's okay.

Would love to hear how others are tackling SBOM signing today.  What's worked for you?  What hasn't?  Are we even there yet?

💬👇 Drop a comment or DM me. Always happy to chat.

#SBOM #SupplyChainSecurity #SoftwareSecurity #DigitalSignatures #PKI #DevSecOps #OpenSourceSecurity #SBOMSigning #CyberSecurity
