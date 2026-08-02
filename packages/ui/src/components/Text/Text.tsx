import styles from "./Text.module.scss";
import { cv, cx, resolveAs, sxClassName, type BaseProps, type PolymorphicProps, type Tone } from "@/components/shared";

type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "body"
  | "hint"
  | "span";
type TextColor =
  | "auto"
  | "heading"
  | "muted"
  | "inherit"
  | "primary"
  | "secondary"
  | Tone;

export type TextProps = BaseProps & PolymorphicProps & {
  variant?: TextVariant;
  color?: TextColor;
  tone?: Tone | "default";
  error?: boolean;
};

export function Text({
  as,
  children,
  className = "",
  variant = "body",
  color,
  tone = "default",
  error = false,
  ...props
}: TextProps) {
  const styleVariant = variant === "p" ? "body" : variant;
  const tag = resolveAs(
    as,
    variant.startsWith("h") ? variant : variant === "span" ? "span" : "p"
  );
  const Tag = tag as unknown as "p";
  const resolvedColor = error
    ? "danger"
    : (color ??
      (tone !== "default"
        ? tone
        : variant.startsWith("h")
          ? "heading"
          : variant === "hint"
            ? "muted"
            : "auto"));

  return (
    <Tag
      className={sxClassName(props, cx(
        styles.text,
        cv(styles, "variant", styleVariant, "body"),
        cv(styles, "color", resolvedColor, "auto"),
        className,
      ))}
      {...props}
    >
      {children}
    </Tag>
  );
}
