import styles from "./SplitPane.module.scss";
import { cv, cx, responsiveClass, responsiveVars, styleObject, sxClassName, type BaseProps, type Gap, type ResponsiveValue } from "@/components/shared";

type SplitPaneRatio = "third" | "half" | "golden";

export type SplitPaneProps = BaseProps & {
  aside?: BaseProps["children"];
  side?: "left" | "right";
  ratio?: ResponsiveValue<SplitPaneRatio>;
  gap?: ResponsiveValue<Gap>;
};

export function SplitPane({ aside, side = "left", ratio = "third", gap = "md", className = "", children, style, ...props }: SplitPaneProps) {
  const baseStyle = {
    ...styleObject(style),
    ...responsiveVars(ratio, "--tui-split-columns", (value) => ratioValues[value]),
    ...responsiveVars(gap, "--tui-split-gap", (value) => gapValues[value])
  };
  return (
    <div
      className={sxClassName(props, cx(styles.split, cv(styles, "side", side, "left"), responsiveClass(styles, "ratio", ratio, "third"), responsiveClass(styles, "gap", gap, "md"), className))}
      style={baseStyle}
      {...props}
    >
      {aside && <aside className={styles.aside}>{aside}</aside>}
      <div className={styles.main}>{children}</div>
    </div>
  );
}

const ratioValues: Record<SplitPaneRatio, string> = {
  third: "minmax(12rem, 0.36fr) minmax(0, 1fr)",
  half: "minmax(0, 1fr) minmax(0, 1fr)",
  golden: "minmax(14rem, 0.62fr) minmax(0, 1fr)"
};

const gapValues: Record<Gap, string> = {
  none: "0",
  sm: "var(--tui-space-3)",
  md: "var(--tui-space-5)",
  lg: "var(--tui-space-6)"
};
