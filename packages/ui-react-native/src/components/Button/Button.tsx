import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle
} from "react-native";
import { createAndroidRipple } from "../../theme/platform.js";
import { useNativeTheme } from "../hooks.js";
import { Text } from "../Text/index.js";
import type { Size } from "../types.js";
import type { ButtonTone, ButtonVariant } from "../variant-types.js";
import { buttonTextColor, createButtonLabelThemeStyles, createButtonThemeStyles, styles } from "./Button.styles.js";

export type ButtonProps = Omit<PressableProps, "style" | "children"> & {
  children?: ReactNode;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Button({
  children,
  variant = "solid",
  tone = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const theme = useNativeTheme();
  const isDisabled = disabled || loading;
  const color = buttonTextColor(theme, tone, variant);

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      android_ripple={props.android_ripple ?? createAndroidRipple(theme)}
      accessibilityRole={props.accessibilityRole ?? "button"}
      accessibilityState={{ disabled: isDisabled, busy: loading, ...props.accessibilityState }}
      style={({ pressed }) => [
        styles.root,
        createButtonThemeStyles(theme, size, tone, variant, isDisabled, pressed),
        style
      ]}
    >
      {loading ? <ActivityIndicator color={color} size="small" /> : null}
      {typeof children === "string" || typeof children === "number" ? (
        <Text variant="span" style={[styles.label, createButtonLabelThemeStyles(theme, tone, variant), textStyle]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
