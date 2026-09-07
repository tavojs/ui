import {
  createTavo,
  type Store,
  TavoController,
} from "@tavojs/core";
import {
  Alert,
  AppBar,
  AspectRatio,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  Chart,
  Checkbox,
  Chip,
  ColorPicker,
  CodeBlock,
  Collapsible,
  Combobox,
  CommandMenu,
  ConfirmDialog,
  DatePicker,
  Dialog,
  Divider,
  DropdownMenu,
  EmptyState,
  Field,
  FileTrigger,
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
  Inline,
  InputGroup,
  Kbd,
  Link,
  List,
  ListItem,
  Menubar,
  NavigationMenu,
  NumberInput,
  ObjectField,
  Overlay,
  Page,
  Pagination,
  Popover,
  Progress,
  PropertyItem,
  PropertyList,
  Portal,
  Radio,
  RadioGroup,
  Resizable,
  SearchInput,
  ScrollArea,
  Section,
  Select,
  Sheet,
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
  TextInput,
  Textarea,
  Timeline,
  TimelineItem,
  Toast,
  Toggle,
  ToggleGroup,
  Toolbar,
  TreeView,
  Tooltip,
  VisuallyHidden,
} from "@/index";
import {
  componentMetadata,
  getComponentMetadata,
  type ComponentMetadata,
} from "@/metadata";
import tavoLogo from "@/assets/images/tavo-logo.svg";

type ComponentDetailProps = {
  pathname?: string;
  params: { component: string };
  data?: unknown;
};
type ComponentDetailState = {
  activeTab: string;
  calendarMonth: number;
  calendarYear: number;
  color: string;
  enabled: boolean;
  page: number;
  previewOpen: boolean;
  query: string;
  value: number;
};

export const head = ({ params }: { params: { component?: string } }) => {
  const component = params.component
    ? getComponentMetadata(params.component)
    : undefined;
  return {
    title: `${component?.name ?? "Component"} - Tavo.js UI Preview`,
    unsafeHeadHtml: `<meta name="description" content="${component?.description ?? "Component API, examples, and accessibility guidance from @tavojs/ui"}">`,
  };
};

export function generateStaticParams() {
  return componentMetadata.map((component) => ({ component: component.slug }));
}

class ComponentDetailController extends TavoController {
  model: Store<ComponentDetailState>;

  constructor({ model }: { model: Store<ComponentDetailState> }) {
    super();
    this.model = model;
  }

  patch(data: Partial<ComponentDetailState>) {
    this.model.patch(data);
  }
}

