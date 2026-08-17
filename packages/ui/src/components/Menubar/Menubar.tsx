import styles from "./Menubar.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";
import { Link } from "@/components/Link";

export type MenubarProps = BaseProps;
export type MenubarItemProps = BaseProps & {
  href?: string;
  current?: boolean;
  disabled?: boolean;
};

function MenubarBase({ children, className = "", ...props }: MenubarProps) {
  return <nav className={sxClassName(props, cx(styles.root, className))} role="menubar" {...props}>{children}</nav>;
}

export function MenubarItem({ children, className = "", href, current = false, disabled = false, ...props }: MenubarItemProps) {
  const classNames = sxClassName(props, cx(styles.item, current && styles.current, disabled && styles.disabled, className));
  if (href) {
    return <Link className={classNames} href={href} disabled={disabled} noUnderline role="menuitem" aria-current={current ? "page" : undefined} {...props}>{children}</Link>;
  }
  return <button type="button" className={classNames} role="menuitem" disabled={disabled} aria-current={current ? "page" : undefined} {...props}>{children}</button>;
}

export const MenubarRoot = MenubarBase;
export const Menubar = Object.assign(MenubarBase, {
  Root: MenubarRoot,
  Item: MenubarItem
});
