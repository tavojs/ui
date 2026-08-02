import type { Child } from "@tavojs/core";
import styles from "./Chip.module.scss";
import { cv, cx, resolveAs, sxClassName, type BaseProps, type PolymorphicProps, type Size, type Tone } from "@/components/shared";
import { Text } from "@/components/Text";

export type ChipProps = BaseProps & PolymorphicProps & {
  tone?: Tone;
  size?: Size;
  selected?: boolean;
  removable?: boolean;
  removeLabel?: string;
  onRemove?: () => void;
  leading?: Child;
};

export function Chip({
  as,
  children,
  className = "",
  tone = "neutral",
  size = "md",
  selected = false,
  removable = false,
  removeLabel = "Remove",
  onRemove,
  leading,
  ...props
}: ChipProps) {
  const Component = resolveAs(as, "span") as unknown as "span";
  return (
    <Component
      className={sxClassName(props, cx(styles.chip, cv(styles, "tone", tone, "neutral"), cv(styles, "size", size, "md"), selected && styles.selected, className))}
      data-selected={selected ? "true" : undefined}
      {...props}
    >
      {leading ? <span className={styles.leading}>{leading}</span> : null}
      <Text className={styles.label} as="span" variant="span" color="inherit">{children}</Text>
      {removable ? (
        <button className={styles.remove} type="button" aria-label={removeLabel} onClick={onRemove}>
          x
        </button>
      ) : null}
    </Component>
  );
}
