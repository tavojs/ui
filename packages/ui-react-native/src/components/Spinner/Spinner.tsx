import { ActivityIndicator } from "react-native";
import { useNativeTheme } from "../hooks.js";
import type { Size, Tone } from "../types.js";
import { spinnerColor, spinnerSize } from "./Spinner.styles.js";

export type SpinnerProps = {
  size?: Size | "small" | "large";
  tone?: Tone;
};

export function Spinner({ size = "small", tone = "primary" }: SpinnerProps) {
  const theme = useNativeTheme();
  return <ActivityIndicator size={spinnerSize(size)} color={spinnerColor(theme, tone)} />;
}
