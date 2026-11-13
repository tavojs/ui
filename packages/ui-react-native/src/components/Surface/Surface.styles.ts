import type { BoxProps } from "../Box/index.js";

export function surfaceRadius(radius: BoxProps["radius"]): BoxProps["radius"] {
  return radius ?? "surface";
}
