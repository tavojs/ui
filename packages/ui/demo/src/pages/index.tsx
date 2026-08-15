import { createTavo, type Store, TavoController } from "@tavojs/core";
import {
  Timeline,
  TimelineItem,
  Alert,
  AppBar,
  Avatar,
  Chip,
  Box,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Checkbox,
  CodeBlock,
  Collapsible,
  CommandMenu,
  ConfirmDialog,
  Combobox,
  Toolbar,
  Dialog,
  DropdownMenu,
  Divider,
  Sheet,
  SheetClose,
  SheetContent,
  EmptyState,
  Field,
  Flex,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  GridRuler,
  Icon,
  Image,
  Inline,
  Kbd,
  Link,
  List,
  ListItem,
  TextInput,
  Section,
  Pagination,
  PropertyItem,
  PropertyList,
  Radio,
  RadioGroup,
  SearchInput,
  Progress,
  Select,
  ToggleGroup,
  Sidebar,
  Skeleton,
  Slider,
  Spacer,
  SplitPane,
  Stack,
  Stat,
  StatusDot,
  Stepper,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Tabs,
  Text,
  Textarea,
  Toast,
  Tooltip,
  VisuallyHidden,
} from "@/index";
import { demoThemeController } from "../theme-controller.ts";
import type { ThemeMode, ThemeRuntimeState } from "@/index";
import ComponentsCatalogPage from "./previews/components";

type DemoState = {
  activeTab: string;
  density: "compact" | "comfortable" | "spacious";
  status: "Ready" | "Saved" | "Draft";
  email: string;
  query: string;
  notes: string;
  budget: number;
  releaseDate: string;
  confidence: number;
  platform: "web" | "ios" | "android";
  dialogOpen: boolean;
  confirmOpen: boolean;
  drawerOpen: boolean;
  notifications: boolean;
  acceptTerms: boolean;
  releaseChannel: "stable" | "beta" | "nightly";
  page: number;
};

const tones = [
  "primary",
  "secondary",
  "neutral",
  "success",
  "warning",
  "danger",
  "info",
] as const;

export const head = {
  title: "Components - Tavo.js UI Preview",
  head: '<meta name="description" content="Search and explore every @tavojs/ui component in the package preview">',
};

class HomeController extends TavoController {
  model: Store<DemoState>;

  constructor({ model }: { model: Store<DemoState> }) {
    super();
    this.model = model;
  }

  patch(data: Partial<DemoState>) {
    this.model.patch(data);
  }
}

class ThemeControlsController extends TavoController {
  declare model: Store<ThemeRuntimeState>;

  onInit() {
    this.select(
      demoThemeController.store,
      (state) => state,
      (state) => this.model.setState(state),
      { immediate: true }
    );
  }

  setMode(mode: ThemeMode) {
    demoThemeController.setMode(mode);
  }
}

const ThemeControls = createTavo<
  Record<string, never>,
  ThemeRuntimeState,
  ThemeControlsController
>({
  model: () => demoThemeController.store.getState(),
  controller: ThemeControlsController,
  view: ({ state, controller }) => (
    <Inline gap="sm">
      <Button
        size="sm"
        variant={state.mode === "light" ? "solid" : "soft"}
        onClick={() => controller?.setMode("light")}
      >
        Light
      </Button>
      <Button
        size="sm"
        variant={state.mode === "dark" ? "solid" : "soft"}
        onClick={() => controller?.setMode("dark")}
      >
        Dark
      </Button>
      <Button
        size="sm"
        variant={state.mode === "system" ? "solid" : "soft"}
        onClick={() => controller?.setMode("system")}
      >
        System
      </Button>
    </Inline>
  ),
});

