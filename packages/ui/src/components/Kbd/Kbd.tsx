import styles from "./Kbd.module.scss";
import { cx, resolveAs, sxClassName, type BaseProps, type PolymorphicProps } from "@/components/shared";

export type KbdProps = BaseProps & PolymorphicProps;

export function Kbd({ as, children, className = "", ...props }: KbdProps) {
  const Component = resolveAs(as, "kbd") as unknown as "kbd";
  return <Component className={sxClassName(props, cx(styles.kbd, className))} {...props}>{children}</Component>;
}
