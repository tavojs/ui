import { StyleSheet, type ViewStyle } from "react-native";
import { getColor, getRadius, getSpace, type NativeTheme } from "../../theme/native.js";

export const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center"
  }
});

export function toggleGroupStyles(theme: NativeTheme): ViewStyle {
  return {
    gap: 0,
    padding: getSpace(theme, "1", 4),
    borderWidth: Number(theme.tokens["border-width"] ?? 1),
    borderColor: getColor(theme, "color-border", "#e5e7eb"),
    borderRadius: getRadius(theme, "control", 10),
    backgroundColor: getColor(theme, "color-surface", "#ffffff")
  };
}
