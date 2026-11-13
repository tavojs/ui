import { type ReactNode } from "react";
import {
  Pressable,
  Text as NativeText,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle
} from "react-native";
import { toneColors } from "../style-utils.js";
import { Text } from "../Text/index.js";
import { useNativeTheme } from "../hooks.js";
import type { Size, Tone } from "../types.js";
import {
  checkboxControlStyles,
  checkboxMarkStyles,
  checkboxRootStyles,
  checkboxSize,
  styles
} from "./Checkbox.styles.js";

export type CheckboxProps = Omit<PressableProps, "style" | "children" | "onPress"> & {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  size?: Size;
  tone?: Extract<Tone, "primary" | "secondary" | "neutral">;
  label?: ReactNode;
  onCheckedChange?: (checked: boolean, event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
};

export function Checkbox({
  checked = false,
  indeterminate = false,
  disabled = false,
  size = "md",
  tone = "primary",
  label,
  onCheckedChange,
  style,
  ...props
}: CheckboxProps) {
  const theme = useNativeTheme();
  const amount = checkboxSize(size);
  const colors = toneColors(theme, tone, checked || indeterminate ? "solid" : "outline");

  return (
    <Pressable
      {...props}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: indeterminate ? "mixed" : checked, disabled }}
      onPress={(event) => onCheckedChange?.(!checked, event)}
      style={[styles.root, checkboxRootStyles(theme, disabled), style]}
    >
      <View style={[styles.control, checkboxControlStyles(theme, size, tone, checked, indeterminate)]}>
        {checked || indeterminate ? (
          <NativeText style={checkboxMarkStyles(amount, colors.color)}>{indeterminate ? "-" : "✓"}</NativeText>
        ) : null}
      </View>
      {label ? <Text>{label}</Text> : null}
    </Pressable>
  );
}
