import type { Child, ElementDirectiveInput, VNode } from "@tavojs/core";
import styles from "./Resizable.module.scss";
import { mergeDirectives } from "@/components/disclosure";
import {
  cv,
  cx,
  isResponsiveValue,
  responsiveVars,
  styleObject,
  sxClassName,
  type BaseProps,
  type ResponsiveValue,
  type TavoEventHandler,
} from "@/components/shared";

export type ResizableOrientation = "horizontal" | "vertical";

export type ResizableProps = BaseProps & {
  /** @deprecated Use orientation to describe the separator. */
  direction?: "horizontal" | "vertical";
  orientation?: ResizableOrientation;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  largeStep?: number;
  disabled?: boolean;
  onResizeStart?: (value: number) => void;
  onValueInput?: (value: number) => void;
  onValueChange?: (value: number) => void;
  onResizeCancel?: (value: number) => void;
};

export type ResizablePanelProps = BaseProps & {
  defaultSize?: ResponsiveValue<string>;
};

export type ResizableHandleProps = BaseProps & {
  hitArea?: number | string;
  onPointerDown?: TavoEventHandler<PointerEvent>;
};

type ResizableHandleConfig = {
  orientation: ResizableOrientation;
  value: number;
  min: number;
  max: number;
  step: number;
  largeStep: number;
  disabled: boolean;
  onResizeStart?: (value: number) => void;
  onValueInput?: (value: number) => void;
  onValueChange?: (value: number) => void;
  onResizeCancel?: (value: number) => void;
};

type InternalResizableHandleProps = ResizableHandleProps & {
  __resizable?: ResizableHandleConfig;
};

function isVNode(value: Child): value is VNode {
  return typeof value === "object" && value !== null && !Array.isArray(value) && "type" in value && "props" in value;
}

function withHandleConfig(child: Child, config: ResizableHandleConfig): Child {
  if (Array.isArray(child)) return child.map((item) => withHandleConfig(item, config));
  if (!isVNode(child)) return child;
  if (child.type === ResizableHandle) {
    return { ...child, props: { ...child.props, __resizable: config } };
  }
  return child;
}

export function clampResizableValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function applyVisualValue(owner: HTMLElement | null, orientation: ResizableOrientation, value: number) {
  if (!owner) return;
  owner.dataset.value = String(value);
  const property = orientation === "vertical" ? "inline-size" : "block-size";
  owner.style.setProperty(property, `${value}px`);
}

function ResizableBase({
  children,
  className = "",
  direction,
  orientation,
  value,
  defaultValue = 0,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  largeStep = 10,
  disabled = false,
  onResizeStart,
  onValueInput,
  onValueChange,
  onResizeCancel,
  style,
  ...props
}: ResizableProps) {
  const separatorOrientation = orientation ?? (direction === "vertical" ? "horizontal" : "vertical");
  const layoutDirection = direction ?? (separatorOrientation === "vertical" ? "horizontal" : "vertical");
  const currentValue = clampResizableValue(value ?? defaultValue, min, max);
  const controlledSizing = value !== undefined || defaultValue !== 0;
  const sizeStyle = controlledSizing
    ? separatorOrientation === "vertical"
      ? { inlineSize: `${currentValue}px` }
      : { blockSize: `${currentValue}px` }
    : {};
  const config: ResizableHandleConfig = {
    orientation: separatorOrientation,
    value: currentValue,
    min,
    max,
    step,
    largeStep,
    disabled,
    onResizeStart,
    onValueInput,
    onValueChange,
    onResizeCancel,
  };

  return (
    <div
      className={sxClassName(props, cx(styles.root, cv(styles, "direction", layoutDirection, "horizontal"), className))}
      style={{ ...styleObject(style), ...sizeStyle }}
      data-value={controlledSizing ? currentValue : undefined}
      data-resizable-orientation={separatorOrientation}
      data-disabled={disabled ? "true" : undefined}
      {...props}
    >
      {withHandleConfig(children, config)}
    </div>
  );
}

