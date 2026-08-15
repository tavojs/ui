import styles from "./Calendar.module.scss";
import { cx, sxClassName, type BaseProps } from "@/components/shared";

export type CalendarProps = BaseProps & {
  year?: number;
  month?: number;
  yearRange?: {
    start: number;
    end: number;
  };
  selected?: string;
  min?: string;
  max?: string;
  locale?: string;
  onSelect?: (value: string) => void;
  onMonthChange?: (year: number, month: number) => void;
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthDayCache = new Map<string, Array<CalendarDay | null>>();
const monthTitleCache = new Map<string, string>();
const monthNamesCache = new Map<string, string[]>();
const monthFormatterCache = new Map<string, Intl.DateTimeFormat>();
const MONTH_CACHE_LIMIT = 240;
const FORMATTER_CACHE_LIMIT = 32;

type CalendarDay = {
  day: number;
  value: string;
};

function readCache<K, V>(cache: Map<K, V>, key: K): V | undefined {
  const value = cache.get(key);
  if (value !== undefined) {
    cache.delete(key);
    cache.set(key, value);
  }
  return value;
}

function writeCache<K, V>(cache: Map<K, V>, key: K, value: V, limit: number): void {
  if (cache.size >= limit) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) {
      cache.delete(oldest);
    }
  }
  cache.set(key, value);
}

function toDateValue(date: Date): string {
  return toDateValueParts(date.getFullYear(), date.getMonth(), date.getDate());
}

function resolveMonth(year: number | undefined, month: number | undefined, fallback: Date) {
  const requestedYear = Number.isFinite(year) ? Math.trunc(year as number) : fallback.getFullYear();
  const requestedMonth = Number.isFinite(month) ? Math.trunc(month as number) : fallback.getMonth();
  const start = new Date(0);
  start.setHours(0, 0, 0, 0);
  start.setFullYear(requestedYear, requestedMonth, 1);
  if (!Number.isFinite(start.getTime())) {
    return { year: fallback.getFullYear(), month: fallback.getMonth() };
  }
  return { year: start.getFullYear(), month: start.getMonth() };
}

