import styles from "./Resizable.module.scss";
import { cv, cx, isResponsiveValue, responsiveVars, styleObject, sxClassName, type BaseProps, type ResponsiveValue } from "@/components/shared";

export type ResizableProps = BaseProps & {
  direction?: "horizontal" | "vertical";
};

export type ResizablePanelProps = BaseProps & {
  defaultSize?: ResponsiveValue<string>;
};

function ResizableBase({ children, className = "", direction = "horizontal", ...props }: ResizableProps) {
  return <div className={sxClassName(props, cx(styles.root, cv(styles, "direction", direction, "horizontal"), className))} {...props}>{children}</div>;
}

export function ResizablePanel({ children, className = "", defaultSize, style, ...props }: ResizablePanelProps) {
  const staticSize = !isResponsiveValue(defaultSize) ? defaultSize : undefined;
  return (
    <div
      className={sxClassName(props, cx(styles.panel, className))}
      style={{
        ...styleObject(style),
        ...responsiveVars(defaultSize, "--tui-resizable-panel-basis", (value) => value),
        ...(staticSize ? { flexBasis: staticSize } : {})
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function ResizableHandle({ className = "", ...props }: BaseProps) {
  return <div className={sxClassName(props, cx(styles.handle, className))} role="separator" tabIndex={0} {...props} />;
}

export const ResizableRoot = ResizableBase;
export const Resizable = Object.assign(ResizableBase, {
  Root: ResizableRoot,
  Panel: ResizablePanel,
  Handle: ResizableHandle
});
