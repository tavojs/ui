import styles from "./Switch.module.scss";
import { boolAttr, sxClassName } from "@/components/shared";
import { cv, cx, type BaseProps, type Size, type Tone } from "@/components/shared";

export type SwitchProps = BaseProps & {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  size?: Size;
  tone?: Extract<Tone, "primary" | "secondary" | "neutral">;
};

export function Switch({ className = "", checked, size = "md", tone = "primary", ...props }: SwitchProps) {
  return (
    <label className={sxClassName(props, cx(styles.switch, cv(styles, "size", size, "md"), cv(styles, "tone", tone, "primary"), className))}>
      <input type="checkbox" role="switch" checked={checked} aria-checked={boolAttr(checked)} {...props} />
      <span className={styles.track} />
    </label>
  );
}
