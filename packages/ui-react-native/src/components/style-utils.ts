import type { ViewStyle } from "react-native";
import { getColor, getRadius, getSize, getSpace, type NativeTheme } from "../theme/native.js";
import type { ButtonTone, ButtonVariant, TextVariant } from "./variant-types.js";
import type { FlexAlign, FlexJustify, Gap, Size, Spacing, SurfaceTone, Tone } from "./types.js";

export type ToneColorSet = {
  backgroundColor: string;
  borderColor: string;
  color: string;
};

export function spacing(theme: NativeTheme, value: Spacing | Gap | "none" | number): number {
  if (typeof value === "number") {
    return value;
  }
  if (value === "none") {
    return 0;
  }
  return getSpace(
    theme,
    value === "sm" ? "2" : value === "md" ? "4" : "6",
    value === "sm" ? 8 : value === "md" ? 16 : 24
  );
}

export function radius(theme: NativeTheme, value: "none" | "sm" | "md" | "lg" | "surface" | number): number {
  if (typeof value === "number") {
    return value;
  }
  if (value === "none") {
    return 0;
  }
  return getRadius(theme, value, value === "sm" ? 4 : value === "md" ? 8 : 12);
}

export function maxWidth(value: "sm" | "md" | "lg" | "xl" | "full" | number): number | undefined {
  if (typeof value === "number") {
    return value;
  }
  if (value === "full") {
    return undefined;
  }
  return {
    sm: 768,
    md: 1024,
    lg: 1240,
    xl: 1440
  }[value];
}

export function surfaceStyle(theme: NativeTheme, surface: "none" | SurfaceTone): ViewStyle {
  if (surface === "none") {
    return {};
  }
  if (surface === "raised") {
    return { backgroundColor: getColor(theme, "color-surface-raised", "#ffffff") };
  }
  if (surface === "subtle") {
    return { backgroundColor: getColor(theme, "color-surface-subtle", "#f3f4f6") };
  }
  if (surface === "neutral") {
    return { backgroundColor: getColor(theme, "color-neutral-bg", "#f3f4f6") };
  }
  if (surface === "primary" || surface === "secondary") {
    return { backgroundColor: getColor(theme, `color-${surface}-soft-bg`, "#eef2ff") };
  }
  return { backgroundColor: getColor(theme, "color-surface", "#ffffff") };
}

export function toneColors(
  theme: NativeTheme,
  tone: Tone | ButtonTone,
  variant: ButtonVariant | "soft" | "solid" | "outline" = "solid"
): ToneColorSet {
  const base = getColor(theme, `color-${tone}`, getColor(theme, `color-${tone}-bg`, "#111827"));
  const solidBg = getColor(theme, `color-${tone}-bg`, base);
  const solidText = getColor(theme, `color-${tone}-text`, "#ffffff");
  const softBg = getColor(theme, `color-${tone}-soft-bg`, getColor(theme, "color-neutral-bg", "#f3f4f6"));
  const softText = getColor(theme, `color-${tone}-soft-text`, base);

  if (variant === "solid") {
    return { backgroundColor: solidBg, borderColor: solidBg, color: solidText };
  }
  if (variant === "soft") {
    return { backgroundColor: softBg, borderColor: softBg, color: softText };
  }
  if (variant === "outline") {
    return { backgroundColor: "transparent", borderColor: base, color: softText };
  }
  return { backgroundColor: "transparent", borderColor: "transparent", color: softText };
}

export function textSize(theme: NativeTheme, variant: TextVariant) {
  const body = Number(theme.tokens["font-size-body"] ?? 16);
  const caption = Number(theme.tokens["font-size-caption"] ?? 13);
  const headingScale = theme.config.typography?.headingScale ?? 1.24;
  const sizes: Record<TextVariant, number> = {
    h1: body * headingScale * headingScale * headingScale,
    h2: body * headingScale * headingScale,
    h3: body * headingScale,
    h4: body * 1.12,
    h5: body * 1.05,
    h6: body,
    p: body,
    body,
    hint: caption,
    span: body
  };

  return {
    fontSize: sizes[variant],
    lineHeight: Math.round(sizes[variant] * 1.35),
    fontWeight: variant.startsWith("h") ? ("700" as const) : ("400" as const)
  };
}

export function alignValue(value: FlexAlign): ViewStyle["alignItems"] {
  return value === "start" ? "flex-start" : value === "end" ? "flex-end" : value;
}

export function justifyValue(value: FlexJustify): ViewStyle["justifyContent"] {
  return value === "start"
    ? "flex-start"
    : value === "end"
      ? "flex-end"
      : value === "between"
        ? "space-between"
        : value === "around"
          ? "space-around"
          : value;
}

export function controlHeight(theme: NativeTheme, size: Size): number {
  return getSize(theme, size, size === "sm" ? 32 : size === "lg" ? 48 : 40);
}

export function disabledOpacity(theme: NativeTheme): number {
  const value = theme.tokens["interaction-disabled-opacity"] ?? theme.tokens["opacity-disabled"];
  return typeof value === "number" && Number.isFinite(value) ? value : 0.58;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
