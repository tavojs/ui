import styles from "./Avatar.module.scss";
import { cv, cx, sxClassName, type BaseProps, type Size } from "@/components/shared";
import { Image } from "@/components/Image";

const SOFT_COLORS = ["#E89BA0", "#E6B17E", "#E8D48B", "#B9E37B", "#90E3B3", "#90A9E6", "#AE90E6", "#D090E6"];

export type AvatarProps = BaseProps & {
  src?: string | null;
  alt?: string;
  size?: Size;
  initials?: string;
};

export function Avatar({ className = "", src = null, alt = "", size = "md", initials, children, ...props }: AvatarProps) {
  const label = initials ?? (typeof children === "string" ? children : "");
  const colorIndex = label ? label.charCodeAt(0) % SOFT_COLORS.length : 0;

  if (src) {
    return <Image src={src} alt={alt} className={sxClassName(props, cx(styles.avatar, styles.image, cv(styles, "size", size, "md"), className))} {...props} />;
  }

  return (
    <div
      className={sxClassName(props, cx(styles.avatar, cv(styles, "size", size, "md"), styles.fallback, className))}
      style={{ backgroundColor: SOFT_COLORS[colorIndex] }}
      aria-label={alt || label}
      {...props}
    >
      {label || children}
    </div>
  );
}
