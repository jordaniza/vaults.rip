import type { APIRoute, GetStaticPaths } from "astro";
import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

export const getStaticPaths = (async () => {
  const cases = await getCollection("cases");

  return cases.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const entry = props.entry as CollectionEntry<"cases">;
  const metadata = [
    `Case ID: ${entry.data.caseId}`,
    `Protocol: ${entry.data.protocol}`,
  ];
  const content = [
    `# ${entry.data.title}`,
    metadata.join("\n"),
    entry.body?.trim() ?? "",
  ].filter(Boolean).join("\n\n");

  return new Response(`${content}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
