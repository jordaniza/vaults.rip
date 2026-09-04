---
name: vault-scanner
description: Inspect supported DeFi vaults and their reachable markets for documented configuration risks. Use when given a vault address or market identifier to review; currently supports Morpho Vault V2 only.
---

# Vault scanner

## Job

Given a chain and vault address, identify the vault's current and permitted exposures, resolve the contracts behind them, and apply every relevant check in this repository.

Do not describe a vault as safe merely because no listed check produces a finding. Distinguish a condition that was checked from one that could not be resolved.

## Scope

Only Morpho Vault V2 is supported for now. The workflow is intended to extend to other vault protocols and implementations, but their interfaces and allocation models must be handled explicitly rather than assumed to match Morpho.

If the target is a Morpho Vault V1, another vault implementation, or cannot be identified, report it as unsupported and stop before applying the Morpho V2 procedure.

## Required input

- Chain ID
- Vault contract address
- Optional block number when the review must describe historical rather than current state

A Morpho market ID may be used to inspect a market directly, but it is not enough to determine which vaults can allocate to that market.

## Procedure

1. Identify the target protocol and vault implementation.
2. Read the applicable vaults.rip protocol skill. Load the official protocol skill or documentation it delegates to for current mechanics, interfaces and data access.
3. Resolve both current allocations and destinations that the vault is permitted to allocate into.
4. Apply every check linked by the protocol skill to each relevant component.
5. Report unresolved contracts, unsupported adapters, missing source code, and incomplete enumeration rather than silently omitting them.

## Supported protocol

- For Morpho Vault V2, read [`skills/morpho-v2/SKILL.md`](skills/morpho-v2/SKILL.md). It delegates protocol mechanics and data access to Morpho's maintained sources, then routes the result through the vaults.rip checks.

## Shared skills

Load these only when the protocol procedure requires them:

- Read [`skills/smart-contracts/SKILL.md`](skills/smart-contracts/SKILL.md) when resolving contract behavior, control, or upgradeability.
- Read [`skills/etherscan/SKILL.md`](skills/etherscan/SKILL.md) when retrieving bytecode or verified source through Etherscan's API.

Foundry tests are not required for a scan. The repository may include optional tests that illustrate a check; when one is useful, follow the instructions in the [examples guide](https://github.com/jordaniza/vaults.rip/blob/main/examples/README.md).
