# Contributing

Contributions are welcome. Before making a change, read `design/DESIGN_SPEC.md` and follow the content and build structure described in `README.md`.

## Editing the content

The human-readable website and the LLM-readable content are generated from the same Markdown files. Markdown is the source of truth and Astro (the web framework we use) renders it into the website, case pages, and raw Markdown routes for LLMs.

The scanner starts at `/SKILL.md`, which routes agents to protocol and supporting skills under `/skills/`. Protocol checks contain a short `What to check` section and may link to an optional Foundry example under `examples/`.

Protocol skills should link to maintained upstream skills and documentation for protocol mechanics, interfaces and APIs. Add only the risk-review procedure and checks that vaults.rip contributes on top.

To change an existing case, edit its file in `content/cases/`. For example, changes to **Custom oracle control** belong in:

```text
content/cases/morpho/1.md
```

That one file controls:

- The case title and metadata shown in the homepage case index
- The human-readable page at `/cases/morpho/1/`
- The LLM-readable document at `/content/cases/morpho/1.md`
- The case entry linked from the generated `/content/index.md` directory
- The direct case link included in the generated `/llms.txt` directory

Do not edit those generated outputs separately. Add or revise the copy in the case Markdown, then run `pnpm verify` to confirm that the human and machine-readable versions remain in parity.

The authored content locations are:

- `content/index.md` for homepage copy
- `content/llms.md` for LLM navigation guidance; Astro appends the generated case list
- `content/protocols/<protocol>/<component>/<slug>.md` for scanner checks
- `content/cases/<protocol>/<number>.md` for case copy and frontmatter
- `SKILL.md` for scanner scope and routing
- `skills/<skill-name>/SKILL.md` for protocol and reusable scanner procedures
- `examples/<protocol>/<component>/*.t.sol` for optional executable examples
- `public/content/cases/<protocol>/<number>/` for case-specific images and downloads
- `src/pages/llms.txt.ts` generates the machine-readable case directory; do not maintain its links by hand

Case numbers start at `1` and increase independently for each protocol. The path `content/cases/morpho/1.md` uses the stable frontmatter ID `caseId: morpho1`. Keep both the path and `caseId` unchanged if the title changes; a second Morpho case would use `morpho/2.md` and `caseId: morpho2`.

## Set up the project

```sh
pnpm install
pnpm dev
```

## Before submitting

Run the complete project check:

```sh
pnpm verify
```

This validates the Astro build, content schema, generated routes, content placement, and internal links.

When executable examples exist, run them from the repository root with `forge test`.
