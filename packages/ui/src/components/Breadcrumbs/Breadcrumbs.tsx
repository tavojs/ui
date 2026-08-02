import type { Child } from "@tavojs/core";
import styles from "./Breadcrumbs.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";
import { Link } from "@/components/Link";
import { Text } from "@/components/Text";

export type BreadcrumbItem = {
  label: Child;
  href?: string;
  current?: boolean;
};

export type BreadcrumbsProps = BaseProps & {
  items?: BreadcrumbItem[];
  separator?: Child;
  label?: string;
};

export function Breadcrumbs({
  children,
  className = "",
  items,
  separator = "/",
  label = "Breadcrumb",
  ...props
}: BreadcrumbsProps) {
  return (
    <nav className={sxClassName(props, cx(styles.nav, className))} aria-label={label} {...props}>
      <ol className={styles.list}>
        {items
          ? items.map((item, index) => {
              const isLast = index === items.length - 1;
              const current = item.current || isLast;
              return (
                <li className={styles.item} key={index}>
                  {item.href && !current ? (
                    <Link href={item.href} noUnderline>{item.label}</Link>
                  ) : (
                    <Text as="span" variant="span" color="inherit" className={styles.current} aria-current={current ? "page" : undefined}>{item.label}</Text>
                  )}
                  {!isLast ? <Text as="span" variant="span" color="inherit" className={styles.separator} aria-hidden="true">{separator}</Text> : null}
                </li>
              );
            })
          : children}
      </ol>
    </nav>
  );
}

export function BreadcrumbItem({ children, className = "", ...props }: BaseProps) {
  return <li className={sxClassName(props, cx(styles.item, className))} {...props}>{children}</li>;
}

export function BreadcrumbSeparator({ children = "/", className = "", ...props }: BaseProps) {
  return <Text as="span" variant="span" color="inherit" className={sxClassName(props, cx(styles.separator, className))} aria-hidden="true" {...props}>{children}</Text>;
}
