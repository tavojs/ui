import { type ReactNode } from "react";
import { Box } from "../Box/index.js";
import { Inline } from "../Inline/index.js";
import { Stack } from "../Stack/index.js";
import { Surface, type SurfaceProps } from "../Surface/index.js";
import { Text } from "../Text/index.js";
import { useNativeTheme } from "../hooks.js";
import { cardHeaderStyles } from "./Card.styles.js";
import { CardActions } from "./internal/CardActions.js";
import { CardContent } from "./internal/CardContent.js";
import { CardHeader } from "./internal/CardHeader.js";
import { CardMedia } from "./internal/CardMedia.js";

export type CardProps = SurfaceProps & {
  eyebrow?: ReactNode;
  title?: ReactNode;
  actions?: ReactNode;
  surface?: "default" | "raised";
};

function CardBase({ children, eyebrow, title, actions, surface = "default", style, ...props }: CardProps) {
  const theme = useNativeTheme();

  return (
    <Surface
      tone={surface === "raised" ? "raised" : "default"}
      padding="none"
      border
      shadow={surface === "raised"}
      style={style}
      {...props}
    >
      {(eyebrow || title || actions) && (
        <Inline justify="between" align="start" style={cardHeaderStyles(theme)}>
          <Stack gap="none">
            {eyebrow ? (
              <Text variant="hint" color="muted">
                {eyebrow}
              </Text>
            ) : null}
            {title ? (
              <Text variant="h3" color="heading">
                {title}
              </Text>
            ) : null}
          </Stack>
          {actions}
        </Inline>
      )}
      <Box padding="md">{children}</Box>
    </Surface>
  );
}

export const CardRoot = CardBase;
export { CardActions, CardContent, CardHeader, CardMedia };

export const Card = Object.assign(CardBase, {
  Root: CardRoot,
  Header: CardHeader,
  Content: CardContent,
  Actions: CardActions,
  Media: CardMedia
});
