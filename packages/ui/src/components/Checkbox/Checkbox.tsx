import styles from "./Checkbox.module.scss";
import { boolAttr, sxClassName } from "@/components/shared";
import { cv, cx, type BaseProps, type Size, type Tone } from "@/components/shared";

export type CheckboxProps = BaseProps & {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  size?: Size;
  tone?: Extract<Tone, "primary" | "secondary" | "neutral">;
};

export function Checkbox({
  className = "",
  checked,
  indeterminate = false,
  size = "md",
  tone = "primary",
  ...props
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      aria-checked={indeterminate ? "mixed" : boolAttr(checked)}
      data-indeterminate={indeterminate ? "true" : undefined}
      className={sxClassName(props, cx(styles.checkbox, cv(styles, "size", size, "md"), cv(styles, "tone", tone, "primary"), indeterminate && styles.indeterminate, className))}
      {...props}
    />
  );
}
