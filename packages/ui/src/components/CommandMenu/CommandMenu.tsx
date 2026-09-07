import styles from "./CommandMenu.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";
import { SearchInput } from "@/components/SearchInput";
import { Text } from "@/components/Text";
import { Link } from "@/components/Link";

export type CommandMenuItem = {
  label: string;
  description?: string;
  shortcut?: string;
  href?: string;
  disabled?: boolean;
  onSelect?: () => void;
};

export type CommandMenuProps = BaseProps & {
  items: CommandMenuItem[];
  placeholder?: string;
};

export function CommandMenu({ items = [], placeholder = "Search commands", className = "", ...props }: CommandMenuProps) {
  return (
    <div className={sxClassName(props, cx(styles.menu, className))} role="menu" {...props}>
      <SearchInput placeholder={placeholder} aria-label={placeholder} />
      <div className={styles.list}>
        {items.map((item) => (
          <CommandMenuItemView item={item} />
        ))}
      </div>
    </div>
  );
}

function CommandMenuItemContent({ item }: { item: CommandMenuItem }) {
  return (
    <>
      <Text as="span" variant="span" color="inherit" className={styles.copy}>
        <Text as="span" variant="span" color="heading" className={styles.label}>{item.label}</Text>
        {item.description && <Text as="span" variant="hint" color="muted" className={styles.description}>{item.description}</Text>}
      </Text>
      {item.shortcut && <kbd>{item.shortcut}</kbd>}
    </>
  );
}

function CommandMenuItemView({ item }: { item: CommandMenuItem }) {
  if (item.href) {
    return (
      <Link
        className={cx(styles.item, item.disabled && styles.disabled)}
        href={item.href}
        disabled={item.disabled}
        noUnderline
        tabIndex={item.disabled ? -1 : undefined}
        role="menuitem"
      >
        <CommandMenuItemContent item={item} />
      </Link>
    );
  }

  return (
    <button type="button" className={styles.item} disabled={item.disabled} role="menuitem" onClick={item.onSelect}>
      <CommandMenuItemContent item={item} />
    </button>
  );
}
