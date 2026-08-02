import styles from "./Page.module.scss";
import { cx, responsiveClass, responsiveVars, styleObject, sxClassName, type BaseProps, type ResponsiveValue } from "@/components/shared";

type PageSize = "sm" | "md" | "lg" | "xl" | "full";
type PagePadding = "none" | "sm" | "md" | "lg";

export type PageProps = BaseProps & {
  size?: ResponsiveValue<PageSize>;
  padding?: ResponsiveValue<PagePadding>;
};

export function Page({ size = "xl", padding = "lg", className = "", children, style, ...props }: PageProps) {
  const baseStyle = {
    ...styleObject(style),
    ...responsiveVars(size, "--tui-page-max-width", (value) => sizeValues[value]),
    ...responsiveVars(padding, "--tui-page-padding", (value) => paddingValues[value])
  };

  return (
    <main
      className={sxClassName(props, cx(
        styles.page,
        responsiveClass(styles, "size", size, "xl"),
        responsiveClass(styles, "padding", padding, "lg"),
        className
      ))}
      style={baseStyle}
      {...props}
    >
      {children}
    </main>
  );
}

const sizeValues: Record<PageSize, string> = {
  sm: "48rem",
  md: "64rem",
  lg: "78rem",
  xl: "92rem",
  full: "none"
};

const paddingValues: Record<PagePadding, string> = {
  none: "0",
  sm: "var(--tui-space-3)",
  md: "var(--tui-space-5)",
  lg: "var(--tui-space-6)"
};
