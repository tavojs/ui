import { StyleSheet, type ViewStyle } from "react-native";
import { type NativeTheme } from "../../theme/native.js";
import { checkboxControlStyles, checkboxRootStyles, checkboxSize } from "../Checkbox/Checkbox.styles.js";
import type { Size, Tone } from "../types.js";

export { checkboxRootStyles as radioRootStyles, checkboxSize as radioSize };

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

export function radioControlStyles(
  theme: NativeTheme,
  size: Size,
  tone: Extract<Tone, "primary" | "secondary" | "neutral">,
  checked: boolean
): ViewStyle {
  const amount = checkboxSize(size);
  return {
    ...checkboxControlStyles(theme, size, tone, checked, false),
    borderRadius: amount / 2,
    backgroundColor: "transparent"
  };
}

export function radioDotStyles(amount: number, color: string): ViewStyle {
  return {
    width: amount * 0.5,
    height: amount * 0.5,
    borderRadius: amount,
    backgroundColor: color
  };
}
