import styles from "./GridRuler.module.scss";
import { cx, responsiveClass, responsiveVars, styleObject, sxClassName, type BaseProps, type ResponsiveValue, type Spacing } from "@/components/shared";

export type GridRulerProps = BaseProps & {
  spacing?: ResponsiveValue<Spacing>;
};

export function GridRuler({ className = "", spacing = "md", style, ...props }: GridRulerProps) {
  return (
    <div
      className={sxClassName(props, cx(styles.ruler, responsiveClass(styles, "spacing", spacing, "md"), className))}
      style={{ ...styleObject(style), ...responsiveVars(spacing, "--tui-grid-ruler-gap", (value) => spacingValues[value]) }}
      {...props}
    >
      {Array.from({ length: 12 }, (_, index) => (
        <div key={index} className={styles.column} />
      ))}
    </div>
  );
}

const spacingValues: Record<Spacing, string> = {
  sm: "var(--tui-space-2)",
  md: "var(--tui-space-4)",
  lg: "var(--tui-space-6)"
};
