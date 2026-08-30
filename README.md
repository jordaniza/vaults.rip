<p align="center">
  <img src="./design/vaults-rip-logo-compressed.png" alt="vaults.rip" width="160" />
</p>

## About

vaults.rip is a collection of different ways a DeFi vault can be misconfigured.

### Why

I realised after years of depositing into vaults, like Morpho and Euler, that I had a fairly surface-level understanding of the various controls curators have to direct vault capital.

The minimal design of Morpho vaults is very much optimised for security and govenrance minimisation, which shifts a lot of the burden to the user/curator. I wanted to document as many ways as I could that vault operators could misconfigure a vault, and either accidentally or intentionally lose my money.

This site is a catalogue of those experiments.

## Contributing

Contributions encouraged.

Ask your LLM to read the repository's [agent guidance](./AGENTS.md), or read [CONTRIBUTING.md](./CONTRIBUTING.md) yourself.

## Page hierarchy

| URL                                           | Purpose                                                 | Source                                                                          |
| --------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `/`                                           | About copy and the generated case index                 | `content/index.md`, `content/cases/**/*.md`, `src/pages/index.astro`            |
| `/cases/<protocol>/<number>/`                 | Human-readable case page                                | `content/cases/<protocol>/<number>.md`, `src/pages/cases/[...slug].astro`       |
| `/content/index.md`                           | Raw homepage copy and generated case directory for LLMs | `src/pages/content/index.md.ts`                                                 |
| `/content/cases/<protocol>/<number>.md`       | Complete raw case Markdown with metadata                | Case Markdown and `src/pages/content/cases/[...slug].md.ts`                     |
| `/llms.txt`                                   | Homepage context and direct links to every case          | Both collections and `src/pages/llms.txt.ts`                                    |
| `/skills.md`                                  | Work-in-progress vault review workflow                   | `content/skills.md` and `src/pages/skills.md.ts`                                |
| `/design/<asset>`                             | Logo and social preview assets used by the site         | `public/design/`                                                                |
| `/content/cases/<protocol>/<number>/<asset>`  | Stable, unprocessed case media                          | `public/content/cases/<protocol>/<number>/`                                     |

The case index is generated from case frontmatter. It is intentionally not duplicated in `content/index.md` or `README.md`. The human index omits internal IDs; the raw `/content/index.md` directory includes each stable `caseId` for machine consumers. `/llms.txt` is also generated and combines the homepage context with direct links to every canonical case Markdown file.

Every HTML page advertises `/llms.txt` with `rel="describedby"` and its matching raw Markdown route with `rel="alternate"`. Vercel also adds the `/llms.txt` relationship as an HTTP `Link` header so non-HTML clients can discover it without inspecting the visible page.

## Content and build flow

`src/content.config.ts` defines two Astro collections:

- `pages` reads top-level Markdown from `content/`. The `index` entry supplies homepage prose.
- `cases` reads Markdown from `content/cases/` and validates `title`, `caseId`, `protocol`, and `component` frontmatter.

Astro renders those collections in five places:

1. `src/pages/index.astro` renders the homepage copy and generates its case table.
2. `src/pages/cases/[...slug].astro` uses `getStaticPaths()` to generate one HTML page for every case.
3. The endpoints under `src/pages/content/` generate the raw Markdown directory and one raw Markdown document per case.
4. `src/pages/llms.txt.ts` combines the homepage context with direct links to every canonical case Markdown file.
5. `src/pages/skills.md.ts` serves the high-level vault review workflow from `content/skills.md`.

Files in `public/` are copied unchanged to the root of the production build. Global presentation and SEO live in `src/layouts/BaseLayout.astro` and `src/styles/global.css`; substantive copy does not.

## Where files belong

- Homepage prose: `content/index.md`
- One case: `content/cases/<protocol>/<number>.md`
- Case-specific images or downloads: `public/content/cases/<protocol>/<number>/`
- Design source files: `design/`
- Design assets required by the website: matching files in `public/design/`
- Protocol logo sources: `design/protocols/`, with matching runtime copies in `public/protocols/`
- Generated machine-readable case directory: `src/pages/llms.txt.ts`
- High-level vault review workflow: `content/skills.md`

Case numbers are unpadded, increase independently within each protocol, and start at `1`. The protocol slug and number form a stable ID: `content/cases/morpho/1.md` uses `caseId: morpho1` and routes to `/cases/morpho/1/`. Keep the path and `caseId` unchanged when editing a case title.

Case Markdown uses this standard order: Summary, Context, Where it goes wrong, Example, and How to address. Context and Where it goes wrong may be omitted when they do not add useful information. Summary, Example, and How to address are required.

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
- `vercel.json` advertises `/llms.txt` in response headers.
- `design/` contains the design specification and canonical visual assets.
- `AGENTS.md` contains repository guidance for coding agents.
