import { View, type DimensionValue, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { useNativeTheme } from "../hooks.js";
import { createSkeletonStyles, styles } from "./Skeleton.styles.js";

export type SkeletonProps = Omit<ViewProps, "style"> & {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({ width = "100%", height = 16, radius = 8, style, ...props }: SkeletonProps) {
  const theme = useNativeTheme();
  return (
    <View
      {...props}
      accessibilityRole="progressbar"
      style={[styles.root, createSkeletonStyles(theme, width, height, radius), style]}
    />
  );
}
