import { useWindowDimensions } from "react-native";
import { resolveResponsiveValue, type ResponsiveValue } from "../../theme/responsive.js";
import { Box, type BoxProps } from "../Box/index.js";
import { useNativeTheme } from "../hooks.js";
import type { FlexAlign, FlexDirection, FlexJustify, Gap } from "../types.js";
import { createFlexStyles, styles as flexStyles } from "./Flex.styles.js";

export type FlexProps = Omit<BoxProps, "surface"> & {
  direction?: ResponsiveValue<FlexDirection>;
  align?: ResponsiveValue<FlexAlign>;
  justify?: ResponsiveValue<FlexJustify>;
  gap?: ResponsiveValue<Gap | number>;
  wrap?: boolean;
};

export function Flex({
  children,
  direction = "row",
  align,
  justify,
  gap = "md",
  wrap = false,
  padding = "none",
  style,
  ...props
}: FlexProps) {
  const theme = useNativeTheme();
  const window = useWindowDimensions();

  return (
    <Box
      {...props}
      padding={padding}
      style={[
        flexStyles.root,
        createFlexStyles(
          theme,
          resolveResponsiveValue(direction, theme, window, "row"),
          align ? resolveResponsiveValue(align, theme, window, "stretch") : undefined,
          justify ? resolveResponsiveValue(justify, theme, window, "start") : undefined,
          resolveResponsiveValue(gap, theme, window, "md"),
          wrap
        ),
        style
      ]}
    >
      {children}
    </Box>
  );
}
