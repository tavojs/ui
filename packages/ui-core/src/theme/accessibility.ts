import { contrastRatio } from "@/theme/color";
import type { ResolvedThemeMode, TavoUiThemeConfig, ThemeResolvedColorSet } from "@/theme/types";

function contrastWarnings(
  mode: ResolvedThemeMode,
  tokens: Record<string, string>,
  minimum: number
): string[] {
  const pairs: Array<[string, string, string]> = [
    ["text on background", "color-text", "color-bg"],
    ["muted text on background", "color-text-muted", "color-bg"],
    ["heading on background", "color-heading", "color-bg"],
    ["primary text on primary background", "color-primary-text", "color-primary-bg"],
    ["secondary text on secondary background", "color-secondary-text", "color-secondary-bg"],
    ["neutral text on neutral background", "color-neutral-text", "color-neutral-bg"]
  ];

  return pairs.flatMap(([label, foreground, background]) => {
    const fg = tokens[foreground];
    const bg = tokens[background];
    if (!fg || !bg || !fg.startsWith("#") || !bg.startsWith("#")) {
      return [];
    }
    const ratio = contrastRatio(fg, bg);
    return ratio >= minimum
      ? []
      : [`${mode} ${label} contrast is ${ratio.toFixed(2)}:1, below ${minimum}:1.`];
  });
}

export function accessibilityWarnings(
  config: TavoUiThemeConfig,
  light: ThemeResolvedColorSet,
  dark: ThemeResolvedColorSet
): string[] {
  const level = config.accessibility?.contrast;
  if (!level) {
    return [];
  }
  const minimum = level === "AAA" ? 7 : 4.5;
  return [
    ...contrastWarnings("light", light.tokens, minimum),
    ...contrastWarnings("dark", dark.tokens, minimum)
  ];
}
