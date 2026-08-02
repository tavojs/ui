import { createTavo, type Store, TavoController } from "@tavojs/core";
import {
  Chip,
  Box,
  Button,
  Card,
  CodeBlock,
  Field,
  Grid,
  GridRuler,
  Inline,
  Link,
  TextInput,
  Page,
  Section,
  Select,
  Stack,
  Text,
} from "@/index";

type GridPreviewState = {
  mode: "fixed" | "responsive";
  columns: number;
  minItemWidth: string;
  spacing: "sm" | "md" | "lg";
  align: "start" | "center" | "end" | "stretch";
};

export const head = {
  title: "Grid Preview - Tavo UI",
  head: '<meta name="description" content="A focused grid preview page for testing website layout with @tavojs/ui">',
};

class GridPreviewController extends TavoController {
  model: Store<GridPreviewState>;

  constructor({ model }: { model: Store<GridPreviewState> }) {
    super();
    this.model = model;
  }

  patch(data: Partial<GridPreviewState>) {
    this.model.patch(data);
  }
}

function Tile({
  label,
  tone = "neutral",
  span,
  height = "8rem",
}: {
  label: string;
  tone?:
    | "primary"
    | "secondary"
    | "neutral"
    | "success"
    | "warning"
    | "danger"
    | "info";
  span?: string;
  height?: string;
}) {
  return (
    <Box
      surface={tone === "primary" || tone === "secondary" ? tone : "raised"}
      radius="md"
      padding="md"
      border
      style={{ gridColumn: span, minHeight: height }}
    >
      <Stack gap="sm">
        <Chip tone={tone}>{label}</Chip>
        <Text variant="hint" color="muted">
          {span ?? "auto"}
        </Text>
      </Stack>
    </Box>
  );
}

const GridPreviewPage = createTavo<
  Record<string, never>,
  GridPreviewState,
  GridPreviewController