export const HomePage = createTavo<Record<string, never>, DemoState, HomeController>({
  model: () => ({
    activeTab: "overview",
    density: "comfortable",
    status: "Ready",
    email: "team@tavo.dev",
    query: "",
    notes: "Theme controls, primitives, and form fields are now token-driven.",
    budget: 24,
    releaseDate: "2026-05-14",
    confidence: 72,
    platform: "web",
    dialogOpen: false,
    confirmOpen: false,
    drawerOpen: false,
    notifications: true,
    acceptTerms: false,
    releaseChannel: "stable",
    page: 2,
  }),
  controller: HomeController,
  view: ({ state, controller }) => {
    const tabs = [
      {
        id: "overview",
        label: "Overview",
        content: (
          <Stack>
            <Alert title="Tavo.js-native runtime" tone="info">
              The UI kit uses `@tavojs/core` for TSX rendering, stores, and
              theme context rather than a React runtime.
            </Alert>
            <Text color="muted">
              Theme CSS comes from a small config file, but the consuming app
              still owns when and where that stylesheet is imported.
            </Text>
          </Stack>
        ),
      },
      {
        id: "forms",
        label: "Forms",
        content: (
          <Stack>
            <Field
              label="Team email"
              hint="Used to demonstrate form tokens and module-local styling."
            >
              <TextInput
                type="email"
                value={state.email}
                onInput={(event: Event) =>
                  controller?.patch({
                    email: (event.target as HTMLInputElement).value,
                  })
                }
              />
            </Field>
            <Field label="Density">
              <Select
                value={state.density}
                onChange={(event: Event) =>
                  controller?.patch({
                    density: (event.target as HTMLSelectElement)
                      .value as DemoState["density"],
                  })
                }
              >
                <option value="compact">Compact</option>
                <option value="comfortable">Comfortable</option>
                <option value="spacious">Spacious</option>
              </Select>
            </Field>
          </Stack>
        ),
      },
      {
        id: "system",
        label: "System",
        content: (
          <Stack>
            <Alert title="Generator model" tone="success">
              Raw ramps are generated from primary and secondary anchors, then
              mapped into semantic tokens.
            </Alert>
            <Alert title="Package model" tone="warning">
              Components live beside their SCSS modules, while the theme
              generator and CLI stay separate from runtime rendering.
            </Alert>
          </Stack>
        ),
      },
    ];

    return (
      <Box
        as="main"
        maxWidth="lg"
        paddingInline="md"
        center
        fullWidth
        style={{ paddingBlock: "24px 56px" }}
      >
        <Stack gap="lg">
          <AppBar style={{ borderRadius: "var(--tui-radius-lg)" }}>
            <Toolbar>
              <Inline gap="sm">
                <Chip tone="primary">Runtime</Chip>
                <Chip tone="secondary">Theme CLI</Chip>
                <Chip tone="neutral">TSX + module.scss</Chip>
              </Inline>
              <ThemeControls />
            </Toolbar>
          </AppBar>

          <Grid minItemWidth="20rem" spacing="lg">
            <Box surface="raised" radius="lg" padding="lg" shadow>
              <Chip tone="info">@tavojs/ui</Chip>
              <Text
                variant="h1"
                style={{ maxWidth: "46rem", textWrap: "balance" }}
              >
                Generated tokens, colocated SCSS modules, and a Tavo.js-native
                runtime.
              </Text>
              <Text color="muted" style={{ maxWidth: "42rem" }}>
                This package now follows the same logic you liked in `book-ui`,
                but reworked so styling stays app-owned, the generator is pure,
                and the component runtime stays squarely inside Tavo.js.
              </Text>
              <Inline>
                <Button onClick={() => controller?.patch({ status: "Saved" })}>
                  Save changes
                </Button>
                <Button
                  variant="outline"
                  tone="secondary"
                  onClick={() => controller?.patch({ status: "Draft" })}
                >
                  Mark draft
                </Button>
              </Inline>
              <Inline>
                <Link href="/templates/blog">Blog template</Link>
                <Link href="/templates/admin">Admin template</Link>
                <Link href="/templates/login-register">
                  Login/register template
                </Link>
              </Inline>
              <Inline>
                <Link href="/templates/landing">Landing</Link>
                <Link href="/templates/pricing">Pricing</Link>
                <Link href="/templates/docs">Docs</Link>
                <Link href="/templates/settings">Settings</Link>
                <Link href="/templates/checkout">Checkout</Link>
                <Link href="/previews/grid">Grid preview</Link>
                <Link href="/previews/components">Components preview</Link>
              </Inline>
              <Inline>
                <Link href="/templates/analytics">Analytics</Link>
                <Link href="/templates/onboarding">Onboarding</Link>
                <Link href="/templates/file-manager">File manager</Link>
                <Link href="/templates/inbox">Inbox</Link>
                <Link href="/templates/calendar">Calendar</Link>
                <Link href="/templates/project-board">Project board</Link>
                <Link href="/templates/command-center">Command center</Link>
              </Inline>
            </Box>

            <Card
              eyebrow="Theme"
              title="Default palette"
              actions={
                <Chip tone={state.status === "Saved" ? "success" : "neutral"}>
                  {state.status}
                </Chip>
              }
              surface="raised"
            >
              <Stack gap="sm">
                <ThemeControls />
                <Text color="muted">Email: {state.email}</Text>
              </Stack>
            </Card>
          </Grid>

          <Grid minItemWidth="22rem" spacing="lg">
            <Card eyebrow="Components" title="Core kit" surface="raised">
              <Stack gap="lg">
                <Inline>
                  <Button>Primary</Button>
                  <Button tone="secondary">Secondary</Button>
                  <Button tone="neutral" variant="soft">
                    Neutral
                  </Button>
                  <Button tone="danger" variant="outline">
                    Danger
                  </Button>
                </Inline>

                <Inline>
                  {tones.map((tone) => (
                    <Chip key={tone} tone={tone}>
                      {tone}
                    </Chip>
                  ))}
                </Inline>

                <Inline>
                  <Chip tone="primary" selected>
                    Selected
                  </Chip>
                  <Chip tone="secondary">Design</Chip>
                  <Chip
                    tone="success"
                    removable
                    onRemove={() => controller?.patch({ status: "Saved" })}
                  >
                    Synced
                  </Chip>
                  <Tooltip content="CSS-only tooltip for compact help text">
                    <Button size="sm" variant="ghost" tone="neutral">
                      Help
                    </Button>
                  </Tooltip>
                </Inline>

                <Tabs
                  tabs={tabs}
                  activeId={state.activeTab}
                  onChange={(activeTab) => controller?.patch({ activeTab })}
                />
              </Stack>
            </Card>

            <Card eyebrow="Tokens" title="Theme surfaces">
              <Stack>
                <Grid minItemWidth="9rem" spacing="sm">
                  <Box surface="primary" radius="md" padding="md">
                    Primary
                  </Box>
                  <Box surface="secondary" radius="md" padding="md">
                    Secondary
                  </Box>
                  <Box surface="raised" radius="md" padding="md" border>
                    Box
                  </Box>
                  <Box surface="neutral" radius="md" padding="md">
                    Neutral
                  </Box>
                </Grid>
                <Text color="muted">
                  The demo now uses the UI kit itself for page structure.
                  Developers can build pages with components and only reach for
                  custom styles for special media or product-specific art
                  direction.
                </Text>
              </Stack>
            </Card>
          </Grid>

          <Section
            title="Expanded demo surface"
            description="This page behaves like a package playground while staying mostly style-free at the page level."
            actions={
              <Breadcrumbs
                items={[
                  { label: "Library", href: "#" },
                  { label: "Components", href: "#components" },
                  { label: "Demo surface" },
                ]}
              />
            }
          >
            <Grid minItemWidth="21rem" spacing="md">
              <Card
                eyebrow="Inputs"
                title="Controls and form composition"
                surface="raised"
              >
                <Stack gap="lg">
                  <FormControl fullWidth>
                    <VisuallyHidden>
                      Form updates are announced below for assistive technology.
                    </VisuallyHidden>
                    <VisuallyHidden aria-live="polite" aria-atomic="true">
                      Current status: {state.status}
                    </VisuallyHidden>

                    <Field
                      label="Release email"
                      hint="Bound to Tavo.js MVC state."
                    >
                      <TextInput
                        type="email"
                        value={state.email}
                        onInput={(event: Event) =>
                          controller?.patch({
                            email: (event.target as HTMLInputElement).value,
                          })
                        }
                      />
                    </Field>

                    <Field label="Density">
                      <Select
                        value={state.density}
                        onChange={(event: Event) =>
                          controller?.patch({
                            density: (event.target as HTMLSelectElement)
                              .value as DemoState["density"],
                          })
                        }
                      >
                        <option value="compact">Compact</option>
                        <option value="comfortable">Comfortable</option>
                        <option value="spacious">Spacious</option>
                      </Select>
                    </Field>

                    <Field
                      label="Search components"
                      hint="Uses the new search input primitive."
                    >
                      <SearchInput
                        value={state.query}
                        placeholder="Search buttons, panels, sliders"
                        onInput={(event: Event) =>
                          controller?.patch({
                            query: (event.target as HTMLInputElement).value,
                          })
                        }
                      />
                    </Field>

                    <Field label="Target platform">
                      <ToggleGroup
                        name="platform"
                        value={state.platform}
                        items={[
                          { label: "Web", value: "web" },
                          { label: "iOS", value: "ios" },
                          { label: "Android", value: "android" },
                        ]}
                        onChange={(event: Event) =>
                          controller?.patch({
                            platform: (event.target as HTMLInputElement)
                              .value as DemoState["platform"],
                          })
                        }
                      />
                    </Field>

                    <Grid minItemWidth="10rem" spacing="md">
                      <Field label="Budget">
                        <TextInput
                          type="number"
                          inputMode="decimal"
                          value={state.budget}
                          min={0}
                          max={100}
                          onInput={(event: Event) =>
                            controller?.patch({
                              budget: Number(
                                (event.target as HTMLInputElement).value
                              ),
                            })
                          }
                        />
                      </Field>
                      <Field label="Release date">
                        <TextInput
                          type="date"
                          value={state.releaseDate}
                          onInput={(event: Event) =>
                            controller?.patch({
                              releaseDate: (event.target as HTMLInputElement)
                                .value,
                            })
                          }
                        />
                      </Field>
                    </Grid>

                    <Field label={`Confidence ${state.confidence}%`}>
                      <Slider
                        value={state.confidence}
                        onInput={(event: Event) =>
                          controller?.patch({
                            confidence: Number(
                              (event.target as HTMLInputElement).value
                            ),
                          })
                        }
                      />
                    </Field>

                    <Field label="Owner">
                      <Combobox
                        name="owner"
                        placeholder="Choose an owner"
                        options={[
                          { label: "Design systems", value: "Design systems" },
                          { label: "Runtime", value: "Runtime" },
                          { label: "Theme tooling", value: "Theme tooling" },
                        ]}
                      />
                    </Field>

                    <Field label="Release notes">
                      <Textarea
                        value={state.notes}
                        onInput={(event: Event) =>
                          controller?.patch({
                            notes: (event.target as HTMLTextAreaElement).value,
                          })
                        }
                      />
                    </Field>

                    <FormLabel>Actions</FormLabel>
                    <ButtonGroup fullWidth>
                      <Button variant="soft">Preview</Button>
                      <Button>Publish</Button>
                      <Button variant="outline" tone="danger">
                        Reset
                      </Button>
                    </ButtonGroup>

                    <Inline>
                      <FormControlLabel
                        label="Notifications"
                        control={
                          <Switch
                            checked={state.notifications}
                            onChange={() =>
                              controller?.patch({
                                notifications: !state.notifications,
                              })
                            }
                          />
                        }
                      />
                      <FormControlLabel
                        label="Accept terms"
                        control={
                          <Checkbox
                            checked={state.acceptTerms}
                            onChange={() =>
                              controller?.patch({
                                acceptTerms: !state.acceptTerms,
                              })
                            }
                          />
                        }
                      />
                    </Inline>

                    <Stack gap="sm">
                      <FormLabel>Release channel</FormLabel>
                      <RadioGroup
                        name="release-channel"
                        orientation="horizontal"
                      >
                        {(["stable", "beta", "nightly"] as const).map(
                          (channel) => (
                            <FormControlLabel
                              key={channel}
                              label={channel}
                              control={
                                <Radio
                                  name="release-channel"
                                  value={channel}
                                  checked={state.releaseChannel === channel}
                                  onChange={() =>
                                    controller?.patch({
                                      releaseChannel: channel,
                                    })
                                  }
                                />
                              }
                            />
                          )
                        )}
                      </RadioGroup>
                    </Stack>
                  </FormControl>
                </Stack>
              </Card>

              <Card
                eyebrow="Layout"
                title="Grid, flex, box, spacing"
                surface="raised"
              >
                <Stack gap="lg">
                  <Section
                    eyebrow="Page anatomy"
                    title="Composable shells"
                    description="Section, Card, Box, Sidebar, and SplitPane cover common product layouts without page SCSS."
                    actions={<Button size="sm">Review</Button>}
                  />
                  <SplitPane
                    ratio="third"
                    aside={
                      <Sidebar padding="sm">
                        <Chip tone="neutral">Sidebar</Chip>
                        <Link href="#components">Components</Link>
                        <Link href="#tokens">Tokens</Link>
                      </Sidebar>
                    }
                  >
                    <Card
                      title="Card primitive"
                      description="A framed content region with built-in header rhythm."
                    >
                      <Box surface="subtle" radius="md" padding="md" border>
                        Box composes page sections, inspector panes, and nested
                        settings blocks.
                      </Box>
                    </Card>
                  </SplitPane>
                  <Spacer size="sm" />

                  <Box surface="subtle" radius="md" padding="md">
                    <Flex justify="between" align="center">
                      <Box surface="default" radius="md" padding="md" border>
                        Box
                      </Box>
                      <Box surface="default" radius="md" padding="md" border>
                        Flex
                      </Box>
                      <Box surface="default" radius="md" padding="md" border>
                        Gap
                      </Box>
                    </Flex>
                  </Box>

                  <Grid minItemWidth="9rem" spacing="md">
                    <Box surface="default" radius="md" padding="md" border>
                      12-col aware
                    </Box>
                    <Box surface="default" radius="md" padding="md" border>
                      Auto-fit cards
                    </Box>
                    <Box surface="default" radius="md" padding="md" border>
                      Token spacing
                    </Box>
                  </Grid>

                  <GridRuler spacing="sm" />
                </Stack>
              </Card>

              <Card
                eyebrow="Data Display"
                title="Avatar, image, text, skeleton"
                surface="raised"
              >
                <Stack gap="lg">
                  <Inline>
                    <Avatar initials="HM" />
                    <Avatar initials="TU" size="lg" />
                    <Avatar
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
                      alt="Profile"
                      size="lg"
                    />
                  </Inline>

                  <Image
                    src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=900&q=80"
                    alt="Desk setup"
                    height="180"
                    style={{
                      width: "100%",
                      borderRadius: "var(--tui-radius-md)",
                    }}
                  />

                  <Stack gap="sm">
                    <Text variant="h3">
                      Display tokens are now reusable primitives.
                    </Text>
                    <Text color="muted">
                      `Text`, `Image`, `Avatar`, and `Skeleton` are all
                      theme-aware without needing a separate rendering runtime.
                    </Text>
                    <Skeleton variant="text" width="68%" />
                  </Stack>
                </Stack>
              </Card>

              <Card
                eyebrow="Metrics"
                title="Stats and progress"
                surface="raised"
              >
                <Stack gap="lg">
                  <Grid minItemWidth="10rem" spacing="md">
                    <Stat
                      label="Adoption"
                      value="84%"
                      trend="+12%"
                      tone="success"
                      hint="Across demo components"
                    />
                    <Stat
                      label="Tokens"
                      value="67"
                      trend="Generated"
                      tone="info"
                      hint="Light and dark modes"
                    />
                    <Stat
                      label="Build"
                      value="31kB"
                      trend="Dry run"
                      tone="secondary"
                      hint="Packed package size"
                    />
                  </Grid>

                  <Stack gap="md">
                    <Progress
                      label="Component coverage"
                      value={80}
                      tone="success"
                      showValue
                    />
                    <Progress
                      label="Theme readiness"
                      value={74}
                      tone="secondary"
                      showValue
                    />
                    <Progress
                      label="Docs polish"
                      value={48}
                      tone="warning"
                      showValue
                    />
                  </Stack>

                  <Inline gap="sm">
                    <Spinner size="sm" tone="primary" />
                    <Text color="muted">Preparing package preview</Text>
                  </Inline>
                </Stack>
              </Card>

              <Card
                eyebrow="Data"
                title="Table and pagination"
                surface="raised"
              >
                <Stack gap="lg">
                  <Table compact>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Component</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell numeric>Tokens</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Button</TableCell>
                        <TableCell>
                          <Chip tone="success">Ready</Chip>
                        </TableCell>
                        <TableCell numeric>12</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Dialog</TableCell>
                        <TableCell>
                          <Chip tone="info">Controlled</Chip>
                        </TableCell>
                        <TableCell numeric>9</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Theme CLI</TableCell>
                        <TableCell>
                          <Chip tone="secondary">Generated</Chip>
                        </TableCell>
                        <TableCell numeric>67</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <Pagination
                    page={state.page}
                    pageCount={8}
                    onChange={(page) => controller?.patch({ page })}
                  />
                </Stack>
              </Card>

              <Card
                eyebrow="Navigation"
                title="App bar, links, menus, surfaces"
                surface="raised"
              >
                <Stack gap="lg">
                  <AppBar
                    position="static"
                    style={{ borderRadius: "var(--tui-radius-md)" }}
                  >
                    <Text variant="h6">Workspace</Text>
                    <Inline gap="sm">
                      <Link href="#components">Components</Link>
                      <Link href="#tokens" noUnderline>
                        Tokens
                      </Link>
                    </Inline>
                  </AppBar>

                  <DropdownMenu>
                    <DropdownMenu.Trigger>
                      <Button variant="outline" tone="neutral">
                        Open menu
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item>Duplicate component</DropdownMenu.Item>
                      <DropdownMenu.Item>Export tokens</DropdownMenu.Item>
                      <DropdownMenu.Item href="https://example.com">
                        Open docs
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu>

                  <Collapsible open>
                    <Collapsible.Trigger>
                      Why keep modules colocated?
                    </Collapsible.Trigger>
                    <Collapsible.Content>
                      <Text color="muted">
                        It makes ownership clear, improves portability, and
                        keeps each component’s styling decisions close to its
                        implementation.
                      </Text>
                    </Collapsible.Content>
                  </Collapsible>

                  <Divider label="Shortcuts" />
                  <Inline gap="sm">
                    <Kbd>Cmd</Kbd>
                    <Kbd>K</Kbd>
                    <Text color="muted">Open command surface</Text>
                  </Inline>
                </Stack>
              </Card>

              <Card
                eyebrow="Recipes"
                title="Product-ready compositions"
                surface="raised"
              >
                <Stack gap="lg">
                  <Toolbar
                    title="Resources"
                    filters={
                      <Toolbar>
                        <SearchInput size="sm" placeholder="Filter resources" />
                        <Select size="sm">
                          <option>All states</option>
                          <option>Ready</option>
                        </Select>
                      </Toolbar>
                    }
                    actions={<Button size="sm">Create</Button>}
                  />
                  <Grid minItemWidth="12rem">
                    <Stat label="Recipes" value="13" tone="info" />
                    <Stat label="Preset modes" value="7" tone="secondary" />
                  </Grid>
                  <Stepper
                    steps={[
                      {
                        id: "config",
                        title: "Config",
                        description: "Choose preset",
                        status: "complete",
                      },
                      {
                        id: "tokens",
                        title: "Tokens",
                        description: "Generate CSS",
                        status: "current",
                      },
                      {
                        id: "ship",
                        title: "Ship",
                        description: "Publish package",
                      },
                    ]}
                  />
                  <Card
                    title="Theme preview"
                    description="Static artifact generated by the CLI for design and token review."
                    meta="CLI"
                    tone="primary"
                    actions={
                      <Button size="sm" variant="ghost">
                        Open
                      </Button>
                    }
                  />
                  <Card
                    title="Recipe settings"
                    description="Common settings panel anatomy for product screens."
                  >
                    <PropertyList>
                      <PropertyItem label="Preset">glass</PropertyItem>
                      <PropertyItem label="Density">
                        {state.density}
                      </PropertyItem>
                      <PropertyItem label="Platform">
                        {state.platform}
                      </PropertyItem>
                    </PropertyList>
                  </Card>
                  <Timeline>
                    <TimelineItem
                      title="Theme generated"
                      meta="now"
                      tone="success"
                    >
                      New product aliases are available for app shells and
                      overlays.
                    </TimelineItem>
                    <TimelineItem
                      title="Package checked"
                      meta="2m ago"
                      tone="info"
                    >
                      CSS-only entrypoint and SCSS-module entrypoints both
                      build.
                    </TimelineItem>
                  </Timeline>
                  <Toast
                    title="Release ready"
                    tone="success"
                    action={
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => controller?.patch({ confirmOpen: true })}
                      >
                        Review
                      </Button>
                    }
                  >
                    Status primitives, activity, toast, stepper, and property
                    display are available.
                  </Toast>
                  <Inline>
                    <StatusDot tone="success" label="Online" pulse />
                    <StatusDot tone="warning" label="Needs review" />
                    <StatusDot tone="danger" label="Blocked" />
                  </Inline>
                  <CommandMenu
                    items={[
                      {
                        label: "Generate theme",
                        description: "Run the CLI generator",
                        shortcut: "G",
                      },
                      {
                        label: "Open preview",
                        description: "Inspect tokens",
                        shortcut: "P",
                      },
                    ]}
                  />
                </Stack>
              </Card>

              <Card
                eyebrow="Content"
                title="Lists and code blocks"
                surface="raised"
              >
                <Stack gap="lg">
                  <List marker="secondary">
                    <ListItem title="Box width constraints" meta="layout">
                      Centers page content and applies responsive inline
                      padding.
                    </ListItem>
                    <ListItem title="Section" meta="composition">
                      Gives pages a consistent heading, description, actions,
                      and body rhythm.
                    </ListItem>
                    <ListItem title="Toolbar" meta="commands">
                      Aligns controls without custom flex classes.
                    </ListItem>
                  </List>

                  <CodeBlock
                    language="tsx"
                    wrap
                    code={
                      '<Section title="Settings" actions={<Button>Save</Button>}><Grid minItemWidth="18rem">...</Grid></Section>'
                    }
                  />
                </Stack>
              </Card>

              <Card
                eyebrow="Overlays"
                title="Dialog and drawer"
                surface="raised"
              >
                <Stack gap="lg">
                  <Inline>
                    <Button
                      onClick={() => controller?.patch({ dialogOpen: true })}
                    >
                      Open dialog
                    </Button>
                    <Button
                      variant="outline"
                      tone="secondary"
                      onClick={() => controller?.patch({ drawerOpen: true })}
                    >
                      Open drawer
                    </Button>
                  </Inline>

                  <Alert tone="info" title="Controlled primitives">
                    Overlay visibility lives in the page state, which keeps the
                    API predictable and Tavo.js-friendly.
                  </Alert>
                </Stack>
              </Card>

              <Card
                eyebrow="Surfaces"
                title="Composable card anatomy"
                surface="raised"
              >
                <Box
                  surface="raised"
                  radius="lg"
                  border
                  style={{ overflow: "hidden" }}
                >
                  <CardHeader>
                    <Text variant="h6">Release summary</Text>
                  </CardHeader>
                  <CardMedia
                    style={{ background: "var(--tui-color-primary-bg)" }}
                  />
                  <CardContent>
                    <Stack gap="sm">
                      <Text color="muted">
                        `CardHeader`, `CardMedia`, `CardContent`, and
                        `CardActions` let consumers build their own card
                        structure without fighting a locked template.
                      </Text>
                    </Stack>
                  </CardContent>
                  <CardActions
                    style={{
                      padding: "0 var(--tui-space-5) var(--tui-space-5)",
                    }}
                  >
                    <Button size="sm">Open</Button>
                    <Button size="sm" variant="ghost" tone="neutral">
                      Archive
                    </Button>
                  </CardActions>
                </Box>
              </Card>

              <Card
                eyebrow="Icons"
                title="Simple inline SVG wrapper"
                surface="raised"
              >
                <Stack gap="md">
                  <Inline>
                    <Icon width="20" height="20" viewBox="0 0 24 24">
                      <path d="M12 2l3.1 6.3 6.9 1-5 4.8 1.2 6.8L12 17.6 5.8 20.9 7 14.1 2 9.3l6.9-1L12 2z" />
                    </Icon>
                    <Icon width="20" height="20" viewBox="0 0 24 24">
                      <path
                        d="M4 12h16M12 4v16"
                        stroke="currentColor"
                        stroke-width="2"
                        fill="none"
                      />
                    </Icon>
                    <Icon width="20" height="20" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      />
                    </Icon>
                  </Inline>
                  <Text color="muted">
                    It is intentionally tiny: just enough to standardize sizing
                    and inheritance without turning icons into a subsystem.
                  </Text>
                </Stack>
              </Card>

              <Card
                eyebrow="Feedback"
                title="Empty states and separators"
                surface="raised"
              >
                <Stack gap="lg">
                  <EmptyState
                    title="No variants selected"
                    description="Use empty states for friendly but compact guidance when a panel has no records, filters, or generated output yet."
                    actions={
                      <Inline>
                        <Button size="sm">Add variant</Button>
                        <Button size="sm" variant="ghost" tone="neutral">
                          Clear filters
                        </Button>
                      </Inline>
                    }
                  >
                    <Divider label="or import" />
                  </EmptyState>

                  <Timeline>
                    <TimelineItem
                      title="Theme generated"
                      meta="09:12"
                      tone="success"
                    >
                      CSS variables were emitted from the config and copied to
                      the package output.
                    </TimelineItem>
                    <TimelineItem
                      title="Components exported"
                      meta="09:18"
                      tone="info"
                    >
                      New primitives are available from the root library
                      entrypoint.
                    </TimelineItem>
                    <TimelineItem
                      title="Preview ready"
                      meta="09:22"
                      tone="secondary"
                    >
                      The local Tavo.js demo is running with the expanded catalog.
                    </TimelineItem>
                  </Timeline>
                </Stack>
              </Card>
            </Grid>
          </Section>
        </Stack>

        <Dialog
          open={state.dialogOpen}
          title="Publish release"
          onClose={() => controller?.patch({ dialogOpen: false })}
        >
          <Stack gap="md">
            <Text color="muted">
              This dialog is intentionally controlled by the page state instead
              of hiding its own toggles.
            </Text>
            <Inline>
              <Button
                onClick={() =>
                  controller?.patch({ dialogOpen: false, status: "Saved" })
                }
              >
                Confirm
              </Button>
              <Button
                variant="ghost"
                tone="neutral"
                onClick={() => controller?.patch({ dialogOpen: false })}
              >
                Cancel
              </Button>
            </Inline>
          </Stack>
        </Dialog>

        <Sheet
          open={state.drawerOpen}
          side="right"
          onClose={() => controller?.patch({ drawerOpen: false })}
        >
          <SheetContent open={state.drawerOpen} side="right">
            <Stack gap="lg">
              <Inline>
                <Chip tone="secondary">Sheet</Chip>
                <SheetClose
                  onClick={() => controller?.patch({ drawerOpen: false })}
                />
              </Inline>
              <Text variant="h3">Theme inspector</Text>
              <Text color="muted">
                Use this for secondary workflows like token browsing, inspector
                tools, or contextual docs.
              </Text>
              <Grid minItemWidth="8rem" spacing="sm">
                <Box surface="primary" radius="md" padding="md">
                  Primary
                </Box>
                <Box surface="secondary" radius="md" padding="md">
                  Secondary
                </Box>
                <Box surface="neutral" radius="md" padding="md">
                  Neutral
                </Box>
              </Grid>
            </Stack>
          </SheetContent>
        </Sheet>

        <ConfirmDialog
          open={state.confirmOpen}
          title="Review release"
          description="This confirms the new product primitives are ready to document and publish."
          confirmLabel="Looks good"
          onConfirm={() =>
            controller?.patch({ confirmOpen: false, status: "Saved" })
          }
          onCancel={() => controller?.patch({ confirmOpen: false })}
        />
      </Box>
    );
  },
});

export default ComponentsCatalogPage;
