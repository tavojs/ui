import { type ReactNode } from "react";
import { Text as NativeText, type StyleProp, type TextProps as NativeTextProps, type TextStyle } from "react-native";
import { useNativeTheme } from "../hooks.js";
import { formLabelStyles, styles } from "./FormLabel.styles.js";

export type FormLabelProps = Omit<NativeTextProps, "style"> & {
  children?: ReactNode;
  style?: StyleProp<TextStyle>;
};

export function FormLabel({ children, style, ...props }: FormLabelProps) {
  const theme = useNativeTheme();

  return (
    <NativeText {...props} style={[styles.root, formLabelStyles(theme), style]}>
      {children}
    </NativeText>
  );
}
