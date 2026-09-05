import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { renderProtocolSkill } from "../../lib/render-scanner";
import { renderSkill } from "../../lib/render-skill";

export const prerender = true;

export async function getStaticPaths() {
  const skills = await getCollection("skills");

  return skills.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

export async function GET({ props }: { props: { entry: CollectionEntry<"skills"> } }) {
  const { entry } = props;
  const content = entry.id === "morpho-v2/SKILL"
    ? await renderProtocolSkill(entry)
    : renderSkill(entry);

  if (!content) {
    return new Response(`Missing body for skills/${entry.id}.md\n`, {
      status: 500,
    });
  }

  return new Response(`${content}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
