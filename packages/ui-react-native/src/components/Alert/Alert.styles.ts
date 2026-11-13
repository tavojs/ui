import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import { getRadius, getSpace, type NativeTheme } from "../../theme/native.js";
import { toneColors } from "../style-utils.js";
import type { Tone } from "../types.js";

export type AlertTone = Extract<Tone, "success" | "warning" | "danger" | "info" | "neutral">;

export const styles = StyleSheet.create({
  root: {},
  title: {},
  body: {}
});

export function alertStyles(theme: NativeTheme, tone: AlertTone): ViewStyle {
  const colors = toneColors(theme, tone, "soft");
  return {
    padding: getSpace(theme, "4", 16),
    borderRadius: getRadius(theme, "surface", 12),
    borderWidth: Number(theme.tokens["border-width"] ?? 1),
    borderColor: colors.borderColor,
    backgroundColor: colors.backgroundColor,
    gap: getSpace(theme, "1", 6)
  };
}

export function alertTextColor(theme: NativeTheme, tone: AlertTone): string {
  return toneColors(theme, tone, "soft").color;
}

export function alertTextStyles(theme: NativeTheme, tone: AlertTone): TextStyle {
  return {
    color: alertTextColor(theme, tone)
  };
}
