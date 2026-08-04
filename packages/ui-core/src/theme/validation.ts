import { resolveThemeBreakpoints } from "@/theme/breakpoints";
import { isThemePreset } from "@/theme/presets";
import type { TavoUiThemeConfig, ThemeBreakpointsConfig } from "@/theme/types";
import { resolveThemeViewport } from "@/theme/viewport";

const THEME_CONFIG_KEYS = new Set([
  "$schema",
  "preset",
  "defaultTheme",
  "color",
  "scale",
  "typography",
  "interaction",
  "viewport",
  "breakpoints",
  "semantic",
  "output",
  "accessibility",
  "tokens"
]);

const THEME_OUTPUT_KEYS = new Set(["selector", "darkSelector", "includeMediaQuery"]);

function assertKnownProperties(value: unknown, allowed: ReadonlySet<string>, label: string): void {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return;
  }
  for (const property of Object.keys(value)) {
    if (!allowed.has(property)) {
      throw new Error(`Theme config ${label} has unknown property "${property}".`);
    }
  }
}

function assertPositiveNumber(value: number | undefined, label: string): void {
  if (value !== undefined && (!Number.isFinite(value) || value <= 0)) {
    throw new Error(`Theme config ${label} must be a positive number.`);
  }
}

function assertNonNegativeNumber(value: number | undefined, label: string): void {
  if (value !== undefined && (!Number.isFinite(value) || value < 0)) {
    throw new Error(`Theme config ${label} must be a non-negative number.`);
  }
}

function assertRatioNumber(value: number | undefined, label: string): void {
  if (value !== undefined && (!Number.isFinite(value) || value < 0 || value > 1)) {
    throw new Error(`Theme config ${label} must be a number between 0 and 1.`);
  }
}

export function assertThemeConfig(
  config: TavoUiThemeConfig,
  resolvedBreakpoints?: Required<ThemeBreakpointsConfig>
): void {
  if (!config || typeof config !== "object") {
    throw new Error("Expected a Tavo.js UI theme config object.");
  }
  assertKnownProperties(config, THEME_CONFIG_KEYS, "root");
  assertKnownProperties(config.output, THEME_OUTPUT_KEYS, "output");
  if (!config.color?.light?.primary) {
    throw new Error("Theme config must define color.light.primary.");
  }
  if (
    config.color.method &&
    !["analogous", "monochromatic", "glass"].includes(config.color.method)
  ) {
    throw new Error('Theme config color.method must be "analogous", "monochromatic", or "glass".');
  }
  if (config.preset && !isThemePreset(config.preset)) {
    throw new Error(
      'Theme config preset must be one of "minimal", "glass", "enterprise", "editorial", "dense", "mobile", or "monochrome".'
    );
  }
  if (config.defaultTheme && !["light", "dark", "system"].includes(config.defaultTheme)) {
    throw new Error('Theme config defaultTheme must be "light", "dark", or "system".');
  }

  assertPositiveNumber(config.scale?.unit, "scale.unit");
  assertPositiveNumber(config.scale?.controlHeight, "scale.controlHeight");
  assertPositiveNumber(config.scale?.spacing, "scale.spacing");
  assertNonNegativeNumber(config.scale?.radius, "scale.radius");
  assertNonNegativeNumber(config.scale?.shadow, "scale.shadow");
  assertNonNegativeNumber(config.scale?.border, "scale.border");
  assertNonNegativeNumber(config.scale?.focus, "scale.focus");
  assertNonNegativeNumber(config.scale?.motion, "scale.motion");
  assertRatioNumber(config.scale?.opacity, "scale.opacity");
  assertNonNegativeNumber(config.scale?.blur, "scale.blur");
  assertRatioNumber(config.scale?.glassAlpha, "scale.glassAlpha");
  assertNonNegativeNumber(config.scale?.controlRadius, "scale.controlRadius");
  assertNonNegativeNumber(config.scale?.surfaceRadius, "scale.surfaceRadius");
  assertNonNegativeNumber(config.interaction?.hoverLift, "interaction.hoverLift");
  assertRatioNumber(config.interaction?.hoverShadow, "interaction.hoverShadow");
  assertNonNegativeNumber(config.interaction?.activeScale, "interaction.activeScale");
  assertRatioNumber(config.interaction?.focusAlpha, "interaction.focusAlpha");
  assertRatioNumber(config.interaction?.disabledOpacity, "interaction.disabledOpacity");
  assertNonNegativeNumber(config.interaction?.transition, "interaction.transition");
  assertPositiveNumber(config.viewport?.rootMin, "viewport.rootMin");
  assertPositiveNumber(config.viewport?.rootMax, "viewport.rootMax");
  assertPositiveNumber(config.viewport?.minWidth, "viewport.minWidth");
  assertPositiveNumber(config.viewport?.maxWidth, "viewport.maxWidth");
  assertPositiveNumber(config.breakpoints?.sm, "breakpoints.sm");
  assertPositiveNumber(config.breakpoints?.md, "breakpoints.md");
  assertPositiveNumber(config.breakpoints?.lg, "breakpoints.lg");
  const viewport = resolveThemeViewport(config);
  if (viewport.rootMin > viewport.rootMax) {
    throw new Error(
      "Theme config viewport.rootMin must be less than or equal to viewport.rootMax."
    );
  }
  if (viewport.minWidth >= viewport.maxWidth) {
    throw new Error("Theme config viewport.minWidth must be less than viewport.maxWidth.");
  }
  const breakpoints = resolvedBreakpoints ?? resolveThemeBreakpoints(config);
  if (breakpoints.sm >= breakpoints.md || breakpoints.md >= breakpoints.lg) {
    throw new Error("Theme config breakpoints must be ascending: sm < md < lg.");
  }
  if (
    config.scale?.density &&
    !["compact", "comfortable", "spacious"].includes(config.scale.density)
  ) {
    throw new Error('Theme config scale.density must be "compact", "comfortable", or "spacious".');
  }
  assertPositiveNumber(config.typography?.bodySize, "typography.bodySize");
  assertPositiveNumber(config.typography?.captionSize, "typography.captionSize");
  assertPositiveNumber(config.typography?.labelSize, "typography.labelSize");
  assertPositiveNumber(config.typography?.headingScale, "typography.headingScale");

  if (config.accessibility?.contrast && !["AA", "AAA"].includes(config.accessibility.contrast)) {
    throw new Error('Theme config accessibility.contrast must be "AA" or "AAA".');
  }
}
