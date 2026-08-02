import { DEFAULT_BREAKPOINTS } from "@/theme/defaults";
import type { TavoUiThemeConfig, ThemeBreakpointsConfig } from "@/theme/types";

export function resolveThemeBreakpoints(
  config: TavoUiThemeConfig
): Required<ThemeBreakpointsConfig> {
  return {
    ...DEFAULT_BREAKPOINTS,
    ...(config.breakpoints ?? {})
  };
}
