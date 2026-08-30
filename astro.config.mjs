import { defineConfig } from "astro/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const caseContentRoot = fileURLToPath(
  new URL("./content/cases/", import.meta.url),
);

const serveCaseMarkdownInDev = {
  name: "serve-case-markdown-in-dev",
  enforce: "pre",
  configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      if (!request.url) return next();

      const pathname = new URL(request.url, "http://localhost").pathname;
      const match = pathname.match(
        /^\/content\/cases\/([a-zA-Z0-9/_-]+)\.md$/,
      );

      if (!match) return next();

      try {
        const markdown = await readFile(
          resolve(caseContentRoot, `${match[1]}.md`),
          "utf8",
        );

        response.statusCode = 200;
        response.setHeader("Content-Type", "text/markdown; charset=utf-8");
        response.setHeader("Cache-Control", "no-cache");
        response.end(markdown);
      } catch (error) {
        if (error && typeof error === "object" && "code" in error) {
          if (error.code === "ENOENT") return next();
        }

        next(error);
      }
    });
  },
};

export default defineConfig({
  site: "https://www.vaults.rip",
  output: "static",
  vite: {
    plugins: [serveCaseMarkdownInDev],
  },
  redirects: {
    "/cases/oracle-price-manipulation": "/cases/morpho/1",
    "/cases/custom-oracle-control": "/cases/morpho/1",
    "/content/cases/oracle-price-manipulation.md":
      "/content/cases/morpho/1.md",
    "/content/cases/custom-oracle-control.md": "/content/cases/morpho/1.md",
  },
});
