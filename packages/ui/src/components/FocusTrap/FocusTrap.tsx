import styles from "./FocusTrap.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";
import { trapFocus } from "@/components/a11y";

export type FocusTrapProps = BaseProps & {
  active?: boolean;
};

export function FocusTrap({ active = true, className = "", children, onKeyDown, ...props }: FocusTrapProps) {
  function handleKeyDown(event: KeyboardEvent) {
    if (active) {
      trapFocus(event);
    }
    onKeyDown?.(event);
  }

  return (
    <div className={sxClassName(props, cx(styles.root, className))} data-focus-trap={active ? "true" : "false"} onKeyDown={handleKeyDown} {...props}>
      {children}
    </div>
  );
}
