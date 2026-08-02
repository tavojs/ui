import styles from "./StatusDot.module.scss";
import { cv, cx, resolveAs, sxClassName, type BaseProps, type PolymorphicProps, type Size, type Tone } from "@/components/shared";
import { Text } from "@/components/Text";

export type StatusDotProps = BaseProps & PolymorphicProps & {
  tone?: Tone;
  size?: Exclude<Size, "lg"> | "lg";
  pulse?: boolean;
  label?: string;
};

export function StatusDot({ as, className = "", tone = "neutral", size = "md", pulse = false, label, ...props }: StatusDotProps) {
  const Component = resolveAs(as, "span") as unknown as "span";
  return (
    <Component className={sxClassName(props, cx(styles.status, cv(styles, "tone", tone, "neutral"), cv(styles, "size", size, "md"), pulse && styles.pulse, className))} aria-label={label} {...props}>
      <span className={styles.dot} aria-hidden="true" />
      {label ? <Text className={styles.label} as="span" variant="span" color="inherit">{label}</Text> : null}
    </Component>
  );
}
