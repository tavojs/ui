import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  getTavoUiTokenMetadata,
  tavoUiTokenMetadata,
  tavoUiTokenNames,
} from "../dist/theme/index.js";

test("public token metadata includes static, semantic, and palette tokens", () => {
  assert.ok(tavoUiTokenNames.includes("--tui-space-1"));
  assert.ok(tavoUiTokenNames.includes("--tui-color-bg"));
  assert.ok(tavoUiTokenNames.includes("--tui-primary-500"));
  assert.equal(
    tavoUiTokenMetadata.find((token) => token.cssVariable === "--tui-space-1")
      ?.group,
    "spacing"
  );
});

test("token metadata includes config-defined custom tokens", () => {
  const metadata = getTavoUiTokenMetadata({
    color: { light: { primary: "#116a67" } },
    tokens: { light: { "product-accent": "rebeccapurple" } },
  });
  assert.ok(
    metadata.some((token) => token.cssVariable === "--tui-product-accent")
  );
});

test("validate-css reports unknown tokens with locations and grouped alternatives", () => {
  const directory = mkdtempSync(join(tmpdir(), "tavo-ui-token-validation-"));
  const configPath = join(directory, "tavo-ui.config.json");
  const cssPath = join(directory, "app.css");

  try {
    writeFileSync(
      configPath,
      JSON.stringify({ color: { light: { primary: "#116a67" } } })
    );
    writeFileSync(
      cssPath,
      [
        "/* var(--tui-space-99) is documentation only. */",
        ".card { padding: var(--tui-space-8); color: var(--tui-color-text); }",
      ].join("\n")
    );

    const result = spawnSync(
      "node",
      [
        "dist/cli/index.js",
        "validate-css",
        "--config",
        configPath,
        cssPath,
      ],
      { encoding: "utf8" }
    );

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Unknown Tavo UI token: --tui-space-8/);
    assert.match(result.stderr, /app\.css:2:22/);
    assert.match(result.stderr, /Available spacing tokens:/);
    assert.match(result.stderr, /--tui-space-1/);
    assert.doesNotMatch(result.stderr, /--tui-space-99/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("validate-css accepts supported and config-defined tokens", () => {
  const directory = mkdtempSync(join(tmpdir(), "tavo-ui-token-validation-"));
  const configPath = join(directory, "tavo-ui.config.json");
  const cssPath = join(directory, "app.scss");

  try {
    writeFileSync(
      configPath,
      JSON.stringify({
        color: { light: { primary: "#116a67" } },
        tokens: { light: { "product-accent": "rebeccapurple" } },
      })
    );
    writeFileSync(
      cssPath,
      ".card { padding: var(--tui-space-1); color: var(--tui-product-accent); }"
    );

    const result = spawnSync(
      "node",
      [
        "dist/cli/index.js",
        "validate-css",
        "--config",
        configPath,
        directory,
      ],
      { encoding: "utf8" }
    );

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /CSS token validation passed/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
