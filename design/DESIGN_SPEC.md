# vaults.rip — Design and Content Rules

These rules are part of the product specification. Follow them when creating or modifying any user-facing page.

## 1. What this site is

vaults.rip is a technical knowledge base for DeFi vault and market risk.

It is not:
- a SaaS product
- a startup landing page
- a security company website
- a blog optimized for engagement
- a marketing funnel

The primary artifacts are:
- concise descriptions of specific risk mechanisms
- reproducible examples
- evidence and references
- ways to detect the condition
- machine-readable content for LLMs and agents
- executable checks where useful

The website is the human-readable interface to that corpus.

Content takes precedence over interface.

---

## 2. No marketing copy

Never invent marketing language to fill a layout.

DO NOT add:
- slogans
- taglines
- eyebrow copy
- manifesto-style headings
- punchy section names
- rhetorical statements
- promotional CTAs
- benefit claims
- generic security language

Examples of prohibited copy:

"DEFI RISK, DOCUMENTED"
"When vaults break, the details matter."
"Evidence over alarm"
"Understand risk before it happens."
"Built for better underwriting."
"Explore the risks."
"Stay ahead of DeFi risk."
"Research you can trust."

These are not part of the site's voice.

A heading should normally describe the information immediately below it.

Prefer:

"About"
"Cases"
"Custom oracle control"
"Example"
"How to address"
"References"

Do not try to make these headings more interesting.

---

## 3. Do not generate copy as decoration

Text is load-bearing.

If information has not been provided by the repository's content, do not invent it to improve the visual composition.

Empty space is desirable.

Do not fabricate:
- cases
- descriptions
- protocols
- statistics
- examples
- categories
- quotes
- severity assessments
- dates
- status labels

If there is one case, show one case.

---

## 4. Voice

Use neutral, descriptive language.

Avoid first-person and collective voice:
- no "we"
- no "I"
- no "our"

Prefer impersonal constructions:

"A catalogue of..."
"This case describes..."
"The oracle exposes..."
"The check identifies..."

Avoid editorializing unless the underlying research explicitly does so.

Avoid AI-style contrastive prose and rhetorical framing.

Do not write sentences merely to sound authoritative.

---

## 5. Information architecture

Global navigation contains:

vaults.rip             Checks   Cases   llms.txt   X   GitHub

Do not add navigation items without a real destination.

No prominent CTA in the header.

### Homepage

Vertically stack:

1. vaults.rip / factual introduction
2. About
3. Checks link
4. Cases link
5. repository/source links if useful
6. minimal footer

About appears before Cases.

Do not create a conventional "hero".

The first section can have generous space and large typography, but it should contain factual explanatory prose rather than a headline + tagline + CTA pattern.

### Checks index

Use one vertically flowing page grouped by protocol and then component. Generate a compact contents tree at the top and give each check a stable `checkId` anchor.

Render every check from its canonical Markdown. Show related cases and optional executable examples from check frontmatter.

Do not create separate human-readable pages for individual checks. Links to a check should point to `/checks/#<checkId>`.

### Case index

Group cases by protocol and link to their individual reading pages.

Protocol should preferably be represented by its recognizable logo.

Do not show:
- internal IDs
- severity
- status
- publication date

Do not show internal IDs, components, severity, status or publication dates. Do not add filtering or sorting until the number of cases makes it useful.

### Case pages

No sidebar.

No dashboard.

Use a compact, generated table of contents near the top of each case page. It should link only to sections present in that case and remain visually secondary to the case title and content.

Use one vertically flowing reading column.

Cases are free-form research notes. Do not require or fabricate sections merely to satisfy a template.

Show the protocol, but do not force a case into one component: one case may support several checks.

Show a compact list of related check links near the end of each case. Keep those links in the canonical case Markdown so local raw views contain them; verify them against check frontmatter and do not duplicate the check instructions inside the case.

Machine-readable Markdown link at the bottom where useful.

Sections remain vertically stacked even on wide displays.

Keep every case section in one vertical reading column.

---

## 6. Layout philosophy

Never optimize for information density.

Do not ask:
"How much can fit above the fold?"

Ask:
"How comfortably can this be read?"

Whitespace is an intentional component of the design.

Use a wide page shell but constrain prose to a comfortable reading width.

Suggested desktop geometry:

- outer page max-width: 1200–1280px
- prose width: 720–820px
- table/index content may use the wider shell
- horizontal page padding: 40–64px desktop
- section spacing: 64–96px where appropriate
- heading → body spacing: 20–28px
- paragraphs: ~18–24px apart
- line height: approximately 1.6–1.75 for prose

