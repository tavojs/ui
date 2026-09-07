import type { Child } from "@tavojs/core";
import styles from "./ToggleGroup.module.scss";
import { cx, sxClassName, type BaseProps, type Size } from "@/components/shared";
import { Toggle, type ToggleVariant } from "@/components/Toggle";

export type ToggleGroupItem = {
  label: Child;
  value: string;
  disabled?: boolean;
  accessibleLabel?: string;
  title?: string;
};

export type ToggleGroupValue = string | string[] | undefined;

export type ToggleGroupProps = Omit<BaseProps, "onChange"> & {
  className?: string;
  name?: string;
  value?: string | string[];
  defaultValue?: string | string[];
  items?: ToggleGroupItem[];
  type?: "single" | "multiple";
  size?: Size;
  variant?: ToggleVariant;
  fullWidth?: boolean;
  allowEmpty?: boolean;
  onValueChange?: (value: ToggleGroupValue) => void;
};

export type ToggleGroupItemProps = BaseProps & {
  label?: Child;
  value: string;
  name?: string;
  type?: "single" | "multiple";
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  accessibleLabel?: string;
  size?: Size;
  variant?: ToggleVariant;
};

function isPressed(value: ToggleGroupProps["value"], itemValue: string): boolean {
  return Array.isArray(value) ? value.includes(itemValue) : value === itemValue;
}

function ToggleGroupBase({
  className = "",
  name,
  value,
  defaultValue,
  items,
  type = "single",
  size = "md",
  variant = "default",
  fullWidth = false,
  allowEmpty = false,
  onValueChange,
  children,
  ...props
}: ToggleGroupProps) {
  const controlled = value !== undefined;
  const selectedValue = controlled ? value : defaultValue;

  function selectedInputs(input: HTMLInputElement): string[] {
    const owner = input.closest('[role="group"], [role="radiogroup"]');
    if (!owner) return input.checked ? [input.value] : [];
    return Array.from(owner.querySelectorAll<HTMLInputElement>('input:checked'))
      .map((candidate) => candidate.value);
  }

  return (
    <div
      className={sxClassName(props, cx(styles.root, fullWidth && styles.fullWidth, className))}
      role={type === "single" ? "radiogroup" : "group"}
      {...props}
    >
      {items === undefined ? children : items.map((item) => (
        <label key={item.value} className={cx(styles.item, item.disabled && styles.disabled)} title={item.title}>
          <input
            type={type === "single" ? "radio" : "checkbox"}
            name={name}
            value={item.value}
            checked={controlled ? isPressed(value, item.value) : undefined}
            defaultChecked={!controlled ? isPressed(defaultValue, item.value) : undefined}
            disabled={item.disabled}
            aria-label={item.accessibleLabel}
            onPointerDown={(event: PointerEvent & { currentTarget: HTMLInputElement }) => {
              event.currentTarget.dataset.tuiWasChecked = event.currentTarget.checked ? "true" : "false";
            }}
            onKeyDown={(event: KeyboardEvent & { currentTarget: HTMLInputElement }) => {
              if (event.key === " " || event.key === "Enter") {
                event.currentTarget.dataset.tuiWasChecked = event.currentTarget.checked ? "true" : "false";
              }
            }}
            onClick={(event: MouseEvent & { currentTarget: HTMLInputElement }) => {
              const wasChecked = event.currentTarget.dataset?.tuiWasChecked === "true"
                || isPressed(selectedValue, item.value);
              if (event.currentTarget.dataset) delete event.currentTarget.dataset.tuiWasChecked;
              if (
                type === "single" &&
                allowEmpty &&
                wasChecked
              ) {
                event.preventDefault();
                event.currentTarget.checked = false;
                onValueChange?.(undefined);
              }
            }}
            onChange={(event: Event & { currentTarget: HTMLInputElement }) => {
              if (type === "multiple") {
                onValueChange?.(selectedInputs(event.currentTarget));
              } else if (event.currentTarget.checked) {
                onValueChange?.(item.value);
              }
            }}
          />
          <Toggle
            as="span"
            size={size}
            variant={variant}
            pressed={isPressed(selectedValue, item.value)}
            aria-hidden={item.accessibleLabel ? "true" : undefined}
          >
            {item.label}
          </Toggle>
        </label>
      ))}
    </div>
  );
}

export function ToggleGroupItemComponent({
  children,
  className = "",
  label,
  value,
  name,
  type = "single",
  checked,
  defaultChecked,
  disabled,
  accessibleLabel,
  size = "md",
  variant = "default",
  ...props
}: ToggleGroupItemProps) {
  const itemClassName = sxClassName(
    props,
    cx(styles.item, disabled && styles.disabled, className)
  );
  return (
    <label className={itemClassName}>
      <input
        {...props}
        type={type === "single" ? "radio" : "checkbox"}
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        aria-label={accessibleLabel}
      />
      <Toggle
        as="span"
        size={size}
        variant={variant}
        pressed={checked ?? defaultChecked}
        aria-hidden={accessibleLabel ? "true" : undefined}
      >
        {label ?? children}
      </Toggle>
    </label>
  );
}

export const ToggleGroupRoot = ToggleGroupBase;
export const ToggleGroup = Object.assign(ToggleGroupBase, {
  Root: ToggleGroupRoot,
  Item: ToggleGroupItemComponent
});
