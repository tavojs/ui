import { DEFAULT_VIEWPORT } from "@/theme/defaults";
import type { TavoUiThemeConfig, ThemeViewportConfig } from "@/theme/types";

export function resolveThemeViewport(config: TavoUiThemeConfig): Required<ThemeViewportConfig> {
  return {
    ...DEFAULT_VIEWPORT,
    ...(config.viewport ?? {})
  };
}
