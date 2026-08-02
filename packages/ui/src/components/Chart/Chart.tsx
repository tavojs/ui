import styles from "./Chart.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";

export type ChartDatum = {
  label: string;
  value: number;
  tone?: "primary" | "secondary" | "neutral" | "success" | "warning" | "danger" | "info";
};

export type ChartProps = BaseProps & {
  data: ChartDatum[];
  max?: number;
  label?: string;
};

export function Chart({ className = "", data, max, label = "Chart", ...props }: ChartProps) {
  let resolvedMax = Number.isFinite(max) && (max as number) > 0 ? (max as number) : 1;
  if (!Number.isFinite(max) || (max as number) <= 0) {
    for (const item of data) {
      if (Number.isFinite(item.value) && item.value > resolvedMax) {
        resolvedMax = item.value;
      }
    }
  }

  return (
    <div className={sxClassName(props, cx(styles.root, className))} role="figure" aria-label={label} {...props}>
      {data.map((item) => {
        const displayValue = Number.isFinite(item.value) ? item.value : 0;
        const barValue = Math.max(0, displayValue);
        const percentage = Math.max(0, Math.min(100, (barValue / resolvedMax) * 100));
        return (
          <div className={styles.row}>
            <span className={styles.label}>{item.label}</span>
            <div className={styles.track}>
              <span className={cx(styles.bar, item.tone && styles[`tone-${item.tone}`])} style={{ width: `${percentage}%` }} />
            </div>
            <span className={styles.value}>{displayValue}</span>
          </div>
        );
      })}
    </div>
  );
}
