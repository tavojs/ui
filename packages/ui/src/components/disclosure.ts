import {
  createDirective,
  type ElementDirective,
  type ElementDirectiveInput,
} from "@tavojs/core/runtime";

export type DisclosureOpenChangeReason =
  | "trigger"
  | "selection"
  | "escape"
  | "outside-pointer"
  | "close"
  | "programmatic";

type DetailsBehaviorOptions = {
  open?: boolean;
  onOpenChange?: (open: boolean, reason: DisclosureOpenChangeReason) => void;
  dismissOnOutsidePointer?: boolean;
  focusOnOpen?: string;
  restoreFocus?: boolean;
};

export function mergeDirectives<T extends HTMLElement>(
  ...inputs: ElementDirectiveInput<T>[]
): ElementDirectiveInput<T> {
  const directives: Array<ElementDirective<T> | null | undefined | false> = [];
  inputs.forEach((input) => {
    if (Array.isArray(input)) directives.push(...input);
    else directives.push(input);
  });
  return directives;
}

export function requestDetailsOpenChange(
  details: HTMLDetailsElement,
  open: boolean,
  reason: DisclosureOpenChangeReason,
) {
  details.dataset.tuiOpenReason = reason;
  if (details.open === open) {
    details.dispatchEvent(new Event("tui-open-request"));
    return;
  }
  details.open = open;
}

export function createDetailsBehavior(options: DetailsBehaviorOptions): ElementDirective<HTMLDetailsElement> {
  return createDirective<HTMLDetailsElement>((details) => {
    let suppressToggle = false;
    let lastOpen = details.open;
    const trigger = details.querySelector<HTMLElement>(":scope > summary");

    function reason(): DisclosureOpenChangeReason {
      const value = details.dataset.tuiOpenReason as DisclosureOpenChangeReason | undefined;
      delete details.dataset.tuiOpenReason;
      return value ?? "programmatic";
    }

    function restoreControlledState() {
      if (options.open === undefined || details.open === options.open) return;
      suppressToggle = true;
      details.open = options.open;
      queueMicrotask(() => { suppressToggle = false; });
    }

    function focusOpenedContent() {
      if (!options.focusOnOpen) return;
      queueMicrotask(() => {
        const target = details.querySelector<HTMLElement>(options.focusOnOpen as string);
        target?.focus();
      });
    }

    function handleToggle() {
      if (suppressToggle) return;
      const nextOpen = details.open;
      const changeReason = reason();
      if (nextOpen !== lastOpen || options.open !== undefined) {
        options.onOpenChange?.(nextOpen, changeReason);
      }
      lastOpen = nextOpen;
      if (nextOpen) focusOpenedContent();
      else if (options.restoreFocus && changeReason !== "trigger") queueMicrotask(() => trigger?.focus());
      restoreControlledState();
    }

    function handleOpenRequest() {
      const requested = details.dataset.tuiOpenReason ? details.open : !details.open;
      const changeReason = reason();
      options.onOpenChange?.(requested, changeReason);
      if (!requested && options.restoreFocus && changeReason !== "trigger") queueMicrotask(() => trigger?.focus());
    }

    function handleClick(event: MouseEvent) {
      const summary = (event.target as Element | null)?.closest("summary");
      if (summary && summary.parentElement === details) details.dataset.tuiOpenReason = "trigger";
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.key !== "Escape" || !details.open) return;
      event.preventDefault();
      event.stopPropagation();
      requestDetailsOpenChange(details, false, "escape");
    }

    function handleOutsidePointer(event: PointerEvent) {
      if (!options.dismissOnOutsidePointer || !details.open || event.composedPath().includes(details)) return;
      requestDetailsOpenChange(details, false, "outside-pointer");
    }

    details.addEventListener("click", handleClick, true);
    details.addEventListener("toggle", handleToggle);
    details.addEventListener("tui-open-request", handleOpenRequest);
    details.addEventListener("keydown", handleKeyDown);
    if (options.dismissOnOutsidePointer) document.addEventListener("pointerdown", handleOutsidePointer);
    if (details.open) focusOpenedContent();

    return () => {
      details.removeEventListener("click", handleClick, true);
      details.removeEventListener("toggle", handleToggle);
      details.removeEventListener("tui-open-request", handleOpenRequest);
      details.removeEventListener("keydown", handleKeyDown);
      if (options.dismissOnOutsidePointer) document.removeEventListener("pointerdown", handleOutsidePointer);
    };
  });
}

type FloatingContentOptions = {
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  margin?: number;
  gap?: number;
};

export function createFloatingDetailsContent(options: FloatingContentOptions = {}): ElementDirective<HTMLDivElement> {
  return createDirective<HTMLDivElement>((element) => {
    const owner = element.parentElement as HTMLDetailsElement | null;
    const margin = options.margin ?? 8;
    const gap = options.gap ?? 8;
    let frame = 0;

    function reset() {
      element.removeAttribute("data-tui-floating-positioned");
      element.style.removeProperty("--tui-floating-left");
      element.style.removeProperty("--tui-floating-top");
      element.style.removeProperty("--tui-floating-max-height");
    }

    function update() {
      frame = 0;
      if (!owner?.open) {
        reset();
        return;
      }
      const trigger = owner.querySelector<HTMLElement>(":scope > summary");
      if (!trigger) return;
      const triggerRect = trigger.getBoundingClientRect();
      const contentRect = element.getBoundingClientRect();
      const placement = options.placement ?? (owner.dataset.placement as FloatingContentOptions["placement"]) ?? "bottom-start";
      let left = placement.endsWith("end") ? triggerRect.right - contentRect.width : triggerRect.left;
      let top = placement.startsWith("top") ? triggerRect.top - contentRect.height - gap : triggerRect.bottom + gap;
      if (placement.startsWith("bottom") && top + contentRect.height > window.innerHeight - margin) {
        const flipped = triggerRect.top - contentRect.height - gap;
        if (flipped >= margin) top = flipped;
      } else if (placement.startsWith("top") && top < margin) {
        const flipped = triggerRect.bottom + gap;
        if (flipped + contentRect.height <= window.innerHeight - margin) top = flipped;
      }
      left = Math.min(window.innerWidth - contentRect.width - margin, Math.max(margin, left));
      top = Math.max(margin, Math.min(window.innerHeight - margin, top));
      element.style.setProperty("--tui-floating-left", `${Math.round(left)}px`);
      element.style.setProperty("--tui-floating-top", `${Math.round(top)}px`);
      element.style.setProperty("--tui-floating-max-height", `${Math.max(0, window.innerHeight - top - margin)}px`);
      element.setAttribute("data-tui-floating-positioned", "true");
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(schedule) : null;
    observer?.observe(element);
    owner?.addEventListener("toggle", schedule);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    schedule();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
      owner?.removeEventListener("toggle", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
      reset();
    };
  });
}
