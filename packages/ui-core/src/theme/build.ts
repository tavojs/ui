import { accessibilityWarnings } from "@/theme/accessibility";
import { resolveThemeBreakpoints } from "@/theme/breakpoints";
import { deriveModeTokens } from "@/theme/mode-tokens";
import { resolveThemeConfig } from "@/theme/presets";
import { buildStaticTokens } from "@/theme/static-tokens";
import type { TavoUiThemeConfig, ThemeTokenBuildResult } from "@/theme/types";
import { assertThemeConfig } from "@/theme/validation";

export { resolveThemeBreakpoints } from "@/theme/breakpoints";
export { resolveThemeConfig } from "@/theme/presets";
export { resolveThemeViewport } from "@/theme/viewport";

export function buildThemeTokens(config: TavoUiThemeConfig): ThemeTokenBuildResult {
  const resolvedConfig = resolveThemeConfig(config);
  const breakpoints = resolveThemeBreakpoints(resolvedConfig);
  assertThemeConfig(resolvedConfig, breakpoints);

  const light = deriveModeTokens("light", resolvedConfig);
  const dark = deriveModeTokens("dark", resolvedConfig);
  const staticTokens = buildStaticTokens(resolvedConfig, breakpoints);
  const warnings = accessibilityWarnings(resolvedConfig, light, dark);

  if (warnings.length > 0 && resolvedConfig.accessibility?.failOnViolation) {
    throw new Error(`Theme accessibility validation failed:\n${warnings.join("\n")}`);
  }

  return {
    modes: {
      light,
      dark
    },
    config: resolvedConfig,
    warnings,
    staticTokens,
    breakpoints
  };
}
