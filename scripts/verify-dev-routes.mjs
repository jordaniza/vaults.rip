import { dev } from "astro";

const server = await dev({
  root: new URL("../", import.meta.url),
  logLevel: "silent",
  server: { host: "127.0.0.1", port: 0 },
});

const origin = `http://127.0.0.1:${server.address.port}`;
const browserHeaders = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};
const checks = [
  {
    path: "/content/cases/morpho/1.md",
    contains: ["title: Custom oracle control", "## Related checks", "morpho-v2-oracles-2"],
  },
  {
    path: "/content/cases/morpho/1.md?raw",
    contains: ["title: Custom oracle control", "## Related checks", "morpho-v2-oracles-2"],
  },
  {
    path: "/llms.txt",
    contains: ["# Vault scanner", "Check ID: morpho-v2-oracles-1", "Check ID: morpho-v2-markets-1"],
  },
];
const failures = [];

try {
  for (const check of checks) {
    const response = await fetch(`${origin}${check.path}`, {
      headers: browserHeaders,
      redirect: "manual",
    });
    const body = await response.text();
    const contentType = response.headers.get("content-type") ?? "";

    if (response.status !== 200) {
      failures.push(`${check.path} returned ${response.status}.`);
      continue;
    }
    if (!contentType.startsWith("text/plain")) {
      failures.push(`${check.path} returned ${contentType || "no content type"}.`);
    }
    if (/<!doctype html>|404:\s*Not Found/i.test(body)) {
      failures.push(`${check.path} returned Astro's HTML 404 body.`);
    }
    for (const phrase of check.contains) {
      if (!body.includes(phrase)) failures.push(`${check.path} is missing: ${phrase}.`);
    }
  }
} finally {
  await server.stop();
}

if (failures.length) {
  console.error("Development route verification failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Development route verification passed for browser-style Markdown and llms.txt requests.");
}
