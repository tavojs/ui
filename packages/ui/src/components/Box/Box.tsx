import styles from "./Box.module.scss";
import {
  cv,
  cx,
  responsiveClass,
  responsiveVars,
  resolveAs,
  styleObject,
  sxClassName,
  type BaseProps,
  type PolymorphicProps,
  type ResponsiveValue,
  type Sx,
  type Spacing,
} from "@/components/shared";

export type BoxProps = BaseProps &
  PolymorphicProps & {
    surface?:
      | "none"
      | "default"
      | "raised"
      | "subtle"
      | "neutral"
      | "primary"
      | "secondary";
    padding?: ResponsiveValue<Spacing | "none">;
    paddingInline?: ResponsiveValue<Spacing | "none">;
    maxWidth?: ResponsiveValue<"sm" | "md" | "lg" | "xl" | "full">;
    center?: boolean;
    fullWidth?: boolean;
    radius?: ResponsiveValue<"none" | "sm" | "md" | "lg" | "surface">;
    border?: boolean | "strong";
    shadow?: boolean;
    minHeight?: string;
    sx?: Sx;
  };

export function Box({
  as,
  children,
  className = "",
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
  sx,
  style,
  ...props
}: BoxProps) {
  const Tag = resolveAs(as, "div") as unknown as "div";
  const baseStyle = {
    ...styleObject(style),
    ...responsiveVars(
      padding,
      "--tui-box-padding",
      (value) => spacingValues[value]
    ),
    ...responsiveVars(
      paddingInline,
      "--tui-box-padding-inline",
      (value) => spacingValues[value]
    ),
    ...responsiveVars(
      maxWidth,
      "--tui-box-max-width",
      (value) => maxWidthValues[value]
    ),
    ...responsiveVars(
      radius,
      "--tui-box-radius",
      (value) => radiusValues[value]
    ),
  };
  const element = (
    <Tag
      className={sxClassName(
        props,
        cx(
          styles.box,
          cv(styles, "surface", surface, "none"),
          responsiveClass(styles, "padding", padding, "none"),
          paddingInline &&
            responsiveClass(styles, "padding-inline", paddingInline, "none"),
          maxWidth && responsiveClass(styles, "max-width", maxWidth, "full"),
          center && styles.center,
          fullWidth && styles.fullWidth,
          responsiveClass(styles, "radius", radius, "none"),
          border === true && styles.border,
          border === "strong" && styles["border-strong"],
          shadow && styles.shadow,
          className
        ),
        sx
      )}
      style={minHeight ? { ...baseStyle, minHeight } : baseStyle}
      {...props}
    >
      {children}
    </Tag>
  );
  return element;
}

const spacingValues: Record<Spacing | "none", string> = {
  none: "0",
  sm: "var(--tui-space-2)",
  md: "var(--tui-space-4)",
  lg: "var(--tui-space-6)",
};

const maxWidthValues: Record<"sm" | "md" | "lg" | "xl" | "full", string> = {
  sm: "48rem",
  md: "64rem",
  lg: "77.5rem",
  xl: "90rem",
  full: "none",
};

const radiusValues: Record<"none" | "sm" | "md" | "lg" | "surface", string> = {
  none: "0",
  sm: "var(--tui-radius-sm)",
  md: "var(--tui-radius-md)",
  lg: "var(--tui-radius-lg)",
  surface: "var(--tui-radius-surface, var(--tui-radius-lg))",
};
