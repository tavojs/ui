import type { Child } from "@tavojs/core";
import styles from "./Toast.module.scss";
import { cv, cx, sxClassName, type BaseProps } from "@/components/shared";
import { Button } from "@/components/Button";
import { Text } from "@/components/Text";

export type ToastTone = "info" | "success" | "warning" | "danger";

export type ToastProps = BaseProps & {
  title?: Child;
  tone?: ToastTone;
  action?: Child;
  onClose?: () => void;
  closeLabel?: string;
};

export function Toast({ children, className = "", title, tone = "info", action, onClose, closeLabel = "Dismiss notification", ...props }: ToastProps) {
  return (
    <section className={sxClassName(props, cx(styles.toast, cv(styles, "tone", tone, "info"), className))} role="status" {...props}>
      <div className={styles.content}>
        {title ? <Text as="span" variant="span" color="heading">{title}</Text> : null}
        {children ? <Text as="span" variant="span">{children}</Text> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
      {onClose ? (
        <Button size="sm" variant="ghost" tone="neutral" aria-label={closeLabel} onClick={onClose}>
          ×
        </Button>
      ) : null}
    </section>
  );
}

export function ToastStack({ children, className = "", ...props }: BaseProps) {
  return <div className={sxClassName(props, cx(styles.stack, className))} {...props}>{children}</div>;
}
