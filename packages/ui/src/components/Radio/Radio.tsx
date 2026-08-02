import styles from "./Radio.module.scss";
import { boolAttr, sxClassName } from "@/components/shared";
import { cv, cx, type BaseProps, type Size, type Tone } from "@/components/shared";

export type RadioProps = BaseProps & {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  size?: Size;
  tone?: Extract<Tone, "primary" | "secondary" | "neutral">;
};

export function Radio({ className = "", checked, size = "md", tone = "primary", ...props }: RadioProps) {
  return (
    <input
      type="radio"
      checked={checked}
      aria-checked={boolAttr(checked)}
      className={sxClassName(props, cx(styles.radio, cv(styles, "size", size, "md"), cv(styles, "tone", tone, "primary"), className))}
      {...props}
    />
  );
}
