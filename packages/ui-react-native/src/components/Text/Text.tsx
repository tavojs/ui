import { Text as NativeText, type StyleProp, type TextProps as NativeTextProps, type TextStyle } from "react-native";
import { useNativeTheme } from "../hooks.js";
import type { Tone } from "../types.js";
import type { TextColor, TextVariant } from "../variant-types.js";
import { createTextStyles, styles } from "./Text.styles.js";

export type TextProps = Omit<NativeTextProps, "style"> & {
  variant?: TextVariant;
  color?: TextColor;
  tone?: Tone | "default";
  error?: boolean;
  style?: StyleProp<TextStyle>;
};

export function Text({
  children,
  variant = "body",
  color,
  tone = "default",
  error = false,
  style,
  ...props
}: TextProps) {
  const theme = useNativeTheme();
  return (
    <NativeText {...props} style={[styles.root, ...createTextStyles(theme, variant, color, tone, error), style]}>
      {children}
    </NativeText>
  );
}
