import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const contentRoot = path.join(root, "content");
const casesRoot = path.join(contentRoot, "cases");
const checksRoot = path.join(contentRoot, "checks");
const examplesRoot = path.join(root, "examples");
const publicRoot = path.join(root, "public");
const outputRoot = path.join(root, "dist");
const failures = [];

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
    fail(`Missing ${label}: ${path.relative(root, filePath)}`);
    return false;
  }

  return true;
}

async function walk(directory) {
  if (!(await exists(directory))) return [];

  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    files.push(...(entry.isDirectory() ? await walk(entryPath) : [entryPath]));
  }

  return files;
}

function parseFrontmatter(markdown, fileName) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);

  if (!match) {
    fail(`${fileName} must start with YAML frontmatter.`);
    return { data: new Map(), body: markdown };
  }

  const data = new Map();
  let currentList;

  for (const line of match[1].split("\n")) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9]*):(?:\s*(.*))?$/);

    if (field) {
      const [, key, rawValue = ""] = field;
      const value = rawValue.trim();

      if (!value) {
        currentList = [];
        data.set(key, currentList);
      } else if (value === "[]") {
        currentList = [];
        data.set(key, currentList);
      } else {
        currentList = undefined;
        data.set(key, value.replace(/^(?:"(.*)"|'(.*)')$/, "$1$2"));
      }
      continue;
    }

    const item = line.match(/^\s+-\s+(.+)$/);
    if (item && currentList) currentList.push(item[1].trim());
  }

  return { data, body: markdown.slice(match[0].length).trim() };
}

function value(data, field) {
  const result = data.get(field);
  return typeof result === "string" ? result : "";
}

function list(data, field) {
  const result = data.get(field);
  return Array.isArray(result) ? result : [];
}

