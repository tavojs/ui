import { Link as FrameworkLink } from "@tavojs/core/router";
import styles from "./Link.module.scss";
import {
  cx,
  sxClassName,
  type BaseProps,
  type PolymorphicProps,
} from "@/components/shared";

export type LinkProps = BaseProps &
  PolymorphicProps & {
    href?: string;
    to?: string;
    replace?: boolean;
    scroll?: boolean;
    disabled?: boolean;
    noUnderline?: boolean;
  };

const unsafeProtocolPattern = /^\s*(?:javascript|data|vbscript):/i;

function safeTarget(target: string | undefined): string | undefined {
  return target && !unsafeProtocolPattern.test(target) ? target : undefined;
}

export function Link({
  as,
  children,
  className = "",
  disabled = false,
  noUnderline = false,
  href,
  to,
  replace,
  scroll,
  onClick,
  ...props
}: LinkProps) {
  const classNames = sxClassName(
    props,
    cx(styles.link, noUnderline && styles.noUnderline, disabled && styles.disabled, className)
  );
  const target = safeTarget(to ?? href);
  if (as) {
    const Component = as as unknown as "a";
    const isAnchor = as === "a";
    const isCustomComponent = typeof as !== "string";

    return (
      <Component
        {...props}
        className={classNames}
        href={
          !disabled && (isAnchor || (isCustomComponent && href))
            ? target
            : undefined
        }
        to={!disabled && isCustomComponent ? to : undefined}
        replace={isCustomComponent ? replace : undefined}
        scroll={isCustomComponent ? scroll : undefined}
        aria-disabled={disabled ? "true" : undefined}
        onClick={(event: MouseEvent) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
      >
        {children}
      </Component>
    );
  }

  if (!target || disabled) {
    return (
      <a
        {...props}
        className={classNames}
        aria-disabled={disabled ? "true" : undefined}
        onClick={(event: MouseEvent) => {
          if (disabled) event.preventDefault();
          else onClick?.(event);
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <FrameworkLink
      {...props}
      to={target}
      replace={replace}
      scroll={scroll}
      className={classNames}
      onClick={onClick}
    >
      {children}
    </FrameworkLink>
  );
}
