#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PLATFORM_CLI = {
  web: {
    specifier: "@tavojs/ui/cli",
    runner: "runCli",
    label: "Tavo.js UI web",
  },
  native: {
    specifier: "@tavojs/ui-react-native/cli",
    runner: "runNativeCli",
    label: "Tavo.js UI React Native",
  },
} as const;

type Platform = keyof typeof PLATFORM_CLI;

type Route =
  | {
      kind: "help";
    }
  | {
      kind: "platform";
      platform: Platform;
      args: string[];
    };

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
    "  tavo-ui native <command> [options]",
    "  tavo-ui generate [options]",
    "",
    "Commands:",
    "  web generate      Generate the web theme stylesheet.",
    "  web check         Validate the web theme config.",
    "  web validate-css  Report unknown Tavo.js UI variables in application CSS.",
    "  web tokens        Print generated web theme tokens.",
    "  web init          Create a default web theme config.",
    "  web preview       Generate a web theme preview.",
    "  web audit         Print web theme audit results.",
    "  native generate   Generate a React Native theme config module.",
    "",
    "Install:",
    "  npm install @tavojs/ui                 (includes tavo-ui for web)",
    "  npm install @tavojs/ui-react-native    (React Native components)",
    "  npm install -D @tavojs/ui-cli          (standalone CLI)",
  ].join("\n");
}

export function resolveRoute(argv: string[]): Route {
  const [first, ...rest] = argv;

  if (!first || first === "--help" || first === "-h" || first === "help") {
    return { kind: "help" };
  }

  if (first === "web" || first === "native") {
    return {
      kind: "platform",
      platform: first,
      args: rest.length > 0 ? rest : ["generate"],
    };
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

function installHint(label: string, specifier: string): string {
  return [
    `${label} package is not installed.`,
    "",
    `Install it with: npm install ${packageName(specifier)}`,
  ].join("\n");
}

async function runPlatform(platform: Platform, args: string[]): Promise<void> {
  const { specifier, runner, label } = PLATFORM_CLI[platform];
  let mod: Record<string, unknown>;
  try {
    mod = await import(specifier);
  } catch (error) {
    if (isMissingImport(error, specifier)) {
      throw new Error(installHint(label, specifier));
    }
    throw error;
  }

  const run = mod[runner];
  if (typeof run !== "function") {
    throw new Error(`${specifier} does not export ${runner}.`);
  }
  await run(args);
}

export async function runCli(argv = process.argv.slice(2)): Promise<void> {
  const route = resolveRoute(argv);
  if (route.kind === "help") {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  await runPlatform(route.platform, route.args);
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
