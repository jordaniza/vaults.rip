import { getCollection, getEntry } from "astro:content";

export const prerender = true;

function demoteHeadings(markdown: string, levels: number) {
  return markdown.replace(
    /^(#{1,6})(?=\s)/gm,
    (heading) => `${"#".repeat(levels)}${heading}`,
  );
}

export async function GET() {
  const homepage = await getEntry("pages", "index");
  const cases = (await getCollection("cases")).sort((left, right) =>
    left.id.localeCompare(right.id, undefined, { numeric: true }),
  );

  if (!homepage?.body) {
    return new Response("Missing content/index.md\n", { status: 500 });
  }

  const caseLinks = cases.map(
    (entry) =>
      `- [${entry.data.title}](https://www.vaults.rip/content/cases/${entry.id}.md): ${entry.data.protocol} ${entry.data.component} case. Case ID: ${entry.data.caseId}.`,
  );

  const content = [
    "# vaults.rip",
    "> A collection of different ways a DeFi vault can be misconfigured.",
    demoteHeadings(homepage.body.trim(), 1),
    "## Cases",
    ...caseLinks,
    "## Source",
    "- [GitHub repository](https://github.com/jordaniza/vaults.rip)",
  ].join("\n\n");

  return new Response(`${content}\n`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
