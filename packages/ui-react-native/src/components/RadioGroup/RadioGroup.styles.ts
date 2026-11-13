import { StyleSheet, type ViewStyle } from "react-native";
import { getSpace, type NativeTheme } from "../../theme/native.js";

export const styles = StyleSheet.create({
  root: {
    minWidth: 0
  }
});

export function radioGroupStyles(theme: NativeTheme, orientation: "horizontal" | "vertical"): ViewStyle {
  return {
    flexDirection: orientation === "horizontal" ? "row" : "column",
    flexWrap: orientation === "horizontal" ? "wrap" : "nowrap",
    gap: getSpace(theme, orientation === "horizontal" ? "4" : "3", orientation === "horizontal" ? 16 : 12)
  };
}
