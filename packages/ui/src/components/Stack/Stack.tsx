import styles from "./Stack.module.scss";
import { cx, responsiveClass, responsiveVars, resolveAs, styleObject, sxClassName, type BaseProps, type Gap, type PolymorphicProps, type Sx, type ResponsiveValue } from "@/components/shared";

export type StackProps = BaseProps & PolymorphicProps & {
  gap?: ResponsiveValue<Gap>;
  sx?: Sx;
};

const gapValues: Record<Gap, string> = {
  none: "0",
  sm: "var(--tui-space-2)",
  md: "var(--tui-space-4)",
  lg: "var(--tui-space-6)"
};

export function Stack({ as, children, className = "", gap = "md", sx, style, ...props }: StackProps) {
  const Component = resolveAs(as, "div") as unknown as "div";
  const vars = responsiveVars(gap, "--tui-stack-gap", (value) => gapValues[value]);
  const baseStyle = { ...styleObject(style), ...vars };
  const nextElement = (
    <Component
      className={sxClassName(props, cx(styles.stack, responsiveClass(styles, "gap", gap, "md"), className), sx)}
      style={baseStyle}
      {...props}
    >
      {children}
    </Component>
  );
  return nextElement;
}
