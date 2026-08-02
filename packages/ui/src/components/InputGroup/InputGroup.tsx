import type { Child } from "@tavojs/core";
import styles from "./InputGroup.module.scss";
import { cv, cx, sxClassName, type BaseProps, type Size } from "@/components/shared";

export type InputGroupProps = BaseProps & {
  size?: Size;
};

export type InputGroupAddonProps = BaseProps & {
  position?: "start" | "end";
};

export type InputGroupInputProps = BaseProps & {
  type?: string;
  name?: string;
  value?: string | number;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
};

function InputGroupBase({ children, className = "", size = "md", ...props }: InputGroupProps) {
  return <div className={sxClassName(props, cx(styles.root, cv(styles, "size", size, "md"), className))} {...props}>{children}</div>;
}

export function InputGroupAddon({ children, className = "", position = "start", ...props }: InputGroupAddonProps) {
  return <span className={sxClassName(props, cx(styles.addon, cv(styles, "position", position, "start"), className))} {...props}>{children}</span>;
}

export function InputGroupInput({ className = "", type = "text", ...props }: InputGroupInputProps) {
  return <input className={sxClassName(props, cx(styles.input, className))} type={type} {...props} />;
}

export function InputGroupButton({ children, className = "", ...props }: BaseProps & { children?: Child }) {
  return <button type="button" className={sxClassName(props, cx(styles.button, className))} {...props}>{children}</button>;
}

export const InputGroupRoot = InputGroupBase;
export const InputGroup = Object.assign(InputGroupBase, {
  Root: InputGroupRoot,
  Addon: InputGroupAddon,
  Input: InputGroupInput,
  Button: InputGroupButton
});
