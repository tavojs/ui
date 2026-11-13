import { type ReactNode } from "react";
import { Text as NativeText, type StyleProp, type TextStyle } from "react-native";
import { useNativeTheme } from "../hooks.js";
import { iconStyles, styles } from "./Icon.styles.js";

export type IconProps = {
  children?: ReactNode;
  color?: string;
  size?: number;
  style?: StyleProp<TextStyle>;
};

export function Icon({ children, color, size = 20, style }: IconProps) {
  const theme = useNativeTheme();
  return <NativeText style={[styles.root, iconStyles(theme, size, color), style]}>{children}</NativeText>;
}
