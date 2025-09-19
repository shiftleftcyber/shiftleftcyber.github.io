+++
author = "CC"
title = "The Temptation of Software Supply Chain Attacks"
date = "2025-01-12"
image = "img/thirdparty/supply_chain_attack.webp"
+++

Software supply chain attacks are a growing and highly tempting target for attackers. Unlike traditional attacks, which
typically focus on a specific entity—be it a business, government, individual, or non-profit organization—supply chain
attacks aim at a third-party dependency widely used by multiple entities. This strategy greatly expands the attacker's
reach, potentially affecting thousands of organizations through a single point of compromise.

## The XZ Utils Attack: A Cautionary Tale

A recent and alarming example is the XZ Utils attack from February 2024. XZ Utils, a common package present in most
Linux distributions, became the target of malicious actors. Given that Linux powers approximately 70% of global web
servers, the potential impact of this attack was significant. In this case, attackers added a backdoor to the liblzma
library, a component of XZ Utils, which enabled remote code execution capabilities. Fortunately, the attack was
mitigated early due to the swift discovery by Andres Freund. The compromised versions, 5.6.0 and 5.6.1, had not yet
been widely distributed at the time of detection, preventing a much larger disaster. Nonetheless, this incident
highlights the high stakes involved in securing software dependencies.

## Traditional vs. Supply Chain Attacks

Traditional attacks often involve a precise focus. Whether carried out by an individual hacker or a state-sponsored
group, the goal is to concentrate time and resources on breaching a single target. These attacks can be devastating but
are inherently limited in scope, as they impact only the specific entity being targeted. In addition organizations have
invested  heavily in ways to lessen the risk of targeted attacks such as firewalls, intrusion prevention and access
controls.

In contrast, supply chain attacks resemble casting a wide net into the ocean to see what can be caught. By compromising
a software package or dependency used by hundreds or thousands of projects—both commercial and open-source—attackers can
amplify their potential impact exponentially.

## The SolarWinds Attack: A Case Study in Scale

The SolarWinds attack of 2019/2020 remains one of the most infamous examples of a software supply chain attack. In this
case, attackers compromised the build systems responsible for producing the Orion IT management software. By injecting
a backdoor into the Orion updates, they turned a routine software update into a Trojan horse.

Organizations that downloaded and installed the compromised update (all in all it was close to 18,000 customers) 
including the U.S. government and numerous Fortune 500 companies—were left vulnerable. The attackers then analyzed
their "catch," identifying high-value targets to exploit further. This strategic use of supply chain attacks
demonstrates the power of targeting dependencies to scale an attack's reach.

## Why Supply Chain Attacks Are So Effective

The examples of XZ Utils and SolarWinds illustrate how supply chain attacks allow attackers to cast a broader net.
While they may not know exactly what they'll catch, the potential rewards often justify the effort. Once a successful
compromise is made, attackers can sift through their victims and prioritize high-value targets.

## Mitigating and Overcoming the Challenges of Supply Chain Attacks

While it is impossible to completely prevent supply chain attacks, organizations can take steps to mitigate the risks
and reduce their impact. One critical strategy is maintaining a clear understanding of what software and dependencies
are in use. This enables swift action when vulnerabilities are disclosed—for example, knowing whether your systems are
running a specific vulnerable version like liblzma v5.6.0 - v5.6.1.

Software Bill of Materials (SBOMs) can play a pivotal role in this process. An SBOM provides a detailed inventory of the
components within a piece of software. As a software producer, generating SBOMs for each build ensures an up-to-date
record of your product's dependencies. As a consumer, requesting SBOMs from suppliers allows you to maintain an
accurate list of the software in use within your organization. This transparency improves your ability to identify and
respond to vulnerabilities effectively.

However, the path to securing the software supply chain is fraught with challenges. Much of the software ecosystem
relies on open-source projects, many of which are maintained by unpaid volunteers. These contributors work on their own
terms, driven by passion rather than profit. As a result, security practices can vary widely, leaving some projects
more vulnerable than others.

Additionally, the sheer scale of dependencies in modern software makes comprehensive auditing a monumental challenge.
Organizations often rely on hundreds, if not thousands, of third-party libraries and tools, creating a sprawling attack
surface that is difficult to secure. Prioritizing security best practices, supporting open-source maintainers, and
fostering collaboration across the software community are essential steps toward mitigating these challenges.

## Conclusion

Supply chain attacks are not just a theoretical risk—they are an ever-present threat in the modern software landscape.
The XZ Utils and SolarWinds incidents serve as stark reminders of the damage that can be wrought when dependencies are
compromised. As attackers continue to refine their techniques, organizations must remain vigilant, prioritize security
best practices, and advocate for greater support and resources for the open-source community to mitigate these risks
effectively.
