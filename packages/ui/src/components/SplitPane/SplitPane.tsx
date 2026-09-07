import styles from "./SplitPane.module.scss";
import { cv, cx, responsiveClass, responsiveVars, styleObject, sxClassName, type BaseProps, type Gap, type ResponsiveValue } from "@/components/shared";

type SplitPaneRatio = "third" | "half" | "golden";

export type SplitPaneProps = BaseProps & {
  aside?: BaseProps["children"];
  side?: "left" | "right";
  ratio?: ResponsiveValue<SplitPaneRatio>;
  gap?: ResponsiveValue<Gap>;
};

export type SplitPaneRegionProps = BaseProps;

function isExplicitRegion(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    ((value as { type: unknown }).type === SplitPaneAside ||
      (value as { type: unknown }).type === SplitPaneMain)
  );
}

function SplitPaneBase({ aside, side = "left", ratio = "third", gap = "md", className = "", children, style, ...props }: SplitPaneProps) {
  const baseStyle = {
    ...styleObject(style),
    ...responsiveVars(ratio, "--tui-split-columns", (value) => ratioValues[value]),
    ...responsiveVars(gap, "--tui-split-gap", (value) => gapValues[value])
  };
  const explicitRegions = (Array.isArray(children) ? children : [children]).some(
    isExplicitRegion
  );
  return (
    <div
      className={sxClassName(props, cx(styles.split, cv(styles, "side", side, "left"), responsiveClass(styles, "ratio", ratio, "third"), responsiveClass(styles, "gap", gap, "md"), className))}
      style={baseStyle}
      {...props}
    >
      {aside !== undefined ? <aside className={styles.aside}>{aside}</aside> : null}
      {aside === undefined && explicitRegions ? (
        children
      ) : (
        <div className={styles.main}>{children}</div>
      )}
    </div>
  );
}

export function SplitPaneAside({ children, className = "", ...props }: SplitPaneRegionProps) {
  return <aside className={sxClassName(props, cx(styles.aside, className))} {...props}>{children}</aside>;
}

export function SplitPaneMain({ children, className = "", ...props }: SplitPaneRegionProps) {
  return <div className={sxClassName(props, cx(styles.main, className))} {...props}>{children}</div>;
}

export const SplitPaneRoot = SplitPaneBase;
export const SplitPane = Object.assign(SplitPaneBase, {
  Root: SplitPaneRoot,
  Aside: SplitPaneAside,
  Main: SplitPaneMain
});

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
