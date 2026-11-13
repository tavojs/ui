import { Box, type BoxProps } from "../../Box/index.js";

export function CardHeader({ children, style, ...props }: BoxProps) {
  return (
    <Box padding="md" style={style} {...props}>
      {children}
    </Box>
  );
}
