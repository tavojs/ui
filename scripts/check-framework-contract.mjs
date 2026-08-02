import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptPath = fileURLToPath(import.meta.url);
const ignoredDirectories = new Set([
  ".git",
  "demo-dist",
  "dist",
  "node_modules",
  "test-results"
]);
const scannedExtensions = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".mts",
  ".scss",
  ".ts",
  ".tsx"
]);
const obsoleteContracts = [
  /@tavojs\/core\/(?:auto-pages|framework|ssr|session|style|i18n)\b/,
  /\bapiVersion\s*:\s*2\b/,
  /\bexport\s+const\s+static\b/,
  /\bssr\s*:\s*false\b/,
  /\bauto-pages-options\b/,
  /\btavo\.config\.ssr\b/,
  /\bHeadProps\.head\b/,
  /\bdeploy-info\b/,
  /\bgenerate deployment\b/,
  /\bPrivate preview\b/i,
  /\bComing soon\b/i,
  /\bNode(?:\.js)? 18\b/i,
  /\bunsafeHtml\b/
];

async function collectFiles(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
      continue;
    }
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(target));
    } else if (scannedExtensions.has(path.extname(entry.name)) && target !== scriptPath) {
      files.push(target);
    }
  }
  return files;
}

const violations = [];
for (const file of await collectFiles(root)) {
  const source = await fs.readFile(file, "utf8");
  for (const pattern of obsoleteContracts) {
    if (pattern.test(source)) {
      violations.push(`${path.relative(root, file)}: ${pattern}`);
    }
  }
}

if (violations.length > 0) {
  throw new Error(`Obsolete Tavo 1.0 contracts found:\n${violations.join("\n")}`);
}

console.log("Tavo 1.0 downstream contract scan passed.");
