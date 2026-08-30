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

  const caseDocuments = cases.map((entry) => {
    const metadata = [
      `Case ID: ${entry.data.caseId}`,
      `Protocol: ${entry.data.protocol}`,
      `Component: ${entry.data.component}`,
      `Human-readable: https://www.vaults.rip/cases/${entry.id}/`,
      `Canonical Markdown: https://www.vaults.rip/content/cases/${entry.id}.md`,
    ];

    return [
      `### ${entry.data.title}`,
      metadata.join("\n"),
      demoteHeadings(entry.body?.trim() ?? "", 2),
    ].join("\n\n");
  });

  const content = [
    "# vaults.rip",
    "> A collection of different ways a DeFi vault can be misconfigured.",
    demoteHeadings(homepage.body.trim(), 1),
    "## Cases",
    ...caseDocuments,
    "## Source",
    "- [GitHub repository](https://github.com/jordaniza/vaults.rip)",
  ].join("\n\n");

  return new Response(`${content}\n`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
