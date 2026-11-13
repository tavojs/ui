import { Pressable, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { Text } from "../Text/index.js";
import { useNativeTheme } from "../hooks.js";
import type { Size } from "../types.js";
import { segmentedLabelStyles, segmentedOptionStyles, segmentedRootStyles, styles } from "./SegmentedControl.styles.js";

export type SegmentOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type SegmentedControlProps = Omit<ViewProps, "style"> & {
  name: string;
  value?: string;
  options: SegmentOption[];
  size?: Size;
  onValueChange?: (value: string) => void;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedControl({
  value,
  options,
  size = "md",
  onValueChange,
  style,
  ...props
}: SegmentedControlProps) {
  const theme = useNativeTheme();

  return (
    <View {...props} accessibilityRole="radiogroup" style={[styles.root, segmentedRootStyles(theme), style]}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            disabled={option.disabled}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled: option.disabled }}
            onPress={() => onValueChange?.(option.value)}
            style={[styles.option, segmentedOptionStyles(theme, size, selected, Boolean(option.disabled))]}
          >
            <Text variant="span" color="inherit" style={[styles.label, segmentedLabelStyles(theme, selected)]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
