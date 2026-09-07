import type { ElementDirectiveInput } from "@tavojs/core";
import styles from "./Popover.module.scss";
import { cv, cx, sxClassName, type BaseProps } from "@/components/shared";
import {
  createDetailsBehavior,
  createFloatingDetailsContent,
  mergeDirectives,
  requestDetailsOpenChange,
  type DisclosureOpenChangeReason,
} from "@/components/disclosure";

export type PopoverPlacement =
  | "bottom-start"
  | "bottom-end"
  | "top-start"
  | "top-end";

export type PopoverProps = BaseProps & {
  open?: boolean;
  defaultOpen?: boolean;
  placement?: PopoverPlacement;
  onOpenChange?: (open: boolean, reason: DisclosureOpenChangeReason) => void;
};

export type PopoverTriggerProps = BaseProps & {
  label?: string;
};
export type PopoverContentProps = BaseProps & {
  use?: ElementDirectiveInput<HTMLDivElement>;
};
export type PopoverCloseProps = BaseProps;

function PopoverBase({
  children,
  className = "",
  open,
  defaultOpen = false,
  placement = "bottom-start",
  onOpenChange,
  ...props
}: PopoverProps) {
  const classNames = sxClassName(
    props,
    cx(styles.root, cv(styles, "placement", placement, "bottom-start"), className),
  );
  const existingUse = props.use as ElementDirectiveInput<HTMLDetailsElement>;
  delete props.use;
  const behavior = createDetailsBehavior({
    open,
    onOpenChange,
    dismissOnOutsidePointer: true,
    focusOnOpen: '[role="dialog"] input:not([disabled]), [role="dialog"] button:not([disabled]), [role="dialog"][tabindex]',
    restoreFocus: true,
  });

  return (
    <details
      className={classNames}
      open={open ?? defaultOpen}
      data-placement={placement}
      use={mergeDirectives(existingUse, behavior)}
      {...props}
    >
      {children}
    </details>
  );
}

export function PopoverTrigger({ children, className = "", label, ...props }: PopoverTriggerProps) {
  return (
    <summary
      className={sxClassName(props, cx(styles.trigger, className))}
      aria-label={label}
      aria-haspopup="dialog"
      {...props}
    >
      {children}
    </summary>
  );
}

export function PopoverContent({ children, className = "", use, ...props }: PopoverContentProps) {
  const contentClassName = sxClassName(props, cx(styles.content, className));
  const sxUse = props.use as ElementDirectiveInput<HTMLDivElement>;
  delete props.use;
  return (
    <div
      className={contentClassName}
      role="dialog"
      tabIndex={-1}
      use={mergeDirectives(createFloatingDetailsContent(), use, sxUse)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PopoverClose({ children, className = "", onClick, ...props }: PopoverCloseProps) {
  return (
    <button
      type="button"
      className={sxClassName(props, cx(styles.close, className))}
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

export const PopoverRoot = PopoverBase;
export const Popover = Object.assign(PopoverBase, {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Close: PopoverClose,
});
