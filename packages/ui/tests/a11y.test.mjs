import assert from "node:assert/strict";
import test from "node:test";
import * as a11yApi from "../dist/a11y/index.js";

const { auditThemeA11y } = a11yApi;

test("the public accessibility entry point only exposes the theme audit", () => {
  assert.deepEqual(Object.keys(a11yApi), ["auditThemeA11y"]);
});

test("auditThemeA11y returns structured theme contrast warnings", () => {
  const audit = auditThemeA11y({
    color: {
      light: {
        primary: "#777777",
        secondary: "#888888"
      },
      method: "analogous"
    },
    accessibility: {
      contrast: "AAA",
      failOnViolation: false
    }
  });

  assert.equal(audit.passed, true);
  assert.ok(Array.isArray(audit.issues));
  assert.equal(audit.issues.every((issue) => issue.id === "theme-contrast"), true);
});

test("auditThemeA11y marks contrast violations as errors when configured", () => {
  const audit = auditThemeA11y({
    color: {
      light: {
        primary: "#777777",
        secondary: "#888888"
      },
      method: "analogous"
    },
    accessibility: {
      contrast: "AAA",
      failOnViolation: true
    }
  });

  assert.equal(audit.passed, audit.issues.length === 0);
  assert.equal(audit.issues.every((issue) => issue.severity === "error"), true);
});
