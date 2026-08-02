#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

type Route =
  | {
      kind: "help";
    }
  | {
      kind: "platform";
      platform: "web";
      args: string[];
    };

const WEB_COMMANDS = new Set([
  "generate",
  "check",
  "validate-css",
  "tokens",
  "init",
  "preview",
  "audit",
]);
const WEB_CLI_SPECIFIER = "@tavojs/ui/cli";

function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(
    /[\u0000-\u0008\u000b-\u000d\u000e-\u001f\u007f-\u009f]/g,
    ""
  );
}

export function usage(): string {
  return [
    "Usage:",
    "  tavo-ui web <command> [options]",
    "  tavo-ui generate [options]",
    "",
    "Commands:",
    "  web generate      Generate the web theme stylesheet.",
    "  web check         Validate the web theme config.",
    "  web validate-css  Report unknown Tavo UI variables in application CSS.",
    "  web tokens        Print generated web theme tokens.",
    "  web init          Create a default web theme config.",
    "  web preview       Generate a web theme preview.",
    "  web audit         Print web theme audit results.",
    "",
    "Install:",
    "  npm install @tavojs/ui              (includes tavo-ui for web)",
  ].join("\n");
}

export function resolveRoute(argv: string[]): Route {
  const [first, ...rest] = argv;

  if (!first || first === "--help" || first === "-h" || first === "help") {
    return { kind: "help" };
  }

  if (first === "web") {
    return {
      kind: "platform",
      platform: "web",
      args: rest.length > 0 ? rest : ["generate"],
    };
  }

  if (first === "native") {
    throw new Error(
      "React Native commands are not included in the Tavo UI 1.0 web release."
    );
  }

  if (WEB_COMMANDS.has(first)) {
    return { kind: "platform", platform: "web", args: argv };
  }

  return {
    kind: "platform",
    platform: "web",
    args: argv,
  };
}

function packageName(specifier: string): string {
  return specifier.startsWith("@")
    ? specifier.split("/").slice(0, 2).join("/")
    : specifier.split("/")[0];
}

function isMissingImport(error: unknown, specifier: string): boolean {
  const missing =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    ((error as { code?: unknown }).code === "ERR_MODULE_NOT_FOUND" ||
      (error as { code?: unknown }).code === "MODULE_NOT_FOUND");
  if (!missing) {
    return false;
  }

  const message = error instanceof Error ? error.message : String(error);
  const candidates = [specifier, packageName(specifier)];
  return candidates.some((candidate) =>
    [`'${candidate}'`, `"${candidate}"`, `\`${candidate}\``].some((quoted) =>
      message.includes(quoted)
    )
  );
}

function installHint(): string {
  return [
    "Tavo UI web package is not installed.",
    "",
    "Install it with: npm install @tavojs/ui",
  ].join("\n");
}

async function runWeb(args: string[]): Promise<void> {
  try {
    const mod = await import(WEB_CLI_SPECIFIER);
    const runCli = (
      mod as { runCli?: (argv?: string[]) => Promise<void> | void }
    ).runCli;
    if (!runCli) {
      throw new Error("@tavojs/ui/cli does not export runCli.");
    }
    await runCli(args);
  } catch (error) {
    if (isMissingImport(error, WEB_CLI_SPECIFIER)) {
      throw new Error(installHint());
    }
    throw error;
  }
}

export async function runCli(argv = process.argv.slice(2)): Promise<void> {
  const [first] = argv;
  if (!first || first === "--help" || first === "-h" || first === "help") {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  const route = resolveRoute(argv);
  if (route.kind === "platform") {
    await runWeb(route.args);
  }
}

function isEntrypoint(argvPath: string | undefined): boolean {
  if (!argvPath) return false;

  try {
    return (
      realpathSync(fileURLToPath(import.meta.url)) ===
      realpathSync(resolve(argvPath))
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
