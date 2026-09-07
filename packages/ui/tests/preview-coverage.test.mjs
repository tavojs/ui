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

test("RadioGroup preview includes labeled radio controls", () => {
  const source = readFileSync(previewPagePath, "utf8");
  const preview = source.match(
    /case "radio-group":([\s\S]*?)case "resizable":/,
  )?.[1];

  assert.ok(preview);
  assert.match(preview, /<RadioGroup[^>]*>[\s\S]*<Radio /);
  assert.match(preview, /<FormControlLabel /);
});

test("TextInput preview is distinct from the Field composition preview", () => {
  const source = readFileSync(previewPagePath, "utf8");
  const preview = source.match(
    /case "text-input":([\s\S]*?)case "textarea":/,
  )?.[1];

  assert.ok(preview);
  assert.doesNotMatch(preview, /<Field[ >]/);
  assert.match(preview, /<TextInput size="sm"/);
  assert.match(preview, /<TextInput size="lg"/);
});
