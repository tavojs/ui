import styles from "./Grid.module.scss";
import { cx, isResponsiveValue, responsiveClass, responsiveVars, styleObject, sxClassName, type BaseProps, type ResponsiveValue, type Sx, type Spacing } from "@/components/shared";

export type GridProps = BaseProps & {
  columns?: ResponsiveValue<number>;
  minItemWidth?: ResponsiveValue<string>;
  spacing?: ResponsiveValue<Spacing>;
  align?: ResponsiveValue<"start" | "center" | "end" | "stretch">;
  sx?: Sx;
};

export function Grid({
  children,
  className = "",
  columns = 12,
  minItemWidth,
  spacing = "md",
  align = "stretch",
  sx,
  style,
  ...props
}: GridProps) {
  const templateColumns = !isResponsiveValue(minItemWidth) && minItemWidth
    ? autoFitColumns(minItemWidth)
    : !isResponsiveValue(columns)
      ? fixedColumns(columns)
      : undefined;
  const baseStyle = {
    ...styleObject(style),
    ...responsiveVars(columns, "--tui-grid-columns", fixedColumns),
    ...responsiveVars(minItemWidth, "--tui-grid-columns", autoFitColumns),
    ...responsiveVars(spacing, "--tui-grid-gap", (value) => spacingValues[value])
  };

  const element = (
    <div
      className={sxClassName(props, cx(
        styles.grid,
        responsiveClass(styles, "spacing", spacing, "md"),
        responsiveClass(styles, "align", align, "stretch"),
        className
      ), sx)}
      style={{ ...baseStyle, gridTemplateColumns: templateColumns }}
      {...props}
    >
      {children}
    </div>
  );
  return element;
}

const spacingValues: Record<Spacing, string> = {
  sm: "var(--tui-space-2)",
  md: "var(--tui-space-4)",
  lg: "var(--tui-space-6)"
};

function fixedColumns(columns: number): string {
  return `repeat(${columns}, minmax(0, 1fr))`;
}

function autoFitColumns(minItemWidth: string): string {
  return `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`;
}
