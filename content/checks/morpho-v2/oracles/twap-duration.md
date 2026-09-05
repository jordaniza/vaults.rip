---
checkId: morpho-v2-oracles-5
protocol: Morpho V2
component: Oracles
title: Check TWAP duration
slug: twap-duration
examples: []
cases: []
---

Where the pricing path uses a time-weighted average price, identify the pool, observation window, available liquidity, asset volatility, liquidation LLTV and any fallback behaviour. Evaluate whether an attacker could move and sustain the pool price long enough to create unsafe borrowing or liquidation conditions.

A 15–30 minute window is a useful starting heuristic, not a universal safe range. Report an issue when the chosen duration is unsupported by the pool's liquidity and the market's economic parameters, or when the required inputs cannot be established.
