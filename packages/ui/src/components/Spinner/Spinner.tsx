import styles from "./Spinner.module.scss";
import { cv, cx, resolveAs, sxClassName, type BaseProps, type PolymorphicProps, type Size, type Tone } from "@/components/shared";

export type SpinnerProps = BaseProps & PolymorphicProps & {
  size?: Size;
  tone?: Extract<Tone, "primary" | "secondary" | "neutral">;
  label?: string;
};

export function Spinner({ as, className = "", size = "md", tone = "primary", label = "Loading", ...props }: SpinnerProps) {
  const Component = resolveAs(as, "span") as unknown as "span";
  return (
    <Component
      className={sxClassName(props, cx(styles.spinner, cv(styles, "size", size, "md"), cv(styles, "tone", tone, "primary"), className))}
      role="status"
      aria-label={label}
      {...props}
    />
  );
}
