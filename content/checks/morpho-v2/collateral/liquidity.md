---
checkId: morpho-v2-collateral-2
protocol: Morpho V2
component: Collateral
title: Flag shallow collateral at high LLTV
slug: liquidity
examples: []
cases:
  - morpho3
---

Where new, derivative, obscure or otherwise economically shallow collateral is used in a high-LLTV market, flag the market for further review of liquidity, leverage and liquidation sensitivity.

Do not use total supply alone as a proxy for economic depth. If the collateral profile or LLTV cannot be established, record the check as unresolved.
