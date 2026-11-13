import { type ReactNode } from "react";
import { Pressable, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { createAndroidRipple } from "../../theme/platform.js";
import { Text } from "../Text/index.js";
import { useNativeTheme } from "../hooks.js";
import type { Size } from "../types.js";
import { styles, toggleLabelStyles, toggleStyles, type ToggleVariant } from "./Toggle.styles.js";

export type ToggleProps = Omit<PressableProps, "style" | "children"> & {
  children?: ReactNode;
  pressed?: boolean;
  size?: Size;
  variant?: ToggleVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Toggle({
  children,
  pressed = false,
  size = "md",
  variant = "default",
  disabled = false,
  style,
  textStyle,
  ...props
}: ToggleProps) {
  const theme = useNativeTheme();

  return (
    <Pressable
      {...props}
      disabled={disabled}
      android_ripple={props.android_ripple ?? createAndroidRipple(theme)}
      accessibilityRole={props.accessibilityRole ?? "button"}
      accessibilityState={{ selected: pressed, disabled, ...props.accessibilityState }}
      style={({ pressed: isPressed }) => [
        styles.root,
        toggleStyles(theme, size, variant, pressed, disabled),
        isPressed && !disabled ? { opacity: 0.86 } : undefined,
        style
      ]}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text variant="span" style={[styles.label, toggleLabelStyles(theme, pressed), textStyle]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
