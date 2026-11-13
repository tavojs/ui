import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { useNativeTheme } from "../hooks.js";
import { formControlStyles, styles } from "./FormControl.styles.js";

export type FormControlProps = Omit<ViewProps, "style"> & {
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function FormControl({ children, fullWidth = false, style, ...props }: FormControlProps) {
  const theme = useNativeTheme();

  return (
    <View
      {...props}
      accessibilityRole={props.accessibilityRole ?? "none"}
      style={[styles.root, formControlStyles(theme, fullWidth), style]}
    >
      {children}
    </View>
  );
}
