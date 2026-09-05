import { renderScanner } from "../lib/render-scanner";

export const prerender = true;

export async function GET() {
  const content = await renderScanner();

  if (!content) {
    return new Response("Missing SKILL.md\n", { status: 500 });
  }

  return new Response(`${content}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
