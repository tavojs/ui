import { StyleSheet, type ViewStyle } from "react-native";
import { getColor, type NativeTheme } from "../../theme/native.js";
import type { Tone } from "../types.js";

export const styles = StyleSheet.create({
  root: {}
});

export function createDividerStyles(theme: NativeTheme, tone: Tone): ViewStyle {
  return {
    height: Number(theme.tokens["border-width"] ?? 1),
    backgroundColor:
      tone === "neutral" ? getColor(theme, "color-border", "#e5e7eb") : getColor(theme, `color-${tone}`, "#e5e7eb")
  };
}
