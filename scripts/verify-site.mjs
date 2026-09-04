import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = process.cwd();
const contentRoot = path.join(repositoryRoot, "content");
const casesRoot = path.join(contentRoot, "cases");
const protocolsRoot = path.join(contentRoot, "protocols");
const examplesRoot = path.join(repositoryRoot, "examples");
const skillsRoot = path.join(repositoryRoot, "skills");
const publicRoot = path.join(repositoryRoot, "public");
const outputRoot = path.join(repositoryRoot, "dist");
const failures = [];

const caseHeadingOrder = [
  "Summary",
  "Context",
  "Where it goes wrong",
  "Example",
  "How to address",
];
const requiredCaseHeadings = new Set([
  "Summary",
  "Example",
  "How to address",
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

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
await requireFile(path.join(contentRoot, "llms.md"), "LLM routing guidance");
await requireFile(path.join(repositoryRoot, "SKILL.md"), "vault scanner skill");
for (const skillName of ["morpho-v2", "etherscan", "smart-contracts"]) {
  await requireFile(
    path.join(skillsRoot, skillName, "SKILL.md"),
    `${skillName} skill`,
  );
}
await requireFile(path.join(repositoryRoot, "foundry.toml"), "Foundry configuration");
await requireFile(path.join(examplesRoot, "README.md"), "Foundry examples guide");
await requireFile(
  path.join(repositoryRoot, "src", "pages", "llms.txt.ts"),
  "generated LLM endpoint",
);
await requireFile(path.join(repositoryRoot, "design", "DESIGN_SPEC.md"), "design specification");
await requireFile(path.join(repositoryRoot, "vercel.json"), "Vercel configuration");

const homepageMarkdown = await readFile(path.join(contentRoot, "index.md"), "utf8");
const llmsGuideMarkdown = await readFile(path.join(contentRoot, "llms.md"), "utf8");
const foundryConfiguration = await readFile(
  path.join(repositoryRoot, "foundry.toml"),
  "utf8",
);

if (!/^test\s*=\s*["']examples["']\s*$/m.test(foundryConfiguration)) {
  fail('foundry.toml must configure test = "examples".');
}

if (/^# Cases\s*$/m.test(homepageMarkdown)) {
  fail("content/index.md must not contain a manually maintained case index.");
}

const readme = await readFile(path.join(repositoryRoot, "README.md"), "utf8");
const readmeWhy = readme.match(/## Why\n([\s\S]*?)(?=\n## )/)?.[0];
const homepageWhy = homepageMarkdown.match(
  /^## Why\n[\s\S]*?(?=\n## Using\n)/m,
)?.[0];

if (readmeWhy?.trim() !== homepageWhy?.trim()) {
  fail("README.md Why copy has drifted from content/index.md.");
}

const caseFiles = (await walk(casesRoot)).filter((filePath) =>
  filePath.endsWith(".md"),
);
const casePaths = [];
const caseIds = new Set();
const protocolCaseNumbers = new Map();

for (const caseFile of caseFiles) {
  const relativeCaseFile = path.relative(casesRoot, caseFile);
  const caseSegments = relativeCaseFile.split(path.sep);

  if (caseSegments.length !== 2) {
    fail(
      `Case Markdown must use content/cases/<protocol>/<number>.md: ${relativeCaseFile}`,
    );
    continue;
  }

  const [protocolSlug, caseFileName] = caseSegments;
  const caseNumber = path.basename(caseFileName, ".md");
  const casePath = `${protocolSlug}/${caseNumber}`;
  const markdown = await readFile(caseFile, "utf8");
  const frontmatter = parseFrontmatter(markdown, relativeCaseFile);
  casePaths.push(casePath);

  const protocolNumbers = protocolCaseNumbers.get(protocolSlug) ?? [];
  protocolNumbers.push(Number(caseNumber));
  protocolCaseNumbers.set(protocolSlug, protocolNumbers);

  for (const field of ["title", "caseId", "protocol", "component"]) {
    if (!frontmatter.has(field)) {
      fail(`${relativeCaseFile} is missing the ${field} frontmatter field.`);
    }
  }

  for (const field of ["title", "caseId", "protocol", "component"]) {
    if (!frontmatter.get(field)) {
      fail(`${relativeCaseFile} has an empty ${field} frontmatter field.`);
    }
  }

  if (!/^[a-z0-9-]+$/.test(protocolSlug)) {
    fail(`${relativeCaseFile} has an invalid protocol directory.`);
  }

  if (!/^[1-9]\d*$/.test(caseNumber)) {
    fail(`${relativeCaseFile} must use a positive, unpadded case number.`);
  }

  const expectedCaseId = `${protocolSlug}${caseNumber}`;
  const caseId = frontmatter.get("caseId");

  if (caseId !== expectedCaseId) {
    fail(
      `${relativeCaseFile} must use caseId: ${expectedCaseId} to match its path.`,
    );
  } else if (caseIds.has(caseId)) {
    fail(`${relativeCaseFile} duplicates caseId: ${caseId}.`);
  } else {
    caseIds.add(caseId);
  }

  if (toSlug(frontmatter.get("protocol") ?? "") !== protocolSlug) {
    fail(`${relativeCaseFile} protocol does not match its directory.`);
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

  const rawCasePath = path.join(
    outputRoot,
    "content",
    "cases",
    protocolSlug,
    `${caseNumber}.md`,
  );

  await requireFile(
    path.join(outputRoot, "cases", protocolSlug, caseNumber, "index.html"),
    `rendered case page for ${casePath}`,
  );

  if (await requireFile(rawCasePath, `raw case Markdown for ${casePath}`)) {
    const rawCase = await readFile(rawCasePath, "utf8");

    if (!rawCase.includes(`Case ID: ${caseId}`)) {
      fail(`Raw case Markdown is missing Case ID: ${caseId}.`);
    }
  }
}

for (const [protocolSlug, numbers] of protocolCaseNumbers) {
  numbers.sort((left, right) => left - right);

  for (const [index, number] of numbers.entries()) {
    if (number !== index + 1) {
      fail(`${protocolSlug} case numbers must increase from 1 without gaps.`);
      break;
    }
  }
}

const checkFiles = (await walk(protocolsRoot)).filter((filePath) =>
  filePath.endsWith(".md"),
);
const checkIds = new Set();
const checkPaths = [];

for (const checkFile of checkFiles) {
  const relativeCheckFile = path.relative(protocolsRoot, checkFile);
  const checkSegments = relativeCheckFile.split(path.sep);

  if (checkSegments.length !== 3) {
    fail(
      `Check Markdown must use content/protocols/<protocol>/<component>/<slug>.md: ${relativeCheckFile}`,
    );
    continue;
  }

  const [protocolSlug, componentSlug, checkFileName] = checkSegments;
  const checkSlug = path.basename(checkFileName, ".md");
  const checkPath = `${protocolSlug}/${componentSlug}/${checkSlug}`;
  const markdown = await readFile(checkFile, "utf8");
  const frontmatter = parseFrontmatter(markdown, relativeCheckFile);
  checkPaths.push(checkPath);

  for (const field of [
    "checkId",
    "protocol",
    "component",
    "title",
    "slug",
    "examples",
  ]) {
    if (!frontmatter.has(field)) {
      fail(`${relativeCheckFile} is missing the ${field} frontmatter field.`);
    }
  }

  for (const field of ["checkId", "protocol", "component", "title", "slug"]) {
    if (!frontmatter.get(field)) {
      fail(`${relativeCheckFile} has an empty ${field} frontmatter field.`);
    }
  }

  if (frontmatter.get("slug") !== checkSlug) {
    fail(`${relativeCheckFile} slug must match its filename.`);
  }

  if (toSlug(frontmatter.get("protocol") ?? "") !== protocolSlug) {
    fail(`${relativeCheckFile} protocol does not match its directory.`);
  }

  if (toSlug(frontmatter.get("component") ?? "") !== componentSlug) {
    fail(`${relativeCheckFile} component does not match its directory.`);
  }

  const checkId = frontmatter.get("checkId") ?? "";
  const expectedCheckIdPrefix = `${protocolSlug}-${componentSlug}-`;

  if (!new RegExp(`^${escapeRegularExpression(expectedCheckIdPrefix)}[1-9]\\d*$`).test(checkId)) {
    fail(`${relativeCheckFile} checkId must start with ${expectedCheckIdPrefix}.`);
  } else if (checkIds.has(checkId)) {
    fail(`${relativeCheckFile} duplicates checkId: ${checkId}.`);
  } else {
    checkIds.add(checkId);
  }

  const levelTwoHeadings = [...markdown.matchAll(/^##\s+(.+)$/gm)].map(
    (match) => match[1],
  );

  if (
    levelTwoHeadings.length !== 1 ||
    levelTwoHeadings[0] !== "What to check"
  ) {
    fail(`${relativeCheckFile} must contain only one section: “What to check”.`);
  }

  const rawCheckPath = path.join(
    outputRoot,
    "content",
    "protocols",
    protocolSlug,
    componentSlug,
    `${checkSlug}.md`,
  );

  if (await requireFile(rawCheckPath, `raw check Markdown for ${checkPath}`)) {
    const rawCheck = await readFile(rawCheckPath, "utf8");

    if (!rawCheck.includes(`Check ID: ${checkId}`)) {
      fail(`Raw check Markdown is missing Check ID: ${checkId}.`);
    }
  }
}

const publicCaseAssetsRoot = path.join(publicRoot, "content", "cases");

if (await exists(publicCaseAssetsRoot)) {
  const caseAssetFiles = await walk(publicCaseAssetsRoot);

  for (const assetFile of caseAssetFiles) {
    const relativeAsset = path.relative(publicCaseAssetsRoot, assetFile);
    const assetSegments = relativeAsset.split(path.sep);
    const assetCasePath = assetSegments.slice(0, 2).join("/");

    if (assetSegments.length < 3 || !casePaths.includes(assetCasePath)) {
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

const designMorphoLogo = await readFile(
  path.join(repositoryRoot, "design", "protocols", "morpho.svg"),
);
const publicMorphoLogo = await readFile(
  path.join(publicRoot, "protocols", "morpho.svg"),
);

if (!designMorphoLogo.equals(publicMorphoLogo)) {
  fail("Public Morpho logo has drifted from design/protocols/morpho.svg.");
}

for (const outputFile of [
  "index.html",
  "llms.txt",
  "SKILL.md",
  "skills.md",
  path.join("skills", "morpho-v2", "SKILL.md"),
  path.join("skills", "etherscan", "SKILL.md"),
  path.join("skills", "smart-contracts", "SKILL.md"),
  path.join("content", "index.md"),
]) {
  await requireFile(path.join(outputRoot, outputFile), `build output ${outputFile}`);
}

const generatedHomepage = await readFile(path.join(outputRoot, "index.html"), "utf8");
const generatedContentIndex = await readFile(
  path.join(outputRoot, "content", "index.md"),
  "utf8",
);
const generatedLlms = await readFile(path.join(outputRoot, "llms.txt"), "utf8");
const generatedSkill = await readFile(path.join(outputRoot, "SKILL.md"), "utf8");
const generatedSkillAlias = await readFile(
  path.join(outputRoot, "skills.md"),
  "utf8",
);
const generatedMorphoSkill = await readFile(
  path.join(outputRoot, "skills", "morpho-v2", "SKILL.md"),
  "utf8",
);

for (const [label, document] of [
  ["SKILL.md", generatedSkill],
  ["skills.md", generatedSkillAlias],
  ["Morpho V2 skill", generatedMorphoSkill],
]) {
  if (!document.startsWith("---\nname:") || !document.includes("\ndescription:")) {
    fail(`Generated ${label} is missing Agent Skill frontmatter.`);
  }
}

if (!generatedLlms.includes("https://www.vaults.rip/SKILL.md")) {
  fail("Generated llms.txt is missing the SKILL.md discovery link.");
}

for (const upstreamMorphoSource of ["https://docs.morpho.org/llms.txt"]) {
  if (!generatedLlms.includes(upstreamMorphoSource)) {
    fail(`Generated llms.txt is missing upstream Morpho source: ${upstreamMorphoSource}`);
  }

  if (!generatedMorphoSkill.includes(upstreamMorphoSource)) {
    fail(`Generated Morpho V2 skill is missing upstream source: ${upstreamMorphoSource}`);
  }
}

if (generatedSkillAlias !== generatedSkill) {
  fail("Generated skills.md compatibility route has drifted from SKILL.md.");
}

for (const skillPath of [
  "skills/morpho-v2/SKILL.md",
  "skills/etherscan/SKILL.md",
  "skills/smart-contracts/SKILL.md",
]) {
  if (!generatedSkill.includes(skillPath)) {
    fail(`Generated SKILL.md is missing its skill route: ${skillPath}`);
  }
}

if (!generatedLlms.startsWith(llmsGuideMarkdown.trim())) {
  fail("Generated llms.txt has drifted from content/llms.md.");
}

for (const heading of ["## Navigation", "## Cases"]) {
  if (!generatedLlms.includes(heading)) {
    fail(`Generated llms.txt is missing required routing section: ${heading}`);
  }
}

if (generatedLlms.includes("## Why") || generatedLlms.includes("## Using")) {
  fail("Generated llms.txt must not duplicate the homepage overview sections.");
}

if (!generatedHomepage.includes('rel="describedby" href="/llms.txt"')) {
  fail("Homepage does not advertise /llms.txt with rel=describedby.");
}

if (
  !generatedHomepage.includes(
    'rel="alternate" type="text/plain" href="/content/index.md"',
  )
) {
  fail("Homepage does not advertise its raw Markdown alternate.");
}

const vercelConfiguration = JSON.parse(
  await readFile(path.join(repositoryRoot, "vercel.json"), "utf8"),
);
const llmsResponseHeader = vercelConfiguration.headers
  ?.flatMap((rule) => rule.headers ?? [])
  .find((header) => header.key?.toLowerCase() === "link");

if (!llmsResponseHeader?.value?.includes('</llms.txt>; rel="describedby"')) {
  fail("Vercel responses do not advertise /llms.txt with rel=describedby.");
}

for (const source of [
  "/llms.txt",
  "/SKILL.md",
  "/skills.md",
  "/skills/(.*).md",
  "/content/index.md",
  "/content/cases/(.*).md",
  "/content/protocols/(.*).md",
]) {
  const rule = vercelConfiguration.headers?.find((entry) => entry.source === source);
  const contentType = rule?.headers?.find(
    (header) => header.key?.toLowerCase() === "content-type",
  );

  if (contentType?.value !== "text/plain; charset=utf-8") {
    fail(`Vercel does not serve ${source} as UTF-8 plain text.`);
  }
}

for (const casePath of casePaths) {
  if (!generatedHomepage.includes(`/cases/${casePath}/`)) {
    fail(`Homepage is missing generated case link: ${casePath}`);
  }

  if (!generatedContentIndex.includes(`/content/cases/${casePath}.md`)) {
    fail(`Raw content index is missing generated case link: ${casePath}`);
  }

  if (!generatedLlms.includes(`https://www.vaults.rip/content/cases/${casePath}.md`)) {
    fail(`Generated llms.txt is missing direct case link: ${casePath}`);
  }

  const generatedCase = await readFile(
    path.join(outputRoot, "cases", casePath, "index.html"),
    "utf8",
  );

  if (!generatedCase.includes('rel="describedby" href="/llms.txt"')) {
    fail(`Rendered case does not advertise /llms.txt: ${casePath}`);
  }

  if (
    !generatedCase.includes(
      `rel="alternate" type="text/plain" href="/content/cases/${casePath}.md"`,
    )
  ) {
    fail(`Rendered case does not advertise its raw Markdown alternate: ${casePath}`);
  }

  if (
    !generatedCase.includes('class="case-return"') ||
    !generatedCase.includes('class="case-return-label">Home</span>') ||
    !generatedCase.includes('class="case-return-arrow" aria-hidden="true">←</span>')
  ) {
    fail(`Rendered case does not include return-to-home navigation: ${casePath}`);
  }
}

for (const checkPath of checkPaths) {
  if (
    !generatedMorphoSkill.includes(
      `https://www.vaults.rip/content/protocols/${checkPath}.md`,
    )
  ) {
    fail(`Generated Morpho V2 skill is missing direct check link: ${checkPath}`);
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
    `Site verification passed: ${casePaths.length} case, generated routes, content placement, and internal links are valid.`,
  );
}