function ComponentPreview({
  component,
  state,
  controller,
}: {
  component: ComponentMetadata;
  state: ComponentDetailState;
  controller?: ComponentDetailController | null;
}) {
  switch (component.slug) {
    case "alert":
      return <Alert title="Changes saved" tone="success">Your preferences are up to date.</Alert>;
    case "app-bar":
      return <AppBar position="relative" align="center" justify="between" gap="md" sx={{ width: "100%" }}><Text color="heading">Workspace</Text><Toolbar><Button size="sm" variant="ghost">Search</Button><Avatar initials="TM" size="sm" /></Toolbar></AppBar>;
    case "aspect-ratio":
      return <AspectRatio ratio="16/9" style={{ width: "min(100%, 28rem)" }}><Image src={tavoLogo} alt="Tavo.js mark" width="100%" height="100%" objectFit="contain" /></AspectRatio>;
    case "avatar":
      return <Inline><Avatar initials="AL" /><Avatar initials="MC" size="lg" /><Avatar initials="JB" size="sm" /></Inline>;
    case "box":
      return <Box surface="raised" padding="lg" radius="lg" shadow border><Text variant="h3">Token-aware surface</Text><Text color="muted">Padding, radius, border, and elevation compose through Box.</Text></Box>;
    case "breadcrumbs":
      return <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Components", href: "/components" }, { label: component.name, current: true }]} />;
    case "button":
      return (
        <Stack gap="md">
          <Inline wrap><Button>Solid</Button><Button variant="soft">Soft</Button><Button variant="outline">Outline</Button><Button variant="ghost">Ghost</Button><Button variant="text">Text</Button></Inline>
          <Inline wrap><Button tone="primary">Primary</Button><Button tone="secondary">Secondary</Button><Button tone="neutral">Neutral</Button><Button tone="danger">Danger</Button></Inline>
          <Inline align="center" wrap><Button size="sm">Small</Button><Button size="md">Medium</Button><Button size="lg">Large</Button><Button loading>Loading</Button><Button disabled>Disabled</Button><Button iconOnly aria-label="Add item">+</Button></Inline>
        </Stack>
      );
    case "button-group":
      return <ButtonGroup variant="outline"><Button>Day</Button><Button variant="soft">Week</Button><Button>Month</Button></ButtonGroup>;
    case "calendar":
      return (
        <Calendar
          year={state.calendarYear}
          month={state.calendarMonth}
          yearRange={{ start: 2020, end: 2030 }}
          selected="2026-07-30"
          onMonthChange={(calendarYear, calendarMonth) =>
            controller?.patch({ calendarYear, calendarMonth })
          }
        />
      );
    case "card":
      return <Card eyebrow="Workspace" title="Design system" description="A composed, token-aware content surface."><Text color="muted">Components, themes, and package guidance in one place.</Text></Card>;
    case "chart":
      return (
        <Chart
          label="Monthly revenue"
          max={100}
          sx={{ width: "min(100%, 28rem)" }}
          data={[
            { label: "Apr", value: 48, tone: "secondary" },
            { label: "May", value: 72, tone: "primary" },
            { label: "Jun", value: 91, tone: "success" },
            { label: "Jul", value: 64, tone: "info" },
          ]}
        />
      );
    case "checkbox":
      return <Checkbox checked aria-label="Enable notifications" />;
    case "color-picker":
      return <Field label="Brand color" hint={state.color}><ColorPicker name="brand-color" value={state.color} onValueChange={(color) => controller?.patch({ color })} /></Field>;
    case "chip":
      return <Inline><Chip tone="primary" selected>Active</Chip><Chip tone="success">Stable</Chip><Chip tone="neutral">Metadata</Chip></Inline>;
    case "code-block":
      return <CodeBlock language="tsx" code={'import { Button } from "@tavojs/ui/button";\n\n<Button>Ship it</Button>'} />;
    case "collapsible":
      return <Collapsible open centerTrigger><Collapsible.Trigger>Advanced settings</Collapsible.Trigger><Collapsible.Content>Developer-only controls live here.</Collapsible.Content></Collapsible>;
    case "combobox":
      return <Field label="Framework"><Combobox name="framework" options={[{ label: "Tavo.js", value: "tavo" }, { label: "React", value: "react" }, { label: "Vue", value: "vue" }]} /></Field>;
    case "command-menu":
      return <CommandMenu placeholder="Search commands" items={[{ label: "Generate theme", description: "Create semantic tokens", shortcut: "G" }, { label: "Open documentation", description: "Browse component guides", shortcut: "D" }, { label: "Publish package", description: "Create a release", disabled: true }]} />;
    case "confirm-dialog":
      return <><Button tone="danger" onClick={() => controller?.patch({ previewOpen: true })}>Open confirmation</Button><ConfirmDialog open={state.previewOpen} title="Delete component?" description="This preview demonstrates a destructive confirmation." confirmLabel="Delete" onConfirm={() => controller?.patch({ previewOpen: false })} onCancel={() => controller?.patch({ previewOpen: false })} /></>;
    case "date-picker":
      return <Box style={{ width: "min(100%, 22rem)" }}><Stack gap="sm"><FormLabel>Release date</FormLabel><DatePicker name="release-date" inputLabel="Release date" value="2026-07-30" year={2026} month={6} renderCalendarWhenClosed={false} /></Stack></Box>;
    case "dialog":
      return <><Button onClick={() => controller?.patch({ previewOpen: true })}>Open dialog</Button><Dialog open={state.previewOpen} title="Invite teammate" onClose={() => controller?.patch({ previewOpen: false })}><Stack><Text color="muted">Enter an email address to invite someone.</Text><TextInput type="email" placeholder="team@tavo.dev" /><Inline justify="end"><Button onClick={() => controller?.patch({ previewOpen: false })}>Send invite</Button></Inline></Stack></Dialog></>;
    case "divider":
      return <Stack><Text>Above the divider</Text><Divider label="Details" /><Text color="muted">Below the divider</Text></Stack>;
    case "dropdown-menu":
      return <DropdownMenu open align="start"><DropdownMenu.Trigger>Actions</DropdownMenu.Trigger><DropdownMenu.Content><DropdownMenu.Item>Duplicate</DropdownMenu.Item><DropdownMenu.Item href="/components/button">View component</DropdownMenu.Item><DropdownMenu.Item disabled>Archive</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu>;
    case "empty-state":
      return <EmptyState icon={<Icon width={32} height={32}><path d="M4 7h16v12H4zM8 3h8v4H8z" /></Icon>} title="No components found" description="Try changing the current search or create a component." actions={<Button>Create component</Button>} />;
    case "field":
      return <Field label="Project name" hint="Use a short, recognizable name."><TextInput value="Tavo.js UI" /></Field>;
    case "file-trigger":
      return <FileTrigger accept="application/json,.json" variant="outline" onFilesChange={() => undefined}>Import JSON</FileTrigger>;
    case "flex":
      return <Flex gap="md" wrap>{["One", "Two", "Three"].map((label) => <Box padding="md" border radius="md">{label}</Box>)}</Flex>;
    case "focus-trap":
      return <FocusTrap active><Card eyebrow="Keyboard scope" title="Focus stays inside"><Inline><Button variant="outline">Previous</Button><Button>Continue</Button></Inline></Card></FocusTrap>;
    case "form-control":
      return <FormControl fullWidth><Stack gap="sm"><FormLabel>Workspace name</FormLabel><TextInput name="workspace" value="Tavo.js UI" /><Button>Save</Button></Stack></FormControl>;
    case "form-control-label":
      return <Stack><FormControlLabel label="Email notifications" control={<Checkbox checked />} /><FormControlLabel label="Weekly digest" control={<Switch checked />} /></Stack>;
    case "form-label":
      return <Stack gap="sm"><FormLabel>Account settings</FormLabel><FormLabel disabled>Disabled setting</FormLabel><FormLabel size="lg">Large label</FormLabel></Stack>;
    case "grid":
      return <Grid columns={{ base: 1, md: 3 }} spacing="md">{["One", "Two", "Three"].map((label) => <Box padding="md" border radius="md">{label}</Box>)}</Grid>;
    case "grid-ruler":
      return <Box sx={{ width: "100%" }}><GridRuler spacing="md" /></Box>;
    case "hover-card":
      return <HoverCard><HoverCard.Trigger><Link href="/components/avatar">Hover me</Link></HoverCard.Trigger><HoverCard.Content><Stack gap="sm"><Text color="heading">Hover card</Text><Text color="muted">Additional details appear when you hover over the trigger.</Text></Stack></HoverCard.Content></HoverCard>;
    case "icon":
      return <Inline gap="lg"><Icon width={32} height={32}><path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 3.2 5.8 3.2-5.8 3.2-5.8-3.2L12 5.2Zm-6 6 4.5 2.5v5L6 16.2v-5Zm7.5 7.5v-5l4.5-2.5v5l-4.5 2.5Z" /></Icon><Icon width={32} height={32}><path d="M12 3a9 9 0 1 0 9 9h-3a6 6 0 1 1-6-6V3Z" /></Icon><Icon width={32} height={32}><path d="m12 2 3 6 7 .9-5 4.8 1.3 6.8L12 17.2l-6.3 3.3L7 13.7 2 8.9 9 8l3-6Z" /></Icon></Inline>;
    case "image":
      return <Image src={tavoLogo} alt="Tavo.js logo" width={320} height={180} objectFit="contain" />;
    case "inline":
      return <Inline gap="md" align="center" wrap><Chip tone="primary">Design</Chip><Chip tone="success">Build</Chip><Button size="sm">Publish</Button></Inline>;
    case "input-group":
      return <InputGroup><InputGroup.Addon>$</InputGroup.Addon><InputGroup.Input name="amount" placeholder="Amount" /><InputGroup.Button>Apply</InputGroup.Button></InputGroup>;
    case "kbd":
      return <Inline>Open search <Kbd>⌘</Kbd><Kbd>K</Kbd></Inline>;
    case "link":
      return <Inline><Link href="/components/button">Default link</Link><Link href="/components/button" noUnderline>Without underline</Link><Link href="/components/button" disabled>Disabled link</Link></Inline>;
    case "list":
      return <List marker="secondary"><ListItem title="Theme" meta="Ready">Generated semantic tokens.</ListItem><ListItem title="Components" meta="85 public">Accessible building blocks.</ListItem><ListItem title="Release" meta="Next">Publish through Changesets.</ListItem></List>;
    case "menubar":
      return <Menubar aria-label="Editor menu"><Menubar.Item current>File</Menubar.Item><Menubar.Item>Edit</Menubar.Item><Menubar.Item>View</Menubar.Item><Menubar.Item disabled>Deploy</Menubar.Item></Menubar>;
    case "navigation-menu":
      return <NavigationMenu aria-label="Documentation" items={[{ label: "Components", href: "/", description: "Browse the catalog", current: true }, { label: "Themes", href: "/components/box", description: "Customize tokens" }, { label: "Guides", href: "/components/page", description: "Compose interfaces" }]} />;
    case "number-input":
      return <NumberInput label="Width" value={state.value} min={0} max={100} suffix="px" onValueChange={(value) => controller?.patch({ value: value ?? 0 })} />;
    case "object-field":
      return <ObjectField label="Options" value={{ color: "primary", hidden: false, count: 2 }} onDraft={() => undefined} onCommit={() => undefined} />;
    case "overlay":
      return <><Button onClick={() => controller?.patch({ previewOpen: true })}>Open overlay</Button><Overlay open={state.previewOpen}><Card title="Overlay content" description="A centered surface over a soft scrim."><Button onClick={() => controller?.patch({ previewOpen: false })}>Close overlay</Button></Card></Overlay></>;
    case "page":
      return <Page size="sm" padding="md"><Stack gap="sm"><Text variant="h3">Contained page</Text><Text color="muted">Page controls readable width and responsive padding.</Text></Stack></Page>;
    case "pagination":
      return <Pagination page={state.page} pageCount={12} onChange={(page) => controller?.patch({ page })} />;
    case "popover":
      return <Popover open placement="bottom-start"><Popover.Trigger>Filter options</Popover.Trigger><Popover.Content><Stack gap="sm"><FormControlLabel label="Stable only" control={<Checkbox checked />} /><FormControlLabel label="Include recipes" control={<Checkbox />} /></Stack></Popover.Content></Popover>;
    case "portal":
      return <Portal><Card eyebrow="Portal child" title="Rendered content"><Text color="muted">Portal preserves its children in the active rendering environment.</Text></Card></Portal>;
    case "progress":
      return <Stack gap="sm"><Inline justify="between"><Text>Package coverage</Text><Text color="muted">72%</Text></Inline><Progress value={72} aria-label="Package coverage" /></Stack>;
    case "property-list":
      return <PropertyList><PropertyItem label="Package">@tavojs/ui</PropertyItem><PropertyItem label="Version">1.0.1</PropertyItem><PropertyItem label="Status"><StatusDot tone="success" label="Stable" /></PropertyItem></PropertyList>;
    case "radio":
      return <Inline><FormControlLabel label="Primary" control={<Radio name="tone-preview" checked tone="primary" />} /><FormControlLabel label="Secondary" control={<Radio name="tone-preview" tone="secondary" />} /><FormControlLabel label="Disabled" control={<Radio name="tone-preview" disabled />} /></Inline>;
    case "radio-group":
      return (
        <RadioGroup name="density" orientation="horizontal">
          <FormControlLabel label="Compact" control={<Radio value="compact" />} />
          <FormControlLabel label="Comfortable" control={<Radio value="comfortable" checked />} />
          <FormControlLabel label="Spacious" control={<Radio value="spacious" />} />
        </RadioGroup>
      );
    case "resizable":
      return <Resizable><Resizable.Panel defaultSize="38%"><Box padding="md" surface="subtle">Filters</Box></Resizable.Panel><Resizable.Handle /><Resizable.Panel><Box padding="md" surface="raised">Results</Box></Resizable.Panel></Resizable>;
    case "search-input":
      return <SearchInput aria-label="Search preview" placeholder="Search components" />;
    case "scroll-area":
      return <ScrollArea maxHeight="10rem"><Stack gap="sm">{Array.from({ length: 8 }, (_, index) => <Box padding="sm" surface={index % 2 ? "subtle" : "raised"}>Scrollable item {index + 1}</Box>)}</Stack></ScrollArea>;
    case "section":
      return <Section eyebrow="Catalog" title="Featured components" titleSize="h3" description="A section composes heading structure, supporting copy, actions, and content." actions={<Button size="sm">View all</Button>}><Grid columns={2} spacing="sm"><Box padding="md" surface="subtle">Forms</Box><Box padding="md" surface="subtle">Layout</Box></Grid></Section>;
    case "select":
      return <Select aria-label="Preview density" value="comfortable"><option value="compact">Compact</option><option value="comfortable">Comfortable</option><option value="spacious">Spacious</option></Select>;
    case "sheet":
      return <><Button onClick={() => controller?.patch({ previewOpen: true })}>Open sheet</Button><Sheet open={state.previewOpen} side="right" onClose={() => controller?.patch({ previewOpen: false })}><Sheet.Content open={state.previewOpen} side="right" aria-label="Settings sheet" onClose={() => controller?.patch({ previewOpen: false })}><Stack><Inline justify="between"><Text variant="h3">Settings</Text><Sheet.Close onClick={() => controller?.patch({ previewOpen: false })}>Close</Sheet.Close></Inline><FormControlLabel label="Enable previews" control={<Switch checked />} /></Stack></Sheet.Content></Sheet></>;
    case "shell":
      return <Shell header={<AppBar position="relative" padding="sm"><Text color="heading">Dashboard</Text></AppBar>} sidebar={<Sidebar padding="sm"><Stack gap="sm"><Button size="sm" variant="soft">Overview</Button><Button size="sm" variant="ghost">Activity</Button></Stack></Sidebar>}><Box padding="md"><Text color="muted">Shell content area</Text></Box></Shell>;
    case "sidebar":
      return <Sidebar padding="md"><Stack gap="sm"><Text variant="h3">Navigation</Text><Button variant="soft">Overview</Button><Button variant="ghost">Components</Button><Button variant="ghost">Themes</Button></Stack></Sidebar>;
    case "skeleton":
      return <Stack gap="sm"><Skeleton height="1.2rem" width="42%" /><Skeleton height="0.9rem" /><Skeleton height="0.9rem" width="78%" /></Stack>;
    case "slider":
      return <Stack gap="sm"><Slider aria-label="Volume" value={state.value} onInput={(event: Event) => controller?.patch({ value: Number((event.target as HTMLInputElement).value) })} /><Text color="muted">Volume: {state.value}%</Text></Stack>;
    case "spacer":
      return <Box padding="md" surface="subtle"><Text>Content above</Text><Spacer size="lg" /><Text>Content below after a large spacer</Text></Box>;
    case "spinner":
      return <Inline><Spinner size="sm" label="Loading" /><Spinner label="Loading" /><Spinner size="lg" label="Loading" /></Inline>;
    case "split-pane":
      return <SplitPane ratio="third" aside={<Box padding="md" surface="subtle">Inspector</Box>}><Box padding="md" surface="raised">Main canvas</Box></SplitPane>;
    case "stack":
      return <Stack gap="md"><Box padding="sm" surface="subtle">First stacked item</Box><Box padding="sm" surface="raised">Second stacked item</Box><Box padding="sm" surface="primary">Third stacked item</Box></Stack>;
    case "stat":
      return <Grid minItemWidth="10rem" spacing="md"><Stat label="Components" value={componentMetadata.length} delta="Public API" /><Stat label="Status" value="Stable" delta="Ready to use" /></Grid>;
    case "status-dot":
      return <Inline><StatusDot tone="success" label="Operational" /><StatusDot tone="warning" label="Review" /><StatusDot tone="danger" label="Blocked" /></Inline>;
    case "stepper":
      return <Stepper steps={[{ id: "details", title: "Details", description: "Project information", status: "complete" }, { id: "theme", title: "Theme", description: "Colors and typography", status: "current" }, { id: "publish", title: "Publish", description: "Review and release", status: "upcoming" }]} />;
    case "switch":
      return <Inline><Switch checked={state.enabled} aria-label="Enable feature" onChange={(event: Event) => controller?.patch({ enabled: (event.target as HTMLInputElement).checked })} /><Text>{state.enabled ? "Enabled" : "Disabled"}</Text></Inline>;
    case "table":
      return <Table compact><TableHead><TableRow><TableHeaderCell>Component</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell></TableRow></TableHead><TableBody><TableRow><TableCell>Button</TableCell><TableCell>Stable</TableCell></TableRow><TableRow><TableCell>Dialog</TableCell><TableCell>Stable</TableCell></TableRow></TableBody></Table>;
    case "tabs":
      return <Tabs activeId={state.activeTab} onChange={(id: string) => controller?.patch({ activeTab: id })} tabs={[{ id: "preview", label: "Preview", content: <Text>Live component preview.</Text> }, { id: "code", label: "Code", content: <CodeBlock language="tsx" code={component.examples[0]?.code ?? ""} /> }]} />;
    case "text":
      return <Stack gap="sm"><Text variant="h2">Heading text</Text><Text>Body text for comfortable reading.</Text><Text color="muted">Muted supporting text.</Text></Stack>;
    case "text-input":
      return (
        <Stack gap="sm" sx={{ width: "min(100%, 24rem)" }}>
          <TextInput size="sm" aria-label="Small text input" placeholder="Small input" />
          <TextInput aria-label="Medium text input" placeholder="Medium input" />
          <TextInput size="lg" aria-label="Large text input" placeholder="Large input" />
        </Stack>
      );
    case "textarea":
      return <Field label="Release notes"><Textarea value="A compact multiline input that follows the active theme." /></Field>;
    case "timeline":
      return <Timeline><TimelineItem title="Documentation refreshed" meta="Today" tone="success">Added searchable component pages.</TimelineItem><TimelineItem title="Theme generated" meta="Yesterday">Synchronized package tokens.</TimelineItem></Timeline>;
    case "tree-view":
      return <TreeView aria-label="Page layers" selectedIds={["heading"]} expandedIds={["hero"]} selectionMode="multiple"><TreeView.Item id="hero" label="Hero" description="Box"><TreeView.Item id="heading" label="Heading" description="Text" /><TreeView.Item id="cta" label="Call to action" description="Button" /></TreeView.Item></TreeView>;
    case "toast":
      return <Toast title="Saved" tone="success">Your changes were stored locally.</Toast>;
    case "toggle":
      return <Toggle pressed={state.enabled} onClick={() => controller?.patch({ enabled: !state.enabled })}>Preview</Toggle>;
    case "toggle-group":
      return <ToggleGroup name="view" type="single" value="grid" items={[{ label: "List", value: "list" }, { label: "Grid", value: "grid" }]} />;
    case "toolbar":
      return <Toolbar justify="between" wrap sx={{ width: "100%" }}><Inline><Button size="sm" variant="ghost">Undo</Button><Button size="sm" variant="ghost">Redo</Button></Inline><Inline><Button size="sm" variant="outline">Preview</Button><Button size="sm">Publish</Button></Inline></Toolbar>;
    case "tooltip":
      return <Tooltip content="Export report"><Button variant="outline">Hover for a hint</Button></Tooltip>;
    case "visually-hidden":
      return <Stack align="center"><Button iconOnly aria-label="Refresh preview"><span aria-hidden="true">↻</span><VisuallyHidden>Refresh preview</VisuallyHidden></Button><Text color="muted">The button has a screen-reader label hidden from visual layout.</Text></Stack>;
    default:
      return <Card eyebrow={component.category} title={`${component.name} preview`} description={component.description}><Inline><Chip tone="primary">{component.status}</Chip><Text color="muted">See the usage recipe below for the component’s canonical composition.</Text></Inline></Card>;
  }
}

