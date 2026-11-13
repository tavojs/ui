import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import { getColor, getRadius, getSize, getSpace, type NativeTheme } from "../../theme/native.js";
import { disabledOpacity } from "../style-utils.js";
import type { Size } from "../types.js";

export const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center"
  },
  option: {
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    fontWeight: "400"
  }
});

export function segmentedRootStyles(theme: NativeTheme): ViewStyle {
  return {
    padding: Number(theme.tokens["border-width"] ?? 1) + 2,
    borderWidth: Number(theme.tokens["border-width"] ?? 1),
    borderColor: getColor(theme, "color-border", "#e5e7eb"),
    borderRadius: getRadius(theme, "control", 10),
    backgroundColor: getColor(theme, "color-surface-subtle", "#f3f4f6")
  };
}

export function segmentedOptionStyles(theme: NativeTheme, size: Size, selected: boolean, disabled: boolean): ViewStyle {
  return {
    minHeight:
      getSize(theme, size, size === "sm" ? 32 : size === "lg" ? 48 : 40) -
      getSpace(theme, size === "sm" ? "1" : "2", 8),
    paddingHorizontal: getSpace(theme, "3", 12),
    borderRadius: Math.max(getRadius(theme, "control", 10) - 2, 0),
    backgroundColor: selected ? getColor(theme, "color-surface-raised", "#ffffff") : "transparent",
    opacity: disabled ? disabledOpacity(theme) : 1,
    ...(selected ? theme.shadows.sm : {})
  };
}

export function segmentedLabelStyles(theme: NativeTheme, selected: boolean): TextStyle {
  return {
    color: selected ? getColor(theme, "color-text", "#111827") : getColor(theme, "color-text-muted", "#6b7280")
  };
}
