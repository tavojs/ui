import styles from "./Shell.module.scss";
import { cv, cx, sxClassName, type BaseProps } from "@/components/shared";

export type ShellProps = BaseProps & {
  sidebar?: BaseProps["children"];
  header?: BaseProps["children"];
  rail?: "left" | "right";
};

export function Shell({ sidebar, header, rail = "left", className = "", children, ...props }: ShellProps) {
  return (
    <div className={sxClassName(props, cx(styles.shell, cv(styles, "rail", rail, "left"), className))} {...props}>
      {header && <div className={styles.header}>{header}</div>}
      {sidebar && <aside className={styles.sidebar}>{sidebar}</aside>}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
