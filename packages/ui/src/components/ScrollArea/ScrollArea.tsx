import styles from "./ScrollArea.module.scss";
import { cv, cx, isResponsiveValue, responsiveVars, styleObject, sxClassName, type BaseProps, type ResponsiveValue } from "@/components/shared";

export type ScrollAreaProps = BaseProps & {
  orientation?: "vertical" | "horizontal" | "both";
  maxHeight?: ResponsiveValue<string>;
};

export function ScrollArea({ children, className = "", orientation = "vertical", maxHeight, style, ...props }: ScrollAreaProps) {
  const staticMaxHeight = !isResponsiveValue(maxHeight) ? maxHeight : undefined;
  return (
    <div
      className={sxClassName(props, cx(styles.root, cv(styles, "orientation", orientation, "vertical"), className))}
      style={{
        ...styleObject(style),
        ...responsiveVars(maxHeight, "--tui-scroll-area-max-height", (value) => value),
        ...(staticMaxHeight ? { maxHeight: staticMaxHeight } : {})
      }}
      {...props}
    >
      {children}
    </div>
  );
}
