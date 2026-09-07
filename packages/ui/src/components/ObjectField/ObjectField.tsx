import type { Child } from "@tavojs/core";
import styles from "./ObjectField.module.scss";
import { Button } from "@/components/Button";
import { cx, sxClassName, type BaseProps } from "@/components/shared";

export type ObjectFieldJsonPrimitive = string | number | boolean | null;
export type ObjectFieldJsonValue =
  | ObjectFieldJsonPrimitive
  | ObjectFieldJsonValue[]
  | { [key: string]: ObjectFieldJsonValue };
export type ObjectFieldValue = { [key: string]: ObjectFieldJsonValue };
export type ObjectFieldValueKind = "text" | "number" | "boolean" | "object" | "array" | "null";

export type ObjectFieldValidationIssue = {
  row?: number;
  field: "key" | "value" | "json";
  message: string;
};

export type ObjectFieldValidation = {
  valid: boolean;
  issues: ObjectFieldValidationIssue[];
};

export type ObjectFieldProps = Omit<BaseProps, "children"> & {
  className?: string;
  label: Child;
  value: ObjectFieldValue;
  valueKinds?: readonly ObjectFieldValueKind[];
  disabled?: boolean;
  error?: Child;
  showRaw?: boolean;
  addLabel?: Child;
  rawLabel?: Child;
  onDraft?: (value: ObjectFieldValue, validation: ObjectFieldValidation) => void;
  onCommit?: (value: ObjectFieldValue, validation: ObjectFieldValidation) => void;
  onValidationChange?: (validation: ObjectFieldValidation) => void;
};

type ObjectFieldRow = {
  key: string;
  kind: ObjectFieldValueKind;
  value: ObjectFieldJsonValue;
  invalidValue?: string;
};

const allValueKinds: ObjectFieldValueKind[] = ["text", "number", "boolean", "object", "array", "null"];

function valueKind(value: ObjectFieldJsonValue): ObjectFieldValueKind {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return "text";
}

function defaultValueForKind(kind: ObjectFieldValueKind): ObjectFieldJsonValue {
  switch (kind) {
    case "number": return 0;
    case "boolean": return false;
    case "object": return {};
    case "array": return [];
    case "null": return null;
    default: return "";
  }
}

function rowsFromValue(value: ObjectFieldValue): ObjectFieldRow[] {
  return Object.entries(value).map(([key, item]) => ({ key, kind: valueKind(item), value: item }));
}

function validationForRows(rows: ObjectFieldRow[]): ObjectFieldValidation {
  const issues: ObjectFieldValidationIssue[] = [];
  const counts = new Map<string, number>();
  rows.forEach((row) => counts.set(row.key, (counts.get(row.key) ?? 0) + 1));
  rows.forEach((row, index) => {
    if (!row.key.trim()) issues.push({ row: index, field: "key", message: "Property keys cannot be empty." });
    if ((counts.get(row.key) ?? 0) > 1) issues.push({ row: index, field: "key", message: `Duplicate key: ${row.key}` });
    if (row.invalidValue !== undefined) issues.push({ row: index, field: "value", message: row.invalidValue });
  });
  return { valid: issues.length === 0, issues };
}

function valueFromRows(rows: ObjectFieldRow[]): ObjectFieldValue {
  const next: ObjectFieldValue = {};
  rows.forEach((row) => {
    if (row.key.trim() && row.invalidValue === undefined) next[row.key] = row.value;
  });
  return next;
}

export function validateObjectField(value: ObjectFieldValue): ObjectFieldValidation {
  return validationForRows(rowsFromValue(value));
}

export function validateObjectFieldEntries(
  entries: ReadonlyArray<readonly [string, ObjectFieldJsonValue]>,
): ObjectFieldValidation {
  return validationForRows(entries.map(([key, value]) => ({ key, kind: valueKind(value), value })));
}

function uniquePropertyKey(rows: ObjectFieldRow[]): string {
  const keys = new Set(rows.map((row) => row.key));
  let index = 1;
  while (keys.has(index === 1 ? "property" : `property${index}`)) index += 1;
  return index === 1 ? "property" : `property${index}`;
}

function displayValue(row: ObjectFieldRow): string {
  if (row.invalidValue !== undefined) return row.invalidValue;
  if (row.kind === "object" || row.kind === "array") return JSON.stringify(row.value, null, 2);
  if (row.kind === "null") return "null";
  return String(row.value);
}

