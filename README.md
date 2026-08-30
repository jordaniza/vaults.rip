<p align="center">
  <img src="./design/vaults-rip-social-preview.png" alt="vaults.rip — A collection of different ways a DeFi vault can be misconfigured." width="720" />
</p>

## Why

I realised after years of depositing into vaults, like Morpho and Euler, that I had a fairly surface-level understanding of the various controls curators have to direct vault capital.

The minimal design of Morpho vaults is very much optimised for security and govenrance minimisation, which shifts a lot of the burden to the user/curator. I wanted to document as many ways as I could that vault operators could misconfigure a vault, and either accidentally or intentionally lose my money.

This site is a catalogue of those experiments.

## Contributing

Contributions encouraged.

Ask your LLM to read the repository's [agent guidance](./AGENTS.md), or read [CONTRIBUTING.md](./CONTRIBUTING.md) yourself.

## Development and verification

```sh
pnpm install
pnpm dev
```

The available checks are:

- `pnpm check` validates Astro and the content collection schema.
- `pnpm build` produces the static site in `dist/`.
- `pnpm verify:site` audits an existing build for required routes, content placement, frontmatter, section order, copied design assets, and dead internal links.
- `pnpm verify` runs all three checks in the correct order. Run this before pushing or merging changes.
