import styles from "./Button.module.scss";
import {
  cx,
  resolveAs,
  sxClassName,
  type BaseProps,
  type PolymorphicProps,
  type Size,
} from "@/components/shared";

export type ButtonVariant = "solid" | "soft" | "outline" | "ghost" | "text";
export type ButtonTone = "primary" | "secondary" | "neutral" | "danger";

export type ButtonProps = BaseProps &
  PolymorphicProps & {
    variant?: ButtonVariant;
    tone?: ButtonTone;
    size?: Size;
    loading?: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset" | string;
    iconOnly?: boolean;
    label?: string;
  };

export function Button({
  as,
  children,
  className = "",
  variant = "solid",
  tone = "primary",
  size = "md",
  loading = false,
  disabled = false,
  href,
  type,
  iconOnly = false,
  label,
  ...props
}: ButtonProps) {
  const ResolvedComponent = resolveAs(as, "button");
  const Component = ResolvedComponent as unknown as "button";
  const classNames = sxClassName(
    props,
    cx(
      styles.button,
      variant !== "solid" && styles[`variant-${variant}`],
      tone !== "primary" && styles[`tone-${tone}`],
      size !== "md" && styles[`size-${size}`],
      loading && styles.loading,
      iconOnly && styles.iconOnly,
      className
    )
  );
  const isDisabled = disabled || loading;
  const isButton = ResolvedComponent === "button";
  const isAnchor = ResolvedComponent === "a";
  const isCustomComponent = typeof ResolvedComponent !== "string";
  const navigationProps =
    href && (isAnchor || isCustomComponent)
      ? { href: isDisabled ? undefined : href }
      : {};

  return (
    <Component
      {...props}
      className={classNames}
      type={isButton ? type ?? "button" : undefined}
      disabled={isButton ? isDisabled : undefined}
      aria-disabled={!isButton && isDisabled ? "true" : undefined}
      aria-busy={loading ? "true" : undefined}
      aria-label={label}
      tabIndex={!isButton && isDisabled ? -1 : props.tabIndex}
      {...navigationProps}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
      {children}
    </Component>
  );
}
