import styles from "./PropertyList.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";

export type PropertyListProps = BaseProps & {
  divided?: boolean;
};

export type PropertyItemProps = BaseProps & {
  label: string;
  value?: BaseProps["children"];
};

export function PropertyList({ children, className = "", divided = true, ...props }: PropertyListProps) {
  return <dl className={sxClassName(props, cx(styles.list, divided && styles.divided, className))} {...props}>{children}</dl>;
}

export function PropertyItem({ label, value, children, className = "", ...props }: PropertyItemProps) {
  return (
    <div className={sxClassName(props, cx(styles.item, className))} {...props}>
      <dt>{label}</dt>
      <dd>{value ?? children}</dd>
    </div>
  );
}
