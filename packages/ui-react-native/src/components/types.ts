import type { ReactNode } from "react";
import type { AccessibilityRole, StyleProp, ViewStyle } from "react-native";

export type Tone = "primary" | "secondary" | "neutral" | "success" | "warning" | "danger" | "info";
export type Size = "sm" | "md" | "lg";
export type Spacing = "sm" | "md" | "lg";
export type Gap = "none" | Spacing;
export type FlexDirection = "row" | "column" | "row-reverse" | "column-reverse";
export type FlexAlign = "start" | "center" | "end" | "stretch";
export type FlexJustify = "start" | "center" | "end" | "between" | "around";
export type SurfaceTone = "default" | "raised" | "subtle" | "neutral" | "primary" | "secondary";

export type NativeBaseProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
};
