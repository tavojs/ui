import styles from "./Toggle.module.scss";
import { cv, cx, resolveAs, sxClassName, type BaseProps, type PolymorphicProps, type Size } from "@/components/shared";
import { Link } from "@/components/Link";

export type ToggleVariant = "default" | "outline" | "ghost";

export type ToggleProps = BaseProps & PolymorphicProps & {
  pressed?: boolean;
  size?: Size;
  variant?: ToggleVariant;
  disabled?: boolean;
  href?: string;
};

export function Toggle({
  as,
  children,
  className = "",
  pressed = false,
  size = "md",
  variant = "default",
  disabled = false,
  href,
  ...props
}: ToggleProps) {
  const ResolvedComponent = resolveAs(as, href ? "a" : "button");
  const Component = ResolvedComponent as unknown as "button";
  const classNames = sxClassName(
    props,
    cx(styles.toggle, cv(styles, "size", size, "md"), cv(styles, "variant", variant, "default"), pressed && styles.pressed, className)
  );

  if (!as && href) {
    return (
      <Link
        {...props}
        className={classNames}
        href={href}
        disabled={disabled}
        noUnderline
        aria-pressed={pressed ? "true" : "false"}
        tabIndex={disabled ? -1 : props.tabIndex}
      >
        {children}
      </Link>
    );
  }

  const isButton = ResolvedComponent === "button";
  const isAnchor = ResolvedComponent === "a";
  const isCustomComponent = typeof ResolvedComponent !== "string";
  const navigationProps = href && (isAnchor || isCustomComponent) ? { href: disabled ? undefined : href } : {};

  return (
    <Component
      className={classNames}
      type={isButton ? "button" : undefined}
      disabled={isButton ? disabled : undefined}
      aria-pressed={pressed ? "true" : "false"}
      aria-disabled={!isButton && disabled ? "true" : undefined}
      tabIndex={!isButton && disabled ? -1 : props.tabIndex}
      {...navigationProps}
      {...props}
    >
      {children}
    </Component>
  );
}
