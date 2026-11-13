import { StyleSheet, type ViewStyle } from "react-native";
import { getColor, getSpace, type NativeTheme } from "../../theme/native.js";
import type { Size, Tone } from "../types.js";

export const styles = StyleSheet.create({
  root: {},
  track: {
    overflow: "hidden"
  },
  bar: {
    height: "100%"
  }
});

export function progressRootStyles(theme: NativeTheme): ViewStyle {
  return {
    gap: getSpace(theme, "2", 8)
  };
}

export function progressHeight(size: Size): number {
  return size === "sm" ? 6 : size === "lg" ? 12 : 8;
}

export function progressTrackStyles(theme: NativeTheme, height: number): ViewStyle {
  return {
    height,
    borderRadius: height,
    backgroundColor: getColor(theme, "color-neutral-bg", "#e5e7eb")
  };
}

export function progressBarStyles(theme: NativeTheme, tone: Tone, percentage: number): ViewStyle {
  return {
    width: `${percentage * 100}%`,
    backgroundColor: getColor(theme, `color-${tone}-bg`, getColor(theme, `color-${tone}`, "#2563eb"))
  };
}
