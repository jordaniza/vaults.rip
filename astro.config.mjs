import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.vaults.rip",
  output: "static",
  redirects: {
    "/cases/oracle-price-manipulation": "/cases/morpho/1",
    "/cases/custom-oracle-control": "/cases/morpho/1",
    "/content/cases/oracle-price-manipulation.md":
      "/content/cases/morpho/1.md",
    "/content/cases/custom-oracle-control.md": "/content/cases/morpho/1.md",
  },
});
