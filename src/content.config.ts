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
    caseId: z.string().regex(/^[a-z][a-z0-9-]*\d+$/),
    protocol: z.string().min(1),
    component: z.string(),
  }),
});

export const collections = { pages, cases };
