import styles from "./FormControl.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";

export type FormControlProps = BaseProps & {
  fullWidth?: boolean;
};

export function FormControl({ children, className = "", fullWidth = false, ...props }: FormControlProps) {
  return <form className={sxClassName(props, cx(styles.form, fullWidth && styles.fullWidth, className))} {...props}>{children}</form>;
}
