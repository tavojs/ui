import {
  DEFAULT_I18N_SERVICE_NAME,
  getService,
  hasService,
  type AnyI18nService
} from "@tavojs/core";
import { createRouter } from "@tavojs/core/router";
import styles from "./Link.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";

export type LinkProps = BaseProps & {
  href?: string;
  to?: string;
  replace?: boolean;
  scroll?: boolean;
  disabled?: boolean;
  noUnderline?: boolean;
};

const navigationRouter = createRouter([]);
const unsafeProtocolPattern = /^\s*(?:javascript|data|vbscript):/i;

function safeTarget(target: string | undefined): string | undefined {
  return target && !unsafeProtocolPattern.test(target) ? target : undefined;
}

function resolveUrl(target: string): URL | null {
  if (typeof window === "undefined") return null;
  try {
    return new URL(target, window.location.href);
  } catch {
    return null;
  }
}

function activeI18n(): AnyI18nService | undefined {
  return hasService(DEFAULT_I18N_SERVICE_NAME)
    ? getService<AnyI18nService>(DEFAULT_I18N_SERVICE_NAME)
    : undefined;
}

function localizeTarget(target: string, i18n: AnyI18nService | undefined): string {
  if (!i18n || target.startsWith("#")) return target;
  const url = resolveUrl(target);
  if (url) {
    if (url.origin !== window.location.origin) return target;
    return `${i18n.localizePath(url.pathname)}${url.search}${url.hash}`;
  }
  const [withoutHash, hash = ""] = target.split("#", 2);
  const [pathname = "/", search = ""] = withoutHash.split("?", 2);
  return `${i18n.localizePath(pathname || "/")}${search ? `?${search}` : ""}${hash ? `#${hash}` : ""}`;
}

function shouldNavigate(event: MouseEvent, target: string, anchorTarget: unknown, download: unknown): boolean {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }
  if ((typeof anchorTarget === "string" && anchorTarget !== "" && anchorTarget !== "_self") || download !== undefined) {
    return false;
  }
  const url = resolveUrl(target);
  if (!url || url.origin !== window.location.origin) return false;
  return !(url.pathname === window.location.pathname && url.search === window.location.search && url.hash);
}

export function Link({
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
  const rawTarget = to ?? href;
  const safeHref = disabled ? undefined : safeTarget(rawTarget);
  const localizedHref = safeHref && to ? localizeTarget(safeHref, activeI18n()) : safeHref;
  const explicitCurrent = props["aria-current"];
  const current = explicitCurrent ?? (() => {
    const url = localizedHref ? resolveUrl(localizedHref) : null;
    return url && url.origin === window.location.origin && url.pathname === window.location.pathname
      ? "page"
      : undefined;
  })();

  return (
    <a
      className={classNames}
      href={localizedHref}
      aria-disabled={disabled ? "true" : undefined}
      aria-current={current}
      onClick={(event: MouseEvent) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        (onClick as ((event: Event) => void) | undefined)?.(event as unknown as Event);
        if (!to || !localizedHref || !shouldNavigate(event, localizedHref, props.target, props.download)) return;
        event.preventDefault();
        const url = resolveUrl(localizedHref);
        navigationRouter.navigate(url ? `${url.pathname}${url.search}${url.hash}` : localizedHref, {
          replace,
          scroll
        });
      }}
      {...props}
    >
      {children}
    </a>
  );
}
