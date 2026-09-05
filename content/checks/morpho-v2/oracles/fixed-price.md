---
checkId: morpho-v2-oracles-4
protocol: Morpho V2
component: Oracles
title: Check fixed-price assumptions
slug: fixed-price
examples: []
cases:
  - morpho2
---

Trace `price()` to its final inputs and determine whether the result is constant, hard-coded or otherwise lacks live external price discovery. When a fixed price is intentional, identify the redemption, convertibility or other economic mechanism expected to enforce it for the collateral asset.

Report an issue when the market relies on a fixed-price assumption that cannot be supported with current evidence, including the conditions under which the assumed price could diverge from realizable collateral value. If the offchain claim or redemption path cannot be verified, report that uncertainty explicitly.
