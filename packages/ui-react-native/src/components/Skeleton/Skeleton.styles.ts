import { StyleSheet, type DimensionValue, type ViewStyle } from "react-native";
import { getColor, type NativeTheme } from "../../theme/native.js";

export const styles = StyleSheet.create({
  root: {
    opacity: 0.72
  }
});

export function createSkeletonStyles(
  theme: NativeTheme,
  width: DimensionValue,
  height: number,
  radius: number
): ViewStyle {
  return {
    width,
    height,
    borderRadius: radius,
    backgroundColor: getColor(theme, "color-neutral-bg", "#e5e7eb")
  };
}
