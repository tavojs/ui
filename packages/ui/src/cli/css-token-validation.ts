import fs from "node:fs";
import path from "node:path";
import {
  getTavoUiTokenGroup,
  getTavoUiTokenMetadata,
  type TavoUiTokenGroup,
  type TavoUiTokenMetadata
} from "@/theme/token-metadata";
import type { TavoUiThemeConfig } from "@/theme/types";

const CSS_EXTENSIONS = new Set([".css", ".scss", ".sass", ".less"]);
const IGNORED_DIRECTORIES = new Set([".git", "node_modules", "dist", "demo-dist", "coverage"]);
const TOKEN_PATTERN = /--tui-[a-zA-Z0-9_-]+/g;

export type CssTokenDiagnostic = {
  token: string;
  file: string;
  line: number;
  column: number;
  group: TavoUiTokenGroup;
  available: string[];
};

function maskCommentsAndStrings(source: string): string {
  const chars = source.split("");
  let quote: "'" | '"' | undefined;
  let inComment = false;

  for (let index = 0; index < chars.length; index += 1) {
    const current = chars[index];
    const next = chars[index + 1];

    if (inComment) {
      if (current === "*" && next === "/") {
        chars[index] = " ";
        chars[index + 1] = " ";
        index += 1;
        inComment = false;
      } else if (current !== "\n" && current !== "\r") {
        chars[index] = " ";
      }
      continue;
    }

    if (quote) {
      if (current === "\\") {
        chars[index] = " ";
        if (next !== undefined && next !== "\n" && next !== "\r") {
          chars[index + 1] = " ";
          index += 1;
        }
      } else if (current === quote) {
        chars[index] = " ";
        quote = undefined;
      } else if (current !== "\n" && current !== "\r") {
        chars[index] = " ";
      }
      continue;
    }

    if (current === "/" && next === "*") {
      chars[index] = " ";
      chars[index + 1] = " ";
      index += 1;
      inComment = true;
    } else if (current === "'" || current === '"') {
      chars[index] = " ";
      quote = current;
    }
  }

  return chars.join("");
}

function lineAndColumn(source: string, offset: number): { line: number; column: number } {
  const before = source.slice(0, offset);
  const lines = before.split(/\r?\n/);
  return { line: lines.length, column: (lines.at(-1)?.length ?? 0) + 1 };
}

function collectCssFiles(entry: string): string[] {
  if (!fs.existsSync(entry)) {
    throw new Error(`CSS validation path does not exist: ${entry}`);
  }
  const stat = fs.statSync(entry);
  if (stat.isFile()) {
    return CSS_EXTENSIONS.has(path.extname(entry).toLowerCase()) ? [entry] : [];
  }
  if (!stat.isDirectory() || IGNORED_DIRECTORIES.has(path.basename(entry))) return [];

  return fs.readdirSync(entry, { withFileTypes: true }).flatMap((child) =>
    collectCssFiles(path.join(entry, child.name))
  );
}

export function validateTavoUiTokensInCss(
  files: string[],
  config: TavoUiThemeConfig
): CssTokenDiagnostic[] {
  const metadata = getTavoUiTokenMetadata(config);
  const supported = new Set<string>(metadata.map((token) => token.cssVariable));
  const byGroup = new Map<TavoUiTokenGroup, TavoUiTokenMetadata[]>();
  for (const token of metadata) {
    byGroup.set(token.group, [...(byGroup.get(token.group) ?? []), token]);
  }

  const diagnostics: CssTokenDiagnostic[] = [];
  for (const file of [...new Set(files.flatMap(collectCssFiles))].sort()) {
    const source = fs.readFileSync(file, "utf8");
    const searchable = maskCommentsAndStrings(source);
    for (const match of searchable.matchAll(TOKEN_PATTERN)) {
      const token = match[0];
      if (supported.has(token)) continue;
      const group = getTavoUiTokenGroup(token.replace(/^--tui-/, ""));
      const location = lineAndColumn(source, match.index ?? 0);
      diagnostics.push({
        token,
        file,
        ...location,
        group,
        available: (byGroup.get(group) ?? metadata)
          .map((entry) => entry.cssVariable)
          .sort((a, b) => a.localeCompare(b))
      });
    }
  }
  return diagnostics;
}

export function formatCssTokenDiagnostics(
  diagnostics: CssTokenDiagnostic[],
  cwd = process.cwd()
): string {
  return diagnostics.map((diagnostic) => {
    const file = path.relative(cwd, diagnostic.file) || path.basename(diagnostic.file);
    const label = diagnostic.group === "custom" ? "Tavo.js UI" : diagnostic.group;
    return [
      `Unknown Tavo.js UI token: ${diagnostic.token}`,
      `  at ${file}:${diagnostic.line}:${diagnostic.column}`,
      `Available ${label} tokens:`,
      ...diagnostic.available.map((token) => `  ${token}`)
    ].join("\n");
  }).join("\n\n");
}
