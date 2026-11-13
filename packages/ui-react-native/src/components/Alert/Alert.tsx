import { type ReactNode } from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { Text } from "../Text/index.js";
import { useNativeTheme } from "../hooks.js";
import { alertStyles, alertTextStyles, styles, type AlertTone } from "./Alert.styles.js";

export type AlertProps = Omit<ViewProps, "style"> & {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Alert({ tone = "info", title, children, style, ...props }: AlertProps) {
  const theme = useNativeTheme();

  return (
    <View
      {...props}
      accessibilityRole={tone === "danger" ? "alert" : props.accessibilityRole}
      style={[styles.root, alertStyles(theme, tone), style]}
    >
      {title ? (
        <Text variant="h6" style={[styles.title, alertTextStyles(theme, tone)]}>
          {title}
        </Text>
      ) : null}
      {children ? <Text style={[styles.body, alertTextStyles(theme, tone)]}>{children}</Text> : null}
    </View>
  );
}
