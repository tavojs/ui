import type { Child } from "@tavojs/core";
import styles from "./Sheet.module.scss";
import { cv, cx, sxClassName, type BaseProps } from "@/components/shared";
import { closeOnEscape, trapFocus } from "@/components/a11y";

export type SheetSide = "left" | "right" | "top" | "bottom";

export type SheetProps = BaseProps & {
  open?: boolean;
  side?: SheetSide;
  onClose?: () => void;
  labelledBy?: string;
};

export type SheetContentProps = BaseProps & {
  side?: SheetSide;
  open?: boolean;
  onClose?: () => void;
  labelledBy?: string;
};

export type SheetCloseProps = BaseProps & {
  label?: Child;
};

function SheetBase({ children, className = "", open = false, side = "right", onClose, labelledBy, ...props }: SheetProps) {
  return (
    <>
      {open ? <div className={styles.backdrop} role="presentation" onClick={onClose} /> : null}
      <div className={sxClassName(props, cx(styles.root, cv(styles, "side", side, "right"), open && styles.open, className))} aria-hidden={open ? undefined : "true"} aria-labelledby={labelledBy} {...props}>
        {children}
      </div>
    </>
  );
}

export function SheetTrigger({ children, className = "", ...props }: BaseProps) {
  return <button type="button" className={sxClassName(props, cx(styles.trigger, className))} {...props}>{children}</button>;
}

export function SheetContent({ children, className = "", side = "right", open = false, labelledBy, onClose, onKeyDown, ...props }: SheetContentProps) {
  function handleKeyDown(event: KeyboardEvent) {
    closeOnEscape(event, onClose);
    trapFocus(event);
    onKeyDown?.(event);
  }

  return (
    <aside className={sxClassName(props, cx(styles.content, cv(styles, "side", side, "right"), open && styles.open, className))} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1} onKeyDown={handleKeyDown} {...props}>
      {children}
    </aside>
  );
}

export function SheetClose({ children, className = "", label = "Close sheet", ...props }: SheetCloseProps) {
  return <button type="button" className={sxClassName(props, cx(styles.close, className))} aria-label={label} {...props}>{children ?? "Close"}</button>;
}

export const SheetRoot = SheetBase;
export const Sheet = Object.assign(SheetBase, {
  Root: SheetRoot,
  Trigger: SheetTrigger,
  Content: SheetContent,
  Close: SheetClose
});
