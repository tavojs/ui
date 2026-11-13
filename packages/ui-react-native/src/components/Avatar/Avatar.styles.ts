import { StyleSheet, type ImageStyle, type ViewStyle } from "react-native";
import { getColor, type NativeTheme } from "../../theme/native.js";

export const styles = StyleSheet.create({
  root: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center"
  },
  image: {
    width: "100%",
    height: "100%"
  },
  initials: {
    fontWeight: "700"
  }
});

export function avatarRootStyles(theme: NativeTheme, size: number): ViewStyle {
  return {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: getColor(theme, "color-primary-soft-bg", "#dbeafe")
  };
}

export function avatarImageStyles(): ImageStyle {
  return styles.image;
}

export function avatarInitials(name: string | undefined): string | undefined {
  return name
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
