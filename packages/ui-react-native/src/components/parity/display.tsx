import { useState, type ReactNode } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  Text as NativeText,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle
} from "react-native";
import { Button } from "../Button/index.js";
import { Divider } from "../Divider/index.js";
import { Stack } from "../Stack/index.js";
import { Text } from "../Text/index.js";
import type { Tone } from "../types.js";

type ContainerProps = ViewProps & { children?: ReactNode; style?: StyleProp<ViewStyle> };
const row: ViewStyle = { flexDirection: "row", alignItems: "center" };

export type BreadcrumbItem = { label: string; onPress?: () => void; href?: string; current?: boolean };
export type BreadcrumbsProps = ContainerProps & { items?: BreadcrumbItem[]; separator?: ReactNode; label?: string };
export function Breadcrumbs({
  items = [],
  separator = "/",
  label = "Breadcrumbs",
  children,
  style,
  ...props
}: BreadcrumbsProps) {
  return (
    <View {...props} accessibilityLabel={label} style={[row, { flexWrap: "wrap", gap: 8 }, style]}>
      {items.length
        ? items.map((item, index) => (
            <View key={index} style={row}>
              {index > 0 && <Text color="muted">{separator} </Text>}
              <Pressable
                accessibilityRole={item.onPress || item.href ? "link" : "text"}
                accessibilityState={{ disabled: !item.onPress && !item.href }}
                onPress={() => {
                  item.onPress?.();
                  if (item.href) void Linking.openURL(item.href);
                }}
              >
                <Text color={item.current || index === items.length - 1 ? "heading" : "primary"}>{item.label}</Text>
              </Pressable>
            </View>
          ))
        : children}
    </View>
  );
}
export function BreadcrumbItem({ style, ...props }: ContainerProps) {
  return <View {...props} style={[row, style]} />;
}
export function BreadcrumbSeparator({ children = "/" }: { children?: ReactNode }) {
  return <Text color="muted">{children}</Text>;
}

export type ChartDatum = { label: string; value: number; tone?: Tone; color?: string };
export type ChartProps = ContainerProps & { data: ChartDatum[]; max?: number; label?: string };
export function Chart({ data, max, label = "Chart", style, ...props }: ChartProps) {
  const ceiling =
    Number.isFinite(max) && (max ?? 0) > 0
      ? max!
      : Math.max(1, ...data.map((item) => (Number.isFinite(item.value) ? item.value : 0)));
  return (
    <View {...props} accessibilityLabel={label} style={[{ gap: 8 }, style]}>
      {data.map((item, index) => (
        <View key={index} style={[row, { gap: 8 }]}>
          <Text style={{ width: 96 }} numberOfLines={1}>
            {item.label}
          </Text>
          <View style={{ flex: 1, height: 16, backgroundColor: "#e5e7eb", borderRadius: 4 }}>
            <View
              style={{
                width: `${Math.max(
                  0,
                  Math.min(100, ((Number.isFinite(item.value) ? item.value : 0) / ceiling) * 100)
                )}%`,
                height: 16,
                borderRadius: 4,
                backgroundColor:
                  item.color ??
                  (
                    {
                      primary: "#6366f1",
                      secondary: "#14b8a6",
                      neutral: "#6b7280",
                      success: "#16a34a",
                      warning: "#d97706",
                      danger: "#dc2626",
                      info: "#0284c7"
                    } as Record<Tone, string>
                  )[item.tone ?? "primary"]
              }}
            />
          </View>
          <Text>{Number.isFinite(item.value) ? item.value : 0}</Text>
        </View>
      ))}
    </View>
  );
}

export type CodeBlockProps = ContainerProps & {
  code?: string;
  language?: string;
  highlighted?: boolean;
  preserveEscapes?: boolean;
  editorTheme?: "auto" | "light" | "dark";
  wrap?: boolean;
};
export function CodeBlock({
  code,
  children,
  language,
  highlighted,
  editorTheme,
  wrap = false,
  preserveEscapes = false,
  style,
  ...props
}: CodeBlockProps) {
  const text = code ?? (typeof children === "string" ? children : "");
  const content = preserveEscapes ? text : text.replace(/\\r\\n|\\n/g, "\n");
  return (
    <ScrollView
      {...props}
      horizontal={!wrap}
      style={[{ backgroundColor: "#111827", borderRadius: 8, padding: 12 }, style]}
    >
      <NativeText selectable style={{ color: "#f9fafb", fontFamily: "monospace" }}>
        {content}
      </NativeText>
    </ScrollView>
  );
}

