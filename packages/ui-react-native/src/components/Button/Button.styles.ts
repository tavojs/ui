import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import { getRadius, getSpace, type NativeTheme } from "../../theme/native.js";
import { controlHeight, disabledOpacity, spacing, toneColors } from "../style-utils.js";
import type { Size } from "../types.js";
import type { ButtonTone, ButtonVariant } from "../variant-types.js";

export const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  label: {
    fontWeight: "700"
  }
});

export function createButtonThemeStyles(
  theme: NativeTheme,
  size: Size,
  tone: ButtonTone,
  variant: ButtonVariant,
  disabled: boolean,
  pressed: boolean
): ViewStyle {
  const colors = toneColors(theme, tone, variant);

  return {
    minHeight: controlHeight(theme, size),
    paddingHorizontal: spacing(theme, size === "sm" ? "sm" : size === "lg" ? "lg" : "md"),
    borderRadius: getRadius(theme, "control", 10),
    borderWidth: variant === "outline" ? Number(theme.tokens["border-width"] ?? 1) : 0,
    borderColor: colors.borderColor,
    backgroundColor: colors.backgroundColor,
    gap: getSpace(theme, "2", 8),
    opacity: disabled ? disabledOpacity(theme) : pressed ? 0.86 : 1
  };
}

export function createButtonLabelThemeStyles(theme: NativeTheme, tone: ButtonTone, variant: ButtonVariant): TextStyle {
  return {
    color: buttonTextColor(theme, tone, variant)
  };
}

export function buttonTextColor(theme: NativeTheme, tone: ButtonTone, variant: ButtonVariant): string {
  return toneColors(theme, tone, variant).color;
}
