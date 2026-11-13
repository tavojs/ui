import { StyleSheet, type ViewStyle } from "react-native";
import { getRadius, type NativeTheme } from "../../theme/native.js";

export const styles = StyleSheet.create({
  root: {
    minWidth: 0
  }
});

export function buttonGroupStyles(
  theme: NativeTheme,
  orientation: "horizontal" | "vertical",
  fullWidth: boolean
): ViewStyle {
  return {
    flexDirection: orientation === "vertical" ? "column" : "row",
    width: fullWidth ? "100%" : undefined,
    borderRadius: getRadius(theme, "md", 8)
  };
}
