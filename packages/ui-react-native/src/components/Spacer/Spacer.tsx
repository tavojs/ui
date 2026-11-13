import { View } from "react-native";
import { useNativeTheme } from "../hooks.js";
import type { Spacing } from "../types.js";
import { createSpacerStyles, styles } from "./Spacer.styles.js";

export type SpacerProps = {
  size?: Spacing | number;
  direction?: "row" | "column";
};

export function Spacer({ size = "md", direction = "column" }: SpacerProps) {
  const theme = useNativeTheme();
  return <View style={[styles.root, createSpacerStyles(theme, size, direction)]} />;
}
