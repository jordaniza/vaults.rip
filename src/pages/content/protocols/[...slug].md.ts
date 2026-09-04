import type { APIRoute, GetStaticPaths } from "astro";
import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

export const getStaticPaths = (async () => {
  const checks = await getCollection("checks");

  return checks.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const entry = props.entry as CollectionEntry<"checks">;
  const metadata = [
    `Check ID: ${entry.data.checkId}`,
    `Protocol: ${entry.data.protocol}`,
    `Component: ${entry.data.component}`,
  ];
  const examples = entry.data.examples.map(
    (example) =>
      `- [${example}](https://github.com/jordaniza/vaults.rip/blob/main/examples/${example})`,
  );
  const content = [
    `# ${entry.data.title}`,
    metadata.join("\n"),
    entry.body?.trim() ?? "",
    examples.length > 0 ? ["## Examples", ...examples].join("\n\n") : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return new Response(`${content}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
