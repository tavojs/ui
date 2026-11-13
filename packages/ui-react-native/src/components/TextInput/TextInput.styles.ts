import { StyleSheet, type TextStyle } from "react-native";
import { getColor, getRadius, getSize, getSpace, type NativeTheme } from "../../theme/native.js";
import type { Size } from "../types.js";

export const styles = StyleSheet.create({
  root: {}
});

export function createTextInputStyles(theme: NativeTheme, size: Size, error: boolean): TextStyle {
  return {
    minHeight: getSize(theme, size, size === "sm" ? 32 : size === "lg" ? 48 : 40),
    paddingHorizontal: getSpace(theme, "3", 12),
    borderRadius: getRadius(theme, "control", 10),
    borderWidth: Number(theme.tokens["border-width"] ?? 1),
    borderColor: error ? getColor(theme, "color-danger", "#b42318") : getColor(theme, "color-border", "#e5e7eb"),
    backgroundColor: getColor(theme, "color-surface", "#ffffff"),
    color: getColor(theme, "color-text", "#111827"),
    fontSize: Number(theme.tokens["font-size-body"] ?? 16)
  };
}

export const textareaStyles = StyleSheet.create({
  root: {
    minHeight: 96,
    paddingTop: 12
  }
});
