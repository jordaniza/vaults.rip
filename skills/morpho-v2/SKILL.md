---
name: morpho-v2-vault-scanner
description: Apply vaults.rip configuration-risk checks to a Morpho Vault V2 after resolving its structure with Morpho's official documentation. Use only for Morpho Vault V2 reviews.
---

# Morpho Vault V2

## Scope

This procedure supports Morpho Vault V2 only. If the target is Vault V1 or cannot be identified, return to the root skill's unsupported-target rule.

Morpho maintains the protocol mechanics, contract interfaces, addresses, APIs and SDK guidance. Do not reproduce them here.

## Read Morpho

Start at [Morpho's `llms.txt`](https://docs.morpho.org/llms.txt). Select the pages needed to identify the vault and retrieve its current configuration, then fetch their raw Markdown versions by appending `.md` to the documentation URL.

Use [Morpho's full documentation corpus](https://docs.morpho.org/llms-full.txt) only when the targeted pages do not provide enough context. Do not copy protocol interfaces, addresses or API schemas into this skill.

Do not connect Morpho's MCP server or prepare a transaction unless the user has requested or authorized that action. The public documentation is sufficient for ordinary scanning.

## Resolve the review surface

Using Morpho's maintained procedure and data sources:

1. Confirm the chain and that the target address is a Morpho Vault V2.
2. Resolve every current allocation and every destination permitted by a non-zero cap, including nested vault or adapter exposure.
3. Resolve each reachable market's loan asset, collateral asset, oracle, interest-rate model and LLTV.
4. Include pending changes that would materially alter the reachable exposure when Morpho's current data sources expose them.
5. Record any adapter, market, cap or dependency that cannot be resolved. Do not silently discard an unfamiliar adapter or substitute Vault V1 behavior.

If the input is only a market ID, apply the market checks but do not infer which vaults can allocate to it.

## Apply vaults.rip

Morpho explains what the configuration is. vaults.rip checks what may be dangerous about it.

For every applicable resolved component:

- Run every check appended to this skill. In the source repository, those checks live under [`content/checks/morpho-v2/`](https://github.com/jordaniza/vaults.rip/tree/main/content/checks/morpho-v2).
- Use the [smart-contract inspection skill](https://www.vaults.rip/skills/smart-contracts/SKILL.md) when a check depends on arbitrary contract behavior, control or upgradeability.
- Use the [Etherscan skill](https://www.vaults.rip/skills/etherscan/SKILL.md) when verified source or proxy resolution is needed.

Tests are not required. A linked Foundry test may be used when it helps illustrate a check, but its result does not replace inspection of the target's deployed configuration.

## References

- [Morpho documentation index](https://docs.morpho.org/llms.txt)
- [Morpho full documentation corpus](https://docs.morpho.org/llms-full.txt)

## Checks

The generated copy of this skill and [`/llms.txt`](https://www.vaults.rip/llms.txt) append every current Morpho V2 check below. If this source file is being read directly, use the [human-readable check list](https://www.vaults.rip/checks/#protocol-morpho-v2) or load `/llms.txt` before starting the review.
