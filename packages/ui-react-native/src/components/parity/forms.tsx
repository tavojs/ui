import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Linking,
  PanResponder,
  Pressable,
  ScrollView,
  TextInput as NativeTextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewProps,
  type ViewStyle
} from "react-native";
import { Button } from "../Button/index.js";
import { Text } from "../Text/index.js";
import type { Size } from "../types.js";

type ContainerProps = ViewProps & { children?: ReactNode; style?: StyleProp<ViewStyle> };
const fieldStyle = {
  borderWidth: 1,
  borderColor: "#9ca3af",
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 8
} as const;
function iso(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export type CalendarProps = ContainerProps & {
  year?: number;
  month?: number;
  yearRange?: { start: number; end: number };
  selected?: string;
  min?: string;
  max?: string;
  locale?: string;
  onSelect?: (value: string) => void;
  onMonthChange?: (year: number, month: number) => void;
};
export function Calendar({
  year,
  month,
  yearRange,
  selected,
  min,
  max,
  locale,
  onSelect,
  onMonthChange,
  style,
  ...props
}: CalendarProps) {
  const now = new Date();
  const [view, setView] = useState({ year: year ?? now.getFullYear(), month: month ?? now.getMonth() + 1 });
  const y = year ?? view.year,
    m = month ?? view.month;
  const first = new Date(y, m - 1, 1).getDay();
  const count = new Date(y, m, 0).getDate();
  const title = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(y, m - 1, 1));
  const change = (offset: number) => {
    const date = new Date(y, m - 1 + offset, 1);
    const next = { year: date.getFullYear(), month: date.getMonth() + 1 };
    if (yearRange && (next.year < yearRange.start || next.year > yearRange.end)) return;
    if (year === undefined && month === undefined) setView(next);
    onMonthChange?.(next.year, next.month);
  };
  return (
    <View {...props} style={[{ gap: 8 }, style]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Button variant="ghost" accessibilityLabel="Previous month" onPress={() => change(-1)}>
          ‹
        </Button>
        <Text color="heading">{title}</Text>
        <Button variant="ghost" accessibilityLabel="Next month" onPress={() => change(1)}>
          ›
        </Button>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <View key={day} style={{ width: "14.285%", alignItems: "center" }}>
            <Text variant="hint">{day}</Text>
          </View>
        ))}
        {Array.from({ length: first }, (_, index) => (
          <View key={`blank-${index}`} style={{ width: "14.285%" }} />
        ))}
        {Array.from({ length: count }, (_, index) => {
          const date = iso(y, m, index + 1);
          const disabled = Boolean((min && date < min) || (max && date > max));
          return (
            <Pressable
              key={date}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={date}
              accessibilityState={{ selected: date === selected, disabled }}
              onPress={() => onSelect?.(date)}
              style={{
                width: "14.285%",
                padding: 8,
                alignItems: "center",
                borderRadius: 6,
                backgroundColor: date === selected ? "#c7d2fe" : "transparent",
                opacity: disabled ? 0.35 : 1
              }}
            >
              <Text>{index + 1}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export type ColorPickerOption = { value: string; label?: string };
export type ColorPickerProps = ContainerProps & {
  size?: Size;
  format?: "hex" | "css";
  label?: ReactNode;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  swatches?: Array<string | ColorPickerOption>;
  tokens?: ColorPickerOption[];
  onValueInput?: (value: string) => void;
  onValueChange?: (value: string) => void;
};
export function ColorPicker({
  value,
  defaultValue = "",
  size,
  format,
  label,
  placeholder = "#000000",
  required,
  swatches = [],
  tokens = [],
  onValueInput,
  onValueChange,
  style,
  ...props
}: ColorPickerProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const update = (next: string, commit = false) => {
    if (value === undefined) setInternal(next);
    onValueInput?.(next);
    if (commit) onValueChange?.(next);
  };
  return (
    <View {...props} style={[{ gap: 8 }, style]}>
      {label && <Text>{label}</Text>}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: "#9ca3af",
            backgroundColor: current || "transparent"
          }}
        />
        <NativeTextInput
          value={current}
          onChangeText={(next) => update(next)}
          onEndEditing={() => onValueChange?.(current)}
          placeholder={placeholder}
          accessibilityLabel="Color value"
          style={[fieldStyle, { flex: 1 }]}
        />
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {[...swatches, ...tokens].map((item, index) => {
          const option = typeof item === "string" ? { value: item, label: item } : item;
          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={option.label ?? option.value}
              onPress={() => update(option.value, true)}
              style={{
                width: 28,
                height: 28,
                backgroundColor: option.value,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: "#9ca3af"
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

export type ComboboxOption = { label: string; value: string; disabled?: boolean };
export type ComboboxProps = ContainerProps & {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  size?: Size;
  onValueChange?: (value: string) => void;
};
export function Combobox({
  options,
  value,
  defaultValue = "",
  placeholder = "Search",
  size,
  onValueChange,
  style,
  ...props
}: ComboboxProps) {
  const [internal, setInternal] = useState(defaultValue);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const current = value ?? internal;
  const choose = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
    setQuery("");
    setOpen(false);
  };
  return (
    <View {...props} style={style}>
      <NativeTextInput
        value={open ? query : options.find((item) => item.value === current)?.label ?? query}
        onFocus={() => setOpen(true)}
        onChangeText={(next) => {
          setQuery(next);
          setOpen(true);
        }}
        placeholder={placeholder}
        accessibilityLabel={placeholder}
        style={fieldStyle}
      />
      {open && (
        <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }}>
          {options
            .filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
            .map((item) => (
              <Pressable
                key={item.value}
                disabled={item.disabled}
                accessibilityRole="button"
                accessibilityState={{ selected: item.value === current, disabled: item.disabled }}
                onPress={() => choose(item.value)}
                style={{ padding: 10 }}
              >
                <Text>{item.label}</Text>
              </Pressable>
            ))}
        </ScrollView>
      )}
    </View>
  );
}

export type DatePickerProps = ContainerProps & {
  inputLabel?: string;
  value?: string;
  defaultValue?: string;
  min?: string;
  max?: string;
  size?: Size;
  year?: number;
  month?: number;
  open?: boolean;
  renderCalendarWhenClosed?: boolean;
  onValueChange?: (value: string) => void;
};
export function DatePicker({
  inputLabel = "Choose date",
  value,
  defaultValue = "",
  min,
  max,
  size,
  year,
  month,
  open,
  renderCalendarWhenClosed = false,
  onValueChange,
  style,
  ...props
}: DatePickerProps) {
  const [internal, setInternal] = useState(defaultValue);
  const [show, setShow] = useState(false);
  const current = value ?? internal;
  return (
    <View {...props} style={[{ gap: 8 }, style]}>
      <Button variant="outline" accessibilityLabel={inputLabel} onPress={() => setShow(!show)}>
        {current || inputLabel}
      </Button>
      {(open ?? show) || renderCalendarWhenClosed ? (
        <Calendar
          year={year}
          month={month}
          selected={current}
          min={min}
          max={max}
          onSelect={(next) => {
            if (value === undefined) setInternal(next);
            onValueChange?.(next);
            setShow(false);
          }}
        />
      ) : null}
    </View>
  );
}

export type NativePickedFile = { uri: string; name?: string; type?: string; size?: number };
export type FileTriggerProps = {
  children?: ReactNode;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  picker: (options: { accept?: string; multiple: boolean }) => Promise<NativePickedFile[]>;
  onFilesChange?: (files: NativePickedFile[]) => void;
  onError?: (error: unknown) => void;
};
export function FileTrigger({
  children = "Choose files",
  accept,
  multiple = false,
  disabled = false,
  picker,
  onFilesChange,
  onError
}: FileTriggerProps) {
  return (
    <Button
      disabled={disabled}
      onPress={() => {
        void picker({ accept, multiple })
          .then((files) => onFilesChange?.(files))
          .catch(onError ?? (() => {}));
      }}
    >
      {children}
    </Button>
  );
}

export type FormControlLabelProps = ContainerProps & { label?: ReactNode; control?: ReactNode; size?: Size };
export function FormControlLabel({ label, control, children, style, ...props }: FormControlLabelProps) {
  return (
    <View {...props} style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, style]}>
      {control ?? children}
      {label && <Text>{label}</Text>}
    </View>
  );
}

export type InputGroupProps = ContainerProps & { size?: Size };
function InputGroupBase({ style, ...props }: InputGroupProps) {
  return (
    <View
      {...props}
      style={[
        { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#9ca3af", borderRadius: 8 },
        style
      ]}
    />
  );
}
export type InputGroupAddonProps = ContainerProps & { position?: "start" | "end" };
export function InputGroupAddon({ children, style, ...props }: InputGroupAddonProps) {
  return (
    <View {...props} style={[{ paddingHorizontal: 8 }, style]}>
      <Text>{children}</Text>
    </View>
  );
}
export type InputGroupInputProps = TextInputProps;
export function InputGroupInput(props: InputGroupInputProps) {
  return <NativeTextInput {...props} style={[{ flex: 1, padding: 8 }, props.style]} />;
}
export const InputGroupRoot = InputGroupBase;
export const InputGroup = Object.assign(InputGroupBase, {
  Root: InputGroupRoot,
  Addon: InputGroupAddon,
  Input: InputGroupInput
});

export type LinkProps = {
  children?: ReactNode;
  href?: string;
  to?: string;
  disabled?: boolean;
  noUnderline?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};
export function Link({ children, href, to, disabled = false, noUnderline = false, onPress, style }: LinkProps) {
  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="link"
      accessibilityState={{ disabled }}
      onPress={() => {
        onPress?.();
        if (href ?? to) void Linking.openURL((href ?? to)!);
      }}
      style={style}
    >
      <Text color="primary" style={{ textDecorationLine: noUnderline ? "none" : "underline" }}>
        {children}
      </Text>
    </Pressable>
  );
}

export type NumberInputValue = number | null;
export type NumberInputProps = ContainerProps & {
  size?: Size;
  label?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  value?: NumberInputValue;
  defaultValue?: NumberInputValue;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  allowUnset?: boolean;
  onValueInput?: (value: NumberInputValue, draft: string) => void;
  onValueChange?: (value: NumberInputValue, draft: string) => void;
};
export function NumberInput({
  value,
  defaultValue,
  size,
  label,
  prefix,
  suffix,
  min,
  max,
  step = 1,
  placeholder,
  required,
  readOnly,
  disabled,
  allowUnset = true,
  onValueInput,
  onValueChange,
  style,
  ...props
}: NumberInputProps) {
  const [internal, setInternal] = useState<NumberInputValue>(defaultValue ?? null);
  const [draft, setDraft] = useState<string | null>(null);
  const current = value !== undefined ? value : internal;
  const parse = (raw: string): NumberInputValue => {
    const number = raw.trim() === "" ? null : Number(raw);
    return number === null || Number.isFinite(number) ? number : null;
  };
  const clamp = (number: NumberInputValue) =>
    number === null ? null : Math.min(max ?? Infinity, Math.max(min ?? -Infinity, number));
  const commit = (number: NumberInputValue) => {
    if (number === null && !allowUnset) {
      setDraft(null);
      return;
    }
    const next = clamp(number);
    if (value === undefined) setInternal(next);
    setDraft(null);
    onValueChange?.(next, next === null ? "" : String(next));
  };
  return (
    <View {...props} style={[{ gap: 4 }, style]}>
      {label && <Text>{label}</Text>}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {prefix}
        <Button variant="outline" disabled={disabled || readOnly} onPress={() => commit((current ?? 0) - step)}>
          −
        </Button>
        <NativeTextInput
          keyboardType="numeric"
          editable={!disabled && !readOnly}
          value={draft ?? (current === null ? "" : String(current))}
          placeholder={placeholder}
          onChangeText={(raw) => {
            setDraft(raw);
            onValueInput?.(parse(raw), raw);
          }}
          onEndEditing={() => commit(parse(draft ?? (current === null ? "" : String(current))))}
          style={[fieldStyle, { minWidth: 70, textAlign: "center" }]}
        />
        <Button variant="outline" disabled={disabled || readOnly} onPress={() => commit((current ?? 0) + step)}>
          +
        </Button>
        {suffix}
      </View>
    </View>
  );
}

export type ObjectFieldValue = Record<string, unknown> | unknown[] | null;
export type ObjectFieldValidation = { valid: boolean; error?: string };
export type ObjectFieldProps = ContainerProps & {
  label: ReactNode;
  value: ObjectFieldValue;
  disabled?: boolean;
  error?: ReactNode;
  showRaw?: boolean;
  onDraft?: (value: ObjectFieldValue, validation: ObjectFieldValidation) => void;
  onCommit?: (value: ObjectFieldValue, validation: ObjectFieldValidation) => void;
  onValidationChange?: (validation: ObjectFieldValidation) => void;
};
export function ObjectField({
  label,
  value,
  disabled,
  error,
  showRaw,
  onDraft,
  onCommit,
  onValidationChange,
  style,
  ...props
}: ObjectFieldProps) {
  const [draft, setDraft] = useState(JSON.stringify(value, null, 2));
  const serialized = JSON.stringify(value, null, 2);
  useEffect(() => setDraft(serialized), [serialized]);
  const parse = (raw: string) => {
    try {
      const next = JSON.parse(raw) as ObjectFieldValue;
      const validation = { valid: next !== null && typeof next === "object" };
      return {
        value: next,
        validation: validation.valid ? validation : { valid: false, error: "Expected an object or array" }
      };
    } catch {
      return { value, validation: { valid: false, error: "Invalid JSON" } };
    }
  };
  return (
    <View {...props} style={[{ gap: 6 }, style]}>
      <Text>{label}</Text>
      <NativeTextInput
        multiline
        editable={!disabled}
        value={draft}
        onChangeText={(raw) => {
          setDraft(raw);
          const result = parse(raw);
          onDraft?.(result.value, result.validation);
          onValidationChange?.(result.validation);
        }}
        onEndEditing={() => {
          const result = parse(draft);
          if (result.validation.valid) onCommit?.(result.value, result.validation);
        }}
        style={[fieldStyle, { minHeight: 100, fontFamily: "monospace" }]}
      />
      {error && <Text color="danger">{error}</Text>}
    </View>
  );
}

export type PaginationProps = ContainerProps & {
  page: number;
  pageCount: number;
  siblingCount?: number;
  onChange?: (page: number) => void;
  getHref?: (page: number) => string;
  label?: string;
};
export function Pagination({
  page,
  pageCount,
  siblingCount = 1,
  onChange,
  getHref,
  label = "Pagination",
  style,
  ...props
}: PaginationProps) {
  const pages = new Set([1, pageCount]);
  for (let index = page - siblingCount; index <= page + siblingCount; index++) {
    if (index >= 1 && index <= pageCount) pages.add(index);
  }
  const visible = [...pages].filter((index) => index >= 1 && index <= pageCount).sort((a, b) => a - b);
  const activate = (next: number) => {
    onChange?.(next);
    if (getHref) void Linking.openURL(getHref(next));
  };
  return (
    <View {...props} accessibilityLabel={label} style={[{ flexDirection: "row", alignItems: "center", gap: 4 }, style]}>
      <Button variant="outline" disabled={page <= 1} onPress={() => activate(page - 1)}>
        Previous
      </Button>
      {visible.map((index, position) => (
        <View key={index} style={{ flexDirection: "row", alignItems: "center" }}>
          {position > 0 && index - visible[position - 1] > 1 && <Text>…</Text>}
          <Button
            variant={index === page ? "solid" : "ghost"}
            accessibilityLabel={`Page ${index}`}
            onPress={() => activate(index)}
          >
            {String(index)}
          </Button>
        </View>
      ))}
      <Button variant="outline" disabled={page >= pageCount} onPress={() => activate(page + 1)}>
        Next
      </Button>
    </View>
  );
}

export type SearchInputProps = Omit<TextInputProps, "value" | "defaultValue" | "onChangeText"> & {
  value?: string;
  defaultValue?: string;
  size?: Size;
  clearable?: boolean;
  clearLabel?: string;
  loading?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  onClear?: () => void;
  onValueChange?: (value: string) => void;
};
export function SearchInput({
  value,
  defaultValue = "",
  size,
  clearable = false,
  clearLabel = "Clear search",
  loading,
  leading,
  trailing,
  onClear,
  onValueChange,
  style,
  ...props
}: SearchInputProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const change = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#9ca3af",
        borderRadius: 8,
        paddingHorizontal: 8
      }}
    >
      {leading}
      <NativeTextInput
        {...props}
        value={current}
        onChangeText={change}
        accessibilityRole="search"
        style={[{ flex: 1, padding: 8 }, style]}
      />
      {loading && <Text>…</Text>}
      {trailing}
      {clearable && current && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={clearLabel}
          onPress={() => {
            change("");
            onClear?.();
          }}
        >
          <Text>×</Text>
        </Pressable>
      )}
    </View>
  );
}

