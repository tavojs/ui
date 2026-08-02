import fs from "node:fs";
import path from "node:path";
import { buildBreakpointScss, buildBreakpointTs, buildThemeCss } from "./theme-utils.mjs";

function readFlag(name, fallback) {
  const shortName = name === "--config" ? "-c" : name === "--out" ? "-o" : name;
  const index = process.argv.findIndex((value) => value === name || value === shortName);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const configPath = path.resolve(process.cwd(), readFlag("--config", "tavo-ui.config.json"));
const outPath = path.resolve(process.cwd(), readFlag("--out", "src/theme/generated/default-theme.css"));
if (path.extname(outPath).toLowerCase() !== ".css") {
  throw new Error("Generated theme output must use the .css extension.");
}
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const cssText = buildThemeCss(config);
const breakpointScss = buildBreakpointScss(config);
const breakpointTs = buildBreakpointTs(config);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, cssText);
fs.writeFileSync(path.resolve(process.cwd(), "src/theme/breakpoints.scss"), breakpointScss);
fs.writeFileSync(path.resolve(process.cwd(), "src/theme/generated/breakpoints.ts"), breakpointTs);
