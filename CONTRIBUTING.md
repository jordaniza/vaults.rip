# Contributing

Contributions are welcome. Before making a change, read `design/DESIGN_SPEC.md` and follow the content and build structure described in `README.md`.

## Editing the content

The human-readable website and the LLM-readable content are generated from the same Markdown files. Markdown is the source of truth and Astro (the web framework we use) renders it into the website, case pages, and raw Markdown routes for LLMs.

To change an existing case, edit its file in `content/cases/`. For example, changes to **Custom oracle control** belong in:

```text
content/cases/oracle-price-manipulation.md
```

That one file controls:

- The case title and metadata shown in the homepage case index
- The human-readable page at `/cases/oracle-price-manipulation/`
- The LLM-readable document at `/content/cases/oracle-price-manipulation.md`
- The case entry linked from the generated `/content/index.md` directory

Do not edit those generated outputs separately. Add or revise the copy in the case Markdown, then run `pnpm verify` to confirm that the human and machine-readable versions remain in parity.

The authored content locations are:

- `content/index.md` for homepage copy
- `content/cases/<slug>.md` for case copy and frontmatter
- `public/content/cases/<slug>/` for case-specific images and downloads
- `public/llms.txt` for the small machine-readable entry point

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
