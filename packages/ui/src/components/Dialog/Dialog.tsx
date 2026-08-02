import type { Child } from "@tavojs/core";
import styles from "./Dialog.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";
import { Button } from "@/components/Button";
import { closeOnEscape, trapFocus } from "@/components/a11y";

export type DialogProps = BaseProps & {
  open?: boolean;
  title?: Child;
  onClose?: () => void;
  fullScreen?: boolean;
  closeLabel?: Child;
  labelledBy?: string;
  describedBy?: string;
};

function onDialogKeyDown(
  event: KeyboardEvent,
  onClose?: () => void,
  onKeyDown?: (event: KeyboardEvent) => void
) {
  onKeyDown?.(event);
  if (event.defaultPrevented) {
    return;
  }
  closeOnEscape(event, onClose);
  trapFocus(event);
}

function DialogBase({
  children,
  className = "",
  open = false,
  title,
  onClose,
  fullScreen = false,
  closeLabel = "Close",
  labelledBy,
  describedBy,
  onClick,
  onKeyDown,
  ...props
}: DialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className={sxClassName(props, cx(styles.overlay, className))}
      role="presentation"
      {...props}
      onClick={(event: MouseEvent) => {
        onClick?.(event);
        if (!event.defaultPrevented && event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className={cx(styles.dialog, fullScreen && styles.fullScreen)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        onClick={(event: MouseEvent) => event.stopPropagation()}
        onKeyDown={(event: KeyboardEvent) => onDialogKeyDown(event, onClose, onKeyDown)}
      >
        <div className={styles.header}>
          {title ? <div id={labelledBy} className={styles.title}>{title}</div> : <div />}
          <Button
            size="sm"
            variant="ghost"
            tone="neutral"
            aria-label={typeof closeLabel === "string" ? closeLabel : "Close dialog"}
            onClick={onClose}
          >
            {closeLabel}
          </Button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}

export function DialogHeader({ children, className = "", ...props }: BaseProps) {
  return <div className={sxClassName(props, cx(styles.header, className))} {...props}>{children}</div>;
}
export function DialogBody({ children, className = "", ...props }: BaseProps) {
  return <div className={sxClassName(props, cx(styles.body, className))} {...props}>{children}</div>;
}
export function DialogFooter({ children, className = "", ...props }: BaseProps) {
  return <div className={sxClassName(props, cx(styles.footer, className))} {...props}>{children}</div>;
}

export const DialogRoot = DialogBase;
export const DialogContent = DialogBase;
export const Dialog = Object.assign(DialogBase, {
  Root: DialogRoot,
  Content: DialogContent,
  Header: DialogHeader,
  Body: DialogBody,
  Footer: DialogFooter
});
