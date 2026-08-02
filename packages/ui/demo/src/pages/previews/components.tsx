import { createTavo, type Store, TavoController } from "@tavojs/core";
import {
  Timeline,
  TimelineItem,
  Alert,
  AppBar,
  AspectRatio,
  Avatar,
  Chip,
  Box,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  Chart,
  Checkbox,
  CodeBlock,
  Collapsible,
  CommandMenu,
  Combobox,
  ConfirmDialog,
  Toolbar,
  DatePicker,
  Dialog,
  Divider,
  DropdownMenu,
  Sheet,
  SheetContent,
  EmptyState,
  Field,
  Fieldset,
  Flex,
  FocusTrap,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  GridRuler,
  HoverCard,
  Icon,
  Image,
  InputGroup,
  Inline,
  Kbd,
  Link,
  List,
  ListItem,
  Menubar,
  NavigationMenu,
  TextInput,
  Overlay,
  Page,
  Section,
  Pagination,
  Popover,
  Portal,
  Progress,
  PropertyItem,
  PropertyList,
  Radio,
  RadioGroup,
  Resizable,
  ScrollArea,
  SearchInput,
  ToggleGroup,
  Select,
  Shell,
  Sidebar,
  Skeleton,
  Slider,
  Spacer,
  Spinner,
  SplitPane,
  Stack,
  Stat,
  StatusDot,
  Stepper,
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
  ToastStack,
  Toggle,
  Tooltip,
  VisuallyHidden,
} from "@/index";

type ComponentsPreviewState = {
  activeTab: string;
  open: boolean;
  enabled: boolean;
  page: number;
  volume: number;
};

export const head = {
  title: "Components Preview - Tavo UI",
  head: '<meta name="description" content="A mobile-focused all components preview for @tavojs/ui">',
};

class ComponentsPreviewController extends TavoController {
  model: Store<ComponentsPreviewState>;

  constructor({ model }: { model: Store<ComponentsPreviewState> }) {
    super();
    this.model = model;
  }

  patch(data: Partial<ComponentsPreviewState>) {
    this.model.patch(data);
  }
}

const tableRows = [
  { name: "Core", status: "Ready", count: 42 },
  { name: "Forms", status: "Review", count: 18 },
  { name: "Data", status: "Ready", count: 12 },
];

const ComponentsPreviewPage = createTavo<
  Record<string, never>,
  ComponentsPreviewState,
  ComponentsPreviewController
