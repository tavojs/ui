import styles from "./Icon.module.scss";
import type { Component } from "@tavojs/core";
import { cx, styleObject, sxClassName, type Sx } from "@/components/shared";

export type IconProps = {
  children?: unknown;
  className?: string;
  component?: Component<Record<string, unknown>>;
  sx?: Sx;
  style?: Record<string, unknown>;
  width?: number | string;
  height?: number | string;
  viewBox?: string;
  [key: string]: unknown;
};

export function Icon({
  children,
  className = "",
  component: Component,
  sx,
  style,
  width = 24,
  height = 24,
  viewBox,
  ...props
}: IconProps) {
  const classNames = sxClassName(props, cx(styles.icon, className), sx);
  const baseStyle = styleObject(style);
  const componentProps = viewBox === undefined
    ? { className: classNames, style: baseStyle, width, height, ...props }
    : { className: classNames, style: baseStyle, width, height, viewBox, ...props };
  const element = Component ? (
    <Component {...componentProps} />
  ) : (
    <svg
      className={classNames}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={viewBox ?? "0 0 24 24"}
      fill="currentColor"
      style={baseStyle}
      {...props}
    >
      {children}
    </svg>
  );
  return element;
}
