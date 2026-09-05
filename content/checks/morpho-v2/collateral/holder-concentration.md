---
checkId: morpho-v2-collateral-1
protocol: Morpho V2
component: Collateral
title: Check collateral holder concentration
slug: holder-concentration
examples: []
cases:
  - morpho2
---

For each collateral asset, resolve circulating supply, material holders, administrator minting or freezing powers, and the holders supplying collateral to the reviewed markets. Account for contracts and addresses that may be controlled by the same entity rather than treating each address as independent.

Report an issue when one holder or related group can supply enough collateral to dominate borrowing, manipulate available liquidity or leave lenders dependent on that party's ability to realize the asserted collateral value. Record uncertain ownership relationships as unresolved; do not infer common control without evidence.
