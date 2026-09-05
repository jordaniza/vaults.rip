import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async ({ url }, next) => {
  const response = await next();

  if (
    !response.ok ||
    (!url.pathname.endsWith(".md") && !url.pathname.endsWith(".txt"))
  ) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set("Content-Type", "text/plain; charset=utf-8");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
