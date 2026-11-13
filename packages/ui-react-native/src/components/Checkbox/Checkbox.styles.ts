import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import { getRadius, getSpace, type NativeTheme } from "../../theme/native.js";
import { disabledOpacity, toneColors } from "../style-utils.js";
import type { Size, Tone } from "../types.js";

export const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center"
  },
  control: {
    alignItems: "center",
    justifyContent: "center"
  }
});

export function checkboxSize(size: Size): number {
  return size === "sm" ? 18 : size === "lg" ? 26 : 22;
}

export function checkboxRootStyles(theme: NativeTheme, disabled: boolean): ViewStyle {
  return {
    gap: getSpace(theme, "2", 8),
    opacity: disabled ? disabledOpacity(theme) : 1
  };
}

export function checkboxControlStyles(
  theme: NativeTheme,
  size: Size,
  tone: Extract<Tone, "primary" | "secondary" | "neutral">,
  checked: boolean,
  indeterminate: boolean
): ViewStyle {
  const amount = checkboxSize(size);
  const colors = toneColors(theme, tone, checked || indeterminate ? "solid" : "outline");

  return {
    width: amount,
    height: amount,
    borderRadius: getRadius(theme, "sm", 4),
    borderWidth: Number(theme.tokens["border-width-strong"] ?? 2),
    borderColor: colors.borderColor,
    backgroundColor: checked || indeterminate ? colors.backgroundColor : "transparent"
  };
}

export function checkboxMarkStyles(amount: number, color: string): TextStyle {
  return {
    color,
    fontSize: amount * 0.75,
    lineHeight: amount
  };
}
