import { Inline, type InlineProps } from "../../Inline/index.js";

export function CardActions({ children, style, ...props }: InlineProps) {
  return (
    <Inline justify="end" gap="sm" padding="md" style={style} {...props}>
      {children}
    </Inline>
  );
}
