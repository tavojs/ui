import type { Child } from "@tavojs/core";
import styles from "./Timeline.module.scss";
import { cv, cx, sxClassName, type BaseProps, type Tone } from "@/components/shared";
import { Text } from "@/components/Text";

export type TimelineProps = BaseProps;

export type TimelineItemProps = BaseProps & {
  title?: Child;
  meta?: Child;
  tone?: Tone;
};

export function Timeline({ children, className = "", ...props }: TimelineProps) {
  return <ol className={sxClassName(props, cx(styles.timeline, className))} {...props}>{children}</ol>;
}

export function TimelineItem({ children, className = "", title, meta, tone = "primary", ...props }: TimelineItemProps) {
  return (
    <li className={sxClassName(props, cx(styles.item, cv(styles, "tone", tone, "primary"), className))} {...props}>
      <span className={styles.marker} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.header}>
          {title ? <Text className={styles.title} as="span" variant="span" color="heading">{title}</Text> : null}
          {meta ? <Text className={styles.meta} as="span" variant="span" color="muted">{meta}</Text> : null}
        </div>
        {children ? <div className={styles.body}>{children}</div> : null}
      </div>
    </li>
  );
}
