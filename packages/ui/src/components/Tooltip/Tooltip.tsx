import type { Child } from "@tavojs/core";
import styles from "./Tooltip.module.scss";
import { cv, cx, sxClassName, type BaseProps } from "@/components/shared";
import { Text } from "@/components/Text";

export type TooltipProps = BaseProps & {
  content: Child;
  side?: "top" | "right" | "bottom" | "left";
};

export function Tooltip({ children, className = "", content, side = "top", ...props }: TooltipProps) {
  return (
    <span className={sxClassName(props, cx(styles.tooltip, cv(styles, "side", side, "top"), className))} {...props}>
      {children}
      <Text as="span" variant="span" color="inherit" className={styles.content} role="tooltip">{content}</Text>
    </span>
  );
}
