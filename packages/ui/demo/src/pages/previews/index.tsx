import { createTavo, TavoController } from "@tavojs/core";
import {
  Chip,
  Box,
  Card,
  Grid,
  Inline,
  Link,
  Page,
  Section,
  Stack,
  Text,
} from "@/index";

export const head = {
  title: "Previews - Tavo.js UI",
  head: '<meta name="description" content="Focused preview pages for testing @tavojs/ui layouts">',
};

class PreviewsController extends TavoController {}

const PreviewsPage = createTavo<
  Record<string, never>,
  Record<string, never>,
  PreviewsController
>({
  model: () => ({}),
  controller: PreviewsController,
  view: () => (
    <Page size="xl" padding="none">
      <Box as="main" maxWidth="lg" paddingInline="lg" center fullWidth>
        <Stack gap="lg">
          <Section
            eyebrow="Previews"
            title="Focused test surfaces"
            description="Small pages for validating layout behavior outside the main component demo."
            actions={
              <Inline>
                <Link href="/">Main demo</Link>
                <Link href="/previews/grid">Grid preview</Link>
              </Inline>
            }
          />

          <Grid minItemWidth="18rem" spacing="lg">
            <Card title="Website grid" eyebrow="Layout">
              <Stack>
                <Text color="muted">
                  Test fixed and responsive grid behavior with common website
                  layout spans.
                </Text>
                <Inline>
                  <Chip tone="primary">12 columns</Chip>
                  <Chip tone="secondary">Responsive</Chip>
                </Inline>
                <Link href="/previews/grid">Open grid preview</Link>
              </Stack>
            </Card>
            <Card title="Component catalog" eyebrow="Reference">
              <Stack>
                <Text color="muted">
                  Search all public components and open dedicated pages for
                  examples, props, imports, and accessibility guidance.
                </Text>
                <Inline>
                  <Chip tone="success">80 components</Chip>
                  <Chip tone="info">Searchable</Chip>
                </Inline>
                <Link href="/previews/components">Browse components</Link>
              </Stack>
            </Card>
          </Grid>
        </Stack>
      </Box>
    </Page>
  ),
});

export default PreviewsPage;
