import { useMemo } from "react";
import {
  TextInput as NativeTextInput,
  type StyleProp,
  type TextInputProps as NativeTextInputProps,
  type TextStyle
} from "react-native";
import { getColor } from "../../theme/native.js";
import { useNativeTheme } from "../hooks.js";
import type { Size } from "../types.js";
import { createTextInputStyles, styles } from "./TextInput.styles.js";

export type TextInputProps = Omit<NativeTextInputProps, "style"> & {
  size?: Size;
  error?: boolean;
  style?: StyleProp<TextStyle>;
};

export function TextInput({ size = "md", error = false, style, ...props }: TextInputProps) {
  const theme = useNativeTheme();
  const themedStyle = useMemo(() => createTextInputStyles(theme, size, error), [theme, size, error]);

  return (
    <NativeTextInput
      {...props}
      placeholderTextColor={props.placeholderTextColor ?? getColor(theme, "color-text-muted", "#6b7280")}
      style={[styles.root, themedStyle, style]}
    />
  );
}
