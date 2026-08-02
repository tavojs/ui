import styles from "./Toolbar.module.scss";
import {
  cx,
  flexAlignValues,
  flexJustifyValues,
  responsiveClass,
  responsiveVars,
  resolveAs,
  styleObject,
  sxClassName,
  type BaseProps,
  type Gap,
  type PolymorphicProps,
  type ResponsiveValue,
} from "@/components/shared";
import { Text } from "@/components/Text";

export type ToolbarProps = BaseProps &
  PolymorphicProps & {
    align?: ResponsiveValue<"start" | "center" | "end" | "stretch">;
    justify?: ResponsiveValue<"start" | "center" | "end" | "between">;
    gap?: ResponsiveValue<Gap>;
    wrap?: boolean;
    title?: BaseProps["children"];
    filters?: BaseProps["children"];
    actions?: BaseProps["children"];
  };

export function Toolbar({
  as,
  children,
  className = "",
  align = "center",
  justify = "between",
  gap = "md",
  wrap = true,
  title,
  filters,
  actions,
  style,
  ...props
}: ToolbarProps) {
  const Tag = resolveAs(as, "div") as unknown as "div";
  const baseStyle = {
    ...styleObject(style),
    ...responsiveVars(align, "--tui-toolbar-align", (value) => flexAlignValues[value]),
    ...responsiveVars(justify, "--tui-toolbar-justify", (value) => flexJustifyValues[value]),
    ...responsiveVars(gap, "--tui-toolbar-gap", (value) => gapValues[value])
  };
  return (
    <Tag
      className={sxClassName(
        props,
        cx(
          styles.toolbar,
          responsiveClass(styles, "align", align, "center"),
          responsiveClass(styles, "justify", justify, "between"),
          responsiveClass(styles, "gap", gap, "md"),
          wrap && styles.wrap,
          className
        )
      )}
      style={baseStyle}
      {...props}
    >
      <div className={styles.main}>
        {title ? (
          <Text as="h2" variant="h3" color="heading" className={styles.title}>
            {title}
          </Text>
        ) : null}
        {children}
      </div>
      {filters ? <div className={styles.group}>{filters}</div> : null}
      {actions ? <div className={styles.group}>{actions}</div> : null}
    </Tag>
  );
}

const gapValues: Record<Gap, string> = {
  none: "0",
  sm: "var(--tui-space-2)",
  md: "var(--tui-space-4)",
  lg: "var(--tui-space-6)"
};
