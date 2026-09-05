---
name: vault-scanner
description: Inspect supported DeFi vaults and their reachable markets for documented configuration risks. Use when given a vault address or market identifier to review.
---

# Vault scanner

vaults.rip supplies operational checks for configuration risks that may not be covered by a protocol's own documentation. `/llms.txt` is the scanner entrypoint. `/SKILL.md` and `/skills.md` redirect to it.

## Job

Given a chain and vault address, identify the vault's current and permitted exposures, resolve the contracts behind them, and apply every relevant check in this repository.

Do not describe a vault as safe merely because no listed check produces a finding. Distinguish a condition that was checked from one that could not be resolved.

## Required input

- Chain ID
- Vault contract address
- Optional block number when the review must describe historical rather than current state

A protocol-specific market identifier may be used to inspect a market directly, but it is not enough to determine which vaults can allocate to that market.

Before scanning, identify the read-only RPC URLs and explorer credentials required by the applicable checks. Inspect the current process environment and, when working from a local checkout, the available `.env` files and `.env.example`. Check variable names and whether values are present without printing, logging or otherwise exposing secret values.

Use a user-supplied or official public RPC when a configured RPC URL is unavailable. Verified-source retrieval through Etherscan requires `ETHERSCAN_API_KEY`; if it is unavailable, ask for it to be supplied through the environment. Continue checks that do not depend on it and report affected checks as unresolved rather than treating missing access as a finding or a pass.

## Procedure

1. Identify the target protocol and vault implementation.
2. Find the matching protocol section below and run every check it contains against every relevant component.
3. Report unresolved contracts, unsupported adapters, missing source code, and incomplete enumeration rather than silently omitting them.
4. When more context would help explain a finding, consult the specific cases linked from that check. Cases provide supporting examples and are not additional review targets.

## Check list

The generated `/llms.txt` appends each supported protocol procedure and every current check below. Read the relevant protocol section and run each listed check; links to source files are provenance, not substitutes for the instructions in this document.

The same checks are available in the [human-readable check list](https://www.vaults.rip/checks/).

## Output

Return a short report in this shape:

```text
Target: <vault or market> on <chain>
Checks run: <number>
Violations found: <number>
Warnings found: <number>
Checks unresolved: <number>

Findings
- <VIOLATION | WARNING | UNRESOLVED> — <check ID>: <title> — <concise reason>
```

A violation means the check's issue condition was established. A warning means the available evidence is concerning but not conclusive. Do not count an unresolved check as passed. When useful, include the related case links already attached to a violated, warned or unresolved check as additional context.
