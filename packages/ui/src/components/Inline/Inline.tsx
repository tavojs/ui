import styles from "./Inline.module.scss";
import { cx, responsiveClass, responsiveVars, resolveAs, styleObject, sxClassName, type BaseProps, type Gap, type PolymorphicProps, type Sx, type ResponsiveValue } from "@/components/shared";

export type InlineProps = BaseProps & PolymorphicProps & {
  gap?: ResponsiveValue<Gap>;
  sx?: Sx;
};

const gapValues: Record<Gap, string> = {
  none: "0",
  sm: "var(--tui-space-2)",
  md: "var(--tui-space-4)",
  lg: "var(--tui-space-6)"
};

export function Inline({ as, children, className = "", gap = "md", sx, style, ...props }: InlineProps) {
  const Component = resolveAs(as, "div") as unknown as "div";
  const vars = responsiveVars(gap, "--tui-inline-gap", (value) => gapValues[value]);
  const element = (
    <Component
      className={sxClassName(props, cx(styles.inline, responsiveClass(styles, "gap", gap, "md"), className), sx)}
      style={{ ...styleObject(style), ...vars }}
      {...props}
    >
      {children}
    </Component>
  );
  return element;
}
