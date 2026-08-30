# Vault review skill

This is a work-in-progress scaffold for reviewing how a DeFi vault can expose depositor capital. It is not a complete checklist and should be used alongside protocol documentation, onchain evidence, and the current [vaults.rip cases](https://www.vaults.rip/llms.txt).

## Review workflow

### Establish the scope

- Identify the chain, protocol, vault address and vault version.
- Identify the asset deposited into the vault.
- Identify the addresses or roles that can configure, curate or allocate vault capital.

### Map the capital path

- Enumerate every market receiving vault capital.
- Enumerate every market the vault is permitted to allocate to, including markets enabled through allocation caps.
- Record the current allocation and applicable cap for each market.

### Inspect each market

- Record the loan asset, collateral asset, LLTV, interest-rate model and oracle.
- Link each value to its onchain source.
- Check whether the configuration introduces dependencies that are not visible from the vault contract alone.

### Trace external assumptions

- Trace each oracle from its configured address through the value returned by `price()`.
- Check verified source code, proxies, upgrades, mutable configuration, privileged setters, owners and administrators.
- Identify fixed-price assumptions and establish what economically enforces them.
- Look for shared or concentrated control across the vault, market, oracle and collateral issuer.

### Compare against known cases

Use [llms.txt](https://www.vaults.rip/llms.txt) to find the current case documents. Each case contains the mechanism, evidence, example and case-specific checks. Do not assume that the absence of a matching case establishes that a configuration is safe.

### Record the result

- Separate confirmed observations from inferences.
- Record missing or unverifiable information explicitly.
- Link claims to contracts, transactions, verified source code or primary documentation.
- Avoid assigning severity unless a defined severity model is being used.

## Finding scaffold

Use this structure for a potential issue:

1. **Summary** — State the configuration and potential consequence.
2. **Scope** — Identify the vault, markets, assets and relevant roles.
3. **Configuration** — Record the values and dependencies that create the condition.
4. **Evidence** — Link the contracts, transactions, source code and documentation.
5. **Mechanism** — Explain how capital becomes exposed without assuming the protocol itself malfunctions.
6. **Impact** — Describe what can happen and which participants bear the loss.
7. **How to address** — State the checks or configuration changes required.
8. **Unknowns** — List anything that could not be verified.
9. **Related cases** — Link the closest vaults.rip case documents.

## Maintenance

Keep this file focused on the general review procedure. Put issue-specific mechanisms, examples and detailed checks in the canonical case Markdown files, then expose them through the generated `llms.txt` directory.
