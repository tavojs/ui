import { Box, type BoxProps } from "../../Box/index.js";
import { cardMediaStyles } from "../Card.styles.js";

export function CardMedia({ children, style, ...props }: BoxProps) {
  return (
    <Box style={[cardMediaStyles(), style]} {...props}>
      {children}
    </Box>
  );
}