export type EmptyStateProps = ContainerProps & {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};
export function EmptyState({ icon, title, description, actions, children, style, ...props }: EmptyStateProps) {
  return (
    <View {...props} style={[{ alignItems: "center", padding: 24, gap: 12 }, style]}>
      {icon}
      {title && <Text variant="h4">{title}</Text>}
      {description && <Text color="muted">{description}</Text>}
      {children}
      {actions}
    </View>
  );
}

export type KbdProps = { children?: ReactNode; style?: StyleProp<ViewStyle> };
export function Kbd({ children, style }: KbdProps) {
  return (
    <View
      style={[
        {
          alignSelf: "flex-start",
          borderWidth: 1,
          borderColor: "#9ca3af",
          borderRadius: 4,
          paddingHorizontal: 6,
          paddingVertical: 2
        },
        style
      ]}
    >
      <Text variant="hint">{children}</Text>
    </View>
  );
}

export type ListProps = ContainerProps & { ordered?: boolean; marker?: Tone; spacing?: "sm" | "md" | "lg" };
function ListBase({ ordered = false, spacing = "md", children, style, ...props }: ListProps) {
  const entries = Array.isArray(children) ? children : [children];
  return (
    <View {...props} style={[{ gap: spacing === "sm" ? 4 : spacing === "lg" ? 16 : 8 }, style]}>
      {entries
        .filter((item) => item !== null && item !== undefined)
        .map((item, index) => (
          <View key={index} style={[row, { alignItems: "flex-start", gap: 8 }]}>
            <Text>{ordered ? `${index + 1}.` : "•"}</Text>
            <View style={{ flex: 1 }}>{item}</View>
          </View>
        ))}
    </View>
  );
}
export type ListItemProps = ContainerProps & { title?: ReactNode; meta?: ReactNode };
export function ListItem({ title, meta, children, style, ...props }: ListItemProps) {
  return (
    <View {...props} style={[{ gap: 2 }, style]}>
      {title && (
        <Text variant="span" color="heading">
          {title}
        </Text>
      )}
      {children}
      {meta && (
        <Text variant="hint" color="muted">
          {meta}
        </Text>
      )}
    </View>
  );
}
export const ListRoot = ListBase;
export const List = Object.assign(ListBase, { Root: ListRoot, Item: ListItem });

export type PropertyListProps = ContainerProps & { divided?: boolean };
export function PropertyList({ divided = true, children, style, ...props }: PropertyListProps) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <View {...props} style={style}>
      {items.map((item, index) => (
        <View key={index}>
          {divided && index > 0 && <Divider />}
          {item}
        </View>
      ))}
    </View>
  );
}
export type PropertyItemProps = ContainerProps & { label: string; value?: ReactNode };
export function PropertyItem({ label, value, children, style, ...props }: PropertyItemProps) {
  return (
    <View {...props} style={[row, { justifyContent: "space-between", paddingVertical: 8 }, style]}>
      <Text color="muted">{label}</Text>
      <View>{value ?? children}</View>
    </View>
  );
}
Object.assign(PropertyList, { Item: PropertyItem });

export type StatProps = ContainerProps & {
  label?: ReactNode;
  value?: ReactNode;
  hint?: ReactNode;
  trend?: ReactNode;
  tone?: Tone;
};
export function Stat({ label, value, hint, trend, children, style, ...props }: StatProps) {
  return (
    <Stack {...props} gap="sm" style={style}>
      {label && <Text color="muted">{label}</Text>}
      <Text variant="h3">{value ?? children}</Text>
      {hint && <Text variant="hint">{hint}</Text>}
      {trend && <Text variant="hint">{trend}</Text>}
    </Stack>
  );
}

