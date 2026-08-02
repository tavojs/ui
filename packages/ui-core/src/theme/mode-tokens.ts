import {
  generateColorRamp,
  generateNeutralRamp,
  hexToHsl,
  hslToHex,
  normalizeHex,
  readContrastColor
} from "@/theme/color";
import { DEFAULT_SEMANTIC } from "@/theme/defaults";
import type {
  ResolvedThemeMode,
  TavoUiThemeConfig,
  ThemeMethod,
  ThemeResolvedColorSet,
  ThemeSemanticConfig
} from "@/theme/types";

function semanticForMode(
  mode: ResolvedThemeMode,
  config: TavoUiThemeConfig
): Required<ThemeSemanticConfig> {
  const semantic = config.semantic;
  const modeSemantic = semantic?.[mode];

  return {
    success: normalizeHex(
      modeSemantic?.success ?? semantic?.success ?? DEFAULT_SEMANTIC[mode].success
    ),
    warning: normalizeHex(
      modeSemantic?.warning ?? semantic?.warning ?? DEFAULT_SEMANTIC[mode].warning
    ),
    danger: normalizeHex(modeSemantic?.danger ?? semantic?.danger ?? DEFAULT_SEMANTIC[mode].danger),
    info: normalizeHex(modeSemantic?.info ?? semantic?.info ?? DEFAULT_SEMANTIC[mode].info)
  };
}

function deriveSecondaryColor(primaryColor: string): string {
  const primary = hexToHsl(primaryColor);
  return hslToHex(primary.h + 30, primary.s, primary.l);
}

function resolveColorPair(source: { primary: string; secondary?: string }): {
  primary: string;
  secondary: string;
} {
  const primary = normalizeHex(source.primary);
  return {
    primary,
    secondary: normalizeHex(source.secondary ?? deriveSecondaryColor(primary))
  };
}