export function ResizablePanel({ children, className = "", defaultSize, style, ...props }: ResizablePanelProps) {
  const staticSize = !isResponsiveValue(defaultSize) ? defaultSize : undefined;
  return (
    <div
      className={sxClassName(props, cx(styles.panel, className))}
      style={{
        ...styleObject(style),
        ...responsiveVars(defaultSize, "--tui-resizable-panel-basis", (item) => item),
        ...(staticSize ? { flexBasis: staticSize } : {}),
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function ResizableHandle({
  className = "",
  hitArea = "0.75rem",
  __resizable,
  style,
  onKeyDown,
  onPointerDown,
  ...props
}: InternalResizableHandleProps) {
  const config = __resizable ?? {
    orientation: "vertical" as const,
    value: 0,
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
    step: 1,
    largeStep: 10,
    disabled: Boolean(props.disabled),
  };
  let cancelActiveDrag: (() => void) | undefined;
  const cleanupDirective = ((_: HTMLElement) => () => cancelActiveDrag?.()) as ElementDirectiveInput<HTMLDivElement>;
  const existingUse = props.use as ElementDirectiveInput<HTMLDivElement>;
  delete props.use;
  const handleUse = mergeDirectives(existingUse, cleanupDirective);

  function commitKeyboardValue(event: KeyboardEvent & { currentTarget: HTMLElement }, delta: number) {
    event.preventDefault();
    const owner = event.currentTarget.closest<HTMLElement>(`.${styles.root}`);
    const current = Number(owner?.dataset.value ?? config.value);
    const next = clampResizableValue(current + delta, config.min, config.max);
    applyVisualValue(owner, config.orientation, next);
    event.currentTarget.setAttribute("aria-valuenow", String(next));
    config.onValueInput?.(next);
    config.onValueChange?.(next);
  }

  return (
    <div
      className={sxClassName(props, cx(styles.handle, className))}
      role="separator"
      tabIndex={config.disabled ? -1 : 0}
      aria-orientation={config.orientation}
      aria-valuemin={config.min}
      aria-valuemax={config.max}
      aria-valuenow={config.value}
      aria-disabled={config.disabled ? "true" : undefined}
      style={{ ...styleObject(style), "--tui-resizable-hit-area": typeof hitArea === "number" ? `${hitArea}px` : hitArea }}
      use={handleUse}
      onPointerDown={(event: PointerEvent & { currentTarget: HTMLElement }) => {
        onPointerDown?.(event);
        if (event.defaultPrevented || config.disabled || event.button !== 0) return;
        event.preventDefault();
        const handle = event.currentTarget;
        const owner = handle.closest<HTMLElement>(`.${styles.root}`);
        const startPosition = config.orientation === "vertical" ? event.clientX : event.clientY;
        const startValue = Number(owner?.dataset.value ?? config.value);
        let latestValue = startValue;
        const rtlMultiplier = config.orientation === "vertical" && owner && getComputedStyle(owner).direction === "rtl" ? -1 : 1;
        config.onResizeStart?.(startValue);
        handle.setPointerCapture?.(event.pointerId);

        const cleanup = () => {
          document.removeEventListener("pointermove", handleMove);
          document.removeEventListener("pointerup", handleEnd);
          document.removeEventListener("pointercancel", handleCancel);
          document.removeEventListener("keydown", handleEscape);
          if (handle.hasPointerCapture?.(event.pointerId)) handle.releasePointerCapture?.(event.pointerId);
          cancelActiveDrag = undefined;
        };
        const cancel = () => {
          applyVisualValue(owner, config.orientation, startValue);
          handle.setAttribute("aria-valuenow", String(startValue));
          config.onResizeCancel?.(startValue);
          cleanup();
        };
        const handleMove = (moveEvent: PointerEvent) => {
          const position = config.orientation === "vertical" ? moveEvent.clientX : moveEvent.clientY;
          latestValue = clampResizableValue(startValue + (position - startPosition) * rtlMultiplier, config.min, config.max);
          applyVisualValue(owner, config.orientation, latestValue);
          handle.setAttribute("aria-valuenow", String(latestValue));
          config.onValueInput?.(latestValue);
        };
        const handleEnd = () => {
          config.onValueChange?.(latestValue);
          cleanup();
        };
        const handleCancel = () => cancel();
        const handleEscape = (keyEvent: KeyboardEvent) => {
          if (keyEvent.key === "Escape") {
            keyEvent.preventDefault();
            cancel();
          }
        };
        cancelActiveDrag = cancel;
        document.addEventListener("pointermove", handleMove);
        document.addEventListener("pointerup", handleEnd, { once: true });
        document.addEventListener("pointercancel", handleCancel, { once: true });
        document.addEventListener("keydown", handleEscape);
      }}
      onKeyDown={(event: KeyboardEvent & { currentTarget: HTMLElement }) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || config.disabled) return;
        const increment = event.shiftKey ? config.largeStep : config.step;
        if (config.orientation === "vertical" && event.key === "ArrowRight") commitKeyboardValue(event, increment);
        else if (config.orientation === "vertical" && event.key === "ArrowLeft") commitKeyboardValue(event, -increment);
        else if (config.orientation === "horizontal" && event.key === "ArrowDown") commitKeyboardValue(event, increment);
        else if (config.orientation === "horizontal" && event.key === "ArrowUp") commitKeyboardValue(event, -increment);
        else if (event.key === "Home" || event.key === "End") {
          const owner = event.currentTarget.closest<HTMLElement>(`.${styles.root}`);
          const current = Number(owner?.dataset.value ?? config.value);
          commitKeyboardValue(event, (event.key === "Home" ? config.min : config.max) - current);
        }
      }}
      {...props}
    />
  );
}

export const ResizableRoot = ResizableBase;
export const Resizable = Object.assign(ResizableBase, {
  Root: ResizableRoot,
  Panel: ResizablePanel,
  Handle: ResizableHandle,
});
