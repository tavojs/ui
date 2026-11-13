import { StyleSheet, type ViewStyle } from "react-native";
import { getColor, type NativeTheme } from "../../theme/native.js";
import type { Tone } from "../types.js";

export const styles = StyleSheet.create({
  root: {}
});

export function createStatusDotStyles(theme: NativeTheme, tone: Tone, size: number): ViewStyle {
  return {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: getColor(theme, `color-${tone}`, "#22c55e")
  };
}
