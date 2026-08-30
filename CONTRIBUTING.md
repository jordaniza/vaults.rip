# Contributing

Contributions are welcome. Before making a change, read `design/DESIGN_SPEC.md` and follow the content and build structure described in `README.md`.

## Editing the content

The human-readable website and the LLM-readable content are generated from the same Markdown files. Markdown is the source of truth and Astro (the web framework we use) renders it into the website, case pages, and raw Markdown routes for LLMs.

To change an existing case, edit its file in `content/cases/`. For example, changes to **Custom oracle control** belong in:

```text
content/cases/morpho/1.md
```

That one file controls:

- The case title and metadata shown in the homepage case index
- The human-readable page at `/cases/morpho/1/`
- The LLM-readable document at `/content/cases/morpho/1.md`
- The case entry linked from the generated `/content/index.md` directory

Do not edit those generated outputs separately. Add or revise the copy in the case Markdown, then run `pnpm verify` to confirm that the human and machine-readable versions remain in parity.

The authored content locations are:

- `content/index.md` for homepage copy
- `content/cases/<protocol>/<number>.md` for case copy and frontmatter
- `public/content/cases/<protocol>/<number>/` for case-specific images and downloads
- `public/llms.txt` for the small machine-readable entry point

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
