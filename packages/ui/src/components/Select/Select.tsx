import styles from "./Select.module.scss";
import inputStyles from "../TextInput/TextInput.module.scss";
import { cx, sxClassName, type BaseProps, type Size } from "@/components/shared";

export type SelectProps = BaseProps & {
  size?: Size;
};

export function Select({ children, className = "", size = "md", ...props }: SelectProps) {
  return (
    <select className={sxClassName(props, cx(inputStyles.input, inputStyles[`size-${size}`], styles.select, className))} {...props}>
      {children}
    </select>
  );
}
