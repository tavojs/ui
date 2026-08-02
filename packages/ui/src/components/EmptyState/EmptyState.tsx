import type { Child } from "@tavojs/core";
import styles from "./EmptyState.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";
import { Text } from "@/components/Text";

export type EmptyStateProps = BaseProps & {
  icon?: Child;
  title?: Child;
  description?: Child;
  actions?: Child;
};

export function EmptyState({
  children,
  className = "",
  icon,
  title,
  description,
  actions,
  ...props
}: EmptyStateProps) {
  return (
    <section className={sxClassName(props, cx(styles.emptyState, className))} {...props}>
      {icon ? <div className={styles.icon} aria-hidden="true">{icon}</div> : null}
      {title ? <Text className={styles.title} as="h3" variant="h3" color="heading">{title}</Text> : null}
      {description ? <Text className={styles.description} color="muted">{description}</Text> : null}
      {children}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </section>
  );
}
