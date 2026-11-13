import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { resolveRoute, usage } from "../dist/index.js";

test("prints help without args", () => {
  assert.deepEqual(resolveRoute([]), {
    kind: "help",
  });
  assert.match(usage(), /tavo-ui web <command>/);
  assert.match(usage(), /tavo-ui native <command>/);
});

test("runs when invoked through an npm-style bin symlink", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "tavo-ui-cli-"));
  const binPath = path.join(directory, "tavo-ui");
  const entrypoint = new URL("../dist/index.js", import.meta.url);
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  fs.symlinkSync(entrypoint, binPath);
  const result = spawnSync(process.execPath, [binPath, "--help"], {
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Usage:/);
  assert.match(result.stdout, /tavo-ui web <command>/);
});

test("routes explicit web commands", () => {
  assert.deepEqual(
    resolveRoute(["web", "generate", "--config", "tavo-ui.config.json"]),
    {
      kind: "platform",
      platform: "web",
      args: ["generate", "--config", "tavo-ui.config.json"],
    }
  );
});

test("routes explicit native commands and defaults to generate", () => {
  assert.deepEqual(resolveRoute(["native", "generate", "--out", "theme.mjs"]), {
    kind: "platform",
    platform: "native",
    args: ["generate", "--out", "theme.mjs"],
  });
  assert.deepEqual(resolveRoute(["native"]), {
    kind: "platform",
    platform: "native",
    args: ["generate"],
  });
});

test("loads the optional native CLI and gives an install hint when absent", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "tavo-ui-cli-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const entrypoint = path.join(directory, "tavo-ui.mjs");
  fs.copyFileSync(new URL("../dist/index.js", import.meta.url), entrypoint);
  const args = ["generate", "--out", "theme.mjs"];
  const run = () =>
    spawnSync(process.execPath, [entrypoint, "native", ...args], {
      encoding: "utf8",
    });

  const missing = run();
  assert.equal(missing.status, 1, missing.stderr);
  assert.match(missing.stderr, /npm install @tavojs\/ui-react-native/);

  const nativePackage = path.join(
    directory,
    "node_modules",
    "@tavojs",
    "ui-react-native"
  );
  fs.mkdirSync(nativePackage, { recursive: true });
  fs.writeFileSync(
    path.join(nativePackage, "package.json"),
    JSON.stringify({ exports: { "./cli": "./cli.mjs" } })
  );
  fs.writeFileSync(
    path.join(nativePackage, "cli.mjs"),
    "export const runNativeCli = (args) => console.log(JSON.stringify(args));"
  );

  const installed = run();
  assert.equal(installed.status, 0, installed.stderr);
  assert.deepEqual(JSON.parse(installed.stdout), args);
});

test("routes unprefixed generate to web", () => {
  assert.deepEqual(resolveRoute(["generate"]), {
    kind: "platform",
    platform: "web",
    args: ["generate"],
  });
});

test("routes all supported commands to web", () => {
  for (const command of [
    "check",
    "validate-css",
    "tokens",
    "init",
    "preview",
    "audit",
  ]) {
    assert.deepEqual(resolveRoute([command]), {
      kind: "platform",
      platform: "web",
      args: [command],
    });
  }
});
