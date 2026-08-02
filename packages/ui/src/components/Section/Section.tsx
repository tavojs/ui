import type { Child } from "@tavojs/core";
import styles from "./Section.module.scss";
import { cx, responsiveClass, responsiveVars, resolveAs, styleObject, sxClassName, type BaseProps, type PolymorphicProps, type ResponsiveValue, type Spacing } from "@/components/shared";
import { Text } from "@/components/Text";

export type SectionTitleSize = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type SectionProps = BaseProps & PolymorphicProps & {
  eyebrow?: Child;
  title?: Child;
  titleSize?: SectionTitleSize;
  description?: Child;
  actions?: Child;
  spacing?: ResponsiveValue<Spacing>;
};

export function Section({
  as,
  children,
  className = "",
  eyebrow,
  title,
  titleSize = "h2",
  description,
  actions,
  spacing = "lg",
  style,
  ...props
}: SectionProps) {
  const Tag = resolveAs(as, "section") as unknown as "section";
  const hasHeader = eyebrow || title || description || actions;

  return (
    <Tag
      className={sxClassName(props, cx(styles.section, responsiveClass(styles, "spacing", spacing, "lg"), className))}
      style={{ ...styleObject(style), ...responsiveVars(spacing, "--tui-section-gap", (value) => spacingValues[value]) }}
      {...props}
    >
      {hasHeader ? (
        <header className={styles.header}>
          <div className={styles.copy}>
            {eyebrow ? <Text className={styles.eyebrow} variant="hint" color="muted">{eyebrow}</Text> : null}
            {title ? <Text className={styles.title} as={titleSize} variant={titleSize} color="heading">{title}</Text> : null}
            {description ? <Text className={styles.description} color="muted">{description}</Text> : null}
          </div>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </header>
      ) : null}
      {children ? <div className={styles.body}>{children}</div> : null}
    </Tag>
  );
}

const spacingValues: Record<Spacing, string> = {
  sm: "var(--tui-space-3)",
  md: "var(--tui-space-4)",
  lg: "var(--tui-space-6)"
};
