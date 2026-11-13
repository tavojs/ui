import { StyleSheet, type ViewStyle } from "react-native";
import type { NativeTheme } from "../../theme/native.js";
import { maxWidth, radius, spacing, surfaceStyle } from "../style-utils.js";
import type { Spacing, SurfaceTone } from "../types.js";

export const styles = StyleSheet.create({
  root: {}
});

export type BoxStyleOptions = {
  surface: "none" | SurfaceTone;
  padding: Spacing | "none" | number;
  paddingInline: Spacing | "none" | number;
  radius: "none" | "sm" | "md" | "lg" | "surface" | number;
  border: boolean | "strong";
  shadow: boolean;
  center: boolean;
  fullWidth: boolean;
  minHeight?: number;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full" | number;
};

export function createBoxStyles(theme: NativeTheme, options: BoxStyleOptions): ViewStyle[] {
  const borderWidth = options.border
    ? Number(theme.tokens[options.border === "strong" ? "border-width-strong" : "border-width"] ?? 1)
    : 0;

  return [
    styles.root,
    surfaceStyle(theme, options.surface),
    {
      padding: spacing(theme, options.padding),
      paddingHorizontal: spacing(theme, options.paddingInline),
      borderRadius: radius(theme, options.radius),
      borderWidth,
      borderColor: String(
        theme.tokens[options.border === "strong" ? "color-border-strong" : "color-border"] ?? "#e5e7eb"
      ),
      minHeight: options.minHeight,
      alignSelf: options.center ? "center" : undefined,
      width: options.fullWidth ? "100%" : undefined,
      maxWidth: options.maxWidth ? maxWidth(options.maxWidth) : undefined
    },
    options.shadow ? theme.shadows.md : {}
  ];
}