function toDateValueParts(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isDisabled(value: string, min?: string, max?: string): boolean {
  return Boolean((min && value < min) || (max && value > max));
}

function getMonthDays(year: number, month: number): Array<CalendarDay | null> {
  const key = `${year}:${month}`;
  const cached = readCache(monthDayCache, key);
  if (cached) {
    return cached;
  }

  const first = new Date(year, month, 1);
  const count = new Date(year, month + 1, 0).getDate();
  const days: Array<CalendarDay | null> = Array.from({ length: first.getDay() }, () => null);
  for (let day = 1; day <= count; day += 1) {
    days.push({ day, value: toDateValueParts(year, month, day) });
  }
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  writeCache(monthDayCache, key, days, MONTH_CACHE_LIMIT);
  return days;
}

function getMonthTitle(locale: string, year: number, month: number): string {
  const key = `${locale}:${year}:${month}`;
  const cached = readCache(monthTitleCache, key);
  if (cached) {
    return cached;
  }

  let formatter = readCache(monthFormatterCache, locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
    writeCache(monthFormatterCache, locale, formatter, FORMATTER_CACHE_LIMIT);
  }
  const title = formatter.format(new Date(year, month, 1));
  writeCache(monthTitleCache, key, title, MONTH_CACHE_LIMIT);
  return title;
}

function getMonthNames(locale: string): string[] {
  const cached = readCache(monthNamesCache, locale);
  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat(locale, { month: "long" });
  const names = Array.from({ length: 12 }, (_, month) => formatter.format(new Date(2020, month, 1)));
  writeCache(monthNamesCache, locale, names, FORMATTER_CACHE_LIMIT);
  return names;
}

function getDateYear(value: string | undefined): number | undefined {
  const match = value?.match(/^(\d{4,})-\d{2}-\d{2}$/);
  if (!match) {
    return undefined;
  }
  const year = Number(match[1]);
  return Number.isFinite(year) ? year : undefined;
}

function getYears(
  resolvedYear: number,
  yearRange: CalendarProps["yearRange"],
  min: string | undefined,
  max: string | undefined
): number[] {
  const requestedStart = Number.isFinite(yearRange?.start)
    ? Math.trunc(yearRange!.start)
    : (getDateYear(min) ?? resolvedYear - 10);
  const requestedEnd = Number.isFinite(yearRange?.end)
    ? Math.trunc(yearRange!.end)
    : (getDateYear(max) ?? resolvedYear + 10);
  const start = Math.min(requestedStart, requestedEnd, resolvedYear);
  const end = Math.max(requestedStart, requestedEnd, resolvedYear);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function isMonthDisabled(year: number, month: number, min?: string, max?: string): boolean {
  const first = toDateValueParts(year, month, 1);
  const last = toDateValueParts(year, month, new Date(year, month + 1, 0).getDate());
  return Boolean((min && last < min) || (max && first > max));
}

function isYearDisabled(year: number, min?: string, max?: string): boolean {
  const first = toDateValueParts(year, 0, 1);
  const last = toDateValueParts(year, 11, 31);
  return Boolean((min && last < min) || (max && first > max));
}

export function Calendar({
  className = "",
  year,
  month,
  yearRange,
  selected,
  min,
  max,
  locale = "en-US",
  onSelect,
  onMonthChange,
  ...props
}: CalendarProps) {
  const now = new Date();
  const { year: resolvedYear, month: resolvedMonth } = resolveMonth(year, month, now);
  const title = getMonthTitle(locale, resolvedYear, resolvedMonth);
  const today = toDateValue(now);
  const days = getMonthDays(resolvedYear, resolvedMonth);
  const monthNames = onMonthChange ? getMonthNames(locale) : [];
  const years = onMonthChange ? getYears(resolvedYear, yearRange, min, max) : [];
  const previousMonth = resolveMonth(resolvedYear, resolvedMonth - 1, now);
  const nextMonth = resolveMonth(resolvedYear, resolvedMonth + 1, now);

  return (
    <div className={sxClassName(props, cx(styles.root, className))} {...props}>
      {onMonthChange ? (
        <div className={styles.picker} role="group" aria-label="Choose month and year">
          <div className={styles.titleSelectors}>
            <label className={styles.titleSelectControl}>
              <span className={styles.visuallyHidden}>Month</span>
              <span className={styles.titleValue} aria-hidden="true">
                {monthNames[resolvedMonth]}
              </span>
              <select
                className={styles.titleSelector}
                aria-label="Month"
                value={String(resolvedMonth)}
                onInput={(event: Event) => {
                  const nextMonthValue = Number((event.currentTarget as HTMLSelectElement).value);
                  if (Number.isInteger(nextMonthValue)) {
                    onMonthChange(resolvedYear, nextMonthValue);
                  }
                }}
              >
                {monthNames.map((name, index) => (
                  <option
                    value={String(index)}
                    disabled={isMonthDisabled(resolvedYear, index, min, max)}
                  >
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.titleSelectControl}>
              <span className={styles.visuallyHidden}>Year</span>
              <span className={styles.titleValue} aria-hidden="true">
                {resolvedYear}
              </span>
              <select
                className={styles.titleSelector}
                aria-label="Year"
                value={String(resolvedYear)}
                onInput={(event: Event) => {
                  const nextYear = Number((event.currentTarget as HTMLSelectElement).value);
                  if (Number.isInteger(nextYear)) {
                    onMonthChange(nextYear, resolvedMonth);
                  }
                }}
              >
                {years.map((optionYear) => (
                  <option
                    value={String(optionYear)}
                    disabled={isYearDisabled(optionYear, min, max)}
                  >
                    {optionYear}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className={styles.navigation}>
            <button
              type="button"
              className={styles.navigationButton}
              aria-label="Previous month"
              disabled={isMonthDisabled(previousMonth.year, previousMonth.month, min, max)}
              onClick={() => onMonthChange(previousMonth.year, previousMonth.month)}
            >
              <span className={cx(styles.navigationIcon, styles.previousIcon)} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.navigationButton}
              aria-label="Next month"
              disabled={isMonthDisabled(nextMonth.year, nextMonth.month, min, max)}
              onClick={() => onMonthChange(nextMonth.year, nextMonth.month)}
            >
              <span className={cx(styles.navigationIcon, styles.nextIcon)} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <h2 className={styles.title}>{title}</h2>
      )}
      <div className={styles.grid} role="grid" aria-label={title}>
        {weekDays.map((day) => <span className={styles.weekday}>{day}</span>)}
        {days.map((date) => {
          if (date === null) {
            return <span className={styles.empty} aria-hidden="true" />;
          }
          const value = date.value;
          const disabled = isDisabled(value, min, max);
          return (
            <button
              type="button"
              className={cx(styles.day, value === selected && styles.selected, value === today && styles.today)}
              disabled={disabled}
              aria-pressed={value === selected ? "true" : "false"}
              data-value={value}
              onClick={onSelect ? () => onSelect(value) : undefined}
            >
              {date.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