function rgba(color: string, alpha: number): string {
  const hex = normalizeHex(color);
  const red = Number.parseInt(hex.slice(1, 3), 16);
  const green = Number.parseInt(hex.slice(3, 5), 16);
  const blue = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function productAliasTokens(
  tokens: Record<string, string>,
  isDark: boolean
): Record<string, string> {
  const danger = tokens["color-danger"];
  const dangerSurface = danger.startsWith("#")
    ? rgba(danger, isDark ? 0.2 : 0.1)
    : `color-mix(in srgb, ${danger} ${isDark ? 20 : 10}%, transparent)`;

  return {
    "color-app-bg": tokens["color-bg"],
    "color-sidebar-bg": tokens["color-surface"],
    "color-sidebar-border": tokens["color-border"],
    "color-header-bg": tokens["color-surface-raised"],
    "color-header-border": tokens["color-border"],
    "color-panel-bg": tokens["color-surface"],
    "color-panel-border": tokens["color-border"],
    "color-danger-surface": dangerSurface,
    "color-danger-surface-text": danger,
    "color-selection-bg": tokens["color-primary-soft-bg"],
    "color-selection-text": tokens["color-primary-soft-text"],
    "color-focus-ring": tokens["color-focus"],
    "color-overlay-bg": isDark ? "rgba(0, 0, 0, 0.62)" : "rgba(15, 23, 42, 0.42)"
  };
}

function shadowAlpha(value: number, strength: number): string {
  return Math.min(value * strength, 0.8)
    .toFixed(3)
    .replace(/0+$/, "")
    .replace(/\.$/, "");
}

function shadowTokensForMethod(
  method: ThemeMethod,
  isDark: boolean,
  strength: number
): Record<string, string> {
  if (strength === 0) {
    return {
      "shadow-sm": "none",
      "shadow-md": "none",
      "shadow-lg": "none"
    };
  }

  const color = isDark ? "0, 0, 0" : method === "glass" ? "31, 41, 55" : "22, 32, 31";
  const density = method === "glass" ? 1.05 : 0.9;

  return {
    "shadow-sm": `0 1px 2px rgba(${color}, ${shadowAlpha(0.06 * density, strength)})`,
    "shadow-md": `0 8px 20px rgba(${color}, ${shadowAlpha(0.08 * density, strength)})`,
    "shadow-lg": `0 16px 36px rgba(${color}, ${shadowAlpha(0.1 * density, strength)})`
  };
}

function monochromeCanvas(isDark: boolean): Record<string, string> {
  return isDark
    ? {
        bg: "#000000",
        surface: "#050505",
        raised: "#0d0d0d",
        subtle: "#171717",
        border: "#2a2a2a",
        borderStrong: "#3f3f3f",
        text: "#ffffff",
        muted: "#c7c7c7",
        neutralHover: "#262626",
        overlay: "rgba(0, 0, 0, 0.72)"
      }
    : {
        bg: "#ffffff",
        surface: "#ffffff",
        raised: "#fafafa",
        subtle: "#f4f4f4",
        border: "#e5e5e5",
        borderStrong: "#c7c7c7",
        text: "#000000",
        muted: "#555555",
        neutralHover: "#e8e8e8",
        overlay: "rgba(0, 0, 0, 0.38)"
      };
}

function strictMonochromeTokens(
  tokens: Record<string, string>,
  isDark: boolean
): Record<string, string> {
  const canvas = monochromeCanvas(isDark);

  return {
    ...tokens,
    "color-bg": canvas.bg,
    "color-app-bg": canvas.bg,
    "color-surface": canvas.surface,
    "color-surface-raised": canvas.raised,
    "color-surface-subtle": canvas.subtle,
    "color-border": canvas.border,
    "color-border-strong": canvas.borderStrong,
    "color-text": canvas.text,
    "color-text-muted": canvas.muted,
    "color-heading": canvas.text,
    "color-neutral-bg": canvas.subtle,
    "color-neutral-bg-hover": canvas.neutralHover,
    "color-neutral-text": canvas.text,
    "color-sidebar-bg": canvas.surface,
    "color-sidebar-border": canvas.border,
    "color-header-bg": canvas.raised,
    "color-header-border": canvas.border,
    "color-panel-bg": canvas.surface,
    "color-panel-border": canvas.border,
    "color-overlay-bg": canvas.overlay
  };
}

const GLASS_STRUCTURAL_TOKENS = [
  "color-surface",
  "color-surface-raised",
  "color-surface-subtle",
  "color-border",
  "color-border-strong",
  "color-neutral-bg",
  "color-neutral-bg-hover",
  "color-sidebar-bg",
  "color-sidebar-border",
  "color-header-bg",
  "color-header-border",
  "color-panel-bg",
  "color-panel-border",
  "color-overlay-bg",
  "backdrop-filter"
] as const;

function strictGlassTokens(
  tokens: Record<string, string>,
  generatedTokens: Record<string, string>
): Record<string, string> {
  const glassTokens: Record<string, string> = {};
  for (const token of GLASS_STRUCTURAL_TOKENS) {
    if (generatedTokens[token]) {
      glassTokens[token] = generatedTokens[token];
    }
  }

  return {
    ...tokens,
    ...glassTokens
  };
}

function surfaceTokensForMethod(
  method: ThemeMethod,
  primaryColor: string,
  secondaryColor: string,
  primary: Record<number, string>,
  secondary: Record<number, string>,
  isDark: boolean,
  neutral: Record<number, string>,
  shadowStrength: number
): Record<string, string> {
  const shadows = shadowTokensForMethod(method, isDark, shadowStrength);

  if (method === "monochromatic") {
    const canvas = monochromeCanvas(isDark);
    const exactPrimary = normalizeHex(primaryColor);
    const exactSecondary = normalizeHex(secondaryColor);

    return {
      "color-bg": canvas.bg,
      "color-surface": canvas.surface,
      "color-surface-raised": canvas.raised,
      "color-surface-subtle": canvas.subtle,
      "color-border": canvas.border,
      "color-border-strong": canvas.borderStrong,
      "color-text": canvas.text,
      "color-text-muted": canvas.muted,
      "color-heading": canvas.text,
      "color-link": exactPrimary,
      "color-focus": exactPrimary,
      "color-primary-bg": exactPrimary,
      "color-primary-bg-hover": exactPrimary,
      "color-primary-text": readContrastColor(exactPrimary),
      "color-primary-soft-bg": canvas.subtle,
      "color-primary-soft-text": exactPrimary,
      "color-secondary-bg": exactSecondary,
      "color-secondary-bg-hover": exactSecondary,
      "color-secondary-text": readContrastColor(exactSecondary),
      "color-secondary-soft-bg": canvas.subtle,
      "color-secondary-soft-text": exactSecondary,
      "color-neutral-bg": canvas.subtle,
      "color-neutral-bg-hover": canvas.neutralHover,
      "color-neutral-text": canvas.text,
      ...shadows
    };
  }

  if (method === "glass") {
    const primaryAction = normalizeHex(primaryColor);
    const secondaryAction = normalizeHex(secondaryColor);

    return {
      "color-bg": isDark ? neutral[950] : neutral[50],
      "color-surface": isDark ? rgba(neutral[900], 0.58) : "rgba(255, 255, 255, 0.64)",
      "color-surface-raised": isDark ? rgba(neutral[800], 0.72) : "rgba(255, 255, 255, 0.78)",
      "color-surface-subtle": isDark ? rgba(primary[900], 0.34) : rgba(primary[100], 0.44),
      "color-border": isDark ? "rgba(255, 255, 255, 0.16)" : rgba(primary[700], 0.18),
      "color-border-strong": isDark ? "rgba(255, 255, 255, 0.28)" : rgba(primary[800], 0.28),
      "color-text": isDark ? neutral[50] : neutral[950],
      "color-text-muted": isDark ? neutral[300] : neutral[700],
      "color-heading": isDark ? primary[200] : primary[900],
      "color-link": isDark ? primary[300] : primary[700],
      "color-focus": isDark ? primary[300] : primary[500],
      "color-primary-bg": primaryAction,
      "color-primary-bg-hover": isDark ? primary[500] : primary[700],
      "color-primary-text": readContrastColor(primaryAction),
      "color-primary-soft-bg": rgba(primary[isDark ? 800 : 500], isDark ? 0.42 : 0.14),
      "color-primary-soft-text": isDark ? primary[200] : primary[700],
      "color-secondary-bg": secondaryAction,
      "color-secondary-bg-hover": isDark ? secondary[500] : secondary[700],
      "color-secondary-text": readContrastColor(secondaryAction),
      "color-secondary-soft-bg": rgba(secondary[isDark ? 800 : 500], isDark ? 0.42 : 0.14),
      "color-secondary-soft-text": isDark ? secondary[200] : secondary[700],
      "color-neutral-bg": isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.52)",
      "color-neutral-bg-hover": isDark ? "rgba(255, 255, 255, 0.16)" : "rgba(255, 255, 255, 0.72)",
      "color-neutral-text": isDark ? neutral[50] : neutral[900],
      "backdrop-filter": "blur(var(--tui-blur-surface, 22px)) saturate(1.35)",
      ...shadows
    };
  }

  const primaryAction = normalizeHex(primaryColor);
  const secondaryAction = normalizeHex(secondaryColor);

  return {
    "color-bg": isDark ? neutral[950] : neutral[50],
    "color-surface": isDark ? neutral[900] : neutral[100],
    "color-surface-raised": isDark ? neutral[800] : neutral[50],
    "color-surface-subtle": isDark ? neutral[800] : neutral[200],
    "color-border": isDark ? neutral[700] : neutral[300],
    "color-border-strong": isDark ? neutral[600] : neutral[400],
    "color-text": isDark ? neutral[50] : neutral[950],
    "color-text-muted": isDark ? neutral[300] : neutral[700],
    "color-heading": isDark ? primary[200] : primary[900],
    "color-link": isDark ? primary[300] : primary[700],
    "color-focus": isDark ? primary[300] : primary[500],
    "color-primary-bg": primaryAction,
    "color-primary-bg-hover": isDark ? primary[500] : primary[700],
    "color-primary-text": readContrastColor(primaryAction),
    "color-primary-soft-bg": isDark ? primary[900] : primary[100],
    "color-primary-soft-text": isDark ? primary[200] : primary[700],
    "color-secondary-bg": secondaryAction,
    "color-secondary-bg-hover": isDark ? secondary[500] : secondary[700],
    "color-secondary-text": readContrastColor(secondaryAction),
    "color-secondary-soft-bg": isDark ? secondary[900] : secondary[100],
    "color-secondary-soft-text": isDark ? secondary[200] : secondary[700],
    "color-neutral-bg": isDark ? neutral[800] : neutral[200],
    "color-neutral-bg-hover": isDark ? neutral[700] : neutral[300],
    "color-neutral-text": isDark ? neutral[50] : neutral[900],
    ...shadows
  };
}