>({
  model: () => ({
    activeTab: "layout",
    open: true,
    enabled: true,
    page: 2,
    volume: 64,
  }),
  controller: ComponentsPreviewController,
  view: ({ state, controller }) => (
    <Page size="xl" padding="none">
      <AppBar position="sticky">
        <Toolbar wrap>
          <Inline>
            <Chip tone="primary">Components</Chip>
            <Link href="/previews">Previews</Link>
            <Link href="/previews/grid">Grid</Link>
          </Inline>
          <Menubar>
            <Menubar.Item href="#layout">Layout</Menubar.Item>
            <Menubar.Item href="#forms">Forms</Menubar.Item>
            <Menubar.Item href="#data">Data</Menubar.Item>
          </Menubar>
        </Toolbar>
      </AppBar>

      <Box as="main" maxWidth="xl" paddingInline="lg" center fullWidth>
        <Stack gap="lg">
          <Section
            eyebrow="Preview"
            title="All components"
            description="A dense mobile surface for checking component scale, wrapping, overflow, and readable rhythm."
            actions={
              <Inline>
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="outline" tone="secondary">
                  Secondary
                </Button>
              </Inline>
            }
          />

          <VisuallyHidden aria-live="polite" aria-atomic="true">
            Current preview page: {state.page}
          </VisuallyHidden>
          <VisuallyHidden>
            All sections below are rendered for mobile validation.
          </VisuallyHidden>

          <Section
            id="layout"
            title="Layout and Surfaces"
            description="Layout primitives, surfaces, media, and grid helpers."
          >
            <Grid minItemWidth="17rem" spacing="md">
              <Card title="Box stack" eyebrow="Cards">
                <Stack>
                  <Box padding="md" radius="surface" border>
                    <Text>Box with border</Text>
                  </Box>
                  <Box surface="raised" padding="md" radius="md" border>
                    Box surface
                  </Box>
                  <Card
                    title="Card title"
                    description="Card content wraps on narrow screens."
                  >
                    <Text color="muted">Card body content.</Text>
                  </Card>
                </Stack>
              </Card>

              <Card title="Media" eyebrow="Image">
                <Stack>
                  <AspectRatio ratio="16 / 9">
                    <Image
                      src="/tavo-landscape.svg"
                      alt="Tavo preview"
                      width="100%"
                      height="100%"
                      objectFit="cover"
                    />
                  </AspectRatio>
                  <GridRuler spacing="sm" />
                  <Spacer size="md" />
                </Stack>
              </Card>

              <Card title="Split and resize" eyebrow="Layout">
                <Stack>
                  <SplitPane
                    aside={<Text color="muted">Aside</Text>}
                    ratio="third"
                  >
                    <Text>Main pane content</Text>
                  </SplitPane>
                  <Resizable>
                    <Resizable.Panel defaultSize="55%">
                      <Box padding="sm" border>
                        Card A
                      </Box>
                    </Resizable.Panel>
                    <Resizable.Handle aria-label="Resize panels" />
                    <Resizable.Panel>
                      <Box padding="sm" border>
                        Card B
                      </Box>
                    </Resizable.Panel>
                  </Resizable>
                </Stack>
              </Card>

              <Card title="Shell" eyebrow="Structure">
                <Shell
                  header={<Text variant="hint">Compact app shell</Text>}
                  sidebar={
                    <Sidebar padding="sm">
                      <Stack gap="sm">
                        <Link href="#layout">Layout</Link>
                        <Link href="#forms">Forms</Link>
                      </Stack>
                    </Sidebar>
                  }
                >
                  <Box padding="md" border>
                    <Text color="muted">
                      Shell content area collapses inside the mobile preview.
                    </Text>
                  </Box>
                </Shell>
              </Card>
            </Grid>
          </Section>

          <Section
            id="forms"
            title="Forms and Controls"
            description="Inputs, segmented choices, toggles, selection controls, and grouped fields."
          >
            <Grid minItemWidth="17rem" spacing="md">
              <Card title="Inputs" eyebrow="Fields">
                <FormControl fullWidth>
                  <Field label="Text input">
                    <TextInput placeholder="Search components" />
                  </Field>
                  <Field label="Search">
                    <SearchInput placeholder="Search preview" />
                  </Field>
                  <InputGroup>
                    <InputGroup.Addon>@</InputGroup.Addon>
                    <TextInput placeholder="username" />
                    <InputGroup.Button>Go</InputGroup.Button>
                  </InputGroup>
                  <Field label="Textarea">
                    <Textarea value="Longer responsive content wraps here." />
                  </Field>
                </FormControl>
              </Card>

              <Card title="Selections" eyebrow="Controls">
                <Stack>
                  <Field label="Select">
                    <Select>
                      <option>Compact</option>
                      <option>Comfortable</option>
                    </Select>
                  </Field>
                  <Field label="Combobox">
                    <Combobox
                      options={[
                        { label: "Grid", value: "grid" },
                        { label: "Forms", value: "forms" },
                      ]}
                    />
                  </Field>
                  <DatePicker value="2026-05-17" />
                  <Calendar selected="2026-05-17" year={2026} month={4} />
                </Stack>
              </Card>

              <Card title="Interactive" eyebrow="State">
                <Stack>
                  <FormLabel>Switches</FormLabel>
                  <Inline>
                    <FormControlLabel
                      label="Enabled"
                      control={
                        <Switch
                          checked={state.enabled}
                          onChange={() =>
                            controller?.patch({ enabled: !state.enabled })
                          }
                        />
                      }
                    />
                    <FormControlLabel
                      label="Check"
                      control={
                        <Checkbox
                          checked={state.enabled}
                          onChange={() =>
                            controller?.patch({ enabled: !state.enabled })
                          }
                        />
                      }
                    />
                  </Inline>
                  <RadioGroup name="preview-plan">
                    <Radio value="free" checked /> Free
                    <Radio value="scale" /> Scale
                  </RadioGroup>
                  <ToggleGroup
                    name="density"
                    value="comfortable"
                    items={[
                      { label: "Compact", value: "compact" },
                      { label: "Comfort", value: "comfortable" },
                    ]}
                  />
                  <Slider
                    value={state.volume}
                    onInput={(event: Event) =>
                      controller?.patch({
                        volume: Number(
                          (event.target as HTMLInputElement).value
                        ),
                      })
                    }
                  />
                  <TextInput
                    type="number"
                    inputMode="decimal"
                    value={state.volume}
                  />
                  <Toggle pressed>Toggle</Toggle>
                  <ToggleGroup
                    name="preview-toggle"
                    value="one"
                    items={[
                      { label: "One", value: "one" },
                      { label: "Two", value: "two" },
                    ]}
                  />
                </Stack>
              </Card>
            </Grid>
          </Section>

          <Section
            id="navigation"
            title="Navigation and Disclosure"
            description="Menus, tabs, collapsible sections, command surfaces, and hover details."
          >
            <Grid minItemWidth="17rem" spacing="md">
              <Card title="Navigation" eyebrow="Links">
                <Stack>
                  <Breadcrumbs
                    items={[
                      { label: "Home", href: "/" },
                      { label: "Previews", href: "/previews" },
                      { label: "Components" },
                    ]}
                  />
                  <NavigationMenu
                    items={[
                      {
                        label: "Grid",
                        href: "/previews/grid",
                        description: "Grid checks",
                      },
                      {
                        label: "Components",
                        href: "/previews/components",
                        current: true,
                      },
                    ]}
                  />
                  <Pagination
                    page={state.page}
                    pageCount={5}
                    onChange={(page) => controller?.patch({ page })}
                  />
                </Stack>
              </Card>

              <Card title="Menus" eyebrow="Disclosure">
                <Inline>
                  <DropdownMenu open>
                    <DropdownMenu.Trigger>Menu</DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item>Profile</DropdownMenu.Item>
                      <DropdownMenu.Item href="/previews/grid">
                        Grid
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu>
                  <Popover open>
                    <Popover.Trigger>Popover</Popover.Trigger>
                    <Popover.Content>
                      <Text>Popover content</Text>
                    </Popover.Content>
                  </Popover>
                </Inline>
              </Card>

              <Card title="Disclosure" eyebrow="Content">
                <Stack>
                  <Collapsible open>
                    <Collapsible.Trigger>Collapsible item</Collapsible.Trigger>
                    <Collapsible.Content>
                      <Text color="muted">
                        Collapsible body wraps on mobile.
                      </Text>
                    </Collapsible.Content>
                  </Collapsible>
                  <HoverCard>
                    <HoverCard.Trigger>Hover card trigger</HoverCard.Trigger>
                    <HoverCard.Content>Hover card content</HoverCard.Content>
                  </HoverCard>
                  <Tabs
                    tabs={[
                      {
                        id: "layout",
                        label: "Layout",
                        content: <Text>Layout tab</Text>,
                      },
                      {
                        id: "forms",
                        label: "Forms",
                        content: <Text>Forms tab</Text>,
                      },
                    ]}
                    activeId={state.activeTab}
                    onChange={(activeTab) => controller?.patch({ activeTab })}
                  />
                </Stack>
              </Card>
            </Grid>
          </Section>

          <Section
            id="data"
            title="Data and Status"
            description="Tables, metrics, lists, charting, progress, and timeline components."
          >
            <Grid minItemWidth="17rem" spacing="md">
              <Card title="Metrics" eyebrow="Data">
                <Grid minItemWidth="10rem">
                  <Stat
                    label="Users"
                    value="2.4k"
                    trend="+12%"
                    tone="success"
                  />
                  <Stat label="Errors" value="18" trend="-4" tone="warning" />
                </Grid>
                <Chart
                  data={[
                    { label: "Layout", value: 80, tone: "primary" },
                    { label: "Forms", value: 64, tone: "secondary" },
                    { label: "Data", value: 48, tone: "info" },
                  ]}
                />
              </Card>

              <Card title="Table" eyebrow="Responsive">
                <Stack>
                  <Toolbar
                    title="Component rows"
                    filters={
                      <Toolbar>
                        <Chip tone="neutral">All</Chip>
                      </Toolbar>
                    }
                    actions={<Button size="sm">Add</Button>}
                  />
                  <Table.Data
                    columns={[
                      { id: "name", header: "Name" },
                      { id: "status", header: "Status" },
                      { id: "count", header: "Count", numeric: true },
                    ]}
                    rows={tableRows}
                    compact
                  />
                  <Table compact>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Token</TableHeaderCell>
                        <TableHeaderCell numeric>Value</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Root</TableCell>
                        <TableCell numeric>clamp</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Stack>
              </Card>

              <Card title="Lists" eyebrow="Content">
                <Stack>
                  <List>
                    <ListItem title="Mobile">Root scale and wrapping.</ListItem>
                    <ListItem title="Overflow">
                      Tables and scroll areas.
                    </ListItem>
                  </List>
                  <PropertyList>
                    <PropertyItem label="Mode">Preview</PropertyItem>
                    <PropertyItem label="Width">Mobile</PropertyItem>
                    <PropertyItem label="Spacing">rem based</PropertyItem>
                    <PropertyItem label="Root">viewport clamp</PropertyItem>
                  </PropertyList>
                  <ScrollArea maxHeight="10rem">
                    <Timeline>
                      <TimelineItem title="Theme" meta="Now" tone="primary">
                        Root scale added.
                      </TimelineItem>
                      <TimelineItem title="Preview" meta="Next" tone="success">
                        All components checked.
                      </TimelineItem>
                    </Timeline>
                  </ScrollArea>
                  <Timeline>
                    <TimelineItem title="Mobile check" meta="Today">
                      Validated component preview route.
                    </TimelineItem>
                  </Timeline>
                </Stack>
              </Card>
            </Grid>
          </Section>

          <Section
            id="feedback"
            title="Feedback and Overlays"
            description="Alerts, toasts, dialogs, sheets, drawers, loading states, and empty states."
          >
            <Grid minItemWidth="17rem" spacing="md">
              <Card title="Feedback" eyebrow="Status">
                <Stack>
                  <Alert title="Info" tone="info">
                    Responsive alert body.
                  </Alert>
                  <Alert title="Success" tone="success">
                    Everything wraps safely.
                  </Alert>
                  <ToastStack>
                    <Toast
                      title="Toast"
                      tone="info"
                      action={<Button size="sm">Undo</Button>}
                    >
                      Compact notification.
                    </Toast>
                  </ToastStack>
                  <Progress value={72} showValue label="Coverage" />
                  <StatusDot tone="success">Online</StatusDot>
                  <Spinner label="Loading" />
                  <Skeleton height="4rem" />
                  <EmptyState
                    title="No issues"
                    description="The empty state keeps content centered on narrow screens."
                    actions={<Button size="sm">Create</Button>}
                  />
                </Stack>
              </Card>

              <Card title="Overlays" eyebrow="Modal">
                <Stack>
                  <Dialog open title="Dialog preview">
                    <Text>Dialog content.</Text>
                  </Dialog>
                  <ConfirmDialog
                    open
                    title="Confirm dialog"
                    description="Confirm dialog shares the same responsive overlay behavior."
                  />
                  <Sheet open>
                    <SheetContent open>
                      <Text>Sheet content.</Text>
                    </SheetContent>
                  </Sheet>
                  <Sheet open side="bottom">
                    <SheetContent open side="bottom">
                      <Text>Bottom sheet content.</Text>
                    </SheetContent>
                  </Sheet>
                  <Overlay open={false}>Hidden overlay</Overlay>
                </Stack>
              </Card>

              <Card title="Miscellaneous" eyebrow="Small">
                <Stack>
                  <Inline>
                    <Avatar name="Tavo UI" />
                    <Chip tone="primary">Chip</Chip>
                    <Chip selected removable>
                      Chip
                    </Chip>
                    <Kbd>⌘K</Kbd>
                    <Tooltip content="Tooltip content">
                      <Button size="sm">Tooltip</Button>
                    </Tooltip>
                  </Inline>
                  <ButtonGroup>
                    <Button>One</Button>
                    <Button variant="outline">Two</Button>
                  </ButtonGroup>
                  <Flex gap="sm" align="center">
                    <Icon aria-hidden="true">
                      <circle cx="12" cy="12" r="8" />
                    </Icon>
                    <Button iconOnly label="Icon action">
                      +
                    </Button>
                    <Link href="/previews/grid">Grid preview</Link>
                  </Flex>
                  <CommandMenu
                    items={[
                      { label: "Open grid", href: "/previews/grid" },
                      { label: "Open previews", href: "/previews" },
                    ]}
                  />
                  <Card title="Settings">
                    <Text color="muted">Settings panel content.</Text>
                  </Card>
                  <Card
                    title="Resource card"
                    meta="Docs"
                    description="A compact resource preview."
                  />
                  <Divider label="End" />
                  <CodeBlock
                    code={`viewport: {\n  rootMin: 14,\n  rootMax: 16\n}`}
                  />
                  <FocusTrap active={false}>
                    <Inline>
                      <Button size="sm">Focus A</Button>
                      <Button size="sm" variant="outline">
                        Focus B
                      </Button>
                    </Inline>
                  </FocusTrap>
                  <Portal disabled>
                    <Text color="muted">
                      Portal content renders inline in this runtime.
                    </Text>
                  </Portal>
                </Stack>
              </Card>
            </Grid>
          </Section>
        </Stack>
      </Box>
    </Page>
  ),
});

export default ComponentsPreviewPage;
