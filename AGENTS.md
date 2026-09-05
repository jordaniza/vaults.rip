# Repository guidance

## Source of truth

- Read `design/DESIGN_SPEC.md` before changing any user-facing page. Content takes precedence over interface, and invented marketing copy is prohibited.
- Homepage prose lives only in `content/index.md`.
- Checks index prose lives only in `content/checks.md`; cases index prose lives only in `content/cases.md`.
- Human protocol introductions live in `content/protocols/<protocol>.md` and link to maintained upstream documentation.
- Canonical checks live only in `content/checks/<protocol>/<component>/<slug>.md`.
- Canonical case research lives only in `content/cases/<protocol>/<number>.md`.
- The root scanner procedure lives in `SKILL.md`. Protocol and shared procedures live in `skills/<skill-name>/SKILL.md`.
- Protocol skills delegate changing mechanics, interfaces, addresses, APIs and SDK behaviour to authoritative upstream documentation. Do not duplicate a protocol manual locally.
- `README.md` intentionally repeats only the homepage `Why` copy. `pnpm verify` checks it for drift.

## Content model

Checks are strict scanner instructions. Every check has non-empty `checkId`, `protocol`, `component`, `title`, `slug`, `examples` and `cases` frontmatter. Its body is one concise instruction without authored headings. It should state the prerequisite or assumption, exact procedure, issue condition and unresolved behaviour. Do not add separate remediation, severity or evidence fields.

Use a stable check ID in the form `<protocol>-<component>-<number>`. Numbers start at `1` and increase independently within each component. The public Morpho Vault V2 protocol slug is `morpho-v2`.

The check owns its case and example relationships. `cases` contains stable case IDs such as `morpho1`; `examples` contains paths relative to `examples/`. Each referenced case must also end with a `## Related checks` list containing the matching absolute `/checks/#<checkId>` links. In other words, checks link to cases by `caseId`, and cases link back to checks by `checkId`. This deliberate duplication keeps the canonical Markdown useful when Vite serves it through `?raw`; `pnpm verify` prevents the two directions from drifting. Do not copy check instructions into a case.

Cases are free-form research. Every case has non-empty `title`, `caseId` and `protocol` frontmatter. Do not assign a case to one component and do not require a fixed section schema. Put cases at `content/cases/<protocol>/<number>.md`, using unpadded numbers that start at `1` for each protocol. `caseId` is the protocol slug followed by its number and remains stable when the title changes.

Tests are optional illustrations, not required checks. When useful, put a Foundry test under `examples/<protocol>/<component>/` and reference it from one check. The root `foundry.toml` maps `examples/` as the test directory.

## Astro build

`src/content.config.ts` is the only content collection definition:

- `pages` loads the root index Markdown files in `content/`.
- `cases` loads `content/cases/**/*.md` and retains raw bodies.
- `checks` loads `content/checks/*/*/*.md` and retains raw bodies.
- `protocols` loads `content/protocols/*.md` for human-readable protocol introductions.
- `scanner` loads root `SKILL.md`.
- `skills` loads `skills/*/SKILL.md`.

The build flow is:

1. Astro validates all collections.
2. `src/pages/index.astro` renders `content/index.md`.
3. `src/pages/checks/index.astro` groups every check by protocol and component, renders the matching human protocol introduction, adds stable anchors, and generates related case/example links.
4. `src/pages/cases/index.astro` groups all cases by protocol.
5. `src/pages/cases/[...slug].astro` renders each complete case, including its authored related-check links.
6. `src/pages/content/cases/[...slug].md.ts` emits the same complete case Markdown with normalized title and identity metadata.
7. `src/pages/llms.txt.ts` publishes the general scanner entrypoint from root `SKILL.md`, then appends each supported protocol skill and its complete generated check list; `/SKILL.md` and `/skills.md` permanently redirect to it.
8. `src/pages/skills/[...slug].md.ts` publishes individual skills. The Morpho V2 route appends every Morpho V2 check and its related case/example links to `skills/morpho-v2/SKILL.md`.
9. Astro copies `public/` unchanged into `dist/`.

