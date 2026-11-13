import { type ReactNode } from "react";
import { Switch as NativeSwitch, View, type StyleProp, type ViewStyle } from "react-native";
import { getColor } from "../../theme/native.js";
import { Text } from "../Text/index.js";
import { useNativeTheme } from "../hooks.js";
import type { Size, Tone } from "../types.js";
import { styles, switchRootStyles, switchTrackColors } from "./Switch.styles.js";

export type SwitchProps = {
  checked?: boolean;
  disabled?: boolean;
  size?: Size;
  tone?: Extract<Tone, "primary" | "secondary" | "neutral">;
  label?: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
  style?: StyleProp<ViewStyle>;
};

export function Switch({
  checked = false,
  disabled = false,
  tone = "primary",
  label,
  onCheckedChange,
  style
}: SwitchProps) {
  const theme = useNativeTheme();
  return (
    <View style={[styles.root, switchRootStyles(theme, disabled), style]}>
      <NativeSwitch
        value={checked}
        disabled={disabled}
        onValueChange={onCheckedChange}
        trackColor={switchTrackColors(theme, tone)}
        thumbColor={getColor(theme, "color-surface-raised", "#ffffff")}
      />
      {label ? <Text>{label}</Text> : null}
    </View>
  );
}
