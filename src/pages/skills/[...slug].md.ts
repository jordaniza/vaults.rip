import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { renderSkill } from "../../lib/render-skill";

export const prerender = true;

export async function getStaticPaths() {
  const skills = await getCollection("skills");

  return skills.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

function buildMorphoChecks(checks: CollectionEntry<"checks">[]) {
  const componentOrder = ["Oracles", "Collateral", "Markets", "Vaults"];
  const sorted = checks.sort((left, right) => {
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
  });
  const lines: string[] = [];
  let currentComponent = "";

  for (const check of sorted) {
    if (check.data.component !== currentComponent) {
      currentComponent = check.data.component;
      lines.push(`### ${currentComponent}`, "");
    }

    lines.push(
      `- [${check.data.title}](https://www.vaults.rip/content/protocols/${check.id}.md)`,
    );
  }

  return lines.join("\n");
}

export async function GET({ props }: { props: { entry: CollectionEntry<"skills"> } }) {
  const { entry } = props;
  const content = renderSkill(entry);

  if (!content) {
    return new Response(`Missing body for skills/${entry.id}.md\n`, {
      status: 500,
    });
  }

  const sections = [content];

  if (entry.id === "morpho-v2/SKILL") {
    const checks = (await getCollection("checks")).filter(
      (check) => check.data.protocol === "Morpho",
    );
    sections.push(buildMorphoChecks(checks));
  }

  return new Response(`${sections.filter(Boolean).join("\n\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
