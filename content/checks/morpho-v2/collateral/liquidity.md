---
checkId: morpho-v2-collateral-2
protocol: Morpho V2
component: Collateral
title: Check collateral liquidity
slug: liquidity
examples: []
cases: []
---

For new collateral assets and derivatives such as Pendle tokens, compare available market liquidity with the liquidation volume implied by the LLTV.

For a highly leveraged position, estimate the absolute price move needed to reach the LLTV and whether the collateral could be sold without significant further price impact. Report an issue if realistic liquidity would not support the liquidation. If liquidity data is unavailable, record the check as unresolved.
