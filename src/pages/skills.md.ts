import { getCollection, getEntry } from "astro:content";

export const prerender = true;

export async function GET() {
  const skill = await getEntry("pages", "skills");
  const cases = (await getCollection("cases")).sort((left, right) =>
    left.id.localeCompare(right.id, undefined, { numeric: true }),
  );

  if (!skill?.body) {
    return new Response("Missing content/skills.md\n", { status: 500 });
  }

  const caseLinks = cases.map(
    (entry) =>
      `- [${entry.data.title}](https://www.vaults.rip/content/cases/${entry.id}.md): ${entry.data.protocol} ${entry.data.component} case.`,
  );
  const content = [skill.body.trim(), "## Cases", ...caseLinks].join("\n\n");

  return new Response(`${content}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
