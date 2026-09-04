# vaults.rip

vaults.rip is a technical knowledge base of documented DeFi vault and market failure cases.

## Navigation

- Start with [`SKILL.md`](https://www.vaults.rip/SKILL.md) when checking a vault or market. It defines the scanner's scope and routes to the protocol and supporting skills required for the review.
- The scanner currently supports Morpho Vault V2 only. Do not apply its protocol procedure to Morpho Vault V1 or another vault implementation.
- For Morpho mechanics, interfaces and data access, use [Morpho's maintained `llms.txt`](https://docs.morpho.org/llms.txt). vaults.rip adds adversarial configuration checks rather than duplicating Morpho's documentation.
- Alternatively, browse the cases listed below to enumerate known failure modes or read a specific example.
- Use `/content/cases/<protocol>/<number>.md` for the machine-readable version of a case and `/cases/<protocol>/<number>/` for its human-readable rendering.
- The public source repository is [`github.com/jordaniza/vaults.rip`](https://github.com/jordaniza/vaults.rip). It contains the skills, checks, Markdown sources and optional Foundry examples.