function toSlug(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeBody(body) {
  return body.toLowerCase().replace(/\s+/g, " ").trim();
}

function countOccurrences(document, needle) {
  return document.split(needle).length - 1;
}

function escapeRegularExpression(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function resolveOutputReference(sourceFile, reference) {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(reference) || reference.startsWith("data:")) {
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
    candidate = (await exists(htmlCandidate))
      ? htmlCandidate
      : path.join(candidate, "index.html");
  }

  if (!(await exists(candidate))) {
    fail(`Dead internal reference in ${path.relative(outputRoot, sourceFile)}: ${reference}`);
    return;
  }

  if (fragment && candidate.endsWith(".html")) {
    const targetHtml = await readFile(candidate, "utf8");
    const decodedFragment = decodeURIComponent(fragment);
    const idPattern = new RegExp(`\\bid=["']${escapeRegularExpression(decodedFragment)}["']`);

    if (!idPattern.test(targetHtml)) {
      fail(`Missing fragment target in ${path.relative(outputRoot, sourceFile)}: ${reference}`);
    }
  }
}

for (const [file, label] of [
  ["content/index.md", "homepage Markdown"],
  ["SKILL.md", "root scanner skill"],
  ["skills/morpho-v2/SKILL.md", "Morpho V2 skill"],
  ["skills/etherscan/SKILL.md", "Etherscan skill"],
  ["skills/smart-contracts/SKILL.md", "smart-contract skill"],
  ["foundry.toml", "Foundry configuration"],
  ["examples/README.md", "examples guide"],
  ["design/DESIGN_SPEC.md", "design specification"],
  ["vercel.json", "Vercel configuration"],
  [".husky/pre-commit", "Husky pre-commit hook"],
]) {
  await requireFile(path.join(root, file), label);
}

if (await exists(path.join(contentRoot, "llms.md"))) {
  fail("content/llms.md duplicates the generated scanner and must not exist.");
}

const protocolFiles = (await walk(path.join(contentRoot, "protocols"))).filter((file) => file.endsWith(".md"));
const protocolSlugs = new Set();
for (const file of protocolFiles) {
  const relative = path.relative(path.join(contentRoot, "protocols"), file);
  if (relative.split(path.sep).length !== 1) {
    fail(`Protocol introduction must use content/protocols/<protocol>.md: ${relative}.`);
    continue;
  }
  const markdown = await readFile(file, "utf8");
  const { data, body } = parseFrontmatter(markdown, relative);
  const fileSlug = path.basename(relative, ".md");
  for (const field of ["title", "slug", "docsUrl"]) {
    if (!value(data, field)) fail(`${relative} has a missing or empty ${field} field.`);
  }
  if (value(data, "slug") !== fileSlug) fail(`${relative} slug must match its filename.`);
  if (!body.includes(value(data, "docsUrl"))) fail(`${relative} must link to its docsUrl in the human introduction.`);
  if (protocolSlugs.has(fileSlug)) fail(`${relative} duplicates protocol slug: ${fileSlug}.`);
  protocolSlugs.add(fileSlug);
}

const foundryConfiguration = await readFile(path.join(root, "foundry.toml"), "utf8");
if (!/^test\s*=\s*["']examples["']\s*$/m.test(foundryConfiguration)) {
  fail('foundry.toml must configure test = "examples".');
}

const homepageMarkdown = await readFile(path.join(contentRoot, "index.md"), "utf8");
if (!homepageMarkdown.includes("](/checks/)") || !homepageMarkdown.includes("](/cases/)")) {
  fail("content/index.md must link to both /checks/ and /cases/.");
}

const readme = await readFile(path.join(root, "README.md"), "utf8");
const readmeWhy = readme.match(/## Why\n([\s\S]*?)(?=\n## )/)?.[0]?.trim();
const homepageWhy = homepageMarkdown.match(/## Why\n([\s\S]*?)(?=\n## )/)?.[0]?.trim();
if (readmeWhy !== homepageWhy) {
  fail("README.md Why copy has drifted from content/index.md.");
}

const caseFiles = (await walk(casesRoot)).filter((file) => file.endsWith(".md"));
const cases = [];
const caseIds = new Set();
const casePaths = new Set();
const protocolCaseNumbers = new Map();

for (const file of caseFiles) {
  const relative = path.relative(casesRoot, file);
  const segments = relative.split(path.sep);
  if (segments.length !== 2) {
    fail(`Case Markdown must use content/cases/<protocol>/<number>.md: ${relative}`);
    continue;
  }

  const [protocolSlug, fileName] = segments;
  const number = path.basename(fileName, ".md");
  const markdown = await readFile(file, "utf8");
  const { data, body } = parseFrontmatter(markdown, relative);
  const caseId = value(data, "caseId");
  const casePath = `${protocolSlug}/${number}`;

  for (const field of ["title", "caseId", "protocol"]) {
    if (!value(data, field)) fail(`${relative} has a missing or empty ${field} field.`);
  }
  if (data.has("component")) fail(`${relative} must not assign a case to one component.`);
  if (!/^[a-z0-9-]+$/.test(protocolSlug)) fail(`${relative} has an invalid protocol directory.`);
  if (!/^[1-9]\d*$/.test(number)) fail(`${relative} must use a positive, unpadded case number.`);
  if (caseId !== `${protocolSlug}${number}`) fail(`${relative} must use caseId: ${protocolSlug}${number}.`);
  if (caseIds.has(caseId)) fail(`${relative} duplicates caseId: ${caseId}.`);
  if (toSlug(value(data, "protocol")) !== protocolSlug) fail(`${relative} protocol does not match its directory.`);
  if (!body) fail(`${relative} has no case content.`);

  caseIds.add(caseId);
  casePaths.add(casePath);
  cases.push({ caseId, casePath, title: value(data, "title"), file, markdown });
  const numbers = protocolCaseNumbers.get(protocolSlug) ?? [];
  numbers.push(Number(number));
  protocolCaseNumbers.set(protocolSlug, numbers);
}

for (const [protocol, numbers] of protocolCaseNumbers) {
  numbers.sort((left, right) => left - right);
  if (numbers.some((number, index) => number !== index + 1)) {
    fail(`${protocol} case numbers must increase from 1 without gaps.`);
  }
}

const checkFiles = (await walk(checksRoot)).filter((file) => file.endsWith(".md"));
const checks = [];
const checkIds = new Set();
const checkBodies = new Map();
const checkSlugs = new Set();
const checkTitles = new Set();
const checkNumbers = new Map();
const referencedExamples = new Map();

for (const file of checkFiles) {
  const relative = path.relative(checksRoot, file);
  const segments = relative.split(path.sep);
  if (segments.length !== 3) {
    fail(`Check Markdown must use content/checks/<protocol>/<component>/<slug>.md: ${relative}`);
    continue;
  }

  const [protocolSlug, componentSlug, fileName] = segments;
  const fileSlug = path.basename(fileName, ".md");
  const markdown = await readFile(file, "utf8");
  const { data, body } = parseFrontmatter(markdown, relative);
  const checkId = value(data, "checkId");
  const title = value(data, "title");
  const examples = list(data, "examples");
  const relatedCases = list(data, "cases");

  for (const field of ["checkId", "protocol", "component", "title", "slug"]) {
    if (!value(data, field)) fail(`${relative} has a missing or empty ${field} field.`);
  }
  for (const field of ["examples", "cases"]) {
    if (!data.has(field) || !Array.isArray(data.get(field))) fail(`${relative} must declare ${field} as a list.`);
  }
  if (value(data, "slug") !== fileSlug) fail(`${relative} slug must match its filename.`);
  if (toSlug(value(data, "protocol")) !== protocolSlug) fail(`${relative} protocol does not match its directory.`);
  if (toSlug(value(data, "component")) !== componentSlug) fail(`${relative} component does not match its directory.`);

  const idMatch = checkId.match(new RegExp(`^${escapeRegularExpression(protocolSlug)}-${escapeRegularExpression(componentSlug)}-([1-9]\\d*)$`));
  if (!idMatch) fail(`${relative} checkId must use ${protocolSlug}-${componentSlug}-<number>.`);
  if (checkIds.has(checkId)) fail(`${relative} duplicates checkId: ${checkId}.`);
  checkIds.add(checkId);

  const componentKey = `${protocolSlug}/${componentSlug}`;
  const numbers = checkNumbers.get(componentKey) ?? [];
  if (idMatch) numbers.push(Number(idMatch[1]));
  checkNumbers.set(componentKey, numbers);

  const slugKey = `${componentKey}/${fileSlug}`;
  const titleKey = `${componentKey}/${title.toLowerCase()}`;
  if (checkSlugs.has(slugKey)) fail(`${relative} duplicates a check slug within its component.`);
  if (checkTitles.has(titleKey)) fail(`${relative} duplicates a check title within its component.`);
  checkSlugs.add(slugKey);
  checkTitles.add(titleKey);

  if (!body) fail(`${relative} has no check instruction.`);
  if (/^#{1,6}\s/m.test(body)) fail(`${relative} must contain one body instruction without authored headings.`);
  if (/coming soon/i.test(body)) fail(`${relative} contains a published “Coming soon” check.`);
  const normalized = normalizeBody(body);
  if (checkBodies.has(normalized)) fail(`${relative} duplicates the body of ${checkBodies.get(normalized)}.`);
  checkBodies.set(normalized, relative);

  if (new Set(examples).size !== examples.length) fail(`${relative} repeats an example reference.`);
  if (new Set(relatedCases).size !== relatedCases.length) fail(`${relative} repeats a case reference.`);
  for (const caseId of relatedCases) {
    if (!caseIds.has(caseId)) fail(`${relative} references unknown caseId: ${caseId}.`);
  }
  for (const example of examples) {
    if (path.isAbsolute(example) || example.includes("..")) {
      fail(`${relative} has an unsafe example path: ${example}.`);
      continue;
    }
    const owners = referencedExamples.get(example) ?? [];
    owners.push(checkId);
    referencedExamples.set(example, owners);
    await requireFile(path.join(examplesRoot, example), `example referenced by ${relative}`);
  }

  checks.push({ checkId, title, protocol: value(data, "protocol"), component: value(data, "component"), relatedCases, examples, relative });
}

for (const protocolSlug of new Set(checks.map((check) => toSlug(check.protocol)))) {
  await requireFile(
    path.join(root, "skills", protocolSlug, "SKILL.md"),
    `protocol skill for ${protocolSlug}`,
  );
  if (!protocolSlugs.has(protocolSlug)) {
    fail(`Missing human-readable protocol introduction for ${protocolSlug}.`);
  }
}

for (const entry of cases) {
  if (!checks.some((check) => check.relatedCases.includes(entry.caseId))) {
    fail(`Orphaned case without a related check: ${entry.caseId}.`);
  }
}

for (const [component, numbers] of checkNumbers) {
  numbers.sort((left, right) => left - right);
  if (numbers.some((number, index) => number !== index + 1)) {
    fail(`${component} check IDs must increase from 1 without gaps.`);
  }
}

for (const [example, owners] of referencedExamples) {
  if (owners.length > 1) fail(`${example} is referenced by more than one check: ${owners.join(", ")}.`);
}

const foundryExamples = (await walk(examplesRoot)).filter((file) => file.endsWith(".t.sol"));
for (const example of foundryExamples) {
  const relative = path.relative(examplesRoot, example).split(path.sep).join("/");
  if (!referencedExamples.has(relative)) fail(`Orphaned Foundry example: ${relative}.`);
}

const caseAssetsRoot = path.join(publicRoot, "content", "cases");
for (const asset of await walk(caseAssetsRoot)) {
  const relative = path.relative(caseAssetsRoot, asset).split(path.sep).join("/");
  const segments = relative.split("/");
  const casePath = segments.slice(0, 2).join("/");
  if (segments.length < 3 || !casePaths.has(casePath)) {
    fail(`Orphaned case asset: ${relative}.`);
    continue;
  }
  const owner = cases.find((entry) => entry.casePath === casePath);
  if (!owner?.markdown.includes(`/content/cases/${relative}`)) fail(`Case asset is not referenced by its Markdown: ${relative}.`);
  if ((await stat(asset)).size === 0) fail(`Empty case asset: ${relative}.`);
}

for (const assetName of ["vaults-rip-logo.png", "vaults-rip-social-preview.png"]) {
  const designAsset = await readFile(path.join(root, "design", assetName));
  const publicAsset = await readFile(path.join(publicRoot, "design", assetName));
  if (!designAsset.equals(publicAsset)) fail(`Public design asset has drifted from design/${assetName}.`);
}
const designMorpho = await readFile(path.join(root, "design/protocols/morpho.svg"));
const publicMorpho = await readFile(path.join(publicRoot, "protocols/morpho.svg"));
if (!designMorpho.equals(publicMorpho)) fail("Public Morpho logo has drifted from its design source.");

for (const file of [
  "index.html",
  "checks/index.html",
  "cases/index.html",
  "llms.txt",
  "SKILL.md/index.html",
  "skills.md/index.html",
  "content/index.md",
  "skills/morpho-v2/SKILL.md",
  "skills/etherscan/SKILL.md",
  "skills/smart-contracts/SKILL.md",
]) {
  await requireFile(path.join(outputRoot, file), `build output ${file}`);
}

const generatedHome = await readFile(path.join(outputRoot, "index.html"), "utf8");
const generatedChecks = await readFile(path.join(outputRoot, "checks/index.html"), "utf8");
const generatedCases = await readFile(path.join(outputRoot, "cases/index.html"), "utf8");
const generatedLlms = await readFile(path.join(outputRoot, "llms.txt"), "utf8");
const generatedMorphoSkill = await readFile(path.join(outputRoot, "skills/morpho-v2/SKILL.md"), "utf8");
const generatedSkillRedirect = await readFile(path.join(outputRoot, "SKILL.md/index.html"), "utf8");
const generatedSkillsRedirect = await readFile(path.join(outputRoot, "skills.md/index.html"), "utf8");

for (const [route, redirect] of [["/SKILL.md", generatedSkillRedirect], ["/skills.md", generatedSkillsRedirect]]) {
  if (!redirect.includes('url=/llms.txt') || !redirect.includes('href="/llms.txt"')) {
    fail(`${route} does not redirect to /llms.txt in the static build.`);
  }
}
if (!generatedLlms.startsWith("---\nname: vault-scanner\n")) fail("Generated scanner is missing root Agent Skill frontmatter.");
for (const phrase of ["## Check list", "## Output", "Checks run", "Violations found", "Warnings found", "Checks unresolved", "## Checks"]) {
  if (!generatedLlms.includes(phrase)) fail(`Generated scanner is missing: ${phrase}.`);
}
if (!generatedLlms.includes("https://www.vaults.rip/checks/")) {
  fail("Generated scanner does not link to the human-readable check list.");
}
if (!generatedLlms.includes("https://docs.morpho.org/llms.txt")) {
  fail("Generated scanner is missing the Morpho V2 procedure.");
}
for (const phrase of ["https://docs.morpho.org/llms.txt", "## Checks", "https://www.vaults.rip/skills/etherscan/SKILL.md", "https://www.vaults.rip/skills/smart-contracts/SKILL.md"]) {
  if (!generatedMorphoSkill.includes(phrase)) fail(`Generated Morpho V2 skill is missing: ${phrase}.`);
}

for (const check of checks) {
  if (countOccurrences(generatedLlms, `Check ID: ${check.checkId}`) !== 1) fail(`Generated scanner must include ${check.checkId} exactly once.`);
  if (countOccurrences(generatedMorphoSkill, `Check ID: ${check.checkId}`) !== 1) fail(`Generated Morpho V2 skill must include ${check.checkId} exactly once.`);
  if (countOccurrences(generatedChecks, `id="${check.checkId}"`) !== 1) fail(`/checks/ must include ${check.checkId} exactly once.`);
  for (const caseId of check.relatedCases) {
    const relatedCase = cases.find((entry) => entry.caseId === caseId);
    if (relatedCase && !generatedChecks.includes(`/cases/${relatedCase.casePath}/`)) fail(`/checks/ is missing ${check.checkId}'s related case ${caseId}.`);
    if (relatedCase && !generatedMorphoSkill.includes(`https://www.vaults.rip/content/cases/${relatedCase.casePath}.md`)) fail(`Morpho V2 skill is missing ${check.checkId}'s raw related case ${caseId}.`);
  }
}

for (const entry of cases) {
  const renderedPath = path.join(outputRoot, "cases", entry.casePath, "index.html");
  const rawPath = path.join(outputRoot, "content", "cases", `${entry.casePath}.md`);
  await requireFile(renderedPath, `rendered case ${entry.casePath}`);
  await requireFile(rawPath, `raw case ${entry.casePath}`);
  if (countOccurrences(generatedCases, `/cases/${entry.casePath}/`) !== 1) fail(`/cases/ must include ${entry.casePath} exactly once.`);

  if ((await exists(renderedPath)) && (await exists(rawPath))) {
    const rendered = await readFile(renderedPath, "utf8");
    const raw = await readFile(rawPath, "utf8");
    const relatedChecks = checks.filter((check) => check.relatedCases.includes(entry.caseId));
    if (!rendered.includes(`rel="alternate" type="text/plain" href="/content/cases/${entry.casePath}.md"`)) fail(`Rendered case is missing its raw alternate: ${entry.casePath}.`);
    if (!raw.includes(`Case ID: ${entry.caseId}`)) fail(`Raw case is missing its stable ID: ${entry.casePath}.`);
    if (!rendered.includes("Related checks") || !raw.includes("## Related checks")) {
      fail(`Case ${entry.caseId} is missing its related-check section.`);
    }
    if (countOccurrences(raw, "https://www.vaults.rip/checks/#") !== relatedChecks.length) {
      fail(`Case ${entry.caseId} related-check links have drifted from check frontmatter.`);
    }
    for (const check of relatedChecks) {
      if (countOccurrences(rendered, `/checks/#${check.checkId}`) !== 1) {
        fail(`Rendered case ${entry.caseId} must link ${check.checkId} exactly once.`);
      }
      if (countOccurrences(raw, `https://www.vaults.rip/checks/#${check.checkId}`) !== 1) {
        fail(`Raw case ${entry.caseId} must link ${check.checkId} exactly once.`);
      }
    }
  }
}

const allowedHumanCasePages = new Set([
  "",
  "custom-oracle-control",
  "oracle-price-manipulation",
  ...cases.map((entry) => entry.casePath),
]);
for (const outputFile of (await walk(path.join(outputRoot, "cases"))).filter(
  (file) => path.basename(file) === "index.html",
)) {
  const route = path
    .relative(path.join(outputRoot, "cases"), path.dirname(outputFile))
    .split(path.sep)
    .join("/");
  const normalizedRoute = route === "." ? "" : route;
  if (!allowedHumanCasePages.has(normalizedRoute)) fail(`Orphaned generated case page: /cases/${normalizedRoute}/.`);
}

for (const outputFile of (await walk(path.join(outputRoot, "checks"))).filter(
  (file) => file.endsWith(".html"),
)) {
  const route = path.relative(path.join(outputRoot, "checks"), outputFile).split(path.sep).join("/");
  if (route !== "index.html") fail(`Unexpected individual check page: /checks/${route}.`);
}

const allowedRawCaseFiles = new Set(cases.map((entry) => `${entry.casePath}.md`));
for (const outputFile of (await walk(path.join(outputRoot, "content", "cases"))).filter(
  (file) => file.endsWith(".md"),
)) {
  const route = path.relative(path.join(outputRoot, "content", "cases"), outputFile).split(path.sep).join("/");
  if (!allowedRawCaseFiles.has(route)) fail(`Orphaned generated raw case: /content/cases/${route}.`);
}

if (!generatedHome.includes('rel="describedby" href="/llms.txt"')) fail("Homepage does not advertise /llms.txt.");
for (const route of ["/checks/", "/cases/"]) {
  if (!generatedHome.includes(`href="${route}"`)) fail(`Homepage is missing ${route}.`);
}
for (const entry of cases) {
  if (generatedHome.includes(`/cases/${entry.casePath}/`)) fail("Homepage must not duplicate the generated case index.");
}

const vercel = JSON.parse(await readFile(path.join(root, "vercel.json"), "utf8"));
const linkHeader = vercel.headers?.flatMap((rule) => rule.headers ?? []).find((header) => header.key?.toLowerCase() === "link");
if (!linkHeader?.value?.includes('</llms.txt>; rel="describedby"')) fail("Vercel responses do not advertise /llms.txt.");
for (const source of ["/llms.txt", "/skills/(.*).md", "/content/index.md", "/content/cases/(.*).md"]) {
  const rule = vercel.headers?.find((entry) => entry.source === source);
  const contentType = rule?.headers?.find((header) => header.key?.toLowerCase() === "content-type");
  if (contentType?.value !== "text/plain; charset=utf-8") fail(`Vercel does not serve ${source} as UTF-8 plain text.`);
}
for (const source of ["/SKILL.md", "/skills.md"]) {
  const redirect = vercel.redirects?.find((entry) => entry.source === source);
  if (redirect?.destination !== "/llms.txt" || redirect?.permanent !== true) {
    fail(`Vercel does not permanently redirect ${source} to /llms.txt.`);
  }
}

if (!generatedChecks.includes("https://docs.morpho.org/llms.txt")) {
  fail("Human-readable Morpho V2 checks do not link to Morpho documentation.");
}

const astroConfig = await readFile(path.join(root, "astro.config.mjs"), "utf8");
const middleware = await readFile(path.join(root, "src/middleware.ts"), "utf8");
if (!astroConfig.includes("machineRouteDevHeaders")) fail("Astro dev is missing the machine-route preflight workaround.");
if (!astroConfig.includes('request.headers.accept = "text/plain,*/*"') || !astroConfig.includes("middlewares.stack.unshift")) {
  fail("Astro dev does not classify browser Markdown requests ahead of its root-file route guard.");
}
if (!middleware.includes('text/plain; charset=utf-8')) fail("Astro middleware does not enforce plain-text machine routes.");

const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
if (packageJson.scripts?.prepare !== "husky") fail('package.json must run Husky from the "prepare" script.');
if (!packageJson.devDependencies?.husky) fail("husky must be a development dependency.");
if (await exists(path.join(root, ".husky/pre-commit"))) {
  const hook = await readFile(path.join(root, ".husky/pre-commit"), "utf8");
  if (hook.trim() !== "pnpm verify && pnpm verify:dev-routes") {
    fail(".husky/pre-commit must fail fast while running pnpm verify and pnpm verify:dev-routes.");
  }
}

for (const outputFile of (await walk(outputRoot)).filter((file) => file.endsWith(".html"))) {
  const html = await readFile(outputFile, "utf8");
  const references = [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)].map((match) => match[1]);
  for (const reference of references) await resolveOutputReference(outputFile, reference);
}

if (failures.length) {
  console.error("Site verification failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Site verification passed: ${checks.length} checks and ${cases.length} cases have valid sources, relationships, routes, and internal links.`);
}
