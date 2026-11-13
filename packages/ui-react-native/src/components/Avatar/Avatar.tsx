import {
  Image as NativeImage,
  View,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
  type ViewProps,
  type ViewStyle
} from "react-native";
import { Text } from "../Text/index.js";
import { useNativeTheme } from "../hooks.js";
import { avatarImageStyles, avatarInitials, avatarRootStyles, styles } from "./Avatar.styles.js";

export type AvatarProps = Omit<ViewProps, "style"> & {
  source?: ImageSourcePropType;
  name?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

export function Avatar({ source, name, size = 40, style, imageStyle, ...props }: AvatarProps) {
  const theme = useNativeTheme();

  return (
    <View {...props} style={[styles.root, avatarRootStyles(theme, size), style]}>
      {source ? (
        <NativeImage source={source} style={[avatarImageStyles(), imageStyle]} />
      ) : (
        <Text variant="span" color="primary" style={styles.initials}>
          {avatarInitials(name)}
        </Text>
      )}
    </View>
  );
}
