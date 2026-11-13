import { StyleSheet, type ViewStyle } from "react-native";
import type { NativeTheme } from "../../theme/native.js";
import { alignValue, justifyValue, spacing } from "../style-utils.js";
import type { FlexAlign, FlexDirection, FlexJustify, Gap } from "../types.js";

export const styles = StyleSheet.create({
  root: {}
});

export function createFlexStyles(
  theme: NativeTheme,
  direction: FlexDirection,
  align: FlexAlign | undefined,
  justify: FlexJustify | undefined,
  gap: Gap | number,
  wrap: boolean
): ViewStyle {
  return {
    flexDirection: direction,
    alignItems: align ? alignValue(align) : undefined,
    justifyContent: justify ? justifyValue(justify) : undefined,
    gap: spacing(theme, gap),
    flexWrap: wrap ? "wrap" : "nowrap"
  };
}
