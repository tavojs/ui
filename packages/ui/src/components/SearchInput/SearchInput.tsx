import type { Child } from "@tavojs/core";
import styles from "./SearchInput.module.scss";
import inputStyles from "../TextInput/TextInput.module.scss";
import {
  cv,
  cx,
  sxClassName,
  type BaseProps,
  type Size,
  type ValueChangeHandler
} from "@/components/shared";

export type SearchInputProps = Omit<BaseProps, "children" | "onChange" | "onInput"> & {
  className?: string;
  inputClassName?: string;
  size?: Size;
  value?: string;
  defaultValue?: string;
  name?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: string;
  required?: boolean;
  readOnly?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  type?: never;
  clearable?: boolean;
  clearLabel?: string;
  loading?: boolean;
  leading?: Child;
  trailing?: Child;
  onClear?: () => void;
  onChange?: ValueChangeHandler<HTMLInputElement>;
  onInput?: ValueChangeHandler<HTMLInputElement>;
};

export function SearchInput({
  className = "",
  inputClassName = "",
  size = "md",
  value,
  defaultValue,
  clearable = false,
  clearLabel = "Clear search",
  loading = false,
  leading,
  trailing,
  onClear,
  sx,
  ...props
}: SearchInputProps) {
  const hasValue = value !== undefined && value.length > 0;
  const showClear = clearable && hasValue && Boolean(onClear) && !props.disabled && !props.readOnly;
  const hasTrailingContent = loading || showClear || trailing !== undefined;

  return (
    <span
      className={sxClassName(
        { sx },
        cx(
          styles.root,
          cv(styles, "size", size, "md"),
          (props["aria-invalid"] === "true" || props["aria-invalid"] === true) && styles.invalid,
          className
        )
      )}
    >
      <span className={styles.leading} aria-hidden={leading === undefined ? "true" : undefined}>
        {leading ?? <span className={styles.searchIcon} />}
      </span>
      <input
        {...props}
        type="search"
        value={value}
        defaultValue={defaultValue}
        aria-busy={loading ? "true" : props["aria-busy"]}
        className={cx(
          inputStyles.input,
          styles.input,
          hasTrailingContent && styles.hasTrailing,
          showClear && styles.customClear,
          inputClassName
        )}
      />
      {hasTrailingContent ? (
        <span className={styles.trailing}>
          {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
          {trailing}
          {showClear ? (
            <button
              type="button"
              className={styles.clear}
              aria-label={clearLabel}
              onClick={onClear}
            >
              <span aria-hidden="true">×</span>
            </button>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
