import { StyleSheet, type ViewStyle } from "react-native";
import type { NativeTheme } from "../../theme/native.js";
import { spacing } from "../style-utils.js";
import type { Spacing } from "../types.js";

export const styles = StyleSheet.create({
  root: {}
});

export function createSpacerStyles(theme: NativeTheme, size: Spacing | number, direction: "row" | "column"): ViewStyle {
  const amount = spacing(theme, size);
  return direction === "row" ? { width: amount } : { height: amount };
}
