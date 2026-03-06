+++
author = "Jason Smith"
title = "The SBOM Storage Tax: Optimization at Scale"
date = "2026-03-02"
linkedin = "https://www.linkedin.com/posts/j28smith_sbom-supplychainsecurity-finops-activity-7434359722511601665-DPTT"
image = "img/thirdparty/2026-03-02-sbom-storage-tax.png"
+++

Following my last post on the "Storage Tax" of binary blob signing, I received some insightful feedback from the
community. The common critique was:

> JSON minification doesn't really matter if you compress the JSON.

It's a valid point. Technically, compression will save far more than minification. But does the choice to sign the
"data" (allowing minification) still matter if we are just going to run it through Zstandard (zstd) anyway?

To find out, I ran a series of tests on the sample set of CycloneDX and SPDX SBOMs from my
[sbom-signing-best-practices](https://github.com/shiftleftcyber/sbom-signing-best-practices) GitHub repo. I compared
the storage footprints of pretty-printed files, minified files, and their compressed counterparts.

The data confirms the initial intuition, but only if you look at the surface-level percentages. Under the hood, there
is a "hidden" efficiency gain that still justifies a data-aware signing strategy.

## The Technical Reality Check

Based on my analysis of the test data, here is the breakdown of average storage savings:

- **Minification:** Reduced file size by ~32%.
- **Zstd Compression:** Reduced file size by ~79%.
- **The "Combo" (Minify + Zstd):** Reduced file size by ~81%.

At first glance, the "compression-only" camp seems to have won. Adding minification to the compression pipeline only
appears to save an additional 2% relative to the original file size.

**The 2% Trap:** While 2% of the total original file seems negligible, we don't pay for storage based on the original
file size. We pay based on the final compressed artifact. When we look at the results through a "FinOps" lens, that
small delta becomes more significant.

## The 11% Efficiency Gain

When we look at the final artifact size (the compressed file we actually pay to store), the story changes.

In my tests, applying minification before Zstandard compression resulted in a final file that was 11% smaller on
average than compressing the pretty-printed version. By stripping away the "entropy" of unnecessary whitespace and
newlines first, the compression algorithm can focus purely on data patterns, leading to a tighter result.

Let's scale that 11% efficiency gain to the requirements of the **EU Cyber Resilience Act (CRA)**:

1. **10-Year Retention:** You aren't storing one SBOM. You are storing a decade of build history. 11% savings today
compounded over time is a massive reduction in "whitespace debt" by year ten.
2. **Enterprise Scale:** For thousands of software products and services, each with daily or even per-commit builds,
this is the difference between manageable cold storage and a budget-breaking line item.
3. **Global Traffic:** 11% less data means lower egress costs for every audit and transfer.

In this context, an 11% reduction in your long-term storage footprint isn't just "technical elegance". It's a
significant reduction in operational overhead and "whitespace debt".

## The Recommended Storage Strategy

If you are locked into "Binary Blob Signing", you are effectively forbidden from fully optimizing your data. To keep
that signature valid for a decade, you must store the compressed "Pretty-Printed" version. As a result, you are paying
an 11% storage tax indefinitely.

To avoid the storage tax, our recommended strategy for long-term SBOM retention is:

1. **Implement Data-Aware Signing:** Stop signing the container (the file) and start signing the "Facts" (the
canonicalized data).
2. **Minify + Compress for Storage:** Use JSON minification to strip out the structural overhead and a modern algorithm
like Zstandard on the minified version of the SBOM to reach peak efficiency.

This approach ensures that your signatures are resilient to formatting changes while your storage is optimized for the
next 10 years of compliance.

## Final Remarks

I initially brought up the storage topic during my last presentation at the [OpenSSF](https://openssf.org/) SBOM
Everywhere SIG meeting when presenting my findings on SBOM signing best practices and it sparked an immediate shift
in the conversation. A special thank you to [Kate Stewart](https://www.linkedin.com/in/katestewartaustin/) for
inviting me to the SPDX tech call to give the same presentation there. And thanks to the OpenSSF SBOM Everywhere SIG
members and the SPDX Tech call members for all the feedback that prompted this deeper dive.

We are moving toward a world where signing the "Facts" isn't just more secure, it's cheaper.

**The benchmark is being set.** Are you signing the container, or are you signing the data?
