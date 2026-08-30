import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const pages = defineCollection({
  loader: glob({ pattern: "*.md", base: "./content", retainBody: true }),
});

const cases = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./content/cases",
    retainBody: true,
  }),
  schema: z.object({
    title: z.string(),
    protocol: z.string().nullable().default(null),
    component: z.string(),
    riskType: z.string(),
  }),
});

export const collections = { pages, cases };
