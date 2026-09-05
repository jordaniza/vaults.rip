---
checkId: morpho-v2-oracles-5
protocol: Morpho V2
component: Oracles
title: Check Pendle PT TWAP duration
slug: twap-duration
examples: []
cases:
  - morpho3
---

Where Pendle PT collateral is used, verify that the oracle TWAP follows [Pendle's current guidance](https://docs.pendle.finance/pendle-v2-dev/Oracles/HowToIntegratePtAndLpOracle), which recommends 900 seconds for most markets or 1,800 seconds.

Report a materially shorter duration for review. If the duration cannot be determined, record the check as unresolved.