>({
  model: () => ({
    mode: "fixed",
    columns: 12,
    minItemWidth: "16rem",
    spacing: "md",
    align: "stretch",
  }),
  controller: GridPreviewController,
  view: ({ state, controller }) => {
    const isFixed = state.mode === "fixed";
    const gridProps = isFixed
      ? { columns: state.columns }
      : { minItemWidth: state.minItemWidth };

    return (
      <Page size="xl" padding="none">
        <Box as="main" maxWidth="xl" paddingInline="lg" center fullWidth>
          <Stack gap="lg">
            <Section
              eyebrow="Preview"
              title="Website grid"
              description="A focused grid surface for testing page spans, responsive card grids, and token spacing."
              actions={
                <Inline>
                  <Link href="/previews">Previews</Link>
                  <Link href="/">Main demo</Link>
                </Inline>
              }
            />

            <Grid minItemWidth="18rem" spacing="lg" align="start">
              <Card title="Controls" eyebrow="Grid settings">
                <Stack>
                  <Field label="Mode">
                    <Select
                      value={state.mode}
                      onChange={(event: Event) =>
                        controller?.patch({
                          mode: (event.target as HTMLSelectElement)
                            .value as GridPreviewState["mode"],
                        })
                      }
                    >
                      <option value="fixed">Fixed columns</option>
                      <option value="responsive">Responsive min width</option>
                    </Select>
                  </Field>

                  <Field label="Columns">
                    <TextInput
                      type="number"
                      inputMode="decimal"
                      min={2}
                      max={16}
                      value={state.columns}
                      disabled={!isFixed}
                      onInput={(event: Event) =>
                        controller?.patch({
                          columns: Number(
                            (event.target as HTMLInputElement).value
                          ),
                        })
                      }
                    />
                  </Field>

                  <Field label="Minimum item width">
                    <Select
                      value={state.minItemWidth}
                      disabled={isFixed}
                      onChange={(event: Event) =>
                        controller?.patch({
                          minItemWidth: (event.target as HTMLSelectElement)
                            .value,
                        })
                      }
                    >
                      <option value="12rem">12rem</option>
                      <option value="16rem">16rem</option>
                      <option value="20rem">20rem</option>
                      <option value="24rem">24rem</option>
                    </Select>
                  </Field>

                  <Field label="Spacing">
                    <Select
                      value={state.spacing}
                      onChange={(event: Event) =>
                        controller?.patch({
                          spacing: (event.target as HTMLSelectElement)
                            .value as GridPreviewState["spacing"],
                        })
                      }
                    >
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                    </Select>
                  </Field>

                  <Field label="Align items">
                    <Select
                      value={state.align}
                      onChange={(event: Event) =>
                        controller?.patch({
                          align: (event.target as HTMLSelectElement)
                            .value as GridPreviewState["align"],
                        })
                      }
                    >
                      <option value="stretch">Stretch</option>
                      <option value="start">Start</option>
                      <option value="center">Center</option>
                      <option value="end">End</option>
                    </Select>
                  </Field>
                </Stack>
              </Card>

              <Card title="Current config" eyebrow="Rendered props">
                <Stack>
                  <Box padding="none" radius="md" border>
                    <CodeBlock
                      highlighted={false}
                      code={`<Grid ${
                        isFixed
                          ? `columns={${state.columns}}`
                          : `minItemWidth="${state.minItemWidth}"`
                      } spacing="${state.spacing}" align="${state.align}" />`}
                    />
                  </Box>
                  <Inline>
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={() =>
                        controller?.patch({
                          mode: "fixed",
                          columns: 12,
                          spacing: "md",
                          align: "stretch",
                        })
                      }
                    >
                      12 column
                    </Button>
                    <Button
                      size="sm"
                      variant="soft"
                      tone="secondary"
                      onClick={() =>
                        controller?.patch({
                          mode: "responsive",
                          minItemWidth: "20rem",
                          spacing: "lg",
                          align: "start",
                        })
                      }
                    >
                      Card grid
                    </Button>
                  </Inline>
                </Stack>
              </Card>
            </Grid>

            <Card title="Column ruler" eyebrow="12-column visual helper">
              <GridRuler spacing={state.spacing} />
            </Card>

            <Card title="Website layout spans" eyebrow="Fixed grid test">
              <Grid {...gridProps} spacing={state.spacing} align={state.align}>
                <Tile
                  label="Hero"
                  tone="primary"
                  span={isFixed ? "span 12" : undefined}
                  height="12rem"
                />
                <Tile
                  label="Intro"
                  tone="secondary"
                  span={isFixed ? "span 7" : undefined}
                />
                <Tile
                  label="Aside"
                  tone="info"
                  span={isFixed ? "span 5" : undefined}
                />
                <Tile
                  label="Feature A"
                  tone="success"
                  span={isFixed ? "span 4" : undefined}
                />
                <Tile
                  label="Feature B"
                  tone="warning"
                  span={isFixed ? "span 4" : undefined}
                />
                <Tile
                  label="Feature C"
                  tone="danger"
                  span={isFixed ? "span 4" : undefined}
                />
                <Tile
                  label="Content"
                  tone="neutral"
                  span={isFixed ? "span 8" : undefined}
                  height="10rem"
                />
                <Tile
                  label="Rail"
                  tone="info"
                  span={isFixed ? "span 4" : undefined}
                  height="10rem"
                />
                <Tile
                  label="Footer"
                  tone="secondary"
                  span={isFixed ? "span 12" : undefined}
                />
              </Grid>
            </Card>

            <Card title="Responsive card grid" eyebrow="Auto-fit test">
              <Grid
                minItemWidth={state.minItemWidth}
                spacing={state.spacing}
                align={state.align}
              >
                {Array.from({ length: 9 }, (_, index) => (
                  <Box padding="md" radius="md" border>
                    <Stack gap="sm">
                      <Chip tone={index % 2 === 0 ? "primary" : "neutral"}>
                        Card {index + 1}
                      </Chip>
                      <Text color="muted">
                        Responsive item using `minItemWidth`.
                      </Text>
                    </Stack>
                  </Box>
                ))}
              </Grid>
            </Card>
          </Stack>
        </Box>
      </Page>
    );
  },
});

export default GridPreviewPage;
