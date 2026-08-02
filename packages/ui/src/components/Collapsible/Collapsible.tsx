import styles from "./Collapsible.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";

export type CollapsibleProps = BaseProps & {
  open?: boolean;
};

export type CollapsibleTriggerProps = BaseProps;
export type CollapsibleContentProps = BaseProps;

function CollapsibleBase({ children, className = "", open = false, ...props }: CollapsibleProps) {
  return <details className={sxClassName(props, cx(styles.root, className))} open={open} {...props}>{children}</details>;
}

export function CollapsibleTrigger({ children, className = "", ...props }: CollapsibleTriggerProps) {
  return <summary className={sxClassName(props, cx(styles.trigger, className))} {...props}>{children}</summary>;
}

export function CollapsibleContent({ children, className = "", ...props }: CollapsibleContentProps) {
  return <div className={sxClassName(props, cx(styles.content, className))} {...props}>{children}</div>;
}

export const CollapsibleRoot = CollapsibleBase;
export const Collapsible = Object.assign(CollapsibleBase, {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent
});
