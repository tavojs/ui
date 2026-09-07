import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as themeApi from "../dist/theme/index.js";

test("the public web theme entry point omits private and core-only contracts", () => {
  assert.equal("useTheme" in themeApi, false);
  assert.equal(typeof themeApi.createLiveThemeController, "function");
  assert.equal(typeof themeApi.mountLiveThemeController, "function");
  assert.equal(typeof themeApi.getLiveThemeSnapshot, "function");
  assert.equal(typeof themeApi.subscribeLiveTheme, "function");

  const declarations = readFileSync(
    new URL("../dist/theme/types.d.ts", import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(declarations, /\bThemeShade\b/);
  assert.doesNotMatch(declarations, /\bThemeTokenBuildResult\b/);
});
