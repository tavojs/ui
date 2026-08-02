import styles from "./Menubar.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";

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
    return <a className={classNames} href={disabled ? undefined : href} role="menuitem" aria-current={current ? "page" : undefined} aria-disabled={disabled ? "true" : undefined} {...props}>{children}</a>;
  }
  return <button type="button" className={classNames} role="menuitem" disabled={disabled} aria-current={current ? "page" : undefined} {...props}>{children}</button>;
}

export const MenubarRoot = MenubarBase;
export const Menubar = Object.assign(MenubarBase, {
  Root: MenubarRoot,
  Item: MenubarItem
});
