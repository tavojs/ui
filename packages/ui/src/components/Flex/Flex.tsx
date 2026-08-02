import styles from "./Flex.module.scss";
import { cx, flexAlignValues, flexGapValue, flexJustifyValues, isResponsiveValue, responsiveClass, responsiveVars, resolveAs, styleObject, sxClassName, type BaseProps, type Gap, type FlexAlign, type FlexDirection, type FlexJustify, type PolymorphicProps, type Sx, type ResponsiveValue } from "@/components/shared";

export type FlexProps = BaseProps & PolymorphicProps & {
  direction?: ResponsiveValue<FlexDirection>;
  align?: ResponsiveValue<FlexAlign>;
  justify?: ResponsiveValue<FlexJustify>;
  gap?: ResponsiveValue<Gap | number | string>;
  sx?: Sx;
};

export function Flex({
  as,
  children,
  className = "",
  direction = "row",
  align,
  justify,
  gap = "md",
  sx,
  style,
  ...props
}: FlexProps) {
  const Tag = resolveAs(as, "div") as unknown as "div";
  const baseStyle = {
    ...styleObject(style),
    ...responsiveVars(direction, "--tui-flex-direction", (value) => value),
    ...responsiveVars(align, "--tui-flex-align", (value) => flexAlignValues[value]),
    ...responsiveVars(justify, "--tui-flex-justify", (value) => flexJustifyValues[value]),
    ...responsiveVars(gap, "--tui-flex-gap", flexGapValue)
  };
  const staticGap = !isResponsiveValue(gap) ? flexGapValue(gap) : undefined;
  const needsInlineGap = !isResponsiveValue(gap) && !(typeof gap === "string" && ["none", "sm", "md", "lg"].includes(gap));

  const element = (
    <Tag
      className={sxClassName(props, cx(
        styles.flex,
        responsiveClass(styles, "direction", direction, "row"),
        !isResponsiveValue(align) && align && styles[`align-${align}`],
        !isResponsiveValue(justify) && justify && styles[`justify-${justify}`],
        typeof gap === "string" && responsiveClass(styles, "gap", gap, "md"),
        className
      ), sx)}
      style={needsInlineGap ? { ...baseStyle, gap: staticGap } : baseStyle}
      {...props}
    >
      {children}
    </Tag>
  );
  return element;
}
