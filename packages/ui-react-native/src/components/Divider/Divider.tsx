import { View, type ViewProps } from "react-native";
import { useNativeTheme } from "../hooks.js";
import type { Tone } from "../types.js";
import { createDividerStyles, styles } from "./Divider.styles.js";

export type DividerProps = ViewProps & {
  tone?: Tone;
};

export function Divider({ tone = "neutral", style, ...props }: DividerProps) {
  const theme = useNativeTheme();
  return <View {...props} style={[styles.root, createDividerStyles(theme, tone), style]} />;
}
