import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const componentSubpaths = [
  "button",
  "button-group",
  "field",
  "form-control",
  "form-label",
  "radio-group",
  "segmented-control",
  "toggle",
  "toggle-group"
];

test("package declares component subpath exports", async () => {
  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(pkg.sideEffects, false, "package modules should be tree-shakeable");

  for (const subpath of componentSubpaths) {
    const key = `./${subpath}`;
    assert.equal(typeof pkg.exports[key], "object", `${key} should be exported`);
    assert.match(pkg.exports[key].import, /dist\/components\/.+\/index\.js/);
    assert.match(pkg.exports[key].types, /dist\/components\/.+\/index\.d\.ts/);
  }
});

test("theme entry avoids runtime star re-exports that retain ui-core", async () => {
  const source = await readFile("dist/theme/index.js", "utf8");

  assert.doesNotMatch(source, /export \* from "@tavojs\/ui-core"/);
  assert.match(source, /buildThemeTokens/);
});

test("every declared export target exists after build", async () => {
  const pkg = JSON.parse(await readFile("package.json", "utf8"));

  for (const [subpath, entry] of Object.entries(pkg.exports)) {
    const targets = typeof entry === "string" ? [entry] : new Set(Object.values(entry));
    for (const target of targets) {
      await assert.doesNotReject(access(target), `${subpath} should resolve to ${target}`);
    }
  }
});
