import styles from "./ToggleGroup.module.scss";
import { cx, sxClassName, type BaseProps, type Size } from "@/components/shared";
import { Toggle, type ToggleVariant } from "@/components/Toggle";

export type ToggleGroupItem = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type ToggleGroupProps = BaseProps & {
  name?: string;
  value?: string | string[];
  items: ToggleGroupItem[];
  type?: "single" | "multiple";
  size?: Size;
  variant?: ToggleVariant;
};

function isPressed(value: ToggleGroupProps["value"], itemValue: string): boolean {
  return Array.isArray(value) ? value.includes(itemValue) : value === itemValue;
}

export function ToggleGroup({
  className = "",
  name,
  value,
  items,
  type = "single",
  size = "md",
  variant = "default",
  ...props
}: ToggleGroupProps) {
  return (
    <div className={sxClassName(props, cx(styles.root, className))} role={type === "single" ? "radiogroup" : "group"} {...props}>
      {items.map((item) => (
        <label className={cx(styles.item, item.disabled && styles.disabled)}>
          <input
            type={type === "single" ? "radio" : "checkbox"}
            name={name}
            value={item.value}
            checked={isPressed(value, item.value)}
            disabled={item.disabled}
          />
          <Toggle as="span" size={size} variant={variant} pressed={isPressed(value, item.value)}>{item.label}</Toggle>
        </label>
      ))}
    </div>
  );
}
