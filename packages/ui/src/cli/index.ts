#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildThemeTokens } from "@tavojs/ui-core";
import {
  formatCssTokenDiagnostics,
  validateTavoUiTokensInCss,
} from "@/cli/css-token-validation";
import { buildTheme } from "@/theme/core/build";
import type { TavoUiThemeConfig } from "@/theme/types";

type CliCommand =
  | "generate"
  | "check"
  | "validate-css"
  | "tokens"
  | "init"
  | "preview"
  | "audit"
  | "help";

type CliOptions = {
  configPath: string;
  outPath: string;
  command: CliCommand;
  mode: "light" | "dark" | "all";
  format: "json" | "css" | "figma";
  inputPaths: string[];
};

const COMMANDS = new Set<CliCommand>([
  "generate",
  "check",
  "validate-css",
  "tokens",
  "init",
  "preview",
  "audit",
  "help",
]);

function usage(): string {
  return [
    "Usage: tavo-ui web <command> [options]",
    "",
    "Commands: generate, check, validate-css, tokens, init, preview, audit",
    "",
    "Options:",
    "  -c, --config <path>  Theme config path.",
    "  -o, --out <path>     Generated output path.",
    "      --mode <mode>    light, dark, or all.",
    "      --format <type>  json, css, or figma.",
    "  <path...>            CSS files or directories for validate-css (default: src).",
    "  -h, --help           Show this help message.",
  ].join("\n");
}

function optionValue(args: string[], index: number, option: string): string {
  const value = args[index + 1];
  if (!value || value.startsWith("-")) {
    throw new Error(`Missing value for ${option}.`);
  }
  return value;
}

