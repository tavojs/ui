import { useMemo } from "react";
import { useWindowDimensions, View, type ViewProps } from "react-native";
import { resolveResponsiveValue, type ResponsiveValue } from "../../theme/responsive.js";
import { useNativeTheme } from "../hooks.js";
import type { NativeBaseProps, Spacing, SurfaceTone } from "../types.js";
import { createBoxStyles } from "./Box.styles.js";

export type BoxProps = Omit<ViewProps, "style"> &
  NativeBaseProps & {
    surface?: "none" | SurfaceTone;
    padding?: ResponsiveValue<Spacing | "none" | number>;
    paddingInline?: ResponsiveValue<Spacing | "none" | number>;
    maxWidth?: ResponsiveValue<"sm" | "md" | "lg" | "xl" | "full" | number>;
    center?: boolean;
    fullWidth?: boolean;
    radius?: ResponsiveValue<"none" | "sm" | "md" | "lg" | "surface" | number>;
    border?: boolean | "strong";
    shadow?: boolean;
    minHeight?: number;
  };

export function Box({
  children,
  surface = "none",
  padding = "none",
  paddingInline,
  maxWidth,
  center = false,
  fullWidth = false,
  radius = "none",
  border = false,
  shadow = false,
  minHeight,
  style,
  ...props
}: BoxProps) {
  const theme = useNativeTheme();
  const window = useWindowDimensions();
  const resolvedPadding = resolveResponsiveValue(padding, theme, window, "none");
  const resolvedStyles = useMemo(
    () =>
      createBoxStyles(theme, {
        surface,
        padding: resolvedPadding,
        paddingInline: resolveResponsiveValue(paddingInline, theme, window, resolvedPadding),
        radius: resolveResponsiveValue(radius, theme, window, "none"),
        maxWidth: maxWidth ? resolveResponsiveValue(maxWidth, theme, window, "full") : undefined,
        border,
        shadow,
        center,
        fullWidth,
        minHeight
      }),
    [
      theme,
      surface,
      resolvedPadding,
      paddingInline,
      window,
      radius,
      maxWidth,
      border,
      shadow,
      center,
      fullWidth,
      minHeight
    ]
  );

  return (
    <View {...props} style={[...resolvedStyles, style]}>
      {children}
    </View>
  );
}
