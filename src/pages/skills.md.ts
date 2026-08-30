import { getEntry } from "astro:content";

export const prerender = true;

export async function GET() {
  const skill = await getEntry("pages", "skills");

  if (!skill?.body) {
    return new Response("Missing content/skills.md\n", { status: 500 });
  }

  return new Response(`${skill.body.trim()}\n`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
