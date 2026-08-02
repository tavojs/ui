import styles from "./Skeleton.module.scss";
import { cv, cx, resolveAs, styleObject, sxClassName, type BaseProps, type PolymorphicProps } from "@/components/shared";

export type SkeletonProps = BaseProps & PolymorphicProps & {
  width?: number | string;
  height?: number | string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
};

export function Skeleton({
  as,
  className = "",
  width,
  height,
  variant = "rectangular",
  style,
  ...props
}: SkeletonProps) {
  const Component = resolveAs(as, "div") as unknown as "div";
  const baseStyle = styleObject(style);
  return (
    <Component
      className={sxClassName(props, cx(styles.skeleton, cv(styles, "variant", variant, "rectangular"), className))}
      style={{ ...baseStyle, width, height }}
      {...props}
    />
  );
}
