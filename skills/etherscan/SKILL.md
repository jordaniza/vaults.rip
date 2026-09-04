---
name: etherscan-contract-source
description: Retrieve deployed bytecode and verified contract source through Etherscan V2, then follow proxy implementations. Use when a contract on an Etherscan-supported chain must be inspected.
---

# Etherscan contract source

## Inputs

- Chain ID
- Contract address
- `ETHERSCAN_API_KEY`

Use the Etherscan V2 API with an explicit `chainid`. Do not assume Ethereum mainnet from an address alone.

Supply the API key through a credential manager or a session-scoped shell variable. Never paste it directly into a command or save it in a tracked file. Bash and Zsh can read it without echoing it:

```sh
printf 'Etherscan API key: ' >&2
IFS= read -r -s ETHERSCAN_API_KEY
printf '\n' >&2
```

The requests below pass the secret to curl through standard input so the expanded key does not appear in curl's command-line arguments. Run `unset ETHERSCAN_API_KEY` after completing the requests.

## Retrieve runtime bytecode

```sh
curl -q --get 'https://api.etherscan.io/v2/api' \
  --data-urlencode "chainid=${CHAIN_ID}" \
  --data-urlencode 'module=proxy' \
  --data-urlencode 'action=eth_getCode' \
  --data-urlencode "address=${CONTRACT_ADDRESS}" \
  --data-urlencode 'tag=latest' \
  --config - <<EOF
data-urlencode = "apikey=${ETHERSCAN_API_KEY}"
EOF
```

`0x` means there is no runtime bytecode at the requested address and block. Non-empty bytecode establishes that code is deployed; it does not establish that source code is verified.

## Retrieve verified source

```sh
curl -q --get 'https://api.etherscan.io/v2/api' \
  --data-urlencode "chainid=${CHAIN_ID}" \
  --data-urlencode 'module=contract' \
  --data-urlencode 'action=getsourcecode' \
  --data-urlencode "address=${CONTRACT_ADDRESS}" \
  --config - <<EOF
data-urlencode = "apikey=${ETHERSCAN_API_KEY}"
EOF
```

Treat missing `SourceCode` as unverified source. Raise an unresolved-source issue; do not label the contract malicious solely because it is unverified.

If `Proxy` is `1` or `Implementation` is populated, repeat the source and bytecode checks for the implementation address. Continue until the executed implementation is reached. Inspect proxy-admin and upgrade authority separately from application-level owners.

An HTTP error, rate limit, or blocked explorer response is not evidence that a contract is unverified. Retry through the API or use another reliable source, and report the source check as unresolved if it still cannot be completed.

## References

- [Etherscan `eth_getCode`](https://docs.etherscan.io/api-reference/endpoint/ethgetcode)
- [Etherscan `getsourcecode`](https://docs.etherscan.io/api-reference/endpoint/getsourcecode)
- [curl configuration input](https://curl.se/docs/manpage.html#-K)
