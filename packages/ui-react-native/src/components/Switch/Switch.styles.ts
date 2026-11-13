import { StyleSheet, type ViewStyle } from "react-native";
import { getColor, getSpace, type NativeTheme } from "../../theme/native.js";
import { disabledOpacity } from "../style-utils.js";
import type { Tone } from "../types.js";

export const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center"
  }
});

export function switchRootStyles(theme: NativeTheme, disabled: boolean): ViewStyle {
  return {
    gap: getSpace(theme, "2", 8),
    opacity: disabled ? disabledOpacity(theme) : 1
  };
}

export function switchTrackColors(theme: NativeTheme, tone: Extract<Tone, "primary" | "secondary" | "neutral">) {
  return {
    false: getColor(theme, "color-neutral-bg", "#e5e7eb"),
    true: getColor(theme, `color-${tone}-bg`, getColor(theme, `color-${tone}`, "#2563eb"))
  };
}
