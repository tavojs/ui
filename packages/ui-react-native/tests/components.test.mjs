import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("core interactive components declare native accessibility contracts", async () => {
  const checks = [
    ["src/components/Button/Button.tsx", 'accessibilityRole={props.accessibilityRole ?? "button"}', "busy: loading"],
    [
      "src/components/Checkbox/Checkbox.tsx",
      'accessibilityRole="checkbox"',
      'checked: indeterminate ? "mixed" : checked'
    ],
    ["src/components/Radio/Radio.tsx", 'accessibilityRole="radio"', "accessibilityState={{ checked, disabled }}"],
    [
      "src/components/Progress/Progress.tsx",
      'accessibilityRole="progressbar"',
      "accessibilityValue={{ min: 0, max: safeMax, now: safeValue }}"
    ],
    [
      "src/components/SegmentedControl/SegmentedControl.tsx",
      'accessibilityRole="radiogroup"',
      'accessibilityRole="radio"'
    ],
    [
      "src/components/Toggle/Toggle.tsx",
      'accessibilityRole={props.accessibilityRole ?? "button"}',
      "selected: pressed"
    ],
    [
      "src/components/ToggleGroup/ToggleGroup.tsx",
      'accessibilityRole={type === "single" ? "radiogroup" : "none"}',
      'accessibilityRole={type === "single" ? "radio" : "checkbox"}'
    ]
  ];

  for (const [file, ...needles] of checks) {
    const source = await readFile(file, "utf8");
    for (const needle of needles) {
      assert.match(source, escapeRegExp(needle), `${file} should include ${needle}`);
    }
  }
});

test("component style files use StyleSheet.create for static style blocks", async () => {
  const files = [
    "src/components/Button/Button.styles.ts",
    "src/components/Checkbox/Checkbox.styles.ts",
    "src/components/Radio/Radio.styles.ts",
    "src/components/SegmentedControl/SegmentedControl.styles.ts",
    "src/components/TextInput/TextInput.styles.ts"
  ];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.match(source, /StyleSheet\.create/, `${file} should use StyleSheet.create`);
  }
});

function escapeRegExp(value) {
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
}
