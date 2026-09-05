import { defineConfig } from "astro/config";

function machineRouteDevHeaders() {
  return {
    name: "vaults-rip-machine-route-dev-headers",
    enforce: "post",
    configureServer(server) {
      return () => {
        const machineRouteMiddleware = (request, response, next) => {
          const pathname = new URL(request.url ?? "/", "http://localhost").pathname;

          if (pathname === "/SKILL.md" || pathname === "/skills.md") {
            response.statusCode = 308;
            response.setHeader("Location", "/llms.txt");
            response.end();
            return;
          }

          if (pathname.endsWith(".md") || pathname.endsWith(".txt")) {
            // Browsers send `Accept: text/html` for top-level navigation. Astro's
            // dev route guard otherwise treats matching root Markdown files as
            // source requests. Classify the request as plain text before that
            // guard runs so Astro serves the generated endpoint, not the source.
            request.headers.accept = "text/plain,*/*";
            response.setHeader("Content-Type", "text/plain; charset=utf-8");
          }

          next();
        };

        server.middlewares.use(machineRouteMiddleware);

        // Astro 7 defers installation of its root-file route guard until Vite's
        // configureServer post hooks. This plugin also runs as a post hook, then
        // moves its rewrite ahead of that guard.
        const middleware = server.middlewares.stack.pop();
        if (middleware) server.middlewares.stack.unshift(middleware);
      };
    },
  };
}

export default defineConfig({
  site: "https://www.vaults.rip",
  output: "static",
  vite: {
    plugins: [machineRouteDevHeaders()],
  },
  redirects: {
    "/SKILL.md": { status: 308, destination: "/llms.txt" },
    "/skills.md": { status: 308, destination: "/llms.txt" },
    "/cases/oracle-price-manipulation": "/cases/morpho/1",
    "/cases/custom-oracle-control": "/cases/morpho/1",
    "/content/cases/oracle-price-manipulation.md":
      "/content/cases/morpho/1.md",
    "/content/cases/custom-oracle-control.md": "/content/cases/morpho/1.md",
    "/content/protocols/morpho/oracles/settable.md":
      "/checks/#morpho-v2-oracles-2",
    "/content/protocols/morpho/oracles/upgradable.md":
      "/checks/#morpho-v2-oracles-3",
    "/content/protocols/morpho/oracles/fixed-price.md":
      "/checks/#morpho-v2-oracles-4",
  },
});
