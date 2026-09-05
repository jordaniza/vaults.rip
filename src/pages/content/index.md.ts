import { getEntry } from "astro:content";

export const prerender = true;

export async function GET() {
  const homepage = await getEntry("pages", "index");
  if (!homepage?.body) {
    return new Response("Missing content/index.md\n", { status: 500 });
  }

  const content = homepage.body.trim();

  return new Response(`${content}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
