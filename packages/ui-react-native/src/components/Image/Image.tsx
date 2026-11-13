import { Image as NativeImage, type ImageProps as NativeImageProps } from "react-native";
import { useNativeTheme } from "../hooks.js";
import { imageStyles, styles } from "./Image.styles.js";

export type ImageProps = NativeImageProps & {
  radius?: "none" | "sm" | "md" | "lg" | "surface" | number;
};

export function Image({ radius = "none", style, ...props }: ImageProps) {
  const theme = useNativeTheme();
  return <NativeImage {...props} style={[styles.root, imageStyles(theme, radius), style]} />;
}
