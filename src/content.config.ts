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

const checks = defineCollection({
  loader: glob({
    pattern: "*/*/*.md",
    base: "./content/protocols",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
    retainBody: true,
  }),
  schema: z.object({
    checkId: z.string().regex(/^[a-z][a-z0-9-]*-[a-z][a-z0-9-]*-\d+$/),
    protocol: z.string().min(1),
    component: z.string().min(1),
    title: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    examples: z.array(z.string()).default([]),
  }),
});

const skillSchema = z.object({
  name: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().min(1),
});

const scanner = defineCollection({
  loader: glob({
    pattern: "SKILL.md",
    base: ".",
    generateId: () => "SKILL",
    retainBody: true,
  }),
  schema: skillSchema,
});

const skills = defineCollection({
  loader: glob({
    pattern: "*/SKILL.md",
    base: "./skills",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
    retainBody: true,
  }),
  schema: skillSchema,
});

export const collections = { pages, cases, checks, scanner, skills };
