import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { Radio } from "../Radio/index.js";
import { useNativeTheme } from "../hooks.js";
import type { Size, Tone } from "../types.js";
import { radioGroupStyles, styles } from "./RadioGroup.styles.js";

export type RadioGroupItem = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type RadioGroupProps = Omit<ViewProps, "style"> & {
  name: string;
  value?: string;
  items?: RadioGroupItem[];
  orientation?: "horizontal" | "vertical";
  size?: Size;
  tone?: Extract<Tone, "primary" | "secondary" | "neutral">;
  onValueChange?: (value: string) => void;
  style?: StyleProp<ViewStyle>;
};

export function RadioGroup({
  children,
  value,
  items,
  orientation = "vertical",
  size = "md",
  tone = "primary",
  onValueChange,
  style,
  ...props
}: RadioGroupProps) {
  const theme = useNativeTheme();

  return (
    <View {...props} accessibilityRole="radiogroup" style={[styles.root, radioGroupStyles(theme, orientation), style]}>
      {items
        ? items.map((item) => (
            <Radio
              key={item.value}
              label={item.label}
              checked={value === item.value}
              disabled={item.disabled}
              size={size}
              tone={tone}
              onCheckedChange={() => onValueChange?.(item.value)}
            />
          ))
        : children}
    </View>
  );
}
