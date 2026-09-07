import type { ElementDirectiveInput } from "@tavojs/core";
import styles from "./Collapsible.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";
import {
  createDetailsBehavior,
  mergeDirectives,
  requestDetailsOpenChange,
  type DisclosureOpenChangeReason,
} from "@/components/disclosure";

export type CollapsibleProps = BaseProps & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, reason: DisclosureOpenChangeReason) => void;
  showArrow?: boolean;
  centerTrigger?: boolean;
};

export type CollapsibleTriggerProps = BaseProps;
export type CollapsibleContentProps = BaseProps;

function CollapsibleBase({
  children,
  className = "",
  open,
  defaultOpen = false,
  onOpenChange,
  showArrow = true,
  centerTrigger = false,
  ...props
}: CollapsibleProps) {
  const classNames = sxClassName(props, cx(styles.root, className));
  const existingUse = props.use as ElementDirectiveInput<HTMLDetailsElement>;
  delete props.use;
  return (
    <details
      className={classNames}
      open={open ?? defaultOpen}
      data-show-arrow={showArrow ? undefined : "false"}
      data-center-trigger={centerTrigger ? "true" : undefined}
      use={mergeDirectives(existingUse, createDetailsBehavior({ open, onOpenChange }))}
      {...props}
    >
      {children}
    </details>
  );
}

export function CollapsibleTrigger({ children, className = "", ...props }: CollapsibleTriggerProps) {
  return <summary className={sxClassName(props, cx(styles.trigger, className))} {...props}>{children}</summary>;
}

export function CollapsibleContent({ children, className = "", ...props }: CollapsibleContentProps) {
  return <div className={sxClassName(props, cx(styles.content, className))} {...props}>{children}</div>;
}

export function CollapsibleClose({ children, className = "", onClick, ...props }: BaseProps) {
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

export const CollapsibleRoot = CollapsibleBase;
export const Collapsible = Object.assign(CollapsibleBase, {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
  Close: CollapsibleClose
});
