import assert from "node:assert/strict";
import test from "node:test";
import { convertTokensForNative, createNativeTheme, parseTokenValue } from "../dist/theme/native.js";
import { resolveResponsiveValue } from "../dist/theme/responsive.js";
import { disabledOpacity, textSize } from "../dist/components/style-utils.js";

const config = {
  preset: "mobile",
  defaultTheme: "system",
  color: {
    light: { primary: "#006ecf" }
  }
};

test("parses CSS-like token values into React Native values", () => {
  assert.equal(parseTokenValue("1rem"), 16);
  assert.equal(parseTokenValue("12px"), 12);
  assert.equal(parseTokenValue("180ms"), 180);
  assert.equal(parseTokenValue("#ffffff"), "#ffffff");
  assert.equal(parseTokenValue("rgba(0, 0, 0, 0.4)"), "rgba(0, 0, 0, 0.4)");
});

test("omits CSS-only tokens during native conversion", () => {
  assert.deepEqual(
    convertTokensForNative({
      "backdrop-filter": "blur(22px)",
      "space-1": "0.5rem"
    }),
    {
      "space-1": 8
    }
  );
});

test("creates native themes from tavo-ui-core tokens", () => {
  const theme = createNativeTheme(config, "light");

  assert.equal(theme.mode, "light");
  assert.equal(typeof theme.tokens["color-bg"], "string");
  assert.equal(typeof theme.tokens["space-1"], "number");
  assert.equal(theme.breakpoints.md, 768);
  assert.equal(theme.breakpoints, theme.build.breakpoints);
  assert.equal(typeof theme.shadows.md.elevation, "number");
});

test("native style helpers honor resolved typography and interaction config", () => {
  const theme = createNativeTheme(
    {
      color: { light: { primary: "#006ecf" } },
      typography: { bodySize: 16, headingScale: 1.5 },
      interaction: { disabledOpacity: 0.31 }
    },
    "light"
  );

  assert.equal(textSize(theme, "h2").fontSize, 36);
  assert.equal(disabledOpacity(theme), 0.31);
});

test("resolves responsive values by breakpoint", () => {
  const theme = createNativeTheme(config, "light");
  const value = {
    base: "base",
    sm: "small",
    md: "medium",
    lg: "large"
  };

  assert.equal(resolveResponsiveValue(value, theme, { width: 320 }, "fallback"), "base");
  assert.equal(resolveResponsiveValue(value, theme, { width: 640 }, "fallback"), "small");
  assert.equal(resolveResponsiveValue(value, theme, { width: 820 }, "fallback"), "medium");
  assert.equal(resolveResponsiveValue(value, theme, { width: 1200 }, "fallback"), "large");
});
