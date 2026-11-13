import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import { getRadius, getSpace, type NativeTheme } from "../../theme/native.js";
import { toneColors } from "../style-utils.js";
import type { Size, Tone } from "../types.js";

export type BadgeVariant = "soft" | "solid" | "outline";

export const styles = StyleSheet.create({
  root: {
    alignSelf: "flex-start"
  },
  label: {
    fontWeight: "700"
  }
});

export function badgeContainerStyles(
  theme: NativeTheme,
  tone: Tone,
  size: Exclude<Size, "lg">,
  variant: BadgeVariant
): ViewStyle {
  const colors = toneColors(theme, tone, variant);

  return {
    paddingHorizontal: getSpace(theme, size === "sm" ? "1" : "2", size === "sm" ? 6 : 8),
    paddingVertical: size === "sm" ? 2 : 4,
    borderRadius: getRadius(theme, "control", 999),
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    borderWidth: variant === "outline" ? Number(theme.tokens["border-width"] ?? 1) : 0
  };
}

export function badgeTextStyles(theme: NativeTheme, tone: Tone, variant: BadgeVariant): TextStyle {
  return {
    color: toneColors(theme, tone, variant).color
  };
}
