import type { Child } from "@tavojs/core";
import styles from "./FormControlLabel.module.scss";
import { cv, cx, sxClassName, type BaseProps, type Size } from "@/components/shared";
import { Text } from "@/components/Text";

export type FormControlLabelProps = BaseProps & {
  label?: Child;
  control?: Child;
  size?: Size;
};

export function FormControlLabel({ className = "", label, control, size = "md", children, ...props }: FormControlLabelProps) {
  return (
    <label className={sxClassName(props, cx(styles.root, cv(styles, "size", size, "md"), className))} {...props}>
      {control ?? children}
      {label ? <Text as="span" variant="span" color="inherit" className={styles.label}>{label}</Text> : null}
    </label>
  );
}
