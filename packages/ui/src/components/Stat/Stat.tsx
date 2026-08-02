import type { Child } from "@tavojs/core";
import styles from "./Stat.module.scss";
import { cv, cx, sxClassName, type BaseProps, type Tone } from "@/components/shared";
import { Text } from "@/components/Text";

export type StatProps = BaseProps & {
  label?: Child;
  value?: Child;
  hint?: Child;
  trend?: Child;
  tone?: Tone;
};

export function Stat({ children, className = "", label, value, hint, trend, tone = "neutral", ...props }: StatProps) {
  return (
    <section className={sxClassName(props, cx(styles.stat, cv(styles, "tone", tone, "neutral"), className))} {...props}>
      <div className={styles.header}>
        {label ? <Text className={styles.label} variant="hint" color="muted">{label}</Text> : null}
        {trend ? <Text className={styles.trend} as="span" variant="span" color="muted">{trend}</Text> : null}
      </div>
      {value ? <Text className={styles.value} variant="h2" as="p" color="heading">{value}</Text> : null}
      {hint ? <Text className={styles.hint} variant="hint" color="muted">{hint}</Text> : null}
      {children}
    </section>
  );
}
