# About

vaults.rip is an LLM-first collection of checks for examining whether a DeFi vault is misconfigured.

## Why

I realised after years of depositing into vaults like Morpho and Euler, that I had a fairly surface-level understanding of the various controls curators have to direct vault capital.

The minimal design of Morpho vaults is very much optimised for security and governance minimisation, which shifts a lot of the burden to the user/curator. It's my view that, without an easy way to **verify** if a vault is secure, we are forced to **trust** the curator/protocol/whatever.

I therefore wanted to create a shortlist of checks that can be run by my LLM to verify if a vault is configured in a way that minimises my chances of losing money.

This site is a collection of those checks.

## Using

The [llms.txt](/llms.txt) provides the general procedure and links to the protocol skills that contain the checks.

**Checks** are operational instructions that an LLM or reviewer can apply to a vault or market.

**Cases** are supporting research examples that explain why a check exists and show what the condition can look like in practice. Cases provide context but are not required to run a review.

## [Checks](/checks/)

Actionable review instructions organized by protocol and component.

## [Cases](/cases/)

Worked research examples for readers who want more detail on a risk mechanism.
