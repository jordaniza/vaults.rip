import type { CollectionEntry } from "astro:content";
import { getCollection, getEntry } from "astro:content";
import { renderSkill } from "./render-skill";

const componentOrder = ["Oracles", "Collateral", "Markets", "Vaults"];

function sortChecks(
  left: CollectionEntry<"checks">,
  right: CollectionEntry<"checks">,
) {
  const leftComponent = componentOrder.indexOf(left.data.component);
  const rightComponent = componentOrder.indexOf(right.data.component);
  const component =
    (leftComponent === -1 ? componentOrder.length : leftComponent) -
      (rightComponent === -1 ? componentOrder.length : rightComponent) ||
    left.data.component.localeCompare(right.data.component);

  return (
    component ||
    left.data.checkId.localeCompare(right.data.checkId, undefined, {
      numeric: true,
    })
  );
}

function renderChecks(
  checks: CollectionEntry<"checks">[],
  cases: CollectionEntry<"cases">[],
) {
  const casesById = new Map(cases.map((entry) => [entry.data.caseId, entry]));
  const sections: string[] = [];
  let currentComponent = "";

  for (const check of checks.sort(sortChecks)) {
    if (check.data.component !== currentComponent) {
      currentComponent = check.data.component;
      sections.push(`### ${currentComponent}`);
    }

    const metadata = [
      `Check ID: ${check.data.checkId}`,
      `Source: https://github.com/jordaniza/vaults.rip/blob/main/content/checks/${check.id}.md`,
    ];
    const examples = check.data.examples.map(
      (example) =>
        `- [${example}](https://github.com/jordaniza/vaults.rip/blob/main/examples/${example})`,
    );
    const relatedCases = check.data.cases.map((caseId) => {
      const relatedCase = casesById.get(caseId);

      if (!relatedCase) return `- Missing case: ${caseId}`;

      return `- [${relatedCase.data.title}](https://www.vaults.rip/content/cases/${relatedCase.id}.md)`;
    });

    sections.push(
      [
        `#### ${check.data.title}`,
        metadata.join("\n"),
        check.body?.trim() ?? "",
        examples.length ? ["Examples:", ...examples].join("\n") : "",
        relatedCases.length
          ? ["Related cases:", ...relatedCases].join("\n")
          : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    );
  }

  return sections.join("\n\n");
}

export async function renderScanner() {
  const [scanner, skills, checks] = await Promise.all([
    getEntry("scanner", "SKILL"),
    getCollection("skills"),
    getCollection("checks"),
  ]);

  if (!scanner) return;

  const root = renderSkill(scanner);
  if (!root) return;

  const protocolSlugs = new Set(
    checks.map((check) =>
      check.data.protocol
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    ),
  );
  const protocolSkills = skills.filter((entry) =>
    protocolSlugs.has(entry.id.replace(/\/SKILL$/, "")),
  );
  const renderedProtocols = await Promise.all(
    protocolSkills.map((entry) => renderProtocolSkill(entry)),
  );

  return [root, ...renderedProtocols.filter(Boolean)].join("\n\n");
}

export async function renderProtocolSkill(entry: CollectionEntry<"skills">) {
  const content = renderSkill(entry);

  if (!content) return;

  const protocolSlug = entry.id.replace(/\/SKILL$/, "");
  const [checks, cases] = await Promise.all([
    getCollection("checks"),
    getCollection("cases"),
  ]);
  const protocolChecks = checks.filter((check) => {
    const checkProtocolSlug = check.data.protocol
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return checkProtocolSlug === protocolSlug;
  });

  return protocolChecks.length
    ? [content, renderChecks(protocolChecks, cases)].join("\n\n")
    : content;
}
