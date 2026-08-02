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
  assert.doesNotMatch(usage(), /tavo-ui native <command>/);
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

test("rejects native commands in the web-only release", () => {
  assert.throws(
    () => resolveRoute(["native", "generate"]),
    /React Native commands are not included/
  );
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
