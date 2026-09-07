import type {
  ResolvedThemeMode,
  ThemeBreakpointsConfig,
  ThemeSemanticConfig,
  ThemeViewportConfig
} from "@/theme/types";

export const DEFAULT_SEMANTIC: Record<ResolvedThemeMode, Required<ThemeSemanticConfig>> = {
  light: {
    success: "#18794e",
    warning: "#9b5d00",
    danger: "#b42318",
    info: "#235fb6"
  },
  dark: {
    success: "#58d68d",
    warning: "#f5b041",
    danger: "#ff6b6b",
    info: "#7fb3ff"
  }
};

export const DEFAULT_BREAKPOINTS: Required<ThemeBreakpointsConfig> = {
  sm: 480,
  md: 768,
  lg: 1024
};

export const DEFAULT_VIEWPORT: Required<ThemeViewportConfig> = {
  strategy: "fixed",
  rootMin: 16,
  rootMax: 16,
  minWidth: 320,
  maxWidth: 960
};

export const LEGACY_FLUID_VIEWPORT: Required<ThemeViewportConfig> = {
  strategy: "fluid",
  rootMin: 14,
  rootMax: 16,
  minWidth: 320,
  maxWidth: 960
};
