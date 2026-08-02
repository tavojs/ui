import { buildThemeTokens } from "@tavojs/ui-core";
import type { TavoUiThemeConfig, ThemeResolvedColorSet } from "@/theme/types";

export type TavoUiTokenGroup =
  | "color"
  | "sizing"
  | "spacing"
  | "radius"
  | "border"
  | "focus"
  | "motion"
  | "opacity"
  | "interaction"
  | "effects"
  | "breakpoint"
  | "typography"
  | "custom";

export type TavoUiTokenMetadata = {
  name: string;
  cssVariable: `--tui-${string}`;
  group: TavoUiTokenGroup;
};

const CATALOG_CONFIG: TavoUiThemeConfig = {
  color: {
    light: { primary: "#116a67", secondary: "#d86c3d" },
    method: "glass"
  }
};

export function getTavoUiTokenGroup(name: string): TavoUiTokenGroup {
  if (
    name.startsWith("color-") ||
    name.startsWith("primary-") ||
    name.startsWith("secondary-") ||
    name.startsWith("neutral-")
  ) return "color";
  if (name.startsWith("size-")) return "sizing";
  if (name.startsWith("space-")) return "spacing";
  if (name.startsWith("radius-")) return "radius";
  if (name.startsWith("border-")) return "border";
  if (name.startsWith("focus-")) return "focus";
  if (name.startsWith("motion-")) return "motion";
  if (name.startsWith("opacity-")) return "opacity";
  if (name.startsWith("interaction-")) return "interaction";
  if (
    name.startsWith("shadow-") ||
    name.startsWith("blur-") ||
    name.startsWith("glass-") ||
    name === "backdrop-filter"
  ) return "effects";
  if (name.startsWith("breakpoint-")) return "breakpoint";
  if (name.startsWith("font-")) return "typography";
  return "custom";
}

function rampNames(mode: ThemeResolvedColorSet): string[] {
  return (["primary", "secondary", "neutral"] as const).flatMap((ramp) =>
    Object.keys(mode[ramp]).map((shade) => `${ramp}-${shade}`)
  );
}

export function getTavoUiTokenMetadata(
  config: TavoUiThemeConfig = CATALOG_CONFIG
): TavoUiTokenMetadata[] {
  const result = buildThemeTokens(config);
  const names = new Set([
    ...Object.keys(result.staticTokens),
    ...rampNames(result.modes.light),
    ...rampNames(result.modes.dark),
    ...Object.keys(result.modes.light.tokens),
    ...Object.keys(result.modes.dark.tokens)
  ]);

  return [...names]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({
      name,
      cssVariable: `--tui-${name}`,
      group: getTavoUiTokenGroup(name)
    }));
}

/** Complete built-in Tavo UI CSS variable catalog. */
export const tavoUiTokenMetadata = Object.freeze(getTavoUiTokenMetadata());

/** Complete built-in Tavo UI CSS variable names. */
export const tavoUiTokenNames = Object.freeze(
  tavoUiTokenMetadata.map((token) => token.cssVariable)
);