export function deriveModeTokens(
  mode: ResolvedThemeMode,
  config: TavoUiThemeConfig
): ThemeResolvedColorSet {
  const method = config.color.method ?? "analogous";
  const fixShade = config.color.fixShade ?? true;
  const shadowStrength = config.scale?.shadow ?? 0.5;
  const source = resolveColorPair(
    mode === "light" ? config.color.light : { ...config.color.light, ...config.color.dark }
  );

  const primary = generateColorRamp(source.primary, method, fixShade);
  const secondary = generateColorRamp(source.secondary, method, fixShade);
  const neutral = generateNeutralRamp(source.primary, method);
  const semantic = semanticForMode(mode, config);

  const isDark = mode === "dark";
  const surfaceTokens = surfaceTokensForMethod(
    method,
    source.primary,
    source.secondary,
    primary,
    secondary,
    isDark,
    neutral,
    shadowStrength
  );

  const generatedBaseTokens = {
    ...surfaceTokens,
    "color-success": semantic.success,
    "color-warning": semantic.warning,
    "color-danger": semantic.danger,
    "color-info": semantic.info
  };
  const generatedTokens = {
    ...generatedBaseTokens,
    ...productAliasTokens(generatedBaseTokens, isDark)
  };
  const overrides = config.tokens?.[mode] ?? {};
  const overriddenBaseTokens = {
    ...generatedBaseTokens,
    ...overrides
  };
  const tokens = {
    ...overriddenBaseTokens,
    ...productAliasTokens(overriddenBaseTokens, isDark),
    ...overrides
  };
  const resolvedTokens =
    method === "monochromatic"
      ? strictMonochromeTokens(tokens, isDark)
      : method === "glass"
        ? strictGlassTokens(tokens, generatedTokens)
        : tokens;

  return {
    primary,
    secondary,
    neutral,
    semantic,
    tokens: resolvedTokens
  };
}
