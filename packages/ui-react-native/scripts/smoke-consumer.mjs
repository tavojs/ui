import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const workspaceRoot = fileURLToPath(new URL("../../../", import.meta.url));
const consumer = mkdtempSync(path.join(tmpdir(), "tavo-ui-native-consumer-"));

function npm(args, cwd, stdio = "inherit") {
  return execFileSync(process.execPath, [process.env.npm_execpath, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, npm_config_cache: path.join(consumer, ".npm-cache") },
    stdio
  });
}

function pack(workspace) {
  const output = npm(["pack", "--json", "--workspace", workspace, "--pack-destination", consumer], workspaceRoot, [
    "ignore",
    "pipe",
    "inherit"
  ]);
  const [{ filename }] = JSON.parse(output);
  return path.join(consumer, filename);
}

try {
  npm(["run", "build", "--workspace", "@tavojs/ui-core"], workspaceRoot);
  const core = pack("@tavojs/ui-core");
  const native = pack("@tavojs/ui-react-native");

  writeFileSync(path.join(consumer, "package.json"), '{"name":"tavo-ui-native-consumer","private":true}\n');
  npm(
    ["install", "--offline", "--ignore-scripts", "--legacy-peer-deps", "--no-audit", "--no-fund", core, native],
    consumer
  );

  // Resolve the same React Native and React type versions used by this workspace.
  for (const peer of ["react", "react-native", "@types/react"]) {
    const target = path.join(consumer, "node_modules", peer);
    mkdirSync(path.dirname(target), { recursive: true });
    symlinkSync(path.dirname(require.resolve(`${peer}/package.json`)), target, "junction");
  }

  writeFileSync(
    path.join(consumer, "app.tsx"),
    `import { Button, TavoThemeProvider } from "@tavojs/ui-react-native";
import { createNativeTheme, type TavoUiThemeConfig } from "@tavojs/ui-react-native/theme";
import { Button as SubpathButton, type ButtonProps } from "@tavojs/ui-react-native/button";
import { type ChartProps } from "@tavojs/ui-react-native/chart";

const config: TavoUiThemeConfig = { preset: "mobile", color: { light: { primary: "#006ecf" } } };
const buttonProps: ButtonProps = { variant: "soft" };
export const chartProps: ChartProps = { data: [{ label: "First", value: 10 }] };
export const theme = createNativeTheme(config, "light");

export const app = (
  <TavoThemeProvider config={config}>
    <Button>Root import</Button>
    <SubpathButton {...buttonProps}>Component import</SubpathButton>
  </TavoThemeProvider>
);
`
  );

  execFileSync(
    process.execPath,
    [
      require.resolve("typescript/bin/tsc"),
      "--noEmit",
      "--strict",
      "--skipLibCheck",
      "--jsx",
      "react-jsx",
      "--module",
      "esnext",
      "--moduleResolution",
      "bundler",
      "app.tsx"
    ],
    { cwd: consumer, stdio: "inherit" }
  );
  console.log("Packed React Native consumer typecheck passed.");
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
