import styles from "./NavigationMenu.module.scss";
import { cv, cx, sxClassName, type BaseProps } from "@/components/shared";

export type NavigationMenuItem = {
  label: string;
  href?: string;
  description?: string;
  current?: boolean;
};

export type NavigationMenuProps = BaseProps & {
  items?: NavigationMenuItem[];
  orientation?: "horizontal" | "vertical";
};

export function NavigationMenu({ children, className = "", items, orientation = "horizontal", ...props }: NavigationMenuProps) {
  return (
    <nav className={sxClassName(props, cx(styles.root, cv(styles, "orientation", orientation, "horizontal"), className))} {...props}>
      {items ? (
        <ul className={styles.list}>
          {items.map((item) => (
            <li className={styles.item}>
              <a className={cx(styles.link, item.current && styles.current)} href={item.href} aria-current={item.current ? "page" : undefined}>
                <span>{item.label}</span>
                {item.description ? <small>{item.description}</small> : null}
              </a>
            </li>
          ))}
        </ul>
      ) : children}
    </nav>
  );
}
