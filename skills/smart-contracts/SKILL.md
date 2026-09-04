---
name: inspect-smart-contracts
description: Trace deployed smart-contract behavior, mutable state, privileged control, and proxy implementations. Use when a vault scan depends on what an onchain contract can currently do.
---

# Inspect smart contracts

## Find an RPC endpoint

Use an RPC URL supplied by the user when available. Otherwise, prefer an endpoint published by the network's official documentation. If none is readily available, find an HTTPS endpoint for the exact chain ID in [Chainlist's machine-readable registry](https://chainlist.org/rpcs.json). Avoid endpoints with unresolved placeholders or embedded credentials.

Verify the endpoint's chain ID before reading contract state. If Cast is installed:

```sh
cast chain-id --rpc-url "$RPC_URL"
```

Otherwise call `eth_chainId` with any JSON-RPC client. For Base mainnet, `https://mainnet.base.org` is an official, rate-limited, no-key endpoint and must return chain ID `8453`.

Use a discovered public endpoint only for reads. Never send a transaction or signature through it. If a material value is surprising, confirm it through a second endpoint.

## Resolve the deployed code

1. Fix the chain ID and, when historical state matters, the block number.
2. Read [`../etherscan/SKILL.md`](../etherscan/SKILL.md) to confirm runtime bytecode, retrieve verified source, and follow proxy implementations on supported chains.
3. If another explorer or source repository is used, preserve the distinction between source claims and code verified against the deployed address.

## Read and compare state

Cast ships with Foundry and works without a Foundry project or test. Use `cast call` for simple reads when it is installed:

```sh
cast call "$CONTRACT_ADDRESS" 'owner()(address)' --rpc-url "$RPC_URL"
```

Add `--block "$BLOCK_NUMBER"` when inspecting historical state. If Cast is unavailable, make the equivalent JSON-RPC `eth_call`.

1. Trace the relevant getter through internal calls, inherited contracts, libraries, and external dependencies.
2. Identify the state and external values that determine its result.
3. Identify every reachable function that can change those values.
4. Resolve modifiers and access-control checks to current onchain role holders. Do not rely only on names such as `setPrice` or `owner`.
5. Query the relevant getters and role holders onchain, then compare the returned values with the behavior allowed by the code.

A targeted `eth_call` of a state-changing function can help resolve a specific uncertainty without persisting state. Treat a revert only as evidence about that exact simulated call. A successful simulation from an arbitrary sender does not prove control of that address.

When source is unavailable, do not guess behavior from an explorer label or contract name. Record the inspection as unresolved unless bytecode analysis or another authoritative artifact completes it.

For an explicitly requested deeper source-code audit, consult the maintained [Trail of Bits skills collection](https://github.com/trailofbits/skills). Do not require or install an external audit skill for an ordinary scan without authorization.