export function ObjectField({
  label,
  value,
  valueKinds = allValueKinds,
  disabled = false,
  error,
  showRaw = true,
  addLabel = "Add property",
  rawLabel = "Advanced JSON",
  onDraft,
  onCommit,
  onValidationChange,
  className = "",
  ...props
}: ObjectFieldProps) {
  const rows = rowsFromValue(value);
  const allowedKinds = valueKinds.length ? [...valueKinds] : [...allValueKinds];

  function emit(nextRows: ObjectFieldRow[], commit: boolean) {
    const validation = validationForRows(nextRows);
    const nextValue = valueFromRows(nextRows);
    onValidationChange?.(validation);
    if (commit) {
      if (validation.valid) onCommit?.(nextValue, validation);
    } else {
      onDraft?.(nextValue, validation);
    }
  }

  function updateRow(index: number, update: Partial<ObjectFieldRow>, commit: boolean) {
    emit(rows.map((row, rowIndex) => rowIndex === index ? { ...row, ...update } : row), commit);
  }

  function updateTextValue(index: number, text: string, commit: boolean) {
    const row = rows[index];
    if (!row) return;
    if (row.kind === "number") {
      const nextNumber = Number(text);
      updateRow(index, Number.isFinite(nextNumber) && text.trim() !== ""
        ? { value: nextNumber, invalidValue: undefined }
        : { invalidValue: "Enter a valid number." }, commit);
      return;
    }
    if (row.kind === "object" || row.kind === "array") {
      try {
        const parsed = JSON.parse(text) as ObjectFieldJsonValue;
        const correctShape = row.kind === "array"
          ? Array.isArray(parsed)
          : typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
        updateRow(index, correctShape
          ? { value: parsed, invalidValue: undefined }
          : { invalidValue: `Enter a JSON ${row.kind}.` }, commit);
      } catch {
        updateRow(index, { invalidValue: `Enter a valid JSON ${row.kind}.` }, commit);
      }
      return;
    }
    updateRow(index, { value: text, invalidValue: undefined }, commit);
  }

  return (
    <fieldset
      className={sxClassName(props, cx(styles.root, Boolean(error) && styles.invalid, className))}
      disabled={disabled}
      {...props}
    >
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.rows}>
        {rows.map((row, index) => {
          const issue = validationForRows(rows).issues.find((candidate) => candidate.row === index);
          return (
            <div key={index} className={styles.row} data-invalid={issue ? "true" : undefined}>
              <label className={styles.controlLabel}>
                <span>Key</span>
                <input
                  className={styles.input}
                  value={row.key}
                  aria-invalid={issue?.field === "key" ? "true" : undefined}
                  onInput={(event: Event & { currentTarget: HTMLInputElement }) => updateRow(index, { key: event.currentTarget.value }, false)}
                  onChange={(event: Event & { currentTarget: HTMLInputElement }) => updateRow(index, { key: event.currentTarget.value }, true)}
                />
              </label>
              <label className={styles.controlLabel}>
                <span>Type</span>
                <select
                  className={styles.select}
                  value={row.kind}
                  aria-label={`Type for ${row.key || `property ${index + 1}`}`}
                  onChange={(event: Event & { currentTarget: HTMLSelectElement }) => {
                    const kind = event.currentTarget.value as ObjectFieldValueKind;
                    updateRow(index, { kind, value: defaultValueForKind(kind), invalidValue: undefined }, true);
                  }}
                >
                  {allowedKinds.map((kind) => <option key={kind} value={kind}>{kind}</option>)}
                </select>
              </label>
              <label className={cx(styles.controlLabel, styles.valueControl)}>
                <span>Value</span>
                {row.kind === "boolean" ? (
                  <select
                    className={styles.select}
                    value={row.value ? "true" : "false"}
                    onChange={(event: Event & { currentTarget: HTMLSelectElement }) => updateRow(index, { value: event.currentTarget.value === "true" }, true)}
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : row.kind === "object" || row.kind === "array" ? (
                  <textarea
                    className={styles.textarea}
                    rows={2}
                    value={displayValue(row)}
                    aria-invalid={issue?.field === "value" ? "true" : undefined}
                    onInput={(event: Event & { currentTarget: HTMLTextAreaElement }) => updateTextValue(index, event.currentTarget.value, false)}
                    onChange={(event: Event & { currentTarget: HTMLTextAreaElement }) => updateTextValue(index, event.currentTarget.value, true)}
                  />
                ) : (
                  <input
                    className={styles.input}
                    value={displayValue(row)}
                    readOnly={row.kind === "null"}
                    inputMode={row.kind === "number" ? "decimal" : undefined}
                    aria-invalid={issue?.field === "value" ? "true" : undefined}
                    onInput={(event: Event & { currentTarget: HTMLInputElement }) => updateTextValue(index, event.currentTarget.value, false)}
                    onChange={(event: Event & { currentTarget: HTMLInputElement }) => updateTextValue(index, event.currentTarget.value, true)}
                  />
                )}
              </label>
              <Button
                className={styles.remove}
                size="sm"
                variant="ghost"
                tone="danger"
                label={`Remove ${row.key || `property ${index + 1}`}`}
                onClick={() => emit(rows.filter((_, rowIndex) => rowIndex !== index), true)}
              >
                Remove
              </Button>
              {issue ? <span className={styles.rowError} role="alert">{issue.message}</span> : null}
            </div>
          );
        })}
      </div>
      <Button
        className={styles.add}
        size="sm"
        variant="outline"
        tone="neutral"
        onClick={() => {
          const kind = allowedKinds[0] ?? "text";
          emit([...rows, { key: uniquePropertyKey(rows), kind, value: defaultValueForKind(kind) }], true);
        }}
      >
        {addLabel}
      </Button>
      {error ? <div className={styles.error} role="alert">{error}</div> : null}
      {showRaw ? (
        <details className={styles.raw}>
          <summary>{rawLabel}</summary>
          <label className={styles.controlLabel}>
            <span>JSON object</span>
            <textarea
              className={styles.rawInput}
              rows={8}
              value={JSON.stringify(value, null, 2)}
              onInput={(event: Event & { currentTarget: HTMLTextAreaElement }) => {
                try {
                  const parsed = JSON.parse(event.currentTarget.value) as unknown;
                  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error();
                  const next = parsed as ObjectFieldValue;
                  const validation = validateObjectField(next);
                  onValidationChange?.(validation);
                  onDraft?.(next, validation);
                } catch {
                  const validation = { valid: false, issues: [{ field: "json" as const, message: "Enter a valid JSON object." }] };
                  onValidationChange?.(validation);
                }
              }}
              onChange={(event: Event & { currentTarget: HTMLTextAreaElement }) => {
                try {
                  const parsed = JSON.parse(event.currentTarget.value) as unknown;
                  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return;
                  const next = parsed as ObjectFieldValue;
                  const validation = validateObjectField(next);
                  if (validation.valid) onCommit?.(next, validation);
                } catch {
                  // The input event already reports invalid JSON without committing it.
                }
              }}
            />
          </label>
        </details>
      ) : null}
    </fieldset>
  );
}
