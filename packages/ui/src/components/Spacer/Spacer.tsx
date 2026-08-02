import styles from "./Spacer.module.scss";
import { cv, cx, responsiveClass, responsiveVars, styleObject, sxClassName, type BaseProps, type ResponsiveValue } from "@/components/shared";

type SpacerSize = "xs" | "sm" | "md" | "lg" | "xl";

export type SpacerProps = BaseProps & {
  size?: ResponsiveValue<SpacerSize>;
  axis?: "block" | "inline";
};

export function Spacer({ size = "md", axis = "block", className = "", style, ...props }: SpacerProps) {
  return (
    <span
      className={sxClassName(props, cx(styles.spacer, responsiveClass(styles, "size", size, "md"), cv(styles, "axis", axis, "block"), className))}
      style={{ ...styleObject(style), ...responsiveVars(size, "--tui-spacer-size", (value) => sizeValues[value]) }}
      aria-hidden="true"
      {...props}
    />
  );
}

const sizeValues: Record<SpacerSize, string> = {
  xs: "var(--tui-space-1)",
  sm: "var(--tui-space-2)",
  md: "var(--tui-space-4)",
  lg: "var(--tui-space-6)",
  xl: "calc(var(--tui-space-6) * 1.5)"
};
