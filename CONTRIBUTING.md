# Contributing

Contributions generally start in one of two places:

1. Read the current [checks](https://www.vaults.rip/checks/) and add an instruction when an important review step is missing.
2. Submit a case study that demonstrates why an existing or proposed check matters.

Rough case research is welcome. Write it as Markdown, then ask an LLM to read `AGENTS.md` and convert it into the repository structure.

## Add a check

Create `content/checks/<protocol>/<component>/<slug>.md` using:

```md
---
checkId: <protocol>-<component>-<next-number>
protocol: <Protocol name>
component: <Component name>
title: <Check title>
slug: <slug>
examples: []
cases:
  - <caseId>
---

<What to inspect, how to inspect it, when to report an issue, and what to do if it cannot be resolved.>
```

The check links to relevant cases through `cases`. Add the reciprocal absolute check link under `## Related checks` at the end of each referenced case; verification prevents these lists from drifting.

## Add a case

Create `content/cases/<protocol>/<next-number>.md` using:

```md
---
title: <Case title>
caseId: <protocol><number>
protocol: <Protocol name>
---

<Case study in free-form Markdown.>

## Related checks

- [<Check title>](https://www.vaults.rip/checks/#<checkId>)
```

Cases do not require fixed headings. Put case images in `public/content/cases/<protocol>/<number>/` and link them from the Markdown.

After adding the case, add its `caseId` to each check it supports. If the required check does not exist, add that check as well.

Foundry examples are optional. If one makes a check easier to understand, put it under `examples/<protocol>/<component>/` and add its relative path to the check's `examples` list.

## Verify

```sh
pnpm install
pnpm verify
```

Husky runs the full build verification and the browser-style development-route regression test before commits.
