import styles from "./Progress.module.scss";
import { cv, cx, sxClassName, type BaseProps, type Size, type Tone } from "@/components/shared";
import { Text } from "@/components/Text";

export type ProgressProps = BaseProps & {
  value?: number;
  max?: number;
  tone?: Extract<Tone, "primary" | "secondary" | "neutral" | "success" | "warning" | "danger" | "info">;
  size?: Exclude<Size, "lg"> | "lg";
  label?: string;
  showValue?: boolean;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function Progress({
  className = "",
  value = 0,
  max = 100,
  tone = "primary",
  size = "md",
  label,
  showValue = false,
  ...props
}: ProgressProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = clamp(Number.isFinite(value) ? value : 0, 0, safeMax);
  const percentage = Math.round((safeValue / safeMax) * 100);

  return (
    <div className={sxClassName(props, cx(styles.root, className))} {...props}>
      {(label || showValue) && (
        <div className={styles.header}>
          {label ? <Text as="span" variant="span">{label}</Text> : <span />}
          {showValue ? <Text as="span" variant="span">{percentage}%</Text> : null}
        </div>
      )}
      <div
        className={cx(styles.track, cv(styles, "tone", tone, "primary"), cv(styles, "size", size, "md"))}
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
        aria-label={label}
      >
        <span className={styles.bar} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
