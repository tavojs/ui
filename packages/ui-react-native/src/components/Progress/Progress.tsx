import { useMemo } from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { clamp } from "../style-utils.js";
import { Inline } from "../Inline/index.js";
import { Text } from "../Text/index.js";
import { useNativeTheme } from "../hooks.js";
import type { Size, Tone } from "../types.js";
import {
  progressBarStyles,
  progressHeight,
  progressRootStyles,
  progressTrackStyles,
  styles
} from "./Progress.styles.js";

export type ProgressProps = Omit<ViewProps, "style"> & {
  value?: number;
  max?: number;
  tone?: Tone;
  size?: Size;
  label?: string;
  showValue?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Progress({
  value = 0,
  max = 100,
  tone = "primary",
  size = "md",
  label,
  showValue = false,
  style,
  accessibilityLabel,
  ...props
}: ProgressProps) {
  const theme = useNativeTheme();
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = clamp(Number.isFinite(value) ? value : 0, 0, safeMax);
  const percentage = safeValue / safeMax;
  const height = progressHeight(size);
  const rootStyle = useMemo(() => progressRootStyles(theme), [theme]);
  const trackStyle = useMemo(() => progressTrackStyles(theme, height), [theme, height]);
  const barStyle = useMemo(() => progressBarStyles(theme, tone, percentage), [theme, tone, percentage]);

  return (
    <View {...props} style={[styles.root, rootStyle, style]}>
      {(label || showValue) && (
        <Inline justify="between">
          {label ? <Text variant="span">{label}</Text> : <View />}
          {showValue ? <Text variant="span">{Math.round(percentage * 100)}%</Text> : null}
        </Inline>
      )}
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityValue={{ min: 0, max: safeMax, now: safeValue }}
        style={[styles.track, trackStyle]}
      >
        <View style={[styles.bar, barStyle]} />
      </View>
    </View>
  );
}
