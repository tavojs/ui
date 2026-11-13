import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import { getColor, getSpace, type NativeTheme } from "../../theme/native.js";
import type { FieldMessageTone } from "./Field.js";

export const styles = StyleSheet.create({
  root: {},
  labelRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  required: {},
  optional: {},
  fieldset: {},
  legend: {
    fontWeight: "400"
  },
  hint: {}
});

export function fieldStyles(theme: NativeTheme): ViewStyle {
  return {
    gap: getSpace(theme, "2", 8)
  };
}

export function labelRowStyles(theme: NativeTheme): ViewStyle {
  return {
    gap: getSpace(theme, "1", 4)
  };
}

export function optionalStyles(theme: NativeTheme): TextStyle {
  return {
    color: getColor(theme, "color-text-muted", "#6b7280"),
    fontSize: Number(theme.tokens["font-size-caption"] ?? 13)
  };
}

export function requiredStyles(theme: NativeTheme): TextStyle {
  return {
    color: getColor(theme, "color-danger", "#b42318")
  };
}

export function messageStyles(theme: NativeTheme, tone: FieldMessageTone): TextStyle {
  const token = tone === "neutral" ? "color-text-muted" : `color-${tone}`;
  return {
    color: getColor(theme, token, tone === "neutral" ? "#6b7280" : "#b42318")
  };
}

export function fieldsetStyles(theme: NativeTheme): ViewStyle {
  return {
    gap: getSpace(theme, "3", 12)
  };
}

export function legendStyles(theme: NativeTheme): TextStyle {
  return {
    color: getColor(theme, "color-heading", "#111827")
  };
}
