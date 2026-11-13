import { type ReactNode } from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { Text } from "../Text/index.js";
import { useNativeTheme } from "../hooks.js";
import {
  fieldStyles,
  fieldsetStyles,
  labelRowStyles,
  legendStyles,
  messageStyles,
  optionalStyles,
  requiredStyles,
  styles
} from "./Field.styles.js";

export type FieldMessageTone = "neutral" | "danger" | "success" | "warning";

export type FieldProps = Omit<ViewProps, "style"> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  success?: ReactNode;
  warning?: ReactNode;
  required?: boolean;
  optional?: boolean;
  id?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export type FormMessageProps = {
  children?: ReactNode;
  tone?: FieldMessageTone;
  nativeID?: string;
};

export type FieldsetProps = Omit<ViewProps, "style"> & {
  legend?: ReactNode;
  hint?: ReactNode;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

function FieldBase({
  label,
  hint,
  error,
  success,
  warning,
  required = false,
  optional = false,
  children,
  style,
  ...props
}: FieldProps) {
  const theme = useNativeTheme();
  const message = error ?? warning ?? success ?? hint;
  const tone: FieldMessageTone = error ? "danger" : warning ? "warning" : success ? "success" : "neutral";

  return (
    <View {...props} aria-invalid={Boolean(error) || undefined} style={[styles.root, fieldStyles(theme), style]}>
      <View style={[styles.labelRow, labelRowStyles(theme)]}>
        <Text variant="span" color="inherit">
          {label}
        </Text>
        {required ? (
          <Text
            variant="span"
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={[styles.required, requiredStyles(theme)]}
          >
            *
          </Text>
        ) : null}
        {optional ? (
          <Text variant="hint" style={[styles.optional, optionalStyles(theme)]}>
            Optional
          </Text>
        ) : null}
      </View>
      {children}
      {message ? <FormMessage tone={tone}>{message}</FormMessage> : null}
    </View>
  );
}

export function FormMessage({ children, tone = "neutral", nativeID }: FormMessageProps) {
  const theme = useNativeTheme();
  return (
    <Text nativeID={nativeID} variant="hint" style={messageStyles(theme, tone)}>
      {children}
    </Text>
  );
}

export function Fieldset({ legend, hint, children, style, ...props }: FieldsetProps) {
  const theme = useNativeTheme();
  return (
    <View
      {...props}
      accessibilityRole={props.accessibilityRole ?? "none"}
      style={[styles.fieldset, fieldsetStyles(theme), style]}
    >
      {legend ? <Legend>{legend}</Legend> : null}
      {hint ? (
        <Text variant="hint" color="muted" style={styles.hint}>
          {hint}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export function Legend({ children }: { children?: ReactNode }) {
  const theme = useNativeTheme();
  return (
    <Text variant="span" color="heading" style={[styles.legend, legendStyles(theme)]}>
      {children}
    </Text>
  );
}

export const FieldRoot = FieldBase;
export const Field = Object.assign(FieldBase, {
  Root: FieldRoot,
  Message: FormMessage,
  Fieldset,
  Legend
});
