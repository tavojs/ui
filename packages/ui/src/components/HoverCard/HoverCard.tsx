import styles from "./HoverCard.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";

export type HoverCardProps = BaseProps;
export type HoverCardTriggerProps = BaseProps;
export type HoverCardContentProps = BaseProps;

function HoverCardBase({ children, className = "", ...props }: HoverCardProps) {
  return <span className={sxClassName(props, cx(styles.root, className))} {...props}>{children}</span>;
}

export function HoverCardTrigger({ children, className = "", ...props }: HoverCardTriggerProps) {
  return <span className={sxClassName(props, cx(styles.trigger, className))} tabIndex={0} {...props}>{children}</span>;
}

export function HoverCardContent({ children, className = "", ...props }: HoverCardContentProps) {
  return <span className={sxClassName(props, cx(styles.content, className))} role="tooltip" {...props}>{children}</span>;
}

export const HoverCardRoot = HoverCardBase;
export const HoverCard = Object.assign(HoverCardBase, {
  Root: HoverCardRoot,
  Trigger: HoverCardTrigger,
  Content: HoverCardContent
});
