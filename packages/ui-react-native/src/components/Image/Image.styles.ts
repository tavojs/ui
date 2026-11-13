import { StyleSheet, type ImageStyle } from "react-native";
import type { NativeTheme } from "../../theme/native.js";
import { radius } from "../style-utils.js";

export const styles = StyleSheet.create({
  root: {}
});

export function imageStyles(
  theme: NativeTheme,
  radiusValue: "none" | "sm" | "md" | "lg" | "surface" | number
): ImageStyle {
  return {
    borderRadius: radius(theme, radiusValue)
  };
}
