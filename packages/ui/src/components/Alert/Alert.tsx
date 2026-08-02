import type { Child } from "@tavojs/core";
import styles from "./Alert.module.scss";
import { cv, cx, resolveAs, sxClassName, type BaseProps, type PolymorphicProps } from "@/components/shared";
import { Text } from "@/components/Text";

export type AlertTone = "info" | "success" | "warning" | "danger";

export type AlertProps = BaseProps & PolymorphicProps & {
  title?: Child;
  tone?: AlertTone;
};

export function Alert({ as, children, className = "", title, tone = "info", ...props }: AlertProps) {
  const Component = resolveAs(as, "div") as unknown as "div";
  return (
    <Component className={sxClassName(props, cx(styles.alert, cv(styles, "tone", tone, "info"), className))} role="status" {...props}>
      {title ? <Text as="span" variant="span" color="heading" className={styles.title}>{title}</Text> : null}
      <Text as="span" variant="span">{children}</Text>
    </Component>
  );
}
