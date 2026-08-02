import {
  createDirective,
  type ElementDirective,
  type ElementDirectiveInput,
} from "@tavojs/core";
import styles from "./Popover.module.scss";
import { cv, cx, sxClassName, type BaseProps } from "@/components/shared";

export type PopoverPlacement =
  | "bottom-start"
  | "bottom-end"
  | "top-start"
  | "top-end";

const VIEWPORT_MARGIN = 8;

export type PopoverProps = BaseProps & {
  open?: boolean;
  placement?: PopoverPlacement;
};

export type PopoverTriggerProps = BaseProps & {
  label?: string;
};
export type PopoverContentProps = BaseProps & {
  use?: ElementDirectiveInput<HTMLDivElement>;
};

function mergeContentDirectives(
  ...inputs: ElementDirectiveInput<HTMLDivElement>[]
): Array<ElementDirective<HTMLDivElement> | null | undefined | false> {
  const directives: Array<ElementDirective<HTMLDivElement> | null | undefined | false> = [
    keepPopoverContentInViewport
  ];
  for (const input of inputs) {
    if (Array.isArray(input)) {
      directives.push(...input);
    } else {
      directives.push(input);
    }
  }
  return directives;
}

const keepPopoverContentInViewport = createDirective<HTMLDivElement>(
  (element) => {
    const owner = element.parentElement as HTMLDetailsElement | null;
    let frame = 0;
    let active = false;

    function resetPosition() {
      element.removeAttribute("data-tui-popover-positioned");
      element.style.removeProperty("--tui-popover-translate-x");
      element.style.removeProperty("--tui-popover-translate-y");
      element.style.removeProperty("--tui-popover-available-height");
    }

    function updatePosition() {
      frame = 0;
      if (!owner?.open) {
        resetPosition();
        return;
      }

      resetPosition();

      const rect = element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const overflowLeft = VIEWPORT_MARGIN - rect.left;
      const overflowRight = rect.right - (viewportWidth - VIEWPORT_MARGIN);
      const overflowTop = VIEWPORT_MARGIN - rect.top;
      const overflowBottom = rect.bottom - (viewportHeight - VIEWPORT_MARGIN);
      const translateX =
        overflowLeft > 0
          ? overflowLeft
          : overflowRight > 0
            ? -overflowRight
            : 0;
      const translateY =
        overflowTop > 0
          ? overflowTop
          : overflowBottom > 0
            ? -overflowBottom
            : 0;
      const availableHeight = Math.max(0, viewportHeight - VIEWPORT_MARGIN * 2);

      if (translateX !== 0) {
        element.style.setProperty(
          "--tui-popover-translate-x",
          `${Math.round(translateX)}px`,
        );
      }
      if (translateY !== 0) {
        element.style.setProperty(
          "--tui-popover-translate-y",
          `${Math.round(translateY)}px`,
        );
      }
      element.style.setProperty(
        "--tui-popover-available-height",
        `${Math.round(availableHeight)}px`,
      );
      element.setAttribute("data-tui-popover-positioned", "true");
    }

    function schedulePositionUpdate() {
      if (frame) {
        return;
      }
      frame = requestAnimationFrame(updatePosition);
    }

    function handleOutsidePointerDown(event: PointerEvent) {
      if (!owner?.open) {
        return;
      }

      const path = event.composedPath();
      if (path.includes(owner)) {
        return;
      }

      owner.open = false;
      resetPosition();
    }

    const resizeObserver =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(schedulePositionUpdate)
        : null;

    function activate() {
      if (active || !owner) {
        return;
      }
      active = true;
      resizeObserver?.observe(element);
      document.addEventListener("pointerdown", handleOutsidePointerDown);
      window.addEventListener("resize", schedulePositionUpdate);
      window.addEventListener("scroll", schedulePositionUpdate, true);
      schedulePositionUpdate();
    }

    function deactivate() {
      if (!active) {
        resetPosition();
        return;
      }
      active = false;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      resizeObserver?.disconnect();
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
      window.removeEventListener("resize", schedulePositionUpdate);
      window.removeEventListener("scroll", schedulePositionUpdate, true);
      resetPosition();
    }

    function handleToggle() {
      if (owner?.open) {
        activate();
      } else {
        deactivate();
      }
    }

    owner?.addEventListener("toggle", handleToggle);
    handleToggle();

    return () => {
      owner?.removeEventListener("toggle", handleToggle);
      deactivate();
    };
  },
);

function PopoverBase({
  children,
  className = "",
  open = false,
  placement = "bottom-start",
  ...props
}: PopoverProps) {
  return (
    <details
      className={sxClassName(
        props,
        cx(
          styles.root,
          cv(styles, "placement", placement, "bottom-start"),
          className,
        ),
      )}
      open={open}
      {...props}
    >
      {children}
    </details>
  );
}

export function PopoverTrigger({
  children,
  className = "",
  label,
  ...props
}: PopoverTriggerProps) {
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

export function PopoverContent({
  children,
  className = "",
  use,
  ...props
}: PopoverContentProps) {
  const contentClassName = sxClassName(props, cx(styles.content, className));
  const sxUse = props.use as ElementDirectiveInput<HTMLDivElement>;
  delete props.use;
  return (
    <div
      className={contentClassName}
      role="dialog"
      use={mergeContentDirectives(use, sxUse)}
      {...props}
    >
      {children}
    </div>
  );
}

export const PopoverRoot = PopoverBase;
export const Popover = Object.assign(PopoverBase, {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
});