Do not read Markdown through ad hoc filesystem calls in page components. Do not place substantive site copy directly in Astro templates.

## Public routes

| Route | Source |
| --- | --- |
| `/` | `content/index.md` |
| `/checks/` | `content/checks.md`, all check Markdown and check frontmatter |
| `/cases/` | `content/cases.md` and case frontmatter |
| `/cases/<protocol>/<number>/` | Matching case Markdown, including related-check links |
| `/content/index.md` | `content/index.md` |
| `/content/cases/<protocol>/<number>.md` | Matching case Markdown, including related-check links |
| `/llms.txt` | General scanner procedure, output format, protocol procedures and complete check lists |
| `/SKILL.md`, `/skills.md` | Permanent redirects to `/llms.txt` |
| `/skills/<skill-name>/SKILL.md` | Matching source skill |
| `/design/<asset>` | `public/design/<asset>` |
| `/content/cases/<protocol>/<number>/<asset>` | Matching case asset under `public/` |

Text and Markdown routes do not use trailing slashes. Human pages do.

## Links and assets

- Link readers to `/checks/#<checkId>`, `/cases/<protocol>/<number>/`, or `/content/cases/<protocol>/<number>.md` as appropriate.
- Link only to generated routes or files that exist under `public/`.
- Keep the repository URL as `https://github.com/jordaniza/vaults.rip` and open it in a new tab in the site interface.
- `src/layouts/BaseLayout.astro` adds new-tab handling to external links and advertises `/llms.txt` through `rel="describedby"`.
- Astro development treats a browser request for a `.md` path that also exists as a repository file differently from a non-browser request: its root-file guard can return the HTML 404 page before the endpoint runs. `astro.config.mjs` places a preflight middleware ahead of that guard and removes HTML content negotiation for machine routes. Keep its deferred Vite middleware ordering intact.
- Local human-facing `View Markdown` links append `?raw`. Vite then serves the canonical source file, which is why related-check links must be present in the case Markdown itself. Production links stay query-free and use Astro's generated text route.
- `src/middleware.ts` applies `text/plain; charset=utf-8` only to successful `.md` and `.txt` responses. Never relabel an error response as plain text; otherwise Astro's HTML 404 appears as raw text and can look like valid machine content.
- `vercel.json` serves all machine-readable Markdown and text routes as `text/plain; charset=utf-8` and mirrors the `llms.txt` relationship in the HTTP `Link` header.
- Put case assets under the matching `public/content/cases/` directory and reference every asset from that case's Markdown.
- Keep runtime logo and preview copies in `public/design/` identical to `design/`. Keep protocol logos in `public/protocols/` identical to `design/protocols/`.
- Preserve compatibility redirects in `astro.config.mjs` when routes change.

## Verification

- `pnpm dev` starts local development.
- `pnpm check` runs Astro diagnostics and schema validation.
- `pnpm build` produces `dist/`.
- `pnpm verify:dev-routes` starts an isolated Astro development server and checks browser-style requests for the Markdown 404 regression, plain-text content types and required related-check content.
- `pnpm verify:site` checks source placement, duplicate bodies and references, unique IDs and routes, generated pages, check-owned relationships, orphaned cases/assets/examples, design drift and dead internal links. It intentionally does not request external URLs.
- `pnpm verify` runs all three stages in order.

Husky runs `pnpm verify` before every commit. Run it before considering a content, route, layout, skill or asset change complete. If the content model or routes change, update this file, `README.md`, `CONTRIBUTING.md`, `design/DESIGN_SPEC.md`, the templates and `scripts/verify-site.mjs` together.

For changes to machine-readable routes, run `pnpm verify:dev-routes` and also load `/llms.txt` plus a case page's `View Markdown` link in a real browser. A plain curl without browser navigation headers is not a sufficient regression check.