function parseArgs(argv: string[]): CliOptions {
  const first = argv[0];
  let command: CliCommand = "generate";
  let args = argv;
  if (first && !first.startsWith("-")) {
    if (!COMMANDS.has(first as CliCommand)) {
      throw new Error(`Unknown command: ${first}`);
    }
    command = first as CliCommand;
    args = argv.slice(1);
  }
  const options: CliOptions = {
    configPath: "tavo-ui.config.json",
    outPath:
      command === "preview"
        ? "tavo-ui-preview.html"
        : "src/theme/generated/default-theme.css",
    command,
    mode: "all",
    format: "json",
    inputPaths: [],
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") {
      options.command = "help";
    } else if (arg === "--config" || arg === "-c") {
      options.configPath = optionValue(args, index, arg);
      index += 1;
    } else if (arg === "--out" || arg === "-o") {
      options.outPath = optionValue(args, index, arg);
      index += 1;
    } else if (arg === "--mode") {
      const mode = optionValue(args, index, arg);
      if (mode !== "light" && mode !== "dark" && mode !== "all") {
        throw new Error(`Invalid mode: ${mode}. Expected light, dark, or all.`);
      }
      options.mode = mode;
      index += 1;
    } else if (arg === "--format") {
      const format = optionValue(args, index, arg);
      if (format !== "json" && format !== "css" && format !== "figma") {
        throw new Error(
          `Invalid format: ${format}. Expected json, css, or figma.`
        );
      }
      options.format = format;
      index += 1;
    } else if (command === "validate-css" && !arg.startsWith("-")) {
      options.inputPaths.push(arg);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function figmaTokens(
  modes: ReturnType<typeof buildThemeTokens>["modes"]
): Record<string, Record<string, { value: string; type: string }>> {
  return Object.fromEntries(
    Object.entries(modes).map(([mode, resolved]) => [
      mode,
      Object.fromEntries(
        Object.entries(resolved.tokens).map(([name, value]) => [
          name,
          {
            value,
            type: name.startsWith("color-")
              ? "color"
              : name.startsWith("font-")
              ? "typography"
              : "dimension",
          },
        ])
      ),
    ])
  );
}

function tokensCss(
  cssText: string,
  mode: CliOptions["mode"],
  result: ReturnType<typeof buildTheme>
): string {
  if (mode === "all") {
    return cssText;
  }
  const output = result.config.output ?? {};
  const selector =
    mode === "light"
      ? output.selector ?? ":root"
      : output.darkSelector ?? ':root[data-tavo-theme="dark"]';
  const resolvedMode = result.modes[mode];
  const tokens = {
    ...Object.fromEntries(
      Object.entries(resolvedMode.primary).map(([shade, value]) => [
        `primary-${shade}`,
        value,
      ])
    ),
    ...Object.fromEntries(
      Object.entries(resolvedMode.secondary).map(([shade, value]) => [
        `secondary-${shade}`,
        value,
      ])
    ),
    ...Object.fromEntries(
      Object.entries(resolvedMode.neutral).map(([shade, value]) => [
        `neutral-${shade}`,
        value,
      ])
    ),
    ...resolvedMode.tokens,
    ...result.staticTokens,
  };
  const lines: string[] = [];
  for (const [name, value] of Object.entries(tokens)) {
    lines.push(`  --tui-${name}: ${value};`);
  }
  return `${selector} {\n${lines.join("\n")}\n}\n`;
}

const DEFAULT_CONFIG: TavoUiThemeConfig = {
  $schema: "./node_modules/@tavojs/ui/schema.json",
  defaultTheme: "dark",
  color: {
    light: {
      primary: "#7C3AED",
    },
    dark: {
      primary: "#A78BFA",
    },
    method: "monochromatic",
    fixShade: true,
  },
  scale: {
    unit: 8,
  },
};

function readConfig(configPath: string): TavoUiThemeConfig {
  return JSON.parse(fs.readFileSync(configPath, "utf8")) as TavoUiThemeConfig;
}

function writeWarnings(warnings: string[]): void {
  for (const warning of warnings) {
    process.stderr.write(`Warning: ${warning}\n`);
  }
}

function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(
    /[\u0000-\u0008\u000b-\u000d\u000e-\u001f\u007f-\u009f]/g,
    ""
  );
}

function escapeStyleText(value: string): string {
  return value.replace(/<\/style/gi, "<\\/style");
}

function previewHtml(cssText: string): string {
  const tokenGroups = [
    [
      "Color",
      [
        "color-bg",
        "color-surface",
        "color-surface-raised",
        "color-border",
        "color-text",
        "color-primary-bg",
        "color-secondary-bg",
      ],
    ],
    [
      "Scale",
      [
        "size-md",
        "space-4",
        "radius-control",
        "radius-surface",
        "border-width",
        "shadow-lg",
      ],
    ],
    [
      "Interaction",
      [
        "interaction-hover-lift",
        "interaction-active-scale",
        "interaction-focus-alpha",
        "interaction-disabled-opacity",
      ],
    ],
  ];
  const tokenDocs = tokenGroups
    .map(
      ([group, tokens]) => `<section>
      <h2>${group} tokens</h2>
      <table>
        <tbody>${(tokens as string[])
          .map(
            (token) =>
              `<tr><th>--tui-${token}</th><td style="font-family: ui-monospace, Menlo, Consolas, monospace">var(--tui-${token})</td></tr>`
          )
          .join("")}</tbody>
      </table>
    </section>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tavo.js UI Theme Preview</title>
  <style>${escapeStyleText(cssText)}</style>
  <style>
    body { margin: 0; background: var(--tui-color-bg); color: var(--tui-color-text); font-family: var(--tui-font-family-text, var(--tui-font-family)); }
    main { width: min(1080px, calc(100% - 32px)); margin: 0 auto; padding: var(--tui-space-6) 0; display: grid; gap: var(--tui-space-6); }
    section { border: var(--tui-border-width) solid var(--tui-color-border); border-radius: var(--tui-radius-surface); background: var(--tui-color-surface); padding: var(--tui-space-5); box-shadow: var(--tui-shadow-md); backdrop-filter: var(--tui-backdrop-filter, none); }
    h1, h2, p { margin: 0; }
    h1 { color: var(--tui-color-heading); font-family: var(--tui-font-family-heading, var(--tui-font-family-text, var(--tui-font-family))); font-size: var(--tui-font-size-h1); }
    h2 { color: var(--tui-color-heading); font-family: var(--tui-font-family-heading, var(--tui-font-family-text, var(--tui-font-family))); font-size: var(--tui-font-size-h3); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: var(--tui-space-3); }
    .swatch { min-height: 86px; border-radius: var(--tui-radius-control); border: var(--tui-border-width) solid var(--tui-color-border); padding: var(--tui-space-3); display: grid; align-content: end; font-weight: 800; }
    .button { display: inline-flex; min-height: var(--tui-size-md); align-items: center; border-radius: var(--tui-radius-control); border: var(--tui-border-width) solid transparent; padding-inline: var(--tui-space-4); font-weight: 900; background: var(--tui-color-primary-bg); color: var(--tui-color-primary-text); }
    .muted { color: var(--tui-color-text-muted); }
    table { width: 100%; border-collapse: collapse; margin-top: var(--tui-space-4); }
    th, td { padding: var(--tui-space-2) var(--tui-space-3); border-bottom: var(--tui-border-width) solid var(--tui-color-border); text-align: left; }
    th { color: var(--tui-color-text-muted); width: 16rem; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Tavo.js UI Theme Preview</h1>
      <p class="muted">Generated from your Tavo.js UI config.</p>
    </header>
    <section>
      <h2>Core Surfaces</h2>
      <div class="grid">
        <div class="swatch" style="background: var(--tui-color-bg)">Background</div>
        <div class="swatch" style="background: var(--tui-color-surface)">Surface</div>
        <div class="swatch" style="background: var(--tui-color-surface-raised)">Raised</div>
        <div class="swatch" style="background: var(--tui-color-surface-subtle)">Subtle</div>
      </div>
    </section>
    <section>
      <h2>Actions</h2>
      <p><span class="button">Primary action</span></p>
    </section>
    ${tokenDocs}
  </main>
</body>
</html>`;
}

export async function runCli(argv = process.argv.slice(2)): Promise<void> {
  if (argv[0] === "native") {
    throw new Error(
      "React Native commands are not included in the Tavo.js UI 1.0 web release."
    );
  }
  const options = parseArgs(argv[0] === "web" ? argv.slice(1) : argv);
  if (options.command === "help") {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  const configPath = path.resolve(process.cwd(), options.configPath);
  const outPath = path.resolve(process.cwd(), options.outPath);

  if (options.command === "init") {
    if (fs.existsSync(configPath)) {
      throw new Error(`Config already exists at ${configPath}`);
    }
    fs.writeFileSync(
      configPath,
      `${JSON.stringify(DEFAULT_CONFIG, null, 2)}\n`
    );
    process.stdout.write(`Created config at ${configPath}\n`);
    return;
  }

  if (
    options.command === "generate" &&
    path.extname(outPath).toLowerCase() !== ".css"
  ) {
    throw new Error("Generated theme output must use the .css extension.");
  }

  const config = readConfig(configPath);

  if (options.command === "validate-css") {
    const inputs = (
      options.inputPaths.length > 0 ? options.inputPaths : ["src"]
    ).map((input) => path.resolve(process.cwd(), input));
    const diagnostics = validateTavoUiTokensInCss(inputs, config);
    if (diagnostics.length > 0) {
      throw new Error(formatCssTokenDiagnostics(diagnostics));
    }
    process.stdout.write("CSS token validation passed.\n");
    return;
  }

  if (
    options.command === "check" ||
    options.command === "audit" ||
    (options.command === "tokens" && options.format !== "css")
  ) {
    const { warnings, modes } = buildThemeTokens(config);

    if (options.command === "check") {
      writeWarnings(warnings);
      process.stdout.write(
        warnings.length === 0
          ? "Theme config passed checks.\n"
          : `Theme config completed with ${warnings.length} warning(s).\n`
      );
      return;
    }

    if (options.command === "audit") {
      writeWarnings(warnings);
      process.stdout.write(
        JSON.stringify(
          {
            passed: warnings.length === 0,
            warningCount: warnings.length,
            warnings,
          },
          null,
          2
        ) + "\n"
      );
      return;
    }

    if (options.format === "figma") {
      const payload =
        options.mode === "all"
          ? figmaTokens(modes)
          : figmaTokens(modes)[options.mode];
      process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
      return;
    }
    const payload = options.mode === "all" ? modes : modes[options.mode];
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  const result = buildTheme(config);
  const { cssText, warnings } = result;

  if (options.command === "tokens") {
    process.stdout.write(tokensCss(cssText, options.mode, result));
    return;
  }

  if (options.command === "preview") {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, previewHtml(cssText));
    writeWarnings(warnings);
    process.stdout.write(`Generated preview at ${outPath}\n`);
    return;
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, cssText);
  writeWarnings(warnings);
  process.stdout.write(`Generated theme at ${outPath}\n`);
}

function isEntrypoint(argvPath: string | undefined): boolean {
  if (!argvPath) return false;
  try {
    return (
      fs.realpathSync(fileURLToPath(import.meta.url)) ===
      fs.realpathSync(path.resolve(argvPath))
    );
  } catch {
    return false;
  }
}

if (isEntrypoint(process.argv[1])) {
  runCli().catch((error: unknown) => {
    console.error(safeErrorMessage(error));
    process.exitCode = 1;
  });
}
