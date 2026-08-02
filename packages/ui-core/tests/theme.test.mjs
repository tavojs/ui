import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildThemeTokens,
  hexToHsl,
  resolveThemeBreakpoints,
  resolveThemeConfig,
  resolveThemeViewport
} from "../dist/index.js";

test("schema exposes only canonical scale and output properties", () => {
  const schema = JSON.parse(readFileSync("schema.json", "utf8"));

  assert.equal(schema.additionalProperties, false);
  assert.equal("size" in schema.properties, false);
  assert.equal(schema.properties.output.additionalProperties, false);
  assert.equal("prefix" in schema.properties.output.properties, false);
  assert.ok("controlHeight" in schema.properties.scale.properties);
  assert.ok("radius" in schema.properties.scale.properties);
});

test("buildThemeTokens resolves light and dark token sets", () => {
  const result = buildThemeTokens({
    color: {
      light: {
        primary: "#116a67",
        secondary: "#d86c3d"
      },
      method: "monochromatic",
      fixShade: true
    },
    scale: {
      controlHeight: 40,
      spacing: 8,
      radius: 6,
      shadow: 0.35,
      border: 0.5,
      density: "comfortable",
      focus: 2,
      motion: 0.5,
      opacity: 0.42,
      blur: 16,
      glassAlpha: 0.58,
      controlRadius: 4,
      surfaceRadius: 10
    },
    typography: {
      textFontFamily: '"IBM Plex Sans", system-ui, sans-serif',
      headingFontFamily: '"Fraunces", Georgia, serif',
      bodySize: 16,
      headingScale: 1.2
    },
    tokens: {
      light: {
        "color-surface": "#fafafa"
      }
    }
  });

  assert.equal(result.config.color.method, "monochromatic");
  assert.equal(result.modes.light.tokens["color-surface"], "#ffffff");
  assert.equal(result.modes.dark.tokens["color-bg"], "#000000");
  assert.equal(result.staticTokens["size-md"], "2.500rem");
  assert.equal(result.staticTokens["border-width"], "0.5px");
  assert.equal(result.staticTokens["font-family-heading"], '"Fraunces", Georgia, serif');
});

test("resolveThemeConfig applies presets before explicit config", () => {
  const result = resolveThemeConfig({
    preset: "enterprise",
    color: {
      light: {
        primary: "#7c5cff"
      }
    },
    scale: {
      density: "spacious"
    }
  });

  assert.equal(result.color.method, "analogous");
  assert.equal(result.scale?.radius, 4);
  assert.equal(result.scale?.density, "spacious");
});

test("resolveThemeBreakpoints applies defaults and overrides", () => {
  assert.deepEqual(resolveThemeBreakpoints({ color: { light: { primary: "#116a67" } } }), {
    sm: 480,
    md: 768,
    lg: 1024
  });
  assert.deepEqual(
    resolveThemeBreakpoints({
      color: { light: { primary: "#116a67" } },
      breakpoints: { sm: 520, md: 820, lg: 1180 }
    }),
    {
      sm: 520,
      md: 820,
      lg: 1180
    }
  );
});

test("scale.unit derives a coherent dimensional system", () => {
  const result = buildThemeTokens({
    color: { light: { primary: "#116a67" } },
    scale: { unit: 10 }
  });

  assert.equal(result.staticTokens["space-1"], "0.625rem");
  assert.equal(result.staticTokens["size-md"], "3.125rem");
  assert.equal(result.staticTokens["radius-md"], "0.625rem");
  assert.equal(result.staticTokens["font-size-body"], "1.250rem");
  assert.equal(result.staticTokens["focus-width"], "3.75px");
  assert.equal(result.staticTokens["blur-surface"], "27.5px");
});

test("explicit dimensions win over density scaling", () => {
  const defaults = buildThemeTokens({
    color: { light: { primary: "#116a67" } },
    scale: { density: "compact" }
  });
  const explicit = buildThemeTokens({
    color: { light: { primary: "#116a67" } },
    scale: { controlHeight: 40, spacing: 10, density: "compact" }
  });

  assert.equal(defaults.staticTokens["size-md"], "2.150rem");
  assert.equal(explicit.staticTokens["size-md"], "2.500rem");
  assert.equal(explicit.staticTokens["space-1"], "0.625rem");
});

