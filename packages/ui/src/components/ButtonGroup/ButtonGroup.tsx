import styles from "./ButtonGroup.module.scss";
import { cv, cx, sxClassName, type BaseProps, type Tone } from "@/components/shared";

export type ButtonGroupProps = BaseProps & {
  orientation?: "horizontal" | "vertical";
  fullWidth?: boolean;
  tone?: Extract<Tone, "primary" | "secondary" | "neutral" | "danger">;
  variant?: "solid" | "soft" | "outline" | "ghost" | "text";
};

export function ButtonGroup({
  children,
  className = "",
  orientation = "horizontal",
  fullWidth = false,
  ...props
}: ButtonGroupProps) {
  return (
    <div className={sxClassName(props, cx(styles.group, cv(styles, "orientation", orientation, "horizontal"), fullWidth && styles.fullWidth, className))} {...props}>
      {children}
    </div>
  );
}
