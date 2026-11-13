import { StyleSheet, type TextStyle } from "react-native";
import { getColor, type NativeTheme } from "../../theme/native.js";

export const styles = StyleSheet.create({
  root: {}
});

export function iconStyles(theme: NativeTheme, size: number, color?: string): TextStyle {
  return {
    color: color ?? getColor(theme, "color-text", "#111827"),
    fontSize: size,
    lineHeight: size
  };
}
