import styles from "./Overlay.module.scss";
import { cv, cx, sxClassName, type BaseProps } from "@/components/shared";

export type OverlayProps = BaseProps & {
  open?: boolean;
  scrim?: "none" | "soft" | "strong";
  center?: boolean;
};

export function Overlay({ open = true, scrim = "soft", center = true, className = "", children, ...props }: OverlayProps) {
  if (!open) {
    return null;
  }

  return (
    <div className={sxClassName(props, cx(styles.overlay, cv(styles, "scrim", scrim, "soft"), center && styles.center, className))} {...props}>
      {children}
    </div>
  );
}
