import { Platform } from "react-native";
import { getColor, type NativeTheme } from "./native.js";

export type NativePlatformName = "ios" | "android" | "web" | "native";

export function getNativePlatform(): NativePlatformName {
  if (Platform.OS === "ios" || Platform.OS === "android" || Platform.OS === "web") {
    return Platform.OS;
  }
  return "native";
}

export function createAndroidRipple(theme: NativeTheme, foreground = false) {
  if (Platform.OS !== "android") {
    return undefined;
  }

  return {
    color: getColor(theme, "color-neutral-bg-hover", "rgba(0, 0, 0, 0.12)"),
    foreground
  };
}

export function platformShadow(theme: NativeTheme, level: "sm" | "md" | "lg" = "md") {
  if (Platform.OS === "android") {
    return { elevation: theme.shadows[level].elevation };
  }
  return theme.shadows[level];
}
