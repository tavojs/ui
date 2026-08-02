import type { Child } from "@tavojs/core";
import styles from "./Card.module.scss";
import {
  cx,
  sxClassName,
  type BaseProps,
  type PolymorphicProps,
  type Tone,
} from "@/components/shared";
import { Box } from "@/components/Box";
import { Chip } from "@/components/Chip";
import { Text } from "@/components/Text";

export type CardProps = BaseProps &
  PolymorphicProps & {
    eyebrow?: Child;
    title?: Child;
    description?: Child;
    meta?: Child;
    tone?: Tone;
    actions?: Child;
    surface?: "default" | "raised";
  };

function CardBase({
  as,
  children,
  className = "",
  eyebrow,
  title,
  description,
  meta,
  tone = "neutral",
  actions,
  surface = "default",
  ...props
}: CardProps) {
  return (
    <Box
      as={as ?? "section"}
      surface={surface}
      padding="none"
      radius="surface"
      border
      shadow={surface === "raised"}
      className={sxClassName(props, cx(styles.card, className))}
      {...props}
    >
      {(eyebrow || meta || title || description || actions) && (
        <header className={styles.header}>
          <div className={styles.headline}>
            {meta ? (
              <Chip size="sm" tone={tone}>
                {meta}
              </Chip>
            ) : eyebrow ? (
              <Text className={styles.eyebrow} variant="hint" color="muted">
                {eyebrow}
              </Text>
            ) : null}
            {title ? (
              <Text
                className={styles.title}
                as="h2"
                variant="h3"
                color="heading"
              >
                {title}
              </Text>
            ) : null}
            {description ? (
              <Text className={styles.description} color="muted">
                {description}
              </Text>
            ) : null}
          </div>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </Box>
  );
}

export function CardHeader({ children, className = "", ...props }: BaseProps) {
  return (
    <div
      className={sxClassName(props, cx(styles.header, className))}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = "", ...props }: BaseProps) {
  return (
    <div className={sxClassName(props, cx(styles.body, className))} {...props}>
      {children}
    </div>
  );
}

export function CardActions({ children, className = "", ...props }: BaseProps) {
  return (
    <div
      className={sxClassName(props, cx(styles.actionsRow, className))}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardMedia({ className = "", ...props }: BaseProps) {
  return (
    <div
      className={sxClassName(props, cx(styles.media, className))}
      {...props}
    />
  );
}

export const CardRoot = CardBase;
export const Card = Object.assign(CardBase, {
  Root: CardRoot,
  Header: CardHeader,
  Content: CardContent,
  Actions: CardActions,
  Media: CardMedia,
});
