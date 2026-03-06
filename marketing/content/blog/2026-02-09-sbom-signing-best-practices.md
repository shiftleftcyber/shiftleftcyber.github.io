+++
author = "Jason Smith"
title = "🚨 Call for Feedback: A Standardized Approach to SBOM Signing"
date = "2026-02-09"
linkedin = "https://www.linkedin.com/posts/j28smith_openssf-sbom-supplychainsecurity-activity-7426752007064985600-5cMX"
image = "img/thirdparty/2026-02-09-sbom-signing-best-practices.png"
+++

> The new benchmark by which all SBOM signing and verification tools will be judged.

This Friday February 13th @ 11:00 EST I'll be presenting the initial draft of the SBOM Signing & Verification Best
Practices Guide at the [OpenSSF](https://openssf.org/) SBOM Everywhere SIG meeting. This initial draft focuses on the
methods used to compute the hash of an SBOM for signing and verification.

The goal? To move the industry away from fragile "binary blob" signatures and toward data-aware integrity so we have a
standardized system that truly scales across different platforms and vendor implementations. It is also a necessity to
properly support the CycloneDX specification to have full interoperability.

I've been heads-down on the reference implementations, and I'm excited to share that the JSON foundation is now largely
complete. We have working code in Go, Java, JavaScript, Python, and Rust that proves we can maintain SBOM trust
regardless of formatting.

## ✅ The "Pretty-Print" vs "Minify" Tests Pass

In our test suite, we took original SBOMs (both CycloneDX and SPDX), ran them through various "pretty-print" and
"minify" cycles, and proved that the computed hash remains identical every time. No more broken signatures because of
a 2-space indent change or an added/removed newline.

### 🧐 What's in the WIP?

**JCS Integration:** Full support for RFC 8785 *"permits data to be exchanged in its original form on the 'wire' while
cryptographic operations performed on the canonicalized counterpart of the data in the producer and consumer endpoints
generate consistent results"*.

**Format Agnostic:** Support for CycloneDX and SPDX JSON structures, including embedded signatures and property exclusion
in JSF for CycloneDX.

**Language Diversity:** Reference implementations across 5 major ecosystems (Go, Java, JavaScript, Python, Rust).

**The XML Frontier:** I'll be sharing my early findings on why W3C Exclusive C14N canonicalization isn't enough for
XML-based SBOMs and some thoughts on how to approach XML normalization. However, the core focus for Friday will be on
the JSON method.

## 🫵 Join the Discussion

I want your eyes on this. Whether you are a tool-builder, a security engineer, or a compliance officer, your feedback
is critical to ensuring this standard is adopted and works in the real world.

I want to hear from the supporters and the critics alike. If you love the approach, help us refine it. If you hate it,
come tell me why. The only way we build a truly resilient standard is by stress-testing it against every perspective
before it's finalized.

### 📅 OpenSSF Calendar

[https://calendar.google.com/calendar/u/0/embed?src=s63voefhp5i9pfltb5q67ngpes@group.calendar.google.com](https://calendar.google.com/calendar/u/0/embed?src=s63voefhp5i9pfltb5q67ngpes@group.calendar.google.com)

### 🕚 Meeting Time

Friday February 13th @ 11:00 EST

### 🔗 Zoom Link

[https://calendar.google.com/calendar/u/0/embed?src=s63voefhp5i9pfltb5q67ngpes@group.calendar.google.com](https://calendar.google.com/calendar/u/0/embed?src=s63voefhp5i9pfltb5q67ngpes@group.calendar.google.com)

### 🔗 GitHub WIP

[https://github.com/shiftleftcyber/sbom-signing-best-practices/tree/initial-setup](https://github.com/shiftleftcyber/sbom-signing-best-practices/tree/initial-setup)

If you are unable to make it and want to discuss directly just let me know. Take a look through the GitHub repo,
gather your thoughts and feedback, and then connect with me to book a time to discuss further.

Let's stop signing the formatting and start signing the facts. Hope to see you Friday!
