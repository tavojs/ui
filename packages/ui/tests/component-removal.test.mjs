import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as cssApi from "../dist/css/index.js";
import * as feedbackApi from "../dist/css/groups/feedback.js";

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
);

test("Carousel and LiveRegion are absent from public component entry points", () => {
  assert.equal("Carousel" in cssApi, false);
  assert.equal("LiveRegion" in cssApi, false);
  assert.equal("LiveRegion" in feedbackApi, false);

  for (const subpath of [
    "./carousel",
    "./css/carousel",
    "./live-region",
    "./css/live-region",
  ]) {
    assert.equal(subpath in packageJson.exports, false);
  }
});
