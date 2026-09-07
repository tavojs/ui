import type { Child } from "@tavojs/core";
import styles from "./Stepper.module.scss";
import { cv, cx, sxClassName, type BaseProps } from "@/components/shared";
import { Text } from "@/components/Text";

export type StepStatus = "complete" | "current" | "upcoming" | "error";

type StepItemBase = {
  id?: string;
  description?: Child;
  status?: StepStatus;
};

export type StepItem = StepItemBase & (
  | { title: Child; label?: Child }
  | { label: Child; title?: Child }
);

export type StepperProps = BaseProps & {
  steps: StepItem[];
  orientation?: "horizontal" | "vertical";
};

export function Stepper({ steps = [], orientation = "horizontal", className = "", ...props }: StepperProps) {
  return (
    <ol className={sxClassName(props, cx(styles.stepper, cv(styles, "orientation", orientation, "horizontal"), className))} {...props}>
      {steps.map((step, index) => {
        const status = step.status ?? "upcoming";
        const title = step.title ?? step.label;
        return (
          <li className={cx(styles.step, styles[`status-${status}`])} aria-current={status === "current" ? "step" : undefined}>
            <span className={styles.marker}>{status === "complete" ? "✓" : index + 1}</span>
            <span className={styles.copy}>
              <Text className={styles.title} as="span" variant="span" color="heading">{title}</Text>
              {step.description ? <Text className={styles.description} as="span" variant="span" color="muted">{step.description}</Text> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
