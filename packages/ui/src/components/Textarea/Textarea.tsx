import styles from "./Textarea.module.scss";
import inputStyles from "../TextInput/TextInput.module.scss";
import {
  cv,
  cx,
  sxClassName,
  type BaseProps,
  type ValueChangeHandler
} from "@/components/shared";

export type TextareaProps = Omit<BaseProps, "onChange" | "onInput"> & {
  className?: string;
  resize?: "none" | "vertical" | "horizontal" | "both";
  rows?: number;
  onChange?: ValueChangeHandler<HTMLTextAreaElement>;
  onInput?: ValueChangeHandler<HTMLTextAreaElement>;
};

export function Textarea({ className = "", resize = "vertical", rows = 4, ...props }: TextareaProps) {
  return <textarea className={sxClassName(props, cx(inputStyles.input, styles.textarea, cv(styles, "resize", resize, "vertical"), className))} rows={rows} {...props} />;
}
