import { StyleSheet, type TextStyle } from "react-native";
import { getColor, type NativeTheme } from "../../theme/native.js";

export const styles = StyleSheet.create({
  root: {
    fontWeight: "400"
  }
});

export function formLabelStyles(theme: NativeTheme): TextStyle {
  return {
    color: getColor(theme, "color-text", "#111827"),
    fontSize: Number(theme.tokens["font-size-label"] ?? 14)
  };
}
