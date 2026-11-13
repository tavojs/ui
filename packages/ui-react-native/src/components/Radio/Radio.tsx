import { type ReactNode } from "react";
import {
  Pressable,
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
import { radioControlStyles, radioDotStyles, radioRootStyles, radioSize, styles } from "./Radio.styles.js";

export type RadioProps = Omit<PressableProps, "style" | "children" | "onPress"> & {
  checked?: boolean;
  disabled?: boolean;
  size?: Size;
  tone?: Extract<Tone, "primary" | "secondary" | "neutral">;
  label?: ReactNode;
  onCheckedChange?: (checked: boolean, event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
};

export function Radio({
  checked = false,
  disabled = false,
  size = "md",
  tone = "primary",
  label,
  onCheckedChange,
  style,
  ...props
}: RadioProps) {
  const theme = useNativeTheme();
  const amount = radioSize(size);
  const colors = toneColors(theme, tone, checked ? "solid" : "outline");

  return (
    <Pressable
      {...props}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled }}
      onPress={(event) => onCheckedChange?.(!checked, event)}
      style={[styles.root, radioRootStyles(theme, disabled), style]}
    >
      <View style={[styles.control, radioControlStyles(theme, size, tone, checked)]}>
        {checked ? <View style={radioDotStyles(amount, colors.borderColor)} /> : null}
      </View>
      {label ? <Text>{label}</Text> : null}
    </Pressable>
  );
}
