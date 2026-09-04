import { getEntry } from "astro:content";
import { renderSkill } from "../lib/render-skill";

export const prerender = true;

export async function GET() {
  const skill = await getEntry("scanner", "SKILL");
  const content = skill && renderSkill(skill);

  if (!content) {
    return new Response("Missing SKILL.md\n", { status: 500 });
  }

  return new Response(`${content}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
