import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = process.cwd();
const contentRoot = path.join(repositoryRoot, "content");
const casesRoot = path.join(contentRoot, "cases");
const publicRoot = path.join(repositoryRoot, "public");
const outputRoot = path.join(repositoryRoot, "dist");
const failures = [];

const caseHeadingOrder = [
  "Summary",
  "Context",
  "Where it goes wrong",
  "Proof of concept",
  "In the wild",
  "How to spot it",
  "How to fix it",
];
const requiredCaseHeadings = new Set([
  "Summary",
  "Where it goes wrong",
  "Proof of concept",
  "How to spot it",
  "How to fix it",
]);

function fail(message) {
  failures.push(message);
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function requireFile(filePath, label) {
  if (!(await exists(filePath))) {
    fail(`Missing ${label}: ${path.relative(repositoryRoot, filePath)}`);
    return false;
  }

  return true;
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walk(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function parseFrontmatter(markdown, fileName) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);

  if (!match) {
    fail(`${fileName} must start with YAML frontmatter.`);
    return new Map();
  }

  return new Map(
    match[1].split("\n").flatMap((line) => {
      const field = line.match(/^([A-Za-z][A-Za-z0-9]*):(?:\s*(.*))?$/);
      return field ? [[field[1], field[2]?.trim() ?? ""]] : [];
    }),
  );
}

function escapeRegularExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function resolveOutputReference(sourceFile, reference) {
  if (
    /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(reference) ||
    reference.startsWith("data:")
  ) {
    return;
  }

  const [withoutFragment, fragment] = reference.split("#", 2);
  const pathPart = withoutFragment.split("?", 1)[0];
  let decodedPath;

  try {
    decodedPath = decodeURIComponent(pathPart);
  } catch {
    fail(`Invalid encoded reference in ${path.relative(outputRoot, sourceFile)}: ${reference}`);
    return;
  }

  let candidate = decodedPath.startsWith("/")
    ? path.join(outputRoot, decodedPath.slice(1))
    : path.resolve(path.dirname(sourceFile), decodedPath || path.basename(sourceFile));

  const candidateStats = await stat(candidate).catch(() => null);

  if (candidateStats?.isDirectory()) {
    candidate = path.join(candidate, "index.html");
  } else if (!candidateStats && !path.extname(candidate)) {
    const htmlCandidate = `${candidate}.html`;
    const indexCandidate = path.join(candidate, "index.html");

    if (await exists(htmlCandidate)) {
      candidate = htmlCandidate;
    } else {
      candidate = indexCandidate;
    }
  }

  if (!(await exists(candidate))) {
    fail(
      `Dead internal reference in ${path.relative(outputRoot, sourceFile)}: ${reference}`,
    );
    return;
  }

  if (fragment && candidate.endsWith(".html")) {
    const targetHtml = await readFile(candidate, "utf8");
    const idPattern = new RegExp(
      `\\bid=["']${escapeRegularExpression(decodeURIComponent(fragment))}["']`,
    );

    if (!idPattern.test(targetHtml)) {
      fail(
        `Missing fragment target in ${path.relative(outputRoot, sourceFile)}: ${reference}`,
      );
    }
  }
}

await requireFile(path.join(contentRoot, "index.md"), "homepage Markdown");
await requireFile(path.join(publicRoot, "llms.txt"), "LLM map");
await requireFile(path.join(repositoryRoot, "design", "DESIGN_SPEC.md"), "design specification");

const homepageMarkdown = await readFile(path.join(contentRoot, "index.md"), "utf8");

if (/^# Cases\s*$/m.test(homepageMarkdown)) {
  fail("content/index.md must not contain a manually maintained case index.");
}

const readme = await readFile(path.join(repositoryRoot, "README.md"), "utf8");
const readmeAbout = readme.match(/## About\n([\s\S]*?)(?=\n## )/)?.[0];
const expectedReadmeAbout = homepageMarkdown
  .trim()
  .replace(/^## /gm, "### ")
  .replace(/^# About$/m, "## About");

if (readmeAbout?.trim() !== expectedReadmeAbout) {
  fail("README.md About copy has drifted from content/index.md.");
}

const caseFiles = (await walk(casesRoot)).filter((filePath) =>
  filePath.endsWith(".md"),
);
const caseSlugs = [];

for (const caseFile of caseFiles) {
  const relativeCaseFile = path.relative(casesRoot, caseFile);

  if (relativeCaseFile.includes(path.sep)) {
    fail(`Case Markdown must be a direct child of content/cases/: ${relativeCaseFile}`);
    continue;
  }

  const slug = path.basename(caseFile, ".md");
  const markdown = await readFile(caseFile, "utf8");
  const frontmatter = parseFrontmatter(markdown, relativeCaseFile);
  caseSlugs.push(slug);

  for (const field of ["title", "protocol", "component", "riskType"]) {
    if (!frontmatter.has(field)) {
      fail(`${relativeCaseFile} is missing the ${field} frontmatter field.`);
    }
  }

  for (const field of ["title", "component", "riskType"]) {
    if (!frontmatter.get(field)) {
      fail(`${relativeCaseFile} has an empty ${field} frontmatter field.`);
    }
  }

  let previousHeadingPosition = -1;

  for (const heading of caseHeadingOrder) {
    const headingPosition = markdown.indexOf(`\n## ${heading}\n`);

    if (headingPosition === -1 && requiredCaseHeadings.has(heading)) {
      fail(`${relativeCaseFile} is missing the “${heading}” section.`);
    } else if (
      headingPosition !== -1 &&
      headingPosition < previousHeadingPosition
    ) {
      fail(`${relativeCaseFile} has case sections out of order.`);
    }

    if (headingPosition !== -1) {
      previousHeadingPosition = headingPosition;
    }
  }

  await requireFile(
    path.join(outputRoot, "cases", slug, "index.html"),
    `rendered case page for ${slug}`,
  );
  await requireFile(
    path.join(outputRoot, "content", "cases", `${slug}.md`),
    `raw case Markdown for ${slug}`,
  );
}

const publicCaseAssetsRoot = path.join(publicRoot, "content", "cases");

if (await exists(publicCaseAssetsRoot)) {
  const caseAssetFiles = await walk(publicCaseAssetsRoot);

  for (const assetFile of caseAssetFiles) {
    const relativeAsset = path.relative(publicCaseAssetsRoot, assetFile);
    const [assetCaseSlug] = relativeAsset.split(path.sep);

    if (!caseSlugs.includes(assetCaseSlug)) {
      fail(`Orphaned case asset without matching Markdown: ${relativeAsset}`);
    }

    const assetStats = await stat(assetFile);

    if (assetStats.size === 0) {
      fail(`Empty case asset: ${relativeAsset}`);
    }
  }
}

for (const assetName of [
  "vaults-rip-logo.png",
  "vaults-rip-social-preview.png",
]) {
  const designAsset = await readFile(
    path.join(repositoryRoot, "design", assetName),
  );
  const publicAsset = await readFile(path.join(publicRoot, "design", assetName));

  if (!designAsset.equals(publicAsset)) {
    fail(`Public design asset has drifted from design/${assetName}.`);
  }
}

for (const outputFile of [
  "index.html",
  "llms.txt",
  path.join("content", "index.md"),
]) {
  await requireFile(path.join(outputRoot, outputFile), `build output ${outputFile}`);
}

const generatedHomepage = await readFile(path.join(outputRoot, "index.html"), "utf8");
const generatedContentIndex = await readFile(
  path.join(outputRoot, "content", "index.md"),
  "utf8",
);

for (const slug of caseSlugs) {
  if (!generatedHomepage.includes(`/cases/${slug}/`)) {
    fail(`Homepage is missing generated case link: ${slug}`);
  }

  if (!generatedContentIndex.includes(`/content/cases/${slug}.md`)) {
    fail(`Raw content index is missing generated case link: ${slug}`);
  }
}

const outputFiles = await walk(outputRoot);

for (const outputFile of outputFiles.filter((filePath) =>
  filePath.endsWith(".html"),
)) {
  const html = await readFile(outputFile, "utf8");
  const references = [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)].map(
    (match) => match[1],
  );

  for (const reference of references) {
    await resolveOutputReference(outputFile, reference);
  }
}

if (failures.length > 0) {
  console.error("Site verification failed:\n");

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  process.exitCode = 1;
} else {
  console.log(
    `Site verification passed: ${caseSlugs.length} case, generated routes, content placement, and internal links are valid.`,
  );
}
