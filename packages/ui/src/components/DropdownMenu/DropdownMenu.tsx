import type { ElementDirectiveInput } from "@tavojs/core";
import styles from "./DropdownMenu.module.scss";
import { cv, cx, sxClassName, type BaseProps } from "@/components/shared";
import { focusMenuItem } from "@/components/a11y";
import {
  createDetailsBehavior,
  createFloatingDetailsContent,
  mergeDirectives,
  requestDetailsOpenChange,
  type DisclosureOpenChangeReason,
} from "@/components/disclosure";
import { Link } from "@/components/Link";

export type DropdownMenuProps = BaseProps & {
  open?: boolean;
  defaultOpen?: boolean;
  align?: "start" | "end";
  onClose?: () => void;
  onOpenChange?: (open: boolean, reason: DisclosureOpenChangeReason) => void;
  showArrow?: boolean;
};

export type DropdownMenuTriggerProps = BaseProps & {
  label?: string;
};
export type DropdownMenuContentProps = BaseProps & {
  use?: ElementDirectiveInput<HTMLDivElement>;
};
export type DropdownMenuItemProps = BaseProps & {
  href?: string;
  disabled?: boolean;
  closeOnSelect?: boolean;
  onSelect?: (event: MouseEvent) => void;
};

function DropdownMenuBase({
  children,
  className = "",
  open,
  defaultOpen = false,
  align = "end",
  onClose,
  onOpenChange,
  showArrow = true,
  ...props
}: DropdownMenuProps) {
  const classNames = sxClassName(props, cx(styles.root, cv(styles, "align", align, "end"), className));
  const existingUse = props.use as ElementDirectiveInput<HTMLDetailsElement>;
  delete props.use;
  const behavior = createDetailsBehavior({
    open,
    onOpenChange: (nextOpen, reason) => {
      onOpenChange?.(nextOpen, reason);
      if (!nextOpen) onClose?.();
    },
    dismissOnOutsidePointer: true,
    focusOnOpen: '[role="menuitem"]:not([disabled]):not([aria-disabled="true"])',
    restoreFocus: true,
  });

  return (
    <details
      className={classNames}
      open={open ?? defaultOpen}
      data-placement={align === "start" ? "bottom-start" : "bottom-end"}
      data-show-arrow={showArrow ? undefined : "false"}
      use={mergeDirectives(existingUse, behavior)}
      {...props}
    >
      {children}
    </details>
  );
}

export function DropdownMenuTrigger({ children, className = "", label, ...props }: DropdownMenuTriggerProps) {
  return (
    <summary
      className={sxClassName(props, cx(styles.trigger, className))}
      aria-label={label}
      aria-haspopup="menu"
      {...props}
    >
      {children}
    </summary>
  );
}

export function DropdownMenuContent({ children, className = "", use, ...props }: DropdownMenuContentProps) {
  const classNames = sxClassName(props, cx(styles.content, className));
  const sxUse = props.use as ElementDirectiveInput<HTMLDivElement>;
  delete props.use;
  return (
    <div
      className={classNames}
      role="menu"
      tabIndex={-1}
      use={mergeDirectives(createFloatingDetailsContent(), use, sxUse)}
      {...props}
    >
      {children}
    </div>
  );
}

function menuItemKeyDown(event: KeyboardEvent, onKeyDown?: (event: KeyboardEvent) => void) {
  onKeyDown?.(event);
  if (event.defaultPrevented) return;
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
  }
}

function selectMenuItem(
  event: MouseEvent,
  onClick: ((event: MouseEvent) => void) | undefined,
  onSelect: ((event: MouseEvent) => void) | undefined,
  closeOnSelect: boolean,
) {
  onClick?.(event);
  if (event.defaultPrevented) return;
  onSelect?.(event);
  if (event.defaultPrevented || !closeOnSelect) return;
  const owner = (event.currentTarget as HTMLElement | null)?.closest("details");
  if (owner) requestDetailsOpenChange(owner, false, "selection");
}

export function DropdownMenuItem({
  children,
  className = "",
  href,
  disabled = false,
  closeOnSelect = true,
  onSelect,
  onClick,
  onKeyDown,
  ...props
}: DropdownMenuItemProps) {
  const classNames = sxClassName(props, cx(styles.item, disabled && styles.disabled, className));
  const handleClick = (event: MouseEvent) => {
    if (!disabled) selectMenuItem(event, onClick, onSelect, closeOnSelect);
  };
  const handleKeyDown = (event: KeyboardEvent) => menuItemKeyDown(event, onKeyDown);

  if (href) {
    return (
      <Link
        className={classNames}
        href={href}
        disabled={disabled}
        noUnderline
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        {...props}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={classNames}
      disabled={disabled}
      role="menuitem"
      {...props}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </button>
  );
}

export function DropdownMenuClose({ children, className = "", onClick, ...props }: BaseProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={sxClassName(props, cx(styles.item, className))}
      onClick={(event: MouseEvent & { currentTarget: HTMLElement }) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const owner = event.currentTarget.closest("details");
        if (owner) requestDetailsOpenChange(owner, false, "close");
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export const DropdownMenuRoot = DropdownMenuBase;
export const DropdownMenu = Object.assign(DropdownMenuBase, {
  Root: DropdownMenuRoot,
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  Close: DropdownMenuClose,
});
