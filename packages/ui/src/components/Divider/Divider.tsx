import type { Child } from "@tavojs/core";
import styles from "./Divider.module.scss";
import { cv, cx, resolveAs, sxClassName, type BaseProps, type PolymorphicProps } from "@/components/shared";
import { Text } from "@/components/Text";

export type DividerProps = BaseProps & PolymorphicProps & {
  orientation?: "horizontal" | "vertical";
  label?: Child;
};

export function Divider({ as, children, className = "", orientation = "horizontal", label, ...props }: DividerProps) {
  const Component = resolveAs(as, "div") as unknown as "div";
  const content = label ?? children;
  const hasContent = content !== undefined && content !== null && content !== false;

  return (
    <Component
      className={sxClassName(props, cx(styles.divider, cv(styles, "orientation", orientation, "horizontal"), hasContent && styles.withContent, className))}
      role="separator"
      aria-orientation={orientation}
      {...props}
    >
      {hasContent ? <Text as="span" variant="span" color="inherit" className={styles.label}>{content}</Text> : null}
    </Component>
  );
}
