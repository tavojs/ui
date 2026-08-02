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
  Text,
  Toolbar,
} from "@/index";

export const head = {
  title: "Blog Template - Tavo UI",
  head: '<meta name="description" content="A blog template composed with @tavojs/ui components">',
};

class BlogTemplateController extends TavoController {}

const articles = [
  {
    title: "Designing with generated tokens",
    meta: "Theme systems",
    description:
      "How small color inputs can drive product surfaces, content hierarchy, and interaction states.",
  },
  {
    title: "Colocated components without page SCSS",
    meta: "Frontend",
    description:
      "A practical layout model for composing editorial pages with reusable primitives.",
  },
  {
    title: "Shipping a Tavo-native UI kit",
    meta: "Release",
    description:
      "Notes on package exports, CSS-only consumption, and keeping the runtime focused.",
  },
];

const BlogTemplate = createTavo<
  Record<string, never>,
  Record<string, never>,
  BlogTemplateController
>({
  model: () => ({}),
  controller: BlogTemplateController,
  view: () => (
    <Page size="xl" padding="none">
      <AppBar position="sticky">
        <Toolbar>
          <Inline gap="sm">
            <Chip tone="primary">Tavo Journal</Chip>
            <Link href="/">UI Kit</Link>
            <Link href="/templates/admin">Admin</Link>
            <Link href="/templates/login-register">Auth</Link>
          </Inline>
          <Button size="sm" variant="soft">
            Subscribe
          </Button>
        </Toolbar>
      </AppBar>

      <Box maxWidth="lg" paddingInline="lg" center fullWidth>
        <Stack gap="lg">
          <Section
            eyebrow="Blog template"
            title="A calm editorial layout built from the UI kit"
            description="Use this as a starting point for changelogs, product essays, release notes, and documentation-led marketing pages."
            actions={
              <Inline>
                <Button>Start writing</Button>
                <Button variant="outline" tone="neutral">
                  View archive
                </Button>
              </Inline>
            }
          />

          <Grid minItemWidth="18rem" spacing="lg">
            <Box surface="raised" padding="lg" radius="surface" border shadow>
              <Stack gap="md">
                <Chip tone="secondary">Featured</Chip>
                <Text variant="h2">The new baseline for Tavo product UI</Text>
                <Text color="muted">
                  A full article hero with reusable spacing, surface, badge,
                  text, and action primitives.
                </Text>
                <Inline>
                  <Chip tone="neutral">8 min read</Chip>
                  <Chip tone="info">Design systems</Chip>
                </Inline>
              </Stack>
            </Box>

            <Card.Root
              eyebrow="Newsletter"
              title="Weekly product notes"
              surface="raised"
            >
              <Stack gap="md">
                <Text color="muted">
                  A compact signup card using only kit spacing and form-adjacent
                  layout primitives.
                </Text>
                <Inline>
                  <Button size="sm">Join list</Button>
                  <Button size="sm" variant="ghost" tone="neutral">
                    RSS
                  </Button>
                </Inline>
              </Stack>
            </Card.Root>
          </Grid>

          <Section
            eyebrow="Latest"
            title="Recent articles"
            description="Cards are intentionally restrained so long-form content stays readable."
          >
            <Grid minItemWidth="18rem" spacing="lg">
              {articles.map((article) => (
                <Card
                  title={article.title}
                  description={article.description}
                  meta={article.meta}
                  tone="neutral"
                >
                  <Link href="#">Read article</Link>
                </Card>
              ))}
            </Grid>
          </Section>

          <Box surface="subtle" radius="lg" padding="lg">
            <Grid minItemWidth="16rem">
              <Stack gap="sm">
                <Text variant="h3">Editorial structure</Text>
                <Text color="muted">
                  Hero, feature, archive, and newsletter blocks.
                </Text>
              </Stack>
              <Stack gap="sm">
                <Text variant="h3">No page stylesheet</Text>
                <Text color="muted">
                  Spacing and color come from component props and tokens.
                </Text>
              </Stack>
            </Grid>
          </Box>
        </Stack>
      </Box>
    </Page>
  ),
});

export default BlogTemplate;
