---
title: Custom oracle control
protocol: Morpho
component: Oracle
riskType: Price manipulation
---

## Summary

Whoever creates a Morpho market chooses the oracle that market uses. There is nothing stopping a market creator from deploying a completely custom oracle with strange, unexpected, or outright malicious behaviour.

The oracle address itself is fixed when the market is created, but that does not mean the price it returns is fixed. The oracle can depend on mutable state, privileged setters, upgradeable contracts, external feeds, or essentially any other logic its author chooses.

Before treating a market as safe, it is therefore important to understand where its price actually comes from, whether that source is live and reputable, and whether any unexpected party retains control over the value returned by the oracle.

## Context

There are three useful pieces to keep in mind when thinking about Morpho: assets, markets and vaults.

Assets are used to create markets. A market might, for example, allow USDC to be borrowed against staked ETH. The market defines the collateral asset, loan asset, LLTV, interest-rate model and, importantly here, the oracle used to value the collateral.

Vaults sit one level above this. Depositors put capital into a vault and the curator decides which Morpho markets that capital is allowed to be allocated into.

Markets are permissionless. Anyone can deploy one, choose its assets and choose its oracle. The same person can also create a vault and whitelist that market for allocation.

This means that understanding the vault contract itself is not enough. A vault inherits the assumptions of every market it allocates into, and those markets in turn inherit the assumptions of their oracles.

## Where it goes wrong

The dangerous assumption is treating an oracle address as equivalent to a trustworthy price source.

A perfectly valid Morpho market can point to an oracle whose returned price is controlled by its deployer.

Once the market has been created and a vault has been allowed to allocate into it, the oracle can continue behaving according to whatever logic was deployed with it. If that logic contains privileged control over the price, the person holding that privilege can change how Morpho values the collateral without changing anything about the vault or market configuration.

This can work in either direction.

Artificially increasing the collateral price can allow a borrower to extract more loan assets than their collateral is actually worth. Artificially reducing it can push otherwise healthy borrowers into liquidation.

Morpho itself does not need to malfunction for either outcome.

## Proof of concept

The POC uses a custom oracle deployed for a Morpho market.

The market is then whitelisted by a vault and capital is allocated into it normally. From the vault depositor's perspective, this looks like an ordinary Morpho allocation.

The oracle, however, retains privileged control over the reported collateral price.

That means the price can be increased after capital has already entered the market, allowing collateral to support substantially more borrowing than its real market value would justify.

[POC market]

[Verified oracle contract]

[Reproduction repository]

## In the wild

A more subtle version of the same problem appeared in the AZND/USDC Morpho market.

Rather than sourcing an external market price, the oracle effectively treated AZND as worth a fixed amount of USDC. Capital from a USDC vault was then allocated into the market and borrowed against AZND collateral.

The important similarity is not that somebody necessarily had a malicious `setPrice()` function. It is that the market's collateral valuation ultimately depended on an oracle assumption that depositors needed to underwrite themselves.

[AZND/USDC market]

[Relevant oracle]

[Further analysis]

## How to spot it

Start with the oracle configured for the market and work backwards from `price()`.

Check:

- Is the oracle contract verified?
- Is it a proxy or otherwise upgradeable?
- What ultimately determines the value returned by `price()`?
- Does it depend on recognizable external feeds such as Chainlink or RedStone?
- Are those feeds themselves the expected contracts?
- Does the oracle contain privileged setters or mutable configuration?
- Can an owner, admin or other address materially influence the returned price?
- Is the price effectively hardcoded?
- If a fixed-price assumption is being made, what economically enforces that price?

An unverified oracle does not necessarily mean the market is unsafe. It means this analysis cannot be completed from public source code and should itself be treated as missing information.

## How to fix it

Do not whitelist a market until the oracle's full pricing path is understood.

Prefer oracle configurations whose pricing assumptions are transparent, whose external dependencies are reputable, and whose privileged control is either absent or explicitly understood.

Where a fixed-price oracle is used, the relevant question is not merely whether the oracle says `$1`. It is what makes the underlying asset worth `$1`, and what happens to lenders if that assumption stops being true.
