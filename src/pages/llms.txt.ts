import { getCollection, getEntry } from "astro:content";

export const prerender = true;

export async function GET() {
  const guide = await getEntry("pages", "llms");
  const cases = (await getCollection("cases")).sort((left, right) =>
    left.id.localeCompare(right.id, undefined, { numeric: true }),
  );

  if (!guide?.body) {
    return new Response("Missing content/llms.md\n", { status: 500 });
  }

  const caseLinks = cases.map(
    (entry) =>
      `- [${entry.data.title}](https://www.vaults.rip/content/cases/${entry.id}.md) — Protocol: ${entry.data.protocol}. Component: ${entry.data.component}. Case ID: ${entry.data.caseId}.`,
  );

  const content = [
    guide.body.trim(),
    "## Cases",
    caseLinks.join("\n"),
  ].join("\n\n");

  return new Response(`${content}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
