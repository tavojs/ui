import styles from "./TextInput.module.scss";
import {
  cv,
  cx,
  sxClassName,
  type BaseProps,
  type Size,
  type ValueChangeHandler
} from "@/components/shared";

export type TextInputProps = Omit<BaseProps, "onChange" | "onInput"> & {
  className?: string;
  size?: Size;
  onChange?: ValueChangeHandler<HTMLInputElement>;
  onInput?: ValueChangeHandler<HTMLInputElement>;
};

export function TextInput({ className = "", size = "md", ...props }: TextInputProps) {
  return <input className={sxClassName(props, cx(styles.input, cv(styles, "size", size, "md"), className))} {...props} />;
}
