import type { BadgeVariant } from "../Badge/index.js";

export function chipVariant(selected: boolean, variant: BadgeVariant): BadgeVariant {
  return selected ? "solid" : variant;
}
