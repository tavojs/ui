import { getColor, type NativeTheme } from "../../theme/native.js";
import type { Tone } from "../types.js";

export function spinnerColor(theme: NativeTheme, tone: Tone): string {
  return getColor(theme, `color-${tone}`, getColor(theme, `color-${tone}-bg`, "#2563eb"));
}

export function spinnerSize(size: "sm" | "md" | "lg" | "small" | "large"): "small" | "large" {
  return size === "lg" || size === "large" ? "large" : "small";
}
