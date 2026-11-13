import { StyleSheet, type ViewStyle } from "react-native";
import { getSpace, type NativeTheme } from "../../theme/native.js";

export const styles = StyleSheet.create({
  media: {
    overflow: "hidden"
  }
});

export function cardHeaderStyles(theme: NativeTheme): ViewStyle {
  return {
    padding: getSpace(theme, "4", 16),
    paddingBottom: 0
  };
}

export function cardMediaStyles(): ViewStyle {
  return styles.media;
}
