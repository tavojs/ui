import styles from "./Sidebar.module.scss";
import { cx, responsiveClass, responsiveVars, styleObject, sxClassName, type BaseProps, type ResponsiveValue, type Spacing } from "@/components/shared";

export type SidebarProps = BaseProps & {
  padding?: ResponsiveValue<Spacing | "none">;
};

export function Sidebar({ padding = "md", className = "", children, style, ...props }: SidebarProps) {
  const baseStyle = {
    ...styleObject(style),
    ...responsiveVars(padding, "--tui-sidebar-padding", (value) => paddingValues[value])
  };
  return (
    <nav className={sxClassName(props, cx(styles.sidebar, responsiveClass(styles, "padding", padding, "md"), className))} style={baseStyle} {...props}>
      {children}
    </nav>
  );
}

const paddingValues: Record<Spacing | "none", string> = {
  none: "0",
  sm: "var(--tui-space-3)",
  md: "var(--tui-space-5)",
  lg: "var(--tui-space-6)"
};
