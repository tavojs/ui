import styles from "./AppBar.module.scss";
import { cv, cx, flexLayoutVars, resolveAs, styleObject, sxClassName, type BaseProps, type FlexLayoutProps, type PolymorphicProps } from "@/components/shared";

export type AppBarProps = BaseProps & FlexLayoutProps & PolymorphicProps & {
  position?: "static" | "sticky" | "fixed" | "relative";
};

export function AppBar({
  as,
  children,
  className = "",
  position = "sticky",
  direction,
  align,
  justify,
  gap,
  sx,
  style,
  ...props
}: AppBarProps) {
  const Tag = resolveAs(as, "header") as unknown as "header";
  const element = (
    <Tag
      className={sxClassName(props, cx(styles.appBar, cv(styles, "position", position, "sticky"), className), sx)}
      style={{ ...styleObject(style), ...flexLayoutVars({ direction, align, justify, gap }) }}
      {...props}
    >
      {children}
    </Tag>
  );
  return element;
}
