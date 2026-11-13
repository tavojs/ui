import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import { getColor, getRadius, getSize, getSpace, type NativeTheme } from "../../theme/native.js";
import { disabledOpacity } from "../style-utils.js";
import type { Size } from "../types.js";

export type ToggleVariant = "default" | "outline" | "ghost";

export const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  label: {
    fontWeight: "400"
  }
});

export function toggleStyles(
  theme: NativeTheme,
  size: Size,
  variant: ToggleVariant,
  pressed: boolean,
  disabled: boolean
): ViewStyle {
  const height = getSize(theme, size, size === "sm" ? 32 : size === "lg" ? 48 : 40);
  return {
    minWidth: height,
    minHeight: height,
    paddingHorizontal: getSpace(theme, "3", 12),
    borderRadius: getRadius(theme, "control", 10),
    borderWidth: variant === "outline" ? Number(theme.tokens["border-width"] ?? 1) : 0,
    borderColor: variant === "outline" ? getColor(theme, "color-border", "#e5e7eb") : "transparent",
    backgroundColor: pressed ? getColor(theme, "color-primary-soft-bg", "#dbeafe") : "transparent",
    opacity: disabled ? disabledOpacity(theme) : 1
  };
}

export function toggleLabelStyles(theme: NativeTheme, pressed: boolean): TextStyle {
  return {
    color: pressed ? getColor(theme, "color-primary-soft-text", "#1d4ed8") : getColor(theme, "color-text", "#111827"),
    fontSize: Number(theme.tokens["font-size-body"] ?? 16)
  };
}