Do not compress vertical spacing merely because the page becomes long.

Long pages are acceptable.

---

## 7. Typography

The site should feel like a high-quality reader or technical publication.

Do not use a stereotypical developer/AI aesthetic.

Avoid:
- monospace body copy
- overly geometric SaaS typography
- giant ultra-bold landing-page headings
- condensed tech fonts
- excessive uppercase
- letter-spaced eyebrow text

### Recommended stack

Editorial/display:
**Newsreader**

Use for:
- vaults.rip wordmark
- H1
- H2
- major article headings

Body/interface:
**Source Sans 3**

Use for:
- prose
- navigation
- metadata
- tables
- link previews

Technical:
**IBM Plex Mono**

Use only for:
- addresses
- code
- transaction hashes
- configuration values
- identifiers

Do not use monospace merely to make something look technical.

### General type behavior

Headings should have softer curves and editorial character.

Body text should be visibly larger and more relaxed than a typical dashboard.

Do not make metadata compete visually with prose.

Do not use uppercase metadata unless extremely restrained.

---

## 8. Color

Dark mode first.

Use near-black with a slight blue character, not pure black.

Example palette:

background: #080D13
surface: #0D141D
border: #202A35

text-primary: #E9EDF2
text-secondary: #A6AFBA
text-muted: #747E89

accent: #5EA7FF

Accent blue is primarily for:
- links
- active navigation
- subtle interactive states

Do not create large blue surfaces.

Do not introduce gradients.

Do not introduce purple.

Do not use neon effects.

Do not create red/amber/green severity systems unless the data model explicitly requires them.

---

## 9. Visual restraint

Avoid generic AI-generated frontend patterns:

- glassmorphism
- gradients
- oversized rounded cards
- card grids
- decorative blobs
- glowing borders
- floating UI panels
- metric counters
- fake dashboards
- feature sections
- icon-filled feature grids
- excessive pills/badges
- ornamental charts
- hero illustrations
- gratuitous animations

Prefer:
- typography
- whitespace
- thin rules
- protocol logos
- source imagery when meaningful
- good link previews
- excellent typesetting

The site does not need to visually prove that it is sophisticated.

---

## 10. Examples

Examples are evidence.

Do not render them as generic application cards.

Prefer an editorial/link-preview treatment similar to a restrained OpenGraph preview:

[optional favicon / source logo / thumbnail]

Example title
source domain
one or two factual lines describing what the example demonstrates

→

Use:
- generous vertical padding
- subtle separator lines
- little or no enclosing box
- source identity where available
- previews retrieved from actual link metadata where practical

The purpose is to make source material easy to inspect.

---

## 11. LLM-first design

Machine readability is a first-class requirement.

Important research content must exist in Markdown or another text-native source format.

Do not bury substantive information exclusively inside React components.

Maintain:
- `/llms.txt` as the canonical scanner entrypoint, output contract and complete generated scanner document
- protocol skills as the canonical source for each protocol procedure, with check Markdown appended into `/llms.txt`
- permanent `/SKILL.md` and `/skills.md` redirects to `/llms.txt`
- `/checks/` as the complete human-readable check list
- `/cases/` as the complete human-readable case list
- stable case URLs
- Markdown source for every case
- Markdown source for every check
- structured frontmatter
- clear links to reproductions and checks

A person or agent should be able to clone the repository and understand its knowledge structure without rendering the website.

The human site and machine-readable corpus should derive from the same source content.

---

## 12. Components should justify themselves

Before introducing a new UI component, ask:

1. Does it improve reading?
2. Does it improve navigation?
3. Does it expose evidence?
4. Does it enable a real action?

If none apply, do not add it.

Do not create a component simply because there is empty space.

---

## 13. Preserve the editorial character

When implementing new functionality such as checkers:

Do not redesign the surrounding site into a product UI.

Checks should read as concise operational instructions. Cases remain separate, free-form supporting research.

A checker may contain inputs, evidence and results where necessary, but it should not cause the global visual language to become dashboard-like.

---

## 14. Final UI review

Before completing any design task, inspect the page and remove anything that appears to have been added primarily to:

- fill space
- make the page look more like a startup
- create visual variety
- sound clever
- increase apparent information density
- make the project seem larger than it currently is

Prefer an unfinished-looking amount of empty space over fabricated sophistication.
