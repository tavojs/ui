import { DEFAULT_VIEWPORT, LEGACY_FLUID_VIEWPORT } from "@/theme/defaults";
import type { TavoUiThemeConfig, ThemeViewportConfig } from "@/theme/types";

export function resolveThemeViewport(config: TavoUiThemeConfig): Required<ThemeViewportConfig> {
  const viewport = config.viewport;
  if (!viewport) {
    return { ...DEFAULT_VIEWPORT };
  }

  const strategy = viewport.strategy ?? "fluid";
  const defaults = strategy === "fixed" ? DEFAULT_VIEWPORT : LEGACY_FLUID_VIEWPORT;
  return {
    ...defaults,
    ...viewport,
    strategy
  };
}
