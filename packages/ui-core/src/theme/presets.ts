import type { TavoUiThemeConfig, ThemePreset } from "@/theme/types";

export const PRESETS: Record<ThemePreset, Partial<TavoUiThemeConfig>> = {
  minimal: {
    color: { light: { primary: "#111827" }, method: "monochromatic", fixShade: false },
    scale: { radius: 2, shadow: 0, border: 1, density: "comfortable", motion: 0.6 }
  },
  glass: {
    color: { light: { primary: "#2563eb" }, method: "glass", fixShade: false },
    scale: { shadow: 0.35, border: 1, blur: 22, surfaceRadius: 10 }
  },
  enterprise: {
    color: { light: { primary: "#0f5ea8" }, method: "analogous", fixShade: true },
    scale: {
      radius: 4,
      shadow: 0.25,
      border: 1,
      density: "compact",
      controlRadius: 4,
      surfaceRadius: 6
    }
  },
  editorial: {
    color: { light: { primary: "#8b3a62" }, method: "analogous", fixShade: false },
    scale: { radius: 10, shadow: 0.2, border: 0.5, density: "spacious", surfaceRadius: 18 },
    typography: { headingScale: 1.32 }
  },
  dense: {
    color: { light: { primary: "#116a67" }, method: "analogous", fixShade: true },
    scale: { density: "compact", radius: 3, shadow: 0.15, border: 1, controlHeight: 36 }
  },
  mobile: {
    color: { light: { primary: "#006ecf" }, method: "glass", fixShade: false },
    scale: {
      density: "spacious",
      controlHeight: 46,
      radius: 12,
      shadow: 0.2,
      border: 0.5,
      controlRadius: 14,
      surfaceRadius: 18
    }
  },
  monochrome: {
    color: { light: { primary: "#000000" }, method: "monochromatic", fixShade: false },
    scale: { shadow: 0, border: 1, radius: 0 }
  }
};

export function isThemePreset(value: string): value is ThemePreset {
  return Object.prototype.hasOwnProperty.call(PRESETS, value);
}

function mergeConfig(
  base: Partial<TavoUiThemeConfig>,
  override: TavoUiThemeConfig
): TavoUiThemeConfig {
  return {
    ...base,
    ...override,
    color: {
      ...base.color,
      ...override.color,
      light: {
        ...(base.color?.light ?? {}),
        ...override.color.light
      },
      dark: {
        ...(base.color?.dark ?? {}),
        ...(override.color.dark ?? {})
      }
    },
    scale: {
      ...(base.scale ?? {}),
      ...(override.scale ?? {})
    },
    typography: {
      ...(base.typography ?? {}),
      ...(override.typography ?? {})
    },
    viewport: {
      ...(base.viewport ?? {}),
      ...(override.viewport ?? {})
    },
    breakpoints: {
      ...(base.breakpoints ?? {}),
      ...(override.breakpoints ?? {})
    },
    semantic: {
      ...(base.semantic ?? {}),
      ...(override.semantic ?? {}),
      light: {
        ...(base.semantic?.light ?? {}),
        ...(override.semantic?.light ?? {})
      },
      dark: {
        ...(base.semantic?.dark ?? {}),
        ...(override.semantic?.dark ?? {})
      }
    },
    output: {
      ...(base.output ?? {}),
      ...(override.output ?? {})
    },
    accessibility: {
      ...(base.accessibility ?? {}),
      ...(override.accessibility ?? {})
    },
    tokens: {
      ...(base.tokens ?? {}),
      ...(override.tokens ?? {}),
      light: {
        ...(base.tokens?.light ?? {}),
        ...(override.tokens?.light ?? {})
      },
      dark: {
        ...(base.tokens?.dark ?? {}),
        ...(override.tokens?.dark ?? {})
      }
    }
  } as TavoUiThemeConfig;
}

export function resolveThemeConfig(config: TavoUiThemeConfig): TavoUiThemeConfig {
  if (!config.preset) {
    return config;
  }
  if (!isThemePreset(config.preset)) {
    throw new Error(
      'Theme config preset must be one of "minimal", "glass", "enterprise", "editorial", "dense", "mobile", or "monochrome".'
    );
  }

  return mergeConfig(PRESETS[config.preset], config);
}
