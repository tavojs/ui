import styles from "./FormLabel.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";

export type FormLabelProps = BaseProps;

export function FormLabel({ children, className = "", ...props }: FormLabelProps) {
  return <label className={sxClassName(props, cx(styles.label, className))} {...props}>{children}</label>;
}
