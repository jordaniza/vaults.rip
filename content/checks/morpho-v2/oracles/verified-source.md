---
checkId: morpho-v2-oracles-1
protocol: Morpho V2
component: Oracles
title: Retrieve verified oracle source
slug: verified-source
examples: []
cases: []
---

For every market the vault currently uses or is permitted to use, resolve the oracle address from the market configuration. Confirm that runtime bytecode exists at that address, retrieve verified source for the deployed contract, and follow every proxy or implementation reference before reviewing its behaviour.

If the implementation source cannot be retrieved and matched to the deployed contract, report the oracle as unresolved. Do not mark source-dependent oracle checks as passed.
