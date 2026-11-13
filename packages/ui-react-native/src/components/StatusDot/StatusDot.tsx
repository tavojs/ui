import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { useNativeTheme } from "../hooks.js";
import type { Tone } from "../types.js";
import { createStatusDotStyles, styles } from "./StatusDot.styles.js";

export type StatusDotProps = Omit<ViewProps, "style"> & {
  tone?: Tone;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function StatusDot({ tone = "success", size = 8, style, ...props }: StatusDotProps) {
  const theme = useNativeTheme();
  return <View {...props} style={[styles.root, createStatusDotStyles(theme, tone, size), style]} />;
}
