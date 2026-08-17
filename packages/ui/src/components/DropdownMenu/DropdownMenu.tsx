import styles from "./DropdownMenu.module.scss";
import { cv, cx, sxClassName, type BaseProps } from "@/components/shared";
import { closeOnEscape, focusMenuItem } from "@/components/a11y";
import { Link } from "@/components/Link";

export type DropdownMenuProps = BaseProps & {
  open?: boolean;
  align?: "start" | "end";
  onClose?: () => void;
  showArrow?: boolean;
};

export type DropdownMenuTriggerProps = BaseProps & {
  label?: string;
};
export type DropdownMenuContentProps = BaseProps;
export type DropdownMenuItemProps = BaseProps & {
  href?: string;
  disabled?: boolean;
};

function DropdownMenuBase({ children, className = "", open = false, align = "end", onClose, showArrow = true, onKeyDown, ...props }: DropdownMenuProps) {
  function handleKeyDown(event: KeyboardEvent) {
    closeOnEscape(event, onClose);
    onKeyDown?.(event);
  }

  return <details className={sxClassName(props, cx(styles.root, cv(styles, "align", align, "end"), className))} open={open} data-show-arrow={showArrow ? undefined : "false"} onKeyDown={handleKeyDown} {...props}>{children}</details>;
}

export function DropdownMenuTrigger({ children, className = "", label, ...props }: DropdownMenuTriggerProps) {
  return <summary className={sxClassName(props, cx(styles.trigger, className))} aria-label={label} aria-haspopup="menu" {...props}>{children}</summary>;
}

export function DropdownMenuContent({ children, className = "", ...props }: DropdownMenuContentProps) {
  return <div className={sxClassName(props, cx(styles.content, className))} role="menu" tabIndex={-1} {...props}>{children}</div>;
}

export function DropdownMenuItem({ children, className = "", href, disabled = false, onKeyDown, ...props }: DropdownMenuItemProps) {
  function handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        focusMenuItem(event, 1);
        break;
      case "ArrowUp":
        focusMenuItem(event, -1);
        break;
      case "Home":
        focusMenuItem(event, Number.NEGATIVE_INFINITY);
        break;
      case "End":
        focusMenuItem(event, Number.POSITIVE_INFINITY);
        break;
      default:
        onKeyDown?.(event);
    }
  }

  if (href) {
    return (
      <Link
        className={sxClassName(props, cx(styles.item, disabled && styles.disabled, className))}
        href={href}
        disabled={disabled}
        noUnderline
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        {...props}
        onKeyDown={handleKeyDown}
      >
        {children}
      </Link>
    );
  }

  return <button type="button" className={sxClassName(props, cx(styles.item, className))} disabled={disabled} role="menuitem" {...props} onKeyDown={handleKeyDown}>{children}</button>;
}

export const DropdownMenuRoot = DropdownMenuBase;
export const DropdownMenu = Object.assign(DropdownMenuBase, {
  Root: DropdownMenuRoot,
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem
});
