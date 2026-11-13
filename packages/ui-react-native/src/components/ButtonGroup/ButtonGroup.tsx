import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { useNativeTheme } from "../hooks.js";
import type { ButtonTone, ButtonVariant } from "../variant-types.js";
import { buttonGroupStyles, styles } from "./ButtonGroup.styles.js";

export type ButtonGroupProps = Omit<ViewProps, "style"> & {
  orientation?: "horizontal" | "vertical";
  fullWidth?: boolean;
  tone?: ButtonTone;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
};

export function ButtonGroup({
  children,
  orientation = "horizontal",
  fullWidth = false,
  style,
  ...props
}: ButtonGroupProps) {
  const theme = useNativeTheme();

  return (
    <View
      {...props}
      accessibilityRole={props.accessibilityRole ?? "none"}
      style={[styles.root, buttonGroupStyles(theme, orientation, fullWidth), style]}
    >
      {children}
    </View>
  );
}
