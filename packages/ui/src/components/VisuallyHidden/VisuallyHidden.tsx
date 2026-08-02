import styles from "./VisuallyHidden.module.scss";
import { cx, resolveAs, sxClassName, type BaseProps, type PolymorphicProps } from "@/components/shared";

export type VisuallyHiddenProps = BaseProps & PolymorphicProps & {
  focusable?: boolean;
};

export function VisuallyHidden({ as, focusable = false, className = "", children, ...props }: VisuallyHiddenProps) {
  const Component = resolveAs(as, "span") as unknown as "span";
  return (
    <Component className={sxClassName(props, cx(styles.root, focusable && styles.focusable, className))} {...props}>
      {children}
    </Component>
  );
}
