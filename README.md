# vaults.rip

## About

vaults.rip is a collection of different ways a DeFi vault can be misconfigured.

### Why

I realised after years of depositing into vaults, like Morpho and Euler, that I had a fairly surface-level understanding of the various controls curators have to direct vault capital.

The minimal design of Morpho vaults is very much optimised for security and govenrance minimisation, which shifts a lot of the burden to the user/curator. I wanted to document as many ways as I could that vault operators could misconfigure a vault, and either accidentally or intentionally lose my money.

This site is a catalogue of those experiments.

### Using

It's intended to be open-source, free, and LLM friendly so people can use in their own workflows without reading a load of essays. Contributions welcome. See the GitHub for more info.

## Page hierarchy

| URL | Purpose | Source |
| --- | --- | --- |
| `/` | About copy and the generated case index | `content/index.md`, `content/cases/*.md`, `src/pages/index.astro` |
| `/cases/<slug>/` | Human-readable case page | `content/cases/<slug>.md`, `src/pages/cases/[slug].astro` |
| `/content/index.md` | Raw homepage copy and generated case directory for LLMs | `src/pages/content/index.md.ts` |
| `/content/cases/<slug>.md` | Complete raw case Markdown with metadata | `content/cases/<slug>.md`, `src/pages/content/cases/[slug].md.ts` |
| `/llms.txt` | Small machine-readable entry point | `public/llms.txt` |
| `/design/<asset>` | Logo and social preview assets used by the site | `public/design/` |
| `/content/cases/<slug>/<asset>` | Stable, unprocessed case media | `public/content/cases/<slug>/` |

The case index is generated from case frontmatter. It is intentionally not duplicated in `content/index.md`, `README.md`, or `llms.txt`.

## Content and build flow

`src/content.config.ts` defines two Astro collections:

- `pages` reads top-level Markdown from `content/`. The `index` entry supplies homepage prose.
- `cases` reads Markdown from `content/cases/` and validates `title`, `protocol`, `component`, and `riskType` frontmatter.

Astro renders those collections in three places:

1. `src/pages/index.astro` renders the homepage copy and generates its case table.
2. `src/pages/cases/[slug].astro` uses `getStaticPaths()` to generate one HTML page for every case.
3. The endpoints under `src/pages/content/` generate the raw Markdown directory and one raw Markdown document per case.

Files in `public/` are copied unchanged to the root of the production build. Global presentation and SEO live in `src/layouts/BaseLayout.astro` and `src/styles/global.css`; substantive copy does not.

## Where files belong

- Homepage prose: `content/index.md`
- One case: `content/cases/<kebab-case-slug>.md`
- Case-specific images or downloads: `public/content/cases/<slug>/`
- Design source files: `design/`
- Design assets required by the website: matching files in `public/design/`
- Machine-readable entry point: `public/llms.txt`

Case Markdown uses this standard order: Summary, Context, Where it goes wrong, Proof of concept, In the wild, How to spot it, and How to fix it. Context and In the wild may be omitted when the case has no useful material for them. The other five sections are required.

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

## Repository structure

- `content/` contains canonical authored copy.
- `src/content.config.ts` is the only collection definition.
- `src/pages/` defines the generated page and Markdown route hierarchy.
- `src/layouts/` and `src/styles/` contain shared presentation.
- `public/` contains files copied directly to their public URLs.
- `scripts/verify-site.mjs` enforces the documented content and route contract.
- `design/` contains the design specification and canonical visual assets.
- `AGENTS.md` contains repository guidance for coding agents.
