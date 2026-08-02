import { createTavo, TavoController } from "@tavojs/core";
import {
  AppBar,
  Chip,
  Box,
  Button,
  Card,
  CodeBlock,
  Collapsible,
  Grid,
  Inline,
  Link,
  List,
  ListItem,
  Page,
  Section,
  SearchInput,
  Sidebar,
  Stack,
  Text,
  Toolbar,
} from "@/index";

export const head = {
  title: "Docs Template - Tavo UI",
  head: '<meta name="description" content="A docs and help center template composed with @tavojs/ui components">',
};

class DocsTemplateController extends TavoController {}

const DocsTemplate = createTavo<
  Record<string, never>,
  Record<string, never>,
  DocsTemplateController
>({
  model: () => ({}),
  controller: DocsTemplateController,
  view: () => (
    <Page size="xl" padding="none">
      <AppBar position="sticky">
        <Toolbar>
          <Inline>
            <Chip tone="primary">Docs</Chip>
            <Link href="/">UI Kit</Link>
            <Link href="/templates/landing">Landing</Link>
            <Link href="/templates/settings">Settings</Link>
          </Inline>
          <SearchInput placeholder="Search docs" aria-label="Search docs" />
        </Toolbar>
      </AppBar>

      <Box maxWidth="xl" paddingInline="lg" center fullWidth>
        <Grid
          minItemWidth="18rem"
          spacing="lg"
          style={{ gridTemplateColumns: "18rem minmax(0, 1fr)" }}
        >
          <Sidebar padding="md">
            <Stack gap="sm">
              <Link href="#">Getting started</Link>
              <Link href="#">Theme config</Link>
              <Link href="#">Components</Link>
              <Link href="#">CSS-only mode</Link>
            </Stack>
          </Sidebar>

          <Stack gap="lg">
            <Section
              eyebrow="Docs template"
              title="Help center layout"
              description="A documentation page with navigation, code snippets, FAQs, and guided links."
              actions={<Button>Open guide</Button>}
            />

            <Box padding="lg" radius="surface" border>
              <Stack>
                <Text variant="h2">Install</Text>
                <CodeBlock
                  code={`npm install @tavojs/ui @tavojs/core sass\nnpx tavo-ui init --config tavo-ui.config.json`}
                />
              </Stack>
            </Box>

            <Grid minItemWidth="18rem">
              <Card.Root title="Theme setup">
                <List spacing="sm">
                  <ListItem title="Primary color">
                    Required minimum config.
                  </ListItem>
                  <ListItem title="Preset">
                    Optional visual starting point.
                  </ListItem>
                </List>
              </Card.Root>
              <Card.Root title="Page composition">
                <Text color="muted">
                  Use layout primitives before reaching for app-level SCSS.
                </Text>
              </Card.Root>
            </Grid>

            <Stack gap="sm">
              <Collapsible open>
                <Collapsible.Trigger>
                  How do I create a glass theme?
                </Collapsible.Trigger>
                <Collapsible.Content>
                  Set `color.method` to `glass`, or use the `glass` preset.
                </Collapsible.Content>
              </Collapsible>
              <Collapsible>
                <Collapsible.Trigger>
                  How do consumers avoid Sass?
                </Collapsible.Trigger>
                <Collapsible.Content>
                  Import components from `@tavojs/ui/css` and include
                  `components.css` plus `theme.css`.
                </Collapsible.Content>
              </Collapsible>
            </Stack>
          </Stack>
        </Grid>
      </Box>
    </Page>
  ),
});

export default DocsTemplate;