test("resolveThemeViewport applies defaults before validating one-sided overrides", () => {
  const config = { color: { light: { primary: "#116a67" } } };
  assert.deepEqual(resolveThemeViewport(config), {
    rootMin: 14,
    rootMax: 16,
    minWidth: 320,
    maxWidth: 960
  });

  assert.throws(
    () => buildThemeTokens({ ...config, viewport: { rootMin: 20 } }),
    /rootMin must be less than or equal to viewport\.rootMax/
  );
  assert.throws(
    () => buildThemeTokens({ ...config, viewport: { maxWidth: 300 } }),
    /minWidth must be less than viewport\.maxWidth/
  );
  assert.throws(
    () => buildThemeTokens({ ...config, viewport: { minWidth: 960 } }),
    /minWidth must be less than viewport\.maxWidth/
  );
});

test("invalid config throws clear errors", () => {
  assert.throws(
    () =>
      buildThemeTokens({
        color: { light: { primary: "#116a67" } },
        size: { base: 40, radius: 6 }
      }),
    /root has unknown property "size"/
  );
  assert.throws(
    () =>
      buildThemeTokens({
        color: { light: { primary: "#116a67" } },
        output: { prefix: "xui" }
      }),
    /output has unknown property "prefix"/
  );
  assert.throws(
    () =>
      buildThemeTokens({
        color: { light: { primary: "#116a67" } },
        breakpoints: { sm: 900, md: 768, lg: 1024 }
      }),
    /breakpoints must be ascending/
  );
  assert.throws(
    () => buildThemeTokens({ color: { light: { primary: "blue" } } }),
    /Invalid hex color/
  );
  for (const config of [
    { scale: { opacity: 1.1 } },
    { interaction: { hoverShadow: 1.1 } },
    { interaction: { focusAlpha: 1.1 } },
    { interaction: { disabledOpacity: 1.1 } }
  ]) {
    assert.throws(
      () => buildThemeTokens({ color: { light: { primary: "#116a67" } }, ...config }),
      /between 0 and 1/
    );
  }
});

test("base token overrides refresh dependent aliases", () => {
  const result = buildThemeTokens({
    color: { light: { primary: "#7c5cff" } },
    tokens: {
      light: {
        "color-surface": "#123456",
        "color-primary-soft-bg": "#abcdef",
        "color-danger": "#102030"
      }
    }
  });

  assert.equal(result.modes.light.tokens["color-panel-bg"], "#123456");
  assert.equal(result.modes.light.tokens["color-selection-bg"], "#abcdef");
  assert.equal(result.modes.light.tokens["color-danger-surface-text"], "#102030");
  assert.equal(result.modes.light.tokens["color-danger-surface"], "rgba(16, 32, 48, 0.1)");
});

test("explicit alias overrides win over refreshed aliases", () => {
  const result = buildThemeTokens({
    color: { light: { primary: "#7c5cff" } },
    tokens: {
      light: {
        "color-surface": "#123456",
        "color-panel-bg": "#654321"
      }
    }
  });

  assert.equal(result.modes.light.tokens["color-panel-bg"], "#654321");
});

test("fixed color ramps remain monotonic around the source color", () => {
  for (const primary of ["#7c5cff", "#116a67", "#f5c542", "#111827"]) {
    for (const method of ["analogous", "monochromatic", "glass"]) {
      const result = buildThemeTokens({
        color: { light: { primary }, method, fixShade: true }
      });

      for (const ramp of [result.modes.light.primary, result.modes.light.secondary]) {
        const lightness = Object.values(ramp).map((color) => hexToHsl(color).l);
        for (let index = 1; index < lightness.length; index += 1) {
          assert.ok(
            lightness[index] <= lightness[index - 1],
            `${method} ${primary} ramp increased at index ${index}`
          );
        }
      }
    }
  }
});

test("omitting secondary derives a neighboring analogous hue", () => {
  const primary = "#8b5cf6";
  const result = buildThemeTokens({ color: { light: { primary } } });
  const primaryHue = hexToHsl(primary).h;
  const secondaryHue = hexToHsl(result.modes.light.tokens["color-secondary-bg"]).h;
  const hueDistance = Math.abs(((secondaryHue - primaryHue + 540) % 360) - 180);

  assert.ok(hueDistance >= 29 && hueDistance <= 31);
});

test("accessibility warnings and failOnViolation are handled in core", () => {
  const result = buildThemeTokens({
    color: {
      light: {
        primary: "#777777"
      },
      method: "glass"
    },
    accessibility: {
      contrast: "AAA"
    }
  });

  assert.ok(result.warnings.length > 0);
  assert.throws(
    () =>
      buildThemeTokens({
        color: {
          light: {
            primary: "#777777"
          },
          method: "glass"
        },
        accessibility: {
          contrast: "AAA",
          failOnViolation: true
        }
      }),
    /Theme accessibility validation failed/
  );
});
