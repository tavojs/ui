import { Box, type BoxProps } from "../../Box/index.js";

export function CardContent({ children, style, ...props }: BoxProps) {
  return (
    <Box padding="md" style={style} {...props}>
      {children}
    </Box>
  );
}
