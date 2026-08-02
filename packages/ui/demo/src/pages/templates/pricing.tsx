import { createTavo, TavoController } from "@tavojs/core";
import {
  AppBar,
  Chip,
  Box,
  Button,
  Card,
  Grid,
  Inline,
  Link,
  List,
  ListItem,
  Page,
  Section,
  Stack,
  Text,
  Toolbar,
} from "@/index";

export const head = {
  title: "Pricing Template - Tavo UI",
  head: '<meta name="description" content="A pricing page template composed with @tavojs/ui components">',
};

class PricingTemplateController extends TavoController {}

const plans = [
  [
    "Starter",
    "$19",
    "For small teams validating a product surface.",
    "primary",
  ],
  [
    "Scale",
    "$79",
    "For teams shipping dashboards, docs, and internal tools.",
    "secondary",
  ],
  [
    "Enterprise",
    "Custom",
    "For organizations with security, support, and governance needs.",
    "info",
  ],
] as const;

const PricingTemplate = createTavo<
  Record<string, never>,
  Record<string, never>,
  PricingTemplateController
>({
  model: () => ({}),
  controller: PricingTemplateController,
  view: () => (
    <Page size="xl" padding="none">
      <AppBar position="sticky">
        <Toolbar>
          <Inline>
            <Chip tone="primary">Pricing</Chip>
            <Link href="/">UI Kit</Link>
            <Link href="/templates/landing">Landing</Link>
            <Link href="/templates/docs">Docs</Link>
          </Inline>
          <Button size="sm">Contact sales</Button>
        </Toolbar>
      </AppBar>

      <Box maxWidth="lg" paddingInline="lg" center fullWidth>
        <Stack gap="lg">
          <Section
            eyebrow="Pricing template"
            title="Simple plans for reusable product interfaces"
            description="A SaaS pricing structure built from Card, List, Chip, Button, and Grid components."
          />

          <Grid minItemWidth="18rem" spacing="lg">
            {plans.map(([name, price, description, tone]) => (
              <Card.Root
                eyebrow={name === "Scale" ? "Popular" : "Plan"}
                title={name}
                surface="raised"
                actions={<Chip tone={tone}>{price}</Chip>}
              >
                <Stack>
                  <Text color="muted">{description}</Text>
                  <List spacing="sm" marker={tone}>
                    <ListItem title="Theme presets">
                      Use product-ready visual systems.
                    </ListItem>
                    <ListItem title="Component recipes">
                      Compose real app workflows quickly.
                    </ListItem>
                    <ListItem title="CSS-only mode">
                      Support stricter consumer builds.
                    </ListItem>
                  </List>
                  <Button
                    tone={name === "Scale" ? "primary" : "neutral"}
                    variant={name === "Scale" ? "solid" : "outline"}
                  >
                    Choose {name}
                  </Button>
                </Stack>
              </Card.Root>
            ))}
          </Grid>

          <Section title="Frequently asked questions">
            <Grid minItemWidth="20rem">
              <Card.Root title="Can I customize tokens?">
                <Text color="muted">
                  Yes, use config overrides or semantic token aliases.
                </Text>
              </Card.Root>
              <Card.Root title="Can I avoid Sass in apps?">
                <Text color="muted">
                  Yes, use `@tavojs/ui/css` with the compiled stylesheets.
                </Text>
              </Card.Root>
            </Grid>
          </Section>
        </Stack>
      </Box>
    </Page>
  ),
});

export default PricingTemplate;