export type StepItem = {
  id?: string;
  title?: ReactNode;
  label?: ReactNode;
  description?: ReactNode;
  status?: "complete" | "current" | "upcoming" | "error";
};
export type StepperProps = ContainerProps & { steps: StepItem[]; orientation?: "horizontal" | "vertical" };
export function Stepper({ steps, orientation = "horizontal", style, ...props }: StepperProps) {
  return (
    <View {...props} style={[{ flexDirection: orientation === "horizontal" ? "row" : "column", gap: 12 }, style]}>
      {steps.map((step, index) => (
        <View key={step.id ?? index} style={[row, { flex: orientation === "horizontal" ? 1 : undefined, gap: 8 }]}>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: step.status === "error" ? "#dc2626" : step.status === "upcoming" ? "#9ca3af" : "#6366f1",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <NativeText style={{ color: "white" }}>{step.status === "complete" ? "✓" : index + 1}</NativeText>
          </View>
          <View>
            <Text variant="span">{step.title ?? step.label}</Text>
            {step.description && (
              <Text variant="hint" color="muted">
                {step.description}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

export type TableProps = ContainerProps & { compact?: boolean };
function TableBase({ compact = false, style, ...props }: TableProps) {
  return (
    <ScrollView horizontal>
      <View {...props} style={[{ gap: compact ? 4 : 8 }, style]} />
    </ScrollView>
  );
}
export function TableCaption({ children, style, ...props }: ContainerProps) {
  return (
    <View {...props} style={style}>
      <Text variant="hint">{children}</Text>
    </View>
  );
}
export function TableHead({ style, ...props }: ContainerProps) {
  return <View {...props} style={style} />;
}
export function TableBody({ style, ...props }: ContainerProps) {
  return <View {...props} style={style} />;
}
export function TableRow({ style, ...props }: ContainerProps) {
  return <View {...props} style={[row, { borderBottomWidth: 1, borderColor: "#e5e7eb" }, style]} />;
}
export type TableCellProps = ContainerProps & { numeric?: boolean };
export function TableCell({ numeric = false, children, style, ...props }: TableCellProps) {
  return (
    <View
      {...props}
      style={[{ minWidth: 80, flex: 1, alignItems: numeric ? "flex-end" : "flex-start", padding: 8 }, style]}
    >
      <Text>{children}</Text>
    </View>
  );
}
export function TableHeaderCell(props: TableCellProps) {
  return (
    <TableCell {...props}>
      <Text color="heading">{props.children}</Text>
    </TableCell>
  );
}
export type TableDataColumn<TRow> = {
  id: keyof TRow & string;
  header: ReactNode;
  render?: (row: TRow) => ReactNode;
  numeric?: boolean;
};
export type TableDataProps<TRow extends Record<string, unknown>> = {
  columns: TableDataColumn<TRow>[];
  rows: TRow[];
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};
export function TableData<TRow extends Record<string, unknown>>({
  columns,
  rows,
  compact = false,
  style
}: TableDataProps<TRow>) {
  return (
    <ScrollView horizontal>
      <View style={style}>
        <TableRow>
          {columns.map((col) => (
            <TableHeaderCell key={col.id} numeric={col.numeric}>
              {col.header}
            </TableHeaderCell>
          ))}
        </TableRow>
        {rows.map((item, index) => (
          <TableRow key={index} style={{ paddingVertical: compact ? 2 : 6 }}>
            {columns.map((col) => (
              <TableCell key={col.id} numeric={col.numeric}>
                {col.render?.(item) ?? String(item[col.id] ?? "")}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </View>
    </ScrollView>
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

export type TimelineProps = ContainerProps;
function TimelineBase({ style, ...props }: TimelineProps) {
  return <View {...props} style={[{ gap: 16 }, style]} />;
}
export type TimelineItemProps = ContainerProps & { title?: ReactNode; meta?: ReactNode; tone?: Tone };
export function TimelineItem({ title, meta, children, style, ...props }: TimelineItemProps) {
  return (
    <View {...props} style={[row, { alignItems: "flex-start", gap: 12 }, style]}>
      <View style={{ width: 10, height: 10, borderRadius: 5, marginTop: 6, backgroundColor: "#6366f1" }} />
      <View style={{ flex: 1 }}>
        {title && <Text color="heading">{title}</Text>}
        {meta && (
          <Text variant="hint" color="muted">
            {meta}
          </Text>
        )}
        {children}
      </View>
    </View>
  );
}
export const TimelineRoot = TimelineBase;
export const Timeline = Object.assign(TimelineBase, { Root: TimelineRoot, Item: TimelineItem });
