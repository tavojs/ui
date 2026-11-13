import { StyleSheet, type ViewStyle } from "react-native";
import { controlHeight } from "../style-utils.js";
import type { NativeTheme } from "../../theme/native.js";
import type { Size } from "../types.js";

export const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 0
  }
});

export function createIconButtonStyles(theme: NativeTheme, size: Size): ViewStyle {
  return {
    width: controlHeight(theme, size)
  };
}
