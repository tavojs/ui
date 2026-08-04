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
  Page,
  Section,
  Stack,
  Stat,
  Text,
  Toolbar,
} from "@/index";

export const head = {
  title: "Landing Template - Tavo.js UI",
  head: '<meta name="description" content="A product landing page template composed with @tavojs/ui components">',
};

class LandingTemplateController extends TavoController {}

const LandingTemplate = createTavo<
  Record<string, never>,
  Record<string, never>,
  LandingTemplateController
>({
  model: () => ({}),
  controller: LandingTemplateController,
  view: () => (
    <Page size="full" padding="none">
      <AppBar position="sticky">
        <Toolbar>
          <Inline>
            <Chip tone="primary">Tavo.js Launch</Chip>
            <Link href="/">UI Kit</Link>
            <Link href="/templates/pricing">Pricing</Link>
            <Link href="/templates/docs">Docs</Link>
          </Inline>
          <Inline>
            <Button size="sm" variant="ghost" tone="neutral">
              Sign in
            </Button>
            <Button size="sm">Start free</Button>
          </Inline>
        </Toolbar>
      </AppBar>

      <Box maxWidth="lg" paddingInline="lg" center fullWidth>
        <Stack gap="lg">
          <Grid minItemWidth="24rem" spacing="lg" align="center">
            <Stack gap="lg">
              <Chip tone="secondary">Product landing template</Chip>
              <Text
                variant="h1"
                style={{ maxWidth: "48rem", textWrap: "balance" }}
              >
                Launch a polished product page with the same primitives used
                inside the app.
              </Text>
              <Text color="muted" style={{ maxWidth: "40rem" }}>
                This template favors real product UI blocks, concise value
                props, metrics, and clear calls to action.
              </Text>
              <Inline>
                <Button>Book a demo</Button>
                <Button variant="outline" tone="neutral">
                  View components
                </Button>
              </Inline>
            </Stack>

            <Box surface="raised" padding="lg" radius="surface" border shadow>
              <Stack>
                <Card.Root
                  eyebrow="Pipeline"
                  title="Launch readiness"
                  surface="raised"
                >
                  <Grid minItemWidth="8rem">
                    <Stat label="Tasks" value="128" tone="primary" />
                    <Stat label="Teams" value="12" tone="secondary" />
                  </Grid>
                </Card.Root>
                <Box surface="subtle" padding="md" radius="md">
                  <Text color="muted">
                    Design tokens, layout primitives, and app-ready recipes in
                    one package.
                  </Text>
                </Box>
              </Stack>
            </Box>
          </Grid>

          <Section
            title="Built for product teams"
            description="Reusable sections for landing pages, product tours, and conversion flows."
          >
            <Grid minItemWidth="18rem" spacing="lg">
              <Card
                title="Token-first visuals"
                meta="Theme"
                tone="primary"
                description="Drive light, dark, glass, and monochrome experiences from one small config."
              />
              <Card
                title="Composable layout"
                meta="Primitives"
                tone="secondary"
                description="Use Page, Section, Grid, Stack, Box, and Card instead of one-off page CSS."
              />
              <Card
                title="Publishable package"
                meta="Library"
                tone="info"
                description="Ship with SCSS-module and CSS-only entrypoints for different app pipelines."
              />
            </Grid>
          </Section>
        </Stack>
      </Box>
    </Page>
  ),
});

export default LandingTemplate;
