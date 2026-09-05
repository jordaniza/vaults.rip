---
checkId: morpho-v2-oracles-2
protocol: Morpho V2
component: Oracles
title: Check for settable prices
slug: settable-price
examples:
  - morpho/oracles/SettableOracle.t.sol
cases:
  - morpho1
---

After resolving the verified implementation, trace every value used by `price()` and every externally reachable function that can change those values. Include inherited functions, role-managed configuration and setters on external dependencies; do not rely on function names alone.

Report an issue when an owner, administrator or other privileged party can materially change the reported price without an independent economic price source constraining the result. Record the controlling addresses and affected markets. If access control or a dependency cannot be resolved, report the check as unresolved.
