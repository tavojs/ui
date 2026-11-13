import { StyleSheet, type ViewStyle } from "react-native";
import { getSpace, type NativeTheme } from "../../theme/native.js";

export const styles = StyleSheet.create({
  root: {}
});

export function formControlStyles(theme: NativeTheme, fullWidth: boolean): ViewStyle {
  return {
    gap: getSpace(theme, "4", 16),
    width: fullWidth ? "100%" : undefined
  };
}
