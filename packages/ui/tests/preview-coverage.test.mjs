import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { componentMetadata } from "../dist/metadata.js";

const previewPagePath = new URL(
  "../demo/src/pages/previews/components/[component].tsx",
  import.meta.url,
);

test("every public component has an explicit catalog preview", () => {
  const source = readFileSync(previewPagePath, "utf8");
  const previewSlugs = new Set(
    [...source.matchAll(/case "([^"]+)"/g)].map((match) => match[1]),
  );
  const missing = componentMetadata
    .map((component) => component.slug)
    .filter((slug) => !previewSlugs.has(slug));

  assert.deepEqual(missing, []);
  assert.equal(previewSlugs.size, componentMetadata.length);
});
