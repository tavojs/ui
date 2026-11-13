import { type ReactNode } from "react";
import { View, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { Text } from "../Text/index.js";
import { useNativeTheme } from "../hooks.js";
import type { Size, Tone } from "../types.js";
import { badgeContainerStyles, badgeTextStyles, styles, type BadgeVariant } from "./Badge.styles.js";

export type BadgeProps = Omit<ViewProps, "style"> & {
  children?: ReactNode;
  tone?: Tone;
  size?: Exclude<Size, "lg">;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Badge({
  children,
  tone = "neutral",
  size = "md",
  variant = "soft",
  style,
  textStyle,
  ...props
}: BadgeProps) {
  const theme = useNativeTheme();
  return (
    <View {...props} style={[styles.root, badgeContainerStyles(theme, tone, size, variant), style]}>
      <Text variant="hint" style={[styles.label, badgeTextStyles(theme, tone, variant), textStyle]}>
        {children}
      </Text>
    </View>
  );
}
