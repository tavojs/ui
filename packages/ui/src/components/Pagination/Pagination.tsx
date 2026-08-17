import styles from "./Pagination.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";
import { Link } from "@/components/Link";

export type PaginationProps = {
  children?: BaseProps["children"];
  className?: string;
  id?: string;
  page: number;
  pageCount: number;
  siblingCount?: number;
  onChange?: (page: number) => void;
  getHref?: (page: number) => string;
  label?: string;
  [key: string]: unknown;
};

const MAX_SIBLING_COUNT = 100;

function finiteInteger(value: number, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.trunc(
    Math.min(Number.MAX_SAFE_INTEGER, Math.max(Number.MIN_SAFE_INTEGER, value))
  );
}

function pageRange(page: number, pageCount: number, siblingCount: number): number[] {
  const start = Math.max(1, page - siblingCount);
  const end = Math.min(pageCount, page + siblingCount);
  const pages = new Set([1, pageCount]);
  for (let offset = -siblingCount; offset <= siblingCount; offset += 1) {
    const value = page + offset;
    if (value >= start && value <= end) {
      pages.add(value);
    }
  }
  return [...pages].sort((a, b) => a - b);
}

export function Pagination({
  className = "",
  page,
  pageCount,
  siblingCount = 1,
  onChange,
  getHref,
  label = "Pagination",
  ...props
}: PaginationProps) {
  const safePageCount = Math.max(1, finiteInteger(pageCount, 1));
  const current = Math.min(Math.max(1, finiteInteger(page, 1)), safePageCount);
  const safeSiblingCount = Math.min(
    MAX_SIBLING_COUNT,
    Math.max(0, finiteInteger(siblingCount, 1))
  );
  const pages = pageRange(current, safePageCount, safeSiblingCount);
  const renderControl = (targetPage: number, labelText: string, disabled: boolean) => {
    const href = getHref?.(targetPage);

    if (href) {
      return (
        <Link
          className={cx(styles.control, disabled && styles.disabled)}
          href={href}
          disabled={disabled}
          noUnderline
          tabIndex={disabled ? -1 : undefined}
          onClick={() => {
            if (!disabled) onChange?.(targetPage);
          }}
        >
          {labelText}
        </Link>
      );
    }

    return (
      <button type="button" className={styles.control} disabled={disabled} onClick={() => onChange?.(targetPage)}>
        {labelText}
      </button>
    );
  };
  const renderPage = (item: number) => {
    const href = getHref?.(item);
    const isActive = item === current;

    if (href) {
      return (
        <Link
          className={cx(styles.page, isActive && styles.active)}
          href={href}
          noUnderline
          aria-current={isActive ? "page" : undefined}
          onClick={() => onChange?.(item)}
        >
          {item}
        </Link>
      );
    }

    return (
      <button
        type="button"
        className={cx(styles.page, isActive && styles.active)}
        aria-current={isActive ? "page" : undefined}
        onClick={() => onChange?.(item)}
      >
        {item}
      </button>
    );
  };

  return (
    <nav className={sxClassName(props, cx(styles.pagination, className))} aria-label={label} {...props}>
      {renderControl(current - 1, "Previous", current <= 1)}
      <ol className={styles.list}>
        {pages.map((item, index) => {
          const previous = pages[index - 1];
          const gap = previous !== undefined && item - previous > 1;
          return (
            <>
              {gap ? <li className={styles.gap} aria-hidden="true">...</li> : null}
              <li>{renderPage(item)}</li>
            </>
          );
        })}
      </ol>
      {renderControl(current + 1, "Next", current >= safePageCount)}
    </nav>
  );
}
