import styles from "./Table.module.scss";
import { cx, sxClassName, type BaseProps, type Sx } from "@/components/shared";
import type { Child } from "@tavojs/core";

export type TableProps = BaseProps & {
  compact?: boolean;
};

export type TableCellProps = BaseProps & {
  numeric?: boolean;
  sx?: Sx;
};

export type TableDataColumn<TRow extends Record<string, unknown> = Record<string, unknown>> = {
  id: keyof TRow & string;
  header: Child;
  numeric?: boolean;
  render?: (row: TRow) => Child;
};

export type TableDataProps<TRow extends Record<string, unknown> = Record<string, unknown>> = BaseProps & {
  columns: Array<TableDataColumn<TRow>>;
  rows: TRow[];
  compact?: boolean;
};

function TableBase({ children, className = "", compact = false, ...props }: TableProps) {
  return (
    <div className={styles.wrap}>
      <table className={sxClassName(props, cx(styles.table, compact && styles.compact, className))} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableCaption({ children, className = "", ...props }: BaseProps) {
  return <caption className={sxClassName(props, cx(styles.caption, className))} {...props}>{children}</caption>;
}

export function TableHead({ children, className = "", ...props }: BaseProps) {
  return <thead className={sxClassName(props, cx(styles.head, className))} {...props}>{children}</thead>;
}

export function TableBody({ children, className = "", ...props }: BaseProps) {
  return <tbody className={sxClassName(props, cx(styles.body, className))} {...props}>{children}</tbody>;
}

export function TableRow({ children, className = "", ...props }: BaseProps) {
  return <tr className={sxClassName(props, cx(styles.row, className))} {...props}>{children}</tr>;
}

export function TableHeaderCell({ children, className = "", numeric = false, sx, ...props }: TableCellProps) {
  const element = (
    <th
      className={sxClassName(props, cx(styles.cell, styles.headerCell, numeric && styles.numeric, className), sx)}
      scope="col"
      {...props}
    >
      {children}
    </th>
  );
  return element;
}

export function TableCell({ children, className = "", numeric = false, sx, ...props }: TableCellProps) {
  const element = (
    <td className={sxClassName(props, cx(styles.cell, numeric && styles.numeric, className), sx)} {...props}>
      {children}
    </td>
  );
  return element;
}

export function TableData<TRow extends Record<string, unknown> = Record<string, unknown>>({
  columns,
  rows,
  compact = false,
  ...props
}: TableDataProps<TRow>) {
  return (
    <TableBase compact={compact} {...props}>
      <thead className={styles.head}>
        <tr className={styles.row}>
          {columns.map((column) => (
            <th className={cx(styles.cell, styles.headerCell, column.numeric && styles.numeric)} scope="col">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={styles.body}>
        {rows.map((row) => (
          <tr className={styles.row}>
            {columns.map((column) => (
              <td className={cx(styles.cell, column.numeric && styles.numeric)}>
                {column.render ? column.render(row) : String(row[column.id] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </TableBase>
  );
}

export const TableRoot = TableBase;
export const Table = Object.assign(TableBase, {
  Root: TableRoot,
  Caption: TableCaption,
  Head: TableHead,
  Body: TableBody,
  Row: TableRow,
  HeaderCell: TableHeaderCell,
  Cell: TableCell,
  Data: TableData
});
