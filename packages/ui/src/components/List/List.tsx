import type { Child } from "@tavojs/core";
import styles from "./List.module.scss";
import { cv, cx, sxClassName, type BaseProps, type Tone } from "@/components/shared";
import { Text } from "@/components/Text";

export type ListProps = BaseProps & {
  ordered?: boolean;
  marker?: Tone;
  spacing?: "sm" | "md" | "lg";
};

export type ListItemProps = BaseProps & {
  title?: Child;
  meta?: Child;
};

export function List({
  children,
  className = "",
  ordered = false,
  marker = "primary",
  spacing = "md",
  ...props
}: ListProps) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={sxClassName(props, cx(styles.list, cv(styles, "marker", marker, "primary"), cv(styles, "spacing", spacing, "md"), className))} {...props}>
      {children}
    </Tag>
  );
}

export function ListItem({ children, className = "", title, meta, ...props }: ListItemProps) {
  return (
    <li className={sxClassName(props, cx(styles.item, className))} {...props}>
      <div className={styles.header}>
        {title ? <Text as="span" variant="span" color="heading" className={styles.title}>{title}</Text> : null}
        {meta ? <Text as="span" variant="span" color="muted" className={styles.meta}>{meta}</Text> : null}
      </div>
      {children ? <div className={styles.body}>{children}</div> : null}
    </li>
  );
}
