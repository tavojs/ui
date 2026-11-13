import { StyleSheet } from "react-native";
import { getColor, type NativeTheme } from "../../theme/native.js";
import { textSize } from "../style-utils.js";
import type { Tone } from "../types.js";
import type { TextColor, TextVariant } from "../variant-types.js";

export const styles = StyleSheet.create({
  root: {}
});

export function textColor(
  theme: NativeTheme,
  variant: TextVariant,
  color: TextColor | undefined,
  tone: Tone | "default",
  error: boolean
) {
  const resolvedColor = error
    ? "danger"
    : (color ??
      (tone !== "default" ? tone : variant.startsWith("h") ? "heading" : variant === "hint" ? "muted" : "auto"));

  return resolvedColor === "auto"
    ? getColor(theme, "color-text", "#111827")
    : resolvedColor === "heading"
      ? getColor(theme, "color-heading", "#111827")
      : resolvedColor === "muted"
        ? getColor(theme, "color-text-muted", "#6b7280")
        : resolvedColor === "inherit"
          ? undefined
          : getColor(theme, `color-${resolvedColor}`, getColor(theme, `color-${resolvedColor}-soft-text`, "#111827"));
}

export function createTextStyles(
  theme: NativeTheme,
  variant: TextVariant,
  color: TextColor | undefined,
  tone: Tone | "default",
  error: boolean
) {
  return [textSize(theme, variant), { color: textColor(theme, variant, color, tone, error) }];
}
