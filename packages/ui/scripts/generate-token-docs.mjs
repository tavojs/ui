import fs from "node:fs";
import path from "node:path";
import { buildTheme, getTavoUiTokenMetadata } from "../dist/theme/index.js";

const root = process.cwd();
const configPath = path.join(root, "tavo-ui.config.json");
const outPath = path.join(root, "docs", "tokens.md");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const result = buildTheme(config);

const descriptions = {
  color: "Semantic color, palette, and surface tokens.",
  size: "Control sizing tokens.",
  space: "Spacing tokens.",
  radius: "Radius tokens.",
  border: "Border width tokens.",
  shadow: "Elevation tokens.",
  focus: "Focus ring tokens.",
  motion: "Motion duration and easing tokens.",
  opacity: "Opacity tokens.",
  interaction: "Interactive state tokens for hover, active, focus, disabled, and transitions.",
  blur: "Glass blur tokens.",
  font: "Typography tokens.",
  backdrop: "Backdrop filter tokens."
};

function groupForToken(token) {
  const first = token.split("-")[0];
  if (token.startsWith("color-")) return "color";
  if (token.startsWith("font-")) return "font";
  return first;
}

function rowsForMode(mode) {
  return Object.entries(result.modes[mode].tokens)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([token, value]) => ({ token, value, group: groupForToken(token) }));
}

function staticRows() {
  const match = result.cssText.match(/:root[^{]*\{([\s\S]*?)\n\}/);
  if (!match) return [];
  return [...match[1].matchAll(/\t--[^-]+-([^:]+): ([^;]+);/g)]
    .map(([, token, value]) => ({ token, value, group: groupForToken(token) }))
    .filter((row) => !row.token.match(/^(primary|secondary|neutral)-\d+$/) && !result.modes.light.tokens[row.token])
    .sort((a, b) => a.token.localeCompare(b.token));
}

function table(rows) {
  return [
    "| Token | Group | Default value |",
    "| --- | --- | --- |",
    ...rows.map((row) => `| \`--tui-${row.token}\` | ${descriptions[row.group] ?? row.group} | \`${String(row.value).replace(/\|/g, "\\|")}\` |`)
  ].join("\n");
}

function catalogTable(rows) {
  return [
    "| Token | Group |",
    "| --- | --- |",
    ...rows.map((row) => `| \`${row.cssVariable}\` | ${row.group} |`)
  ].join("\n");
}

const lines = [
  "# Tavo.js UI Tokens",
  "",
  "This file is generated from `tavo-ui.config.json` and the current theme builder.",
  "",
  "Regenerate after a library build with:",
  "",
  "```bash",
  "npm run docs:tokens",
  "```",
  "",
  "## Complete Supported Token Catalog",
  "",
  "The same catalog is available programmatically from `tavoUiTokenMetadata` and `tavoUiTokenNames` in `@tavojs/ui/theme`.",
  "",
  catalogTable(getTavoUiTokenMetadata(config)),
  "",
  "## Static Tokens",
  "",
  table(staticRows()),
  "",
  "## Light Mode Semantic Tokens",
  "",
  table(rowsForMode("light")),
  "",
  "## Dark Mode Semantic Tokens",
  "",
  table(rowsForMode("dark"))
];

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${lines.join("\n")}\n`);
console.log(`Generated token docs at ${outPath}`);
