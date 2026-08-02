import type { Child, VNode } from "@tavojs/core";
import styles from "./Field.module.scss";
import { cv, cx } from "@/components/shared";
import { Text } from "@/components/Text";

export type FieldProps = {
  label: Child;
  hint?: Child;
  error?: Child;
  success?: Child;
  warning?: Child;
  required?: boolean;
  optional?: boolean;
  id?: string;
  className?: string;
  children?: Child;
};

export type FormMessageProps = {
  children?: Child;
  tone?: "neutral" | "danger" | "success" | "warning";
  id?: string;
  className?: string;
};

export type FieldsetProps = {
  legend?: Child;
  hint?: Child;
  className?: string;
  children?: Child;
};

function slugLabel(label: Child): string {
  return typeof label === "string" ? label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "field";
}

function isVNode(value: Child): value is VNode {
  return typeof value === "object" && value !== null && "type" in value && "props" in value;
}

type DescribedControlState = { applied: boolean };

function firstChildVNode(child: Child): VNode | undefined {
  if (Array.isArray(child)) {
    for (const item of child) {
      const vnode = firstChildVNode(item);
      if (vnode) return vnode;
    }
    return undefined;
  }
  return isVNode(child) ? child : undefined;
}

function describeChild(
  child: Child,
  inputId: string,
  messageId: string | undefined,
  invalid: boolean,
  state: DescribedControlState
): Child {
  if (Array.isArray(child)) {
    return child.map((item) => describeChild(item, inputId, messageId, invalid, state));
  }

  if (!isVNode(child) || state.applied) {
    return child;
  }
  state.applied = true;

  return {
    ...child,
    props: {
      ...child.props,
      id: child.props.id ?? inputId,
      "aria-describedby": messageId
        ? [child.props["aria-describedby"], messageId].filter(Boolean).join(" ")
        : child.props["aria-describedby"],
      "aria-invalid": invalid ? "true" : child.props["aria-invalid"],
      children: child.props.children
    }
  };
}

function FieldBase({ label, hint, error, success, warning, required = false, optional = false, id, className = "", children }: FieldProps) {
  const firstControl = firstChildVNode(children);
  const fieldId = (typeof firstControl?.props.id === "string" ? firstControl.props.id : undefined)
    ?? id
    ?? `tui-${slugLabel(label)}`;
  const messageId = `${fieldId}-message`;
  const message = error ?? warning ?? success ?? hint;
  const tone = error ? "danger" : warning ? "warning" : success ? "success" : "neutral";

  return (
    <div className={cx(styles.field, Boolean(error) && styles.invalid, className)}>
      <label className={styles.label} for={fieldId}>
        <Text as="span" variant="span" color="inherit">
          {label}
        </Text>
        {required && <Text className={styles.required} as="span" variant="span" color="inherit" aria-hidden="true">*</Text>}
        {optional && <Text className={styles.optional} as="span" variant="span" color="muted">Optional</Text>}
      </label>
      {describeChild(children, fieldId, message ? messageId : undefined, Boolean(error), { applied: false })}
      {message ? <FormMessage id={messageId} tone={tone}>{message}</FormMessage> : null}
    </div>
  );
}

export function FormMessage({ children, tone = "neutral", id, className = "" }: FormMessageProps) {
  return <Text id={id} as="span" variant="hint" className={cx(styles.meta, cv(styles, "tone", tone, "neutral"), className)}>{children}</Text>;
}

export function Fieldset({ legend, hint, className = "", children }: FieldsetProps) {
  return (
    <fieldset className={cx(styles.fieldset, className)}>
      {legend && <legend className={styles.legend}>{legend}</legend>}
      {hint && <Text className={styles.hint} color="muted">{hint}</Text>}
      {children}
    </fieldset>
  );
}

export function Legend({ children, className = "" }: { children?: Child; className?: string }) {
  return <legend className={cx(styles.legend, className)}>{children}</legend>;
}

export const FieldRoot = FieldBase;
export const Field = Object.assign(FieldBase, {
  Root: FieldRoot,
  Message: FormMessage,
  Fieldset,
  Legend
});
