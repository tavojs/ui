import type { ScaledSize } from "react-native";
import type { NativeTheme } from "./native.js";

export type Breakpoint = "base" | "sm" | "md" | "lg";
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

const breakpointOrder: Breakpoint[] = ["base", "sm", "md", "lg"];

function isResponsiveRecord<T>(value: ResponsiveValue<T>): value is Partial<Record<Breakpoint, T>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function resolveResponsiveValue<T>(
  value: ResponsiveValue<T> | undefined,
  theme: Pick<NativeTheme, "breakpoints">,
  window: Pick<ScaledSize, "width">,
  fallback: T
): T {
  if (value === undefined) {
    return fallback;
  }
  if (!isResponsiveRecord(value)) {
    return value;
  }

  let resolved = value.base ?? fallback;
  for (const breakpoint of breakpointOrder) {
    if (breakpoint === "base") {
      continue;
    }
    if (window.width >= theme.breakpoints[breakpoint] && value[breakpoint] !== undefined) {
      resolved = value[breakpoint] as T;
    }
  }
  return resolved;
}
