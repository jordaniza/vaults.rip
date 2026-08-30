import { getCollection, getEntry } from "astro:content";

export const prerender = true;

export async function GET() {
  const homepage = await getEntry("pages", "index");
  const cases = (await getCollection("cases")).sort((left, right) =>
    left.data.title.localeCompare(right.data.title),
  );

  if (!homepage?.body) {
    return new Response("Missing content/index.md\n", { status: 500 });
  }

  const caseRows = cases.map(
    (entry) =>
      `| ${entry.data.caseId} | [${entry.data.title}](https://www.vaults.rip/content/cases/${entry.id}.md) | ${entry.data.protocol} | ${entry.data.component} |`,
  );
  const caseTable = [
    "| Case ID | Case | Protocol | Component |",
    "| --- | --- | --- | --- |",
    ...caseRows,
  ].join("\n");
  const content = [homepage.body.trim(), "# Cases", caseTable].join("\n\n");

  return new Response(`${content}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
