# Foundry examples

Tests are not required for a scan. When useful, executable examples live here as self-contained Solidity test files grouped by protocol and component. They illustrate a mechanism or inspection technique; passing a test does not establish that a production vault is affected.

The root `foundry.toml` configures `examples/` as Foundry's test directory. Run every example with:

```sh
forge test
```

Run one example with:

```sh
forge test --match-path 'examples/<protocol>/<component>/<example>.t.sol'
```

For an example that reads deployed state, add the appropriate RPC endpoint:

```sh
forge test --fork-url "$BASE_RPC_URL" --match-path '<path>'
```

Keep RPC URLs and API keys in environment variables. Never commit credentials.
