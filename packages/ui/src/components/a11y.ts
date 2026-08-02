const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

export function getFocusable(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((node) => {
    const disabled = node.getAttribute("aria-disabled") === "true";
    return !disabled && node.offsetParent !== null;
  });
}

export function trapFocus(event: KeyboardEvent): void {
  if (event.key !== "Tab") {
    return;
  }

  const container = event.currentTarget as HTMLElement;
  const focusable = getFocusable(container);
  if (focusable.length === 0) {
    event.preventDefault();
    container.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

export function closeOnEscape(event: KeyboardEvent, onClose?: () => void): void {
  if (event.key === "Escape") {
    event.preventDefault();
    onClose?.();
  }
}

export function focusMenuItem(event: KeyboardEvent, direction: number): void {
  const target = event.currentTarget as HTMLElement;
  const menu = target.closest('[role="menu"]');
  const items = getFocusable(menu as HTMLElement | null).filter((item) => item.getAttribute("role") === "menuitem");
  const index = items.indexOf(target);
  const nextIndex =
    direction === Number.NEGATIVE_INFINITY
      ? 0
      : direction === Number.POSITIVE_INFINITY
        ? items.length - 1
        : (index + direction + items.length) % items.length;

  event.preventDefault();
  items[nextIndex]?.focus();
}
