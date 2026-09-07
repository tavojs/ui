import type { Child } from "@tavojs/core";
import styles from "./ColorPicker.module.scss";
import {
  cv,
  cx,
  sxClassName,
  type BaseProps,
  type Size,
  type ValueChangeEvent,
  type ValueChangeHandler
} from "@/components/shared";

export type ColorPickerOption = {
  label: Child;
  value: string;
};

export type ColorPickerProps = Omit<BaseProps, "children" | "onChange" | "onInput"> & {
  className?: string;
  size?: Size;
  format?: "hex" | "css";
  label?: Child;
  value?: string;
  defaultValue?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  type?: never;
  swatches?: Array<string | ColorPickerOption>;
  tokens?: ColorPickerOption[];
  onValueInput?: (value: string) => void;
  onValueChange?: (value: string) => void;
  onChange?: ValueChangeHandler<HTMLInputElement>;
  onInput?: ValueChangeHandler<HTMLInputElement>;
};

function nativeColorValue(value: string | undefined): string {
  if (/^#[\da-f]{6}$/i.test(value ?? "")) return value as string;
  if (/^#[\da-f]{3}$/i.test(value ?? "")) {
    const [red, green, blue] = (value as string).slice(1);
    return `#${red}${red}${green}${green}${blue}${blue}`;
  }
  return "#000000";
}

export function ColorPicker({
  className = "",
  size = "md",
  format = "hex",
  label,
  value,
  defaultValue,
  name,
  placeholder = "CSS color, gradient, or variable",
  swatches = [],
  tokens = [],
  onValueInput,
  onValueChange,
  onChange,
  onInput,
  disabled = false,
  ...props
}: ColorPickerProps) {
  if (format === "css") {
    const currentValue = value ?? defaultValue ?? "";
    const options = [
      ...swatches.map((option) => typeof option === "string" ? { label: option, value: option } : option),
      ...tokens,
    ];
    const rootClassName = sxClassName(
      props,
      cx(styles.cssRoot, cv(styles, "size", size, "md"), className),
    );

    function inputValue(nextValue: string) {
      onValueInput?.(nextValue);
    }

    function commitValue(nextValue: string) {
      onValueChange?.(nextValue);
    }

    return (
      <label className={rootClassName}>
        {label ? <span className={styles.label}>{label}</span> : null}
        <span className={styles.cssControl}>
          <span
            className={styles.preview}
            style={{ background: currentValue || "transparent" }}
            aria-hidden="true"
          />
          <input
            {...props}
            className={styles.cssInput}
            type="text"
            name={name}
            value={value}
            defaultValue={value === undefined ? defaultValue : undefined}
            placeholder={placeholder}
            disabled={disabled}
            onInput={(event: ValueChangeEvent<HTMLInputElement>) => {
              onInput?.(event);
              if (!event.defaultPrevented) inputValue(event.currentTarget.value);
            }}
            onChange={(event: ValueChangeEvent<HTMLInputElement>) => {
              onChange?.(event);
              if (!event.defaultPrevented) commitValue(event.currentTarget.value);
            }}
          />
          <input
            className={cx(styles.picker, styles.cssNativePicker)}
            type="color"
            value={nativeColorValue(currentValue)}
            disabled={disabled}
            aria-label="Choose a solid color"
            onInput={(event: Event & { currentTarget: HTMLInputElement }) => inputValue(event.currentTarget.value)}
            onChange={(event: Event & { currentTarget: HTMLInputElement }) => commitValue(event.currentTarget.value)}
          />
        </span>
        {options.length ? (
          <span className={styles.options} role="group" aria-label="Color choices">
            {options.map((option) => (
              <button
                key={`${String(option.label)}-${option.value}`}
                className={styles.option}
                type="button"
                title={typeof option.label === "string" ? option.label : option.value}
                aria-label={typeof option.label === "string" ? option.label : option.value}
                style={{ background: option.value }}
                disabled={disabled}
                onClick={() => {
                  inputValue(option.value);
                  commitValue(option.value);
                }}
              />
            ))}
          </span>
        ) : null}
      </label>
    );
  }

  const handleChange: ValueChangeHandler<HTMLInputElement> | undefined =
    onChange || onValueChange
      ? (event) => {
          onChange?.(event);
          onValueChange?.(event.currentTarget.value);
        }
      : undefined;

  return (
    <input
      {...props}
      type="color"
      name={name}
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      disabled={disabled}
      className={sxClassName(
        props,
        cx(styles.picker, cv(styles, "size", size, "md"), className)
      )}
      onChange={handleChange}
      onInput={onInput || onValueInput
        ? (event: ValueChangeEvent<HTMLInputElement>) => {
            onInput?.(event);
            onValueInput?.(event.currentTarget.value);
          }
        : undefined}
    />
  );
}
