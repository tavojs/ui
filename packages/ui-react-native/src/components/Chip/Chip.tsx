import { Badge, type BadgeProps } from "../Badge/index.js";
import { chipVariant } from "./Chip.styles.js";

export type ChipProps = BadgeProps & {
  selected?: boolean;
};

export function Chip({ selected = false, variant = "soft", ...props }: ChipProps) {
  return <Badge variant={chipVariant(selected, variant)} {...props} />;
}
