import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { Toggle, type ToggleVariant } from "../Toggle/index.js";
import { useNativeTheme } from "../hooks.js";
import type { Size } from "../types.js";
import { styles, toggleGroupStyles } from "./ToggleGroup.styles.js";

export type ToggleGroupItem = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type ToggleGroupProps = Omit<ViewProps, "style"> & {
  name?: string;
  value?: string | string[];
  items: ToggleGroupItem[];
  type?: "single" | "multiple";
  size?: Size;
  variant?: ToggleVariant;
  onValueChange?: (value: string | string[]) => void;
  style?: StyleProp<ViewStyle>;
};

function isPressed(value: ToggleGroupProps["value"], itemValue: string): boolean {
  return Array.isArray(value) ? value.includes(itemValue) : value === itemValue;
}

function nextValue(
  current: ToggleGroupProps["value"],
  itemValue: string,
  type: "single" | "multiple"
): string | string[] {
  if (type === "single") {
    return itemValue;
  }

  const values = Array.isArray(current) ? current : [];
  return values.includes(itemValue) ? values.filter((value) => value !== itemValue) : [...values, itemValue];
}

export function ToggleGroup({
  value,
  items,
  type = "single",
  size = "md",
  variant = "default",
  onValueChange,
  style,
  ...props
}: ToggleGroupProps) {
  const theme = useNativeTheme();

  return (
    <View
      {...props}
      accessibilityRole={type === "single" ? "radiogroup" : "none"}
      style={[styles.root, toggleGroupStyles(theme), style]}
    >
      {items.map((item) => (
        <Toggle
          key={item.value}
          size={size}
          variant={variant}
          pressed={isPressed(value, item.value)}
          disabled={item.disabled}
          accessibilityRole={type === "single" ? "radio" : "checkbox"}
          onPress={() => onValueChange?.(nextValue(value, item.value, type))}
        >
          {item.label}
        </Toggle>
      ))}
    </View>
  );
}
