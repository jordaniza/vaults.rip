# Repository guidance

## Product and source-of-truth rules

- Read `design/DESIGN_SPEC.md` before changing any user-facing page. Content takes precedence over interface, and invented marketing copy is prohibited.
- Canonical homepage prose lives only in `content/index.md`.
- Canonical case research lives only in `content/cases/<slug>.md`.
- Do not duplicate the case index in `content/index.md`, `README.md`, or `public/llms.txt`. Astro generates it from case frontmatter.
- `README.md` intentionally repeats the homepage About copy for repository visitors. Check it for drift whenever `content/index.md` changes; `pnpm verify` enforces this.
- Start machine-oriented discovery at `public/llms.txt`, served as `/llms.txt`. Keep it as a small map to `/content/index.md`, not a manually maintained list of cases.

## Astro build structure

The project is a static Astro site configured by `astro.config.mjs` and built with pnpm.

`src/content.config.ts` is the only content collection definition:

- `pages` loads `content/*.md`. The entry ID `index` represents `content/index.md`.
- `cases` loads `content/cases/**/*.md`, retains the raw body for machine-readable endpoints, and validates `title`, `protocol`, `component`, and `riskType`.

The build flow is:

1. Astro syncs and validates the Markdown collections.
2. `src/pages/index.astro` calls `getEntry("pages", "index")`, renders the homepage prose, and builds the case table from `getCollection("cases")`.
3. `src/pages/cases/[slug].astro` calls `getStaticPaths()` over the cases collection and renders one human-readable page per entry.
4. `src/pages/content/index.md.ts` generates the raw homepage document plus the current case directory.
5. `src/pages/content/cases/[slug].md.ts` generates one complete raw Markdown document per case.
6. Astro copies `public/` unchanged into `dist/` and emits the rendered HTML and generated Markdown routes.

Do not bypass the collections by reading Markdown with ad hoc filesystem code in page components. Do not put substantive copy directly into Astro templates.

## Page hierarchy

| Public route                    | Generated from                                                   |
| ------------------------------- | ---------------------------------------------------------------- |
| `/`                             | `content/index.md`, case frontmatter, `src/pages/index.astro`    |
| `/cases/<slug>/`                | `content/cases/<slug>.md`, `src/pages/cases/[slug].astro`        |
| `/content/index.md`             | Both collections through `src/pages/content/index.md.ts`         |
| `/content/cases/<slug>.md`      | The matching case through `src/pages/content/cases/[slug].md.ts` |
| `/llms.txt`                     | `public/llms.txt`                                                |
| `/design/<asset>`               | `public/design/<asset>`                                          |
| `/content/cases/<slug>/<asset>` | `public/content/cases/<slug>/<asset>`                            |

Routes ending in `.md` or `.txt` do not use trailing slashes. Human-readable case routes do.

## Content placement

- Put homepage copy in `content/index.md`.
- Put each case in a direct child Markdown file named `content/cases/<kebab-case-slug>.md`. Do not nest the Markdown file inside its asset directory.
- Every case must include the frontmatter fields `title`, `protocol`, `component`, and `riskType`. `protocol` may be blank; the other fields may not.
- Keep case sections in this order: Summary, Context, Where it goes wrong, Proof of concept, In the wild, How to spot it, and How to fix it. Context and In the wild are optional when the case has no useful material for them; the other five sections are required. If the content model changes, update the templates, documentation, and verifier together.
- Put stable case-specific images and downloads in `public/content/cases/<slug>/`. Reference them from Markdown with the public root path `/content/cases/<slug>/<filename>` so both people and raw-content consumers resolve the same asset.
- Keep canonical design sources in `design/`. The logo and social preview used at runtime have matching copies in `public/design/`; update both together.
- Shared HTML and SEO belong in `src/layouts/BaseLayout.astro`. Shared visual rules belong in `src/styles/global.css`.

## Link and route rules

- Link human readers to `/cases/<slug>/` and machine consumers to `/content/cases/<slug>.md`.
- Link only to routes Astro generates or files that exist under `public/`.
- Keep the repository URL as `https://github.com/jordaniza/vaults.rip` and open it in a new tab in the website interface.
- The homepage compatibility redirect for legacy `/?case=<slug>` URLs lives in `src/pages/index.astro`; do not use query-string URLs for new links.
- Never link to source filesystem paths such as `src/pages/...`, `content/...`, or `public/...` as though they were public URLs.

## Required verification

Use the pnpm scripts exactly as documented:

- `pnpm dev` starts local development.
- `pnpm check` runs Astro diagnostics and content schema validation.
- `pnpm build` produces `dist/`.
- `pnpm verify:site` checks an existing build for required outputs, case structure, asset placement, source drift, and dead internal links.
- `pnpm verify` runs `check`, `build`, and `verify:site` in order.

Run `pnpm verify` before considering a content, route, layout, or asset change complete. If a required heading or route changes intentionally, update `README.md`, this file, the relevant Astro templates, and `scripts/verify-site.mjs` in the same change.
