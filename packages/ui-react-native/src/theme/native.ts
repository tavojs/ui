import type { ImageStyle, TextStyle, ViewStyle } from "react-native";
import {
  buildThemeTokens,
  resolveThemeBreakpoints,
  type ResolvedThemeMode,
  type TavoUiThemeConfig,
  type ThemeTokenBuildResult
} from "@tavojs/ui-core";

export type NativeThemeTokens = Record<string, string | number>;
export type NativeShadowStyle = Pick<
  ViewStyle,
  "shadowColor" | "shadowOffset" | "shadowOpacity" | "shadowRadius" | "elevation"
>;
export type NativeStyle = ViewStyle & TextStyle & ImageStyle;

export type NativeTheme = {
  config: TavoUiThemeConfig;
  build: ThemeTokenBuildResult;
  mode: ResolvedThemeMode;
  tokens: NativeThemeTokens;
  rawTokens: Record<string, string>;
  breakpoints: ReturnType<typeof resolveThemeBreakpoints>;
  shadows: {
    sm: NativeShadowStyle;
    md: NativeShadowStyle;
    lg: NativeShadowStyle;
  };
};

const CSS_ONLY_TOKENS = new Set(["backdrop-filter"]);

export function parseTokenValue(value: string): string | number {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("var(") || trimmed.startsWith("calc(")) {
    return trimmed;
  }

  if (trimmed.endsWith("rem")) {
    const numeric = Number.parseFloat(trimmed.slice(0, -3));
    return Number.isFinite(numeric) ? numeric * 16 : trimmed;
  }

  if (trimmed.endsWith("px")) {
    const numeric = Number.parseFloat(trimmed.slice(0, -2));
    return Number.isFinite(numeric) ? numeric : trimmed;
  }

  if (trimmed.endsWith("ms")) {
    const numeric = Number.parseFloat(trimmed.slice(0, -2));
    return Number.isFinite(numeric) ? numeric : trimmed;
  }

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const numeric = Number.parseFloat(trimmed);
    return Number.isFinite(numeric) ? numeric : trimmed;
  }

  return trimmed;
}

export function convertTokensForNative(tokens: Record<string, string>): NativeThemeTokens {
  const converted: NativeThemeTokens = {};
  for (const [key, value] of Object.entries(tokens)) {
    if (!CSS_ONLY_TOKENS.has(key)) {
      converted[key] = parseTokenValue(value);
    }
  }
  return converted;
}

function tokenNumber(tokens: NativeThemeTokens, key: string, fallback: number): number {
  const value = tokens[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function tokenString(tokens: NativeThemeTokens, key: string, fallback: string): string {
  const value = tokens[key];
  return typeof value === "string" ? value : fallback;
}

function shadowFromCss(value: string | number | undefined, fallbackElevation: number): NativeShadowStyle {
  if (typeof value !== "string" || value === "none") {
    return {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0
    };
  }

  const numbers = [...value.matchAll(/-?\d*\.?\d+/g)].map((match) => Number(match[0]));
  const offsetY = numbers[1] ?? fallbackElevation;
  const blur = numbers[2] ?? fallbackElevation * 4;
  const alpha = numbers.at(-1);

  return {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: typeof alpha === "number" && alpha > 0 && alpha <= 1 ? alpha : 0.16,
    shadowRadius: Math.max(blur / 2, 0),
    elevation: fallbackElevation
  };
}

export function createNativeThemeFromBuild(
  build: ThemeTokenBuildResult,
  mode: ResolvedThemeMode = "light"
): NativeTheme {
  const rawTokens = {
    ...build.staticTokens,
    ...build.modes[mode].tokens
  };
  const tokens = convertTokensForNative(rawTokens);

  return {
    config: build.config,
    build,
    mode,
    rawTokens,
    tokens,
    breakpoints: build.breakpoints,
    shadows: {
      sm: shadowFromCss(tokens["shadow-sm"], 2),
      md: shadowFromCss(tokens["shadow-md"], 6),
      lg: shadowFromCss(tokens["shadow-lg"], 12)
    }
  };
}

export function createNativeTheme(config: TavoUiThemeConfig, mode: ResolvedThemeMode = "light"): NativeTheme {
  return createNativeThemeFromBuild(buildThemeTokens(config), mode);
}

export function getToken(theme: NativeTheme, key: string, fallback: string): string;
export function getToken(theme: NativeTheme, key: string, fallback: number): number;
export function getToken(theme: NativeTheme, key: string, fallback: string | number): string | number {
  const value = theme.tokens[key];
  return value ?? fallback;
}

export function getColor(theme: NativeTheme, key: string, fallback = "#000000"): string {
  return tokenString(theme.tokens, key, fallback);
}

export function getSpace(theme: NativeTheme, key: string, fallback = 0): number {
  return tokenNumber(theme.tokens, `space-${key}`, fallback);
}

export function getRadius(theme: NativeTheme, key: string, fallback = 0): number {
  return tokenNumber(theme.tokens, `radius-${key}`, fallback);
}

export function getSize(theme: NativeTheme, key: string, fallback = 40): number {
  return tokenNumber(theme.tokens, `size-${key}`, fallback);
}