const ComponentDetailPage = createTavo<
  ComponentDetailProps,
  ComponentDetailState,
  ComponentDetailController
>({
  model: () => ({
    activeTab: "preview",
    calendarMonth: 6,
    calendarYear: 2026,
    color: "#5b5bd6",
    enabled: true,
    page: 4,
    previewOpen: false,
    query: "",
    value: 64,
  }),
  controller: ComponentDetailController,
  view: ({ props, state, controller }) => {
    const component = getComponentMetadata(props.params.component);
    if (!component) {
      return (
        <Page size="lg">
          <Box as="main" maxWidth="md" center fullWidth>
            <Stack gap="md">
              <Text as="h1" variant="h1">Component not found</Text>
              <Text color="muted">There is no public component matching “{props.params.component}”.</Text>
              <div><Button as="a" href="/">Browse all components</Button></div>
            </Stack>
          </Box>
        </Page>
      );
    }

    const sidebarComponents = componentMetadata.filter((item) => {
      const query = state.query.trim().toLowerCase();
      return !query || `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(query);
    });
    const relatedNames = component.composition.related ?? component.related ?? [];
    const importCode = `import { ${component.name} } from "${component.importPath}";`;

    return (
      <Page size="full" padding="none">
        <header className="catalog-header">
          <div className="catalog-header-inner">
            <Link className="catalog-brand" href="/" noUnderline><img className="catalog-mark" src={tavoLogo} alt="" /><span>Tavo.js UI</span></Link>
          </div>
        </header>
        <div className="component-detail-layout">
          <aside className="component-sidebar">
            <Stack gap="md">
              <Link href="/">← All components</Link>
              <SearchInput aria-label="Search components" placeholder={`Search ${componentMetadata.length} components`} value={state.query} clearable onClear={() => controller?.patch({ query: "" })} onInput={(event: Event) => controller?.patch({ query: (event.target as HTMLInputElement).value })} />
              <Text variant="hint" color="muted">{sidebarComponents.length} components</Text>
              <nav className="component-sidebar-list" aria-label="Tavo.js UI components">
                {sidebarComponents.map((item) => <Link className={item.slug === component.slug ? "is-active" : ""} href={`/components/${item.slug}`} aria-current={item.slug === component.slug ? "page" : undefined}><span>{item.name}</span><small>{item.category}</small></Link>)}
              </nav>
            </Stack>
          </aside>

          <main className="component-article">
            <Breadcrumbs items={[{ label: "Components", href: "/" }, { label: component.name, current: true }]} />
            <section className="component-title-block">
              <Inline gap="sm"><Chip size="sm" tone="primary">{component.category}</Chip><Chip size="sm" tone="success">{component.status}</Chip></Inline>
              <Text as="h1" variant="h1">{component.name}</Text>
              <Text className="catalog-lede" color="muted">{component.description}</Text>
            </section>

            <section className="component-section" aria-labelledby="preview-title">
              <Text id="preview-title" as="h2" variant="h2">Preview</Text>
              <Text color="muted">A live, theme-aware example rendered with the package component.</Text>
              <div className="component-preview-stage"><ComponentPreview component={component} state={state} controller={controller} /></div>
            </section>

            <section className="component-section">
              <Text as="h2" variant="h2">Import</Text>
              <Text color="muted">Use the dedicated entry point to keep the dependency and generated bundle explicit.</Text>
              <CodeBlock language="tsx" code={importCode} />
              <Text color="muted">For manual CSS loading, import <code>{component.cssImportPath}</code>.</Text>
            </section>

            <section className="component-section">
              <Text as="h2" variant="h2">When to use</Text>
              <div className="component-decision-grid">
                <Card eyebrow="Use it when" title="Good fit"><Text>{component.whenToUse}</Text></Card>
                <Card eyebrow="Choose something else when" title="Avoid this fit"><Text>{component.avoidWhen}</Text></Card>
              </div>
            </section>

            <section className="component-section">
              <Text as="h2" variant="h2">Examples</Text>
              <Stack gap="md">{component.examples.map((example) => <div><Text as="h3" variant="h3">{example.title}</Text><CodeBlock language="tsx" code={example.code} /></div>)}</Stack>
            </section>

            <section className="component-section">
              <Text as="h2" variant="h2">Props and defaults</Text>
              <Table compact>
                <TableHead><TableRow><TableHeaderCell>Prop</TableHeaderCell><TableHeaderCell>Type</TableHeaderCell><TableHeaderCell>Default</TableHeaderCell><TableHeaderCell>Description</TableHeaderCell></TableRow></TableHead>
                <TableBody>{component.props.map((prop) => <TableRow><TableCell><code>{prop.name}</code></TableCell><TableCell><code>{prop.type}</code></TableCell><TableCell>{prop.defaultValue ?? "—"}</TableCell><TableCell>{prop.description}</TableCell></TableRow>)}</TableBody>
              </Table>
            </section>

            <section className="component-section">
              <Text as="h2" variant="h2">Accessibility</Text>
              <Alert title="Accessibility guidance" tone="info">{component.accessibilityGuidance.summary}</Alert>
              <ul className="component-checklist">{component.accessibilityGuidance.checklist.map((item) => <li>{item}</li>)}</ul>
            </section>

            {relatedNames.length > 0 ? <section className="component-section"><Text as="h2" variant="h2">Related components</Text><div className="component-related">{relatedNames.map((name) => { const related = getComponentMetadata(name); return related ? <Link className="catalog-card component-related-card" href={`/components/${related.slug}`} noUnderline><Text as="h3" variant="h3">{related.name}</Text><Text color="muted">{related.description}</Text></Link> : null; })}</div></section> : null}
          </main>
        </div>
      </Page>
    );
  },
});

export default ComponentDetailPage;