export type SelectOption = { label: string; value: string; disabled?: boolean };
export type SelectProps = ContainerProps & {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  size?: Size;
  placeholder?: string;
  onValueChange?: (value: string) => void;
};
export function Select({
  options,
  value,
  defaultValue = "",
  placeholder = "Select",
  size,
  onValueChange,
  style,
  ...props
}: SelectProps) {
  const [internal, setInternal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const current = value ?? internal;
  return (
    <View {...props} style={style}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={fieldStyle}
      >
        <Text>{options.find((item) => item.value === current)?.label ?? placeholder} ▾</Text>
      </Pressable>
      {open && (
        <View>
          {options.map((item) => (
            <Pressable
              key={item.value}
              disabled={item.disabled}
              accessibilityRole="button"
              accessibilityState={{ selected: item.value === current, disabled: item.disabled }}
              onPress={() => {
                if (value === undefined) setInternal(item.value);
                onValueChange?.(item.value);
                setOpen(false);
              }}
              style={{ padding: 10 }}
            >
              <Text>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export type SliderProps = ContainerProps & {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
};
export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue = 0,
  disabled = false,
  onValueChange,
  style,
  ...props
}: SliderProps) {
  const [internal, setInternal] = useState(defaultValue);
  const [width, setWidth] = useState(1);
  const current = value ?? internal;
  const update = (x: number) => {
    const interval = step > 0 ? step : 1;
    const next = Math.max(min, Math.min(max, Math.round((min + (x / width) * (max - min)) / interval) * interval));
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (event) => update(event.nativeEvent.locationX),
        onPanResponderMove: (event) => update(event.nativeEvent.locationX)
      }),
    [disabled, max, min, step, value, width]
  );
  const percentage = max > min ? Math.max(0, Math.min(100, ((current - min) / (max - min)) * 100)) : 0;
  return (
    <View
      {...props}
      {...responder.panHandlers}
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width);
        props.onLayout?.(event);
      }}
      accessibilityRole="adjustable"
      accessibilityState={{ disabled }}
      accessibilityValue={{ min, max, now: current }}
      style={[{ height: 36, justifyContent: "center" }, style]}
    >
      <View style={{ height: 4, backgroundColor: "#d1d5db", borderRadius: 2 }}>
        <View style={{ width: `${percentage}%`, height: 4, backgroundColor: "#6366f1" }} />
      </View>
      <View
        style={{
          position: "absolute",
          left: `${percentage}%`,
          width: 20,
          height: 20,
          borderRadius: 10,
          marginLeft: -10,
          backgroundColor: "#6366f1"
        }}
      />
    </View>
  );
}
