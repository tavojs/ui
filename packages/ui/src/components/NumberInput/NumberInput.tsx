import type { Child } from "@tavojs/core";
import styles from "./NumberInput.module.scss";
import {
  cv,
  cx,
  sxClassName,
  type BaseProps,
  type Size,
  type TavoEventHandler,
  type ValueChangeEvent,
  type ValueChangeHandler,
} from "@/components/shared";

export type NumberInputValue = number | null;

export type NumberInputProps = Omit<BaseProps, "children" | "onChange" | "onInput"> & {
  className?: string;
  size?: Size;
  label?: Child;
  prefix?: Child;
  suffix?: Child;
  value?: NumberInputValue;
  defaultValue?: NumberInputValue;
  min?: number;
  max?: number;
  step?: number;
  name?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  allowUnset?: boolean;
  onValueInput?: (value: NumberInputValue, draft: string) => void;
  onValueChange?: (value: NumberInputValue, draft: string) => void;
  onInput?: ValueChangeHandler<HTMLInputElement>;
  onChange?: ValueChangeHandler<HTMLInputElement>;
  onKeyDown?: TavoEventHandler<KeyboardEvent>;
};

export type NumberInputDraft =
  | { valid: true; value: NumberInputValue }
  | { valid: false; value: null };

export function parseNumberInputDraft(
  draft: string,
  allowUnset = true,
): NumberInputDraft {
  const trimmed = draft.trim();
  if (trimmed === "") {
    return allowUnset
      ? { valid: true, value: null }
      : { valid: false, value: null };
  }

  if (
    trimmed === "+" ||
    trimmed === "-" ||
    trimmed === "." ||
    trimmed === "+." ||
    trimmed === "-." ||
    !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(trimmed)
  ) {
    return { valid: false, value: null };
  }

  const value = Number(trimmed);
  return Number.isFinite(value)
    ? { valid: true, value }
    : { valid: false, value: null };
}

function clampNumber(value: number, min?: number, max?: number): number {
  return Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, value));
}

function valueText(value: NumberInputValue | undefined): string | undefined {
  return value === null ? "" : value?.toString();
}

export function NumberInput({
  className = "",
  size = "md",
  label,
  prefix,
  suffix,
  value,
  defaultValue,
  min,
  max,
  step = 1,
  allowUnset = true,
  onValueInput,
  onValueChange,
  onInput,
  onChange,
  onKeyDown,
  disabled = false,
  ...props
}: NumberInputProps) {
  const rootClassName = sxClassName(
    props,
    cx(styles.root, cv(styles, "size", size, "md"), disabled && styles.disabled, className),
  );
  const input = (
    <input
      {...props}
      className={styles.input}
      type="text"
      inputMode="decimal"
      value={valueText(value)}
      defaultValue={value === undefined ? valueText(defaultValue) : undefined}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value ?? undefined}
      onInput={(event: ValueChangeEvent<HTMLInputElement>) => {
        onInput?.(event);
        if (event.defaultPrevented) return;
        const draft = event.currentTarget.value;
        const parsed = parseNumberInputDraft(draft, allowUnset);
        if (parsed.valid) onValueInput?.(parsed.value, draft);
      }}
      onChange={(event: ValueChangeEvent<HTMLInputElement>) => {
        onChange?.(event);
        if (event.defaultPrevented) return;
        const draft = event.currentTarget.value;
        const parsed = parseNumberInputDraft(draft, allowUnset);
        if (!parsed.valid) return;
        const nextValue = parsed.value === null
          ? null
          : clampNumber(parsed.value, min, max);
        const nextDraft = nextValue === null ? "" : String(nextValue);
        if (nextDraft !== draft) event.currentTarget.value = nextDraft;
        onValueChange?.(nextValue, nextDraft);
      }}
      onKeyDown={(event: KeyboardEvent & { currentTarget: HTMLInputElement }) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
        event.preventDefault();
        const parsed = parseNumberInputDraft(event.currentTarget.value, allowUnset);
        const base = parsed.valid && parsed.value !== null ? parsed.value : min ?? 0;
        const delta = (event.shiftKey ? step * 10 : step) * (event.key === "ArrowUp" ? 1 : -1);
        const nextValue = clampNumber(base + delta, min, max);
        const nextDraft = String(nextValue);
        event.currentTarget.value = nextDraft;
        onValueInput?.(nextValue, nextDraft);
        onValueChange?.(nextValue, nextDraft);
      }}
    />
  );

  return (
    <label
      className={rootClassName}
    >
      {label ? <span className={styles.label}>{label}</span> : null}
      <span className={styles.control}>
        {prefix !== undefined ? <span className={styles.affix} aria-hidden="true">{prefix}</span> : null}
        {input}
        {suffix !== undefined ? <span className={styles.affix} aria-hidden="true">{suffix}</span> : null}
      </span>
    </label>
  );
}
