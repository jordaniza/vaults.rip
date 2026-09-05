---
checkId: morpho-v2-oracles-3
protocol: Morpho V2
component: Oracles
title: Check oracle upgradeability
slug: upgradeability
examples: []
cases: []
---

Inspect the oracle and every contract on its pricing path for proxy storage slots, implementation lookups, upgrade functions and unrestricted `delegatecall`. Resolve the current implementation and every address able to replace or modify it.

Report an issue when a privileged party can replace pricing logic or dependencies without controls that the reviewer can justify for the vault. If the implementation or upgrade authority cannot be resolved, report the check as unresolved rather than treating the current source as permanent.
