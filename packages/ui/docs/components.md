# Component Reference

This reference documents every public component in `@tavojs/ui`. Import examples use focused entrypoints, and every component is also available from the default `@tavojs/ui` root export. New Tavo.js/Vite projects should use the default entrypoints. The `@tavojs/ui/css` entrypoints are equivalent CSS-safe aliases.

## Shared Types

Public components and public slot subcomponents accept `className` on the root element they own. Most components extend `BaseProps`, which includes `children`, `className`, `id`, `role`, `style`, `title`, `tabIndex`, `hidden`, `disabled`, `onClick`, `onChange`, `onInput`, `onKeyDown`, `onFocus`, `onBlur`, `aria-*`, `data-*`, and additional passthrough props.

Shared unions:

- `Tone`: `primary | secondary | neutral | success | warning | danger | info`
- `Size`: `sm | md | lg`
- `Spacing`: `sm | md | lg`
- `ResponsiveValue<T>`: `T | { base?: T; sm?: T; md?: T; lg?: T }`

`Stack`, `Inline`, `Flex`, `Grid`, and `Box` accept mobile-first responsive values for their layout props. `style` remains static; use `sx` for breakpoint-scoped style attributes. `sx` is mobile-first too: `base` applies at every width, while `sm`, `md`, and `lg` apply from that breakpoint upward.

```tsx
<Box
  padding={{ base: "sm", md: "lg" }}
  sx={{
    base: { display: "block" },
    md: { display: "grid", gridTemplateColumns: "1fr 1fr" }
  }}
/>
```

See the [responsive `sx` guide](responsive-sx.md) for visibility examples and breakpoint semantics.

## Polymorphic Roots

Single-root primitives such as `Box`, `Text`, `Card`, `Button`, `Badge`, `Stack`, and `Toolbar` support `as` to change the rendered root element or custom component while preserving Tavo.js UI styling and public props.

```tsx
<Box as="main" maxWidth="lg" paddingInline="lg" center fullWidth>
  <Text as="h1" variant="h1">Dashboard</Text>
</Box>

<Text as="label" htmlFor="email">Email</Text>
<Card as="article">Release notes</Card>
<Button as="a" href="/settings">Settings</Button>
<Button as={RouterLink} to="/settings">Settings</Button>
```

Older `component` props remain supported where they already existed, but `as` is preferred for new code. When both are provided, `as` wins. See the [polymorphic `as` guide](polymorphic-as.md) for detailed usage, custom component expectations, and accessibility notes.


<!-- tavo-ui:component-index:start -->
## Generated Component Index

This section is generated from `scripts/component-manifest.mjs`. Run `npm run generate:package` after adding, removing, or renaming components.

### Layout

| Component | Recommended import | CSS alias import | Description |
| --- | --- | --- | --- |
| `AppBar` | `@tavojs/ui/app-bar` | `@tavojs/ui/css/app-bar` | Top application bar for navigation and product actions. |
| `AspectRatio` | `@tavojs/ui/aspect-ratio` | `@tavojs/ui/css/aspect-ratio` | Fixed-ratio media and content frame primitive. |
| `Box` | `@tavojs/ui/box` | `@tavojs/ui/css/box` | Generic token-backed layout and surface primitive. |
| `Card` | `@tavojs/ui/card` | `@tavojs/ui/css/card` | Discrete content surface with header, media, content, and actions. |
| `Divider` | `@tavojs/ui/divider` | `@tavojs/ui/css/divider` | Horizontal or vertical separator using theme border tokens. |
| `Flex` | `@tavojs/ui/flex` | `@tavojs/ui/css/flex` | Flexbox layout primitive with token-backed gap options. |
| `Grid` | `@tavojs/ui/grid` | `@tavojs/ui/css/grid` | Responsive grid primitive with column and item sizing controls. |
| `GridRuler` | `@tavojs/ui/grid-ruler` | `@tavojs/ui/css/grid-ruler` | Visual grid helper for spacing and layout debugging. |
| `Inline` | `@tavojs/ui/inline` | `@tavojs/ui/css/inline` | Inline layout primitive for compact horizontal groups. |
| `Page` | `@tavojs/ui/page` | `@tavojs/ui/css/page` | Responsive page wrapper with token-backed sizing and padding. |
| `Resizable` | `@tavojs/ui/resizable` | `@tavojs/ui/css/resizable` | Resizable panel layout primitive with separator handles. |
| `ScrollArea` | `@tavojs/ui/scroll-area` | `@tavojs/ui/css/scroll-area` | Styled scroll container with directional overflow controls. |
| `Section` | `@tavojs/ui/section` | `@tavojs/ui/css/section` | Page section wrapper with title, description, and actions. |
| `Shell` | `@tavojs/ui/shell` | `@tavojs/ui/css/shell` | Application shell with optional header and sidebar regions. |
| `Sidebar` | `@tavojs/ui/sidebar` | `@tavojs/ui/css/sidebar` | Sidebar region with token-backed padding. |
| `Spacer` | `@tavojs/ui/spacer` | `@tavojs/ui/css/spacer` | Spacing primitive for block and inline rhythm. |
| `SplitPane` | `@tavojs/ui/split-pane` | `@tavojs/ui/css/split-pane` | Two-column split layout primitive. |
| `Stack` | `@tavojs/ui/stack` | `@tavojs/ui/css/stack` | Vertical layout primitive with token-backed gap options. |
| `Toolbar` | `@tavojs/ui/toolbar` | `@tavojs/ui/css/toolbar` | Flexible toolbar for control groups and page actions. |

### Forms

| Component | Recommended import | CSS alias import | Description |
| --- | --- | --- | --- |
| `Button` | `@tavojs/ui/button` | `@tavojs/ui/css/button` | Action control with solid, soft, outline, and ghost variants. |
| `ButtonGroup` | `@tavojs/ui/button-group` | `@tavojs/ui/css/button-group` | Grouped action container for related buttons. |
| `Calendar` | `@tavojs/ui/calendar` | `@tavojs/ui/css/calendar` | Month grid date selection primitive. |
| `Checkbox` | `@tavojs/ui/checkbox` | `@tavojs/ui/css/checkbox` | Token-styled checkbox control with indeterminate support. |
| `ColorPicker` | `@tavojs/ui/color-picker` | `@tavojs/ui/css/color-picker` | Native color selection control with token-backed styling. |
| `Combobox` | `@tavojs/ui/combobox` | `@tavojs/ui/css/combobox` | Input with datalist-backed option suggestions. |
| `DatePicker` | `@tavojs/ui/date-picker` | `@tavojs/ui/css/date-picker` | Date input and calendar popover composition. |
| `Field` | `@tavojs/ui/field` | `@tavojs/ui/css/field` | Label, message, and ARIA wiring wrapper for form controls. |
| `FileTrigger` | `@tavojs/ui/file-trigger` | `@tavojs/ui/css/file-trigger` | Accessible file-input trigger styled through the button system. |
| `FormControl` | `@tavojs/ui/form-control` | `@tavojs/ui/css/form-control` | Form wrapper primitive for grouped controls. |
| `FormControlLabel` | `@tavojs/ui/form-control-label` | `@tavojs/ui/css/form-control-label` | Label composition for checkbox, radio, and switch controls. |
| `FormLabel` | `@tavojs/ui/form-label` | `@tavojs/ui/css/form-label` | Standalone form label primitive. |
| `InputGroup` | `@tavojs/ui/input-group` | `@tavojs/ui/css/input-group` | Composed input with addons and inline action controls. |
| `NumberInput` | `@tavojs/ui/number-input` | `@tavojs/ui/css/number-input` | Numeric input with draft-safe typed value callbacks and optional affixes. |
| `ObjectField` | `@tavojs/ui/object-field` | `@tavojs/ui/css/object-field` | Structured JSON-compatible object property editor with validation. |
| `Radio` | `@tavojs/ui/radio` | `@tavojs/ui/css/radio` | Token-styled radio input primitive. |
| `RadioGroup` | `@tavojs/ui/radio-group` | `@tavojs/ui/css/radio-group` | Radio fieldset that propagates names to child radio controls. |
| `SearchInput` | `@tavojs/ui/search-input` | `@tavojs/ui/css/search-input` | Search input primitive with consistent control sizing. |
| `Select` | `@tavojs/ui/select` | `@tavojs/ui/css/select` | Token-styled select primitive. |
| `Slider` | `@tavojs/ui/slider` | `@tavojs/ui/css/slider` | Range input primitive. |
| `Switch` | `@tavojs/ui/switch` | `@tavojs/ui/css/switch` | Toggle switch control. |
| `TextInput` | `@tavojs/ui/text-input` | `@tavojs/ui/css/text-input` | Token-styled text input primitive. |
| `Textarea` | `@tavojs/ui/textarea` | `@tavojs/ui/css/textarea` | Token-styled multiline text input. |
| `Toggle` | `@tavojs/ui/toggle` | `@tavojs/ui/css/toggle` | Pressed/unpressed button primitive with link support. |
| `ToggleGroup` | `@tavojs/ui/toggle-group` | `@tavojs/ui/css/toggle-group` | Single or multiple selection group built from toggle controls. |

### Data

| Component | Recommended import | CSS alias import | Description |
| --- | --- | --- | --- |
| `Chart` | `@tavojs/ui/chart` | `@tavojs/ui/css/chart` | Token-backed bar chart primitive for compact metrics. |
| `Pagination` | `@tavojs/ui/pagination` | `@tavojs/ui/css/pagination` | Pagination navigation for paged data views. |
| `Progress` | `@tavojs/ui/progress` | `@tavojs/ui/css/progress` | Linear progress indicator with semantic tones. |
| `PropertyList` | `@tavojs/ui/property-list` | `@tavojs/ui/css/property-list` | Responsive key-value details for product records. |
| `Stat` | `@tavojs/ui/stat` | `@tavojs/ui/css/stat` | Metric card primitive for dashboard values. |
| `StatusDot` | `@tavojs/ui/status-dot` | `@tavojs/ui/css/status-dot` | Compact semantic status indicator. |
| `Stepper` | `@tavojs/ui/stepper` | `@tavojs/ui/css/stepper` | Horizontal or vertical progress steps for setup and checkout flows. |
| `Table` | `@tavojs/ui/table` | `@tavojs/ui/css/table` | Accessible table primitives with caption, head, rows, and cells. |
| `Timeline` | `@tavojs/ui/timeline` | `@tavojs/ui/css/timeline` | Chronological timeline for events and milestones. |
| `TreeView` | `@tavojs/ui/tree-view` | `@tavojs/ui/css/tree-view` | Keyboard-accessible hierarchical view with multi-selection and drop states. |

### Feedback

| Component | Recommended import | CSS alias import | Description |
| --- | --- | --- | --- |
| `Alert` | `@tavojs/ui/alert` | `@tavojs/ui/css/alert` | Inline status message for success, warning, danger, and info states. |
| `ConfirmDialog` | `@tavojs/ui/confirm-dialog` | `@tavojs/ui/css/confirm-dialog` | Confirmation dialog composition for important or destructive actions. |
| `Dialog` | `@tavojs/ui/dialog` | `@tavojs/ui/css/dialog` | Modal dialog with escape handling and focus support. |
| `DropdownMenu` | `@tavojs/ui/dropdown-menu` | `@tavojs/ui/css/dropdown-menu` | Menu primitive for trigger-driven contextual actions. |
| `EmptyState` | `@tavojs/ui/empty-state` | `@tavojs/ui/css/empty-state` | Empty, error, or onboarding state composition. |
| `FocusTrap` | `@tavojs/ui/focus-trap` | `@tavojs/ui/css/focus-trap` | Keyboard focus containment helper for overlays. |
| `HoverCard` | `@tavojs/ui/hover-card` | `@tavojs/ui/css/hover-card` | Hover and focus card for supplemental contextual content. |
| `Overlay` | `@tavojs/ui/overlay` | `@tavojs/ui/css/overlay` | Screen overlay and scrim primitive for modal content. |
| `Portal` | `@tavojs/ui/portal` | `@tavojs/ui/css/portal` | Portal placeholder primitive for future framework-level mounts. |
| `Popover` | `@tavojs/ui/popover` | `@tavojs/ui/css/popover` | Floating disclosure panel for contextual content. |
| `Sheet` | `@tavojs/ui/sheet` | `@tavojs/ui/css/sheet` | Edge-attached dialog panel supporting four sides. |
| `Skeleton` | `@tavojs/ui/skeleton` | `@tavojs/ui/css/skeleton` | Loading placeholder primitive. |
| `Spinner` | `@tavojs/ui/spinner` | `@tavojs/ui/css/spinner` | Loading spinner with status labeling. |
| `Toast` | `@tavojs/ui/toast` | `@tavojs/ui/css/toast` | Inline notification surface and fixed toast stack. |
| `Tooltip` | `@tavojs/ui/tooltip` | `@tavojs/ui/css/tooltip` | Inline tooltip wrapper for supplemental labels. |
| `VisuallyHidden` | `@tavojs/ui/visually-hidden` | `@tavojs/ui/css/visually-hidden` | Accessible visually hidden content helper. |

### Content

| Component | Recommended import | CSS alias import | Description |
| --- | --- | --- | --- |
| `Avatar` | `@tavojs/ui/avatar` | `@tavojs/ui/css/avatar` | User or entity avatar with image, initials, and fallback rendering. |
| `Chip` | `@tavojs/ui/chip` | `@tavojs/ui/css/chip` | Compact selected, filter, or metadata token. |
| `CodeBlock` | `@tavojs/ui/code-block` | `@tavojs/ui/css/code-block` | Preformatted code surface for docs and examples. |
| `Collapsible` | `@tavojs/ui/collapsible` | `@tavojs/ui/css/collapsible` | Native disclosure primitive with trigger and content slots. |
| `Icon` | `@tavojs/ui/icon` | `@tavojs/ui/css/icon` | SVG icon wrapper with currentColor styling. |
| `Image` | `@tavojs/ui/image` | `@tavojs/ui/css/image` | Image primitive with skeleton and fallback support. |
| `Kbd` | `@tavojs/ui/kbd` | `@tavojs/ui/css/kbd` | Keyboard shortcut and keycap text primitive. |
| `Link` | `@tavojs/ui/link` | `@tavojs/ui/css/link` | Token-styled link primitive with disabled and underline options. |
| `List` | `@tavojs/ui/list` | `@tavojs/ui/css/list` | List primitives for structured textual content. |
| `Tabs` | `@tavojs/ui/tabs` | `@tavojs/ui/css/tabs` | Tabbed interface primitive with keyboard navigation. |
| `Text` | `@tavojs/ui/text` | `@tavojs/ui/css/text` | Theme-aware typography primitive. |

### Recipes

| Component | Recommended import | CSS alias import | Description |
| --- | --- | --- | --- |
| `CommandMenu` | `@tavojs/ui/command-menu` | `@tavojs/ui/css/command-menu` | Command palette-style recipe for action discovery. |

### Navigation

| Component | Recommended import | CSS alias import | Description |
| --- | --- | --- | --- |
| `Breadcrumbs` | `@tavojs/ui/breadcrumbs` | `@tavojs/ui/css/breadcrumbs` | Page hierarchy navigation with current-page semantics. |
| `Menubar` | `@tavojs/ui/menubar` | `@tavojs/ui/css/menubar` | Horizontal application menu bar with link and button items. |
| `NavigationMenu` | `@tavojs/ui/navigation-menu` | `@tavojs/ui/css/navigation-menu` | Responsive navigation list with current-page semantics. |

<!-- tavo-ui:component-index:end -->

## ActivityFeed

Import: `@tavojs/ui/activity-feed`

Use `ActivityFeed` and `ActivityItem` for chronological product events.

Props:

- `ActivityItem.title?: Child`
- `ActivityItem.meta?: Child`
- `ActivityItem.tone?: Tone`

Example:

```tsx
<ActivityFeed>
  <ActivityItem title="Theme generated" meta="now" tone="success">
    The package emitted a fresh token file.
  </ActivityItem>
</ActivityFeed>
```

Accessibility: Renders an ordered list, preserving event order for assistive technology.

## Alert

Import: `@tavojs/ui/alert`

Use `Alert` for inline feedback that belongs inside page flow.

Props:

- `title?: Child`
- `tone?: "info" | "success" | "warning" | "danger"`

Example:

```tsx
<Alert title="Saved" tone="success">
  Your changes were stored locally.
</Alert>
```

Accessibility: Uses `role="status"` by default.

## AppBar

Import: `@tavojs/ui/app-bar`

Use `AppBar` for page or app headers.

Backdrop filtering is enabled only by a glass theme token. Analogous and monochromatic themes keep it disabled to avoid unnecessary full-width repaint work.

Props:

- `position?: "static" | "sticky" | "fixed" | "relative"`
- `direction?: ResponsiveValue<"row" | "column" | "row-reverse" | "column-reverse">`
- `align?: ResponsiveValue<"start" | "center" | "end" | "stretch">`
- `justify?: ResponsiveValue<"start" | "center" | "end" | "between" | "around">`
- `gap?: ResponsiveValue<Gap | number | string>`
- `sx?: Sx`

Example:

```tsx
<AppBar align="center" justify="between" gap={{ base: "sm", md: "lg" }}>
  <Toolbar>...</Toolbar>
</AppBar>
```

Accessibility: Defaults to `header`; use `as="nav"` and labels when the bar is navigational.

## AspectRatio

Import: `@tavojs/ui/aspect-ratio`

Use `AspectRatio` for media, previews, embeds, and thumbnails that need stable dimensions.

Props:

- `ratio?: ResponsiveValue<number | "\${number}/\${number}">`

Example:

```tsx
<AspectRatio ratio={{ base: "1/1", md: "16/9" }}>
  <img src="/cover.jpg" alt="Product preview" />
</AspectRatio>
```

Accessibility: The wrapper is semantic-neutral; keep accessible labels on the media or content inside.

## Avatar

Import: `@tavojs/ui/avatar`

Use `Avatar` for users, teams, and entities.

Props:

- `src?: string | null`
- `alt?: string`
- `size?: Size`
- `initials?: string`

Example:

```tsx
<Avatar src="/user.png" alt="Ari Lane" />
<Avatar initials="AL" />
```

Accessibility: Provide meaningful `alt` for real people; use empty `alt` for decorative avatars.

## Badge

Import: `@tavojs/ui/badge`

Use `Badge` for compact labels, states, metadata, and tags.

Props:

- `tone?: Tone`

Example:

```tsx
<Badge tone="success">Active</Badge>
```

Accessibility: Badges are visual labels; avoid using color as the only carrier of meaning.

## Box

Import: `@tavojs/ui/box`

Use `Box` for generic token-backed surfaces, page width constraints, and one-off layout wrappers.

Props:

- `surface?: "default" | "raised" | "subtle" | "primary" | "secondary" | "neutral"`
- `padding?: "none" | "sm" | "md" | "lg"`
- `paddingInline?: "none" | "sm" | "md" | "lg"`
- `maxWidth?: "sm" | "md" | "lg" | "xl" | "full"`
- `center?: boolean`
- `fullWidth?: boolean`
- `radius?: "none" | "sm" | "md" | "lg"`
- `shadow?: boolean`
- `border?: boolean`

Example:

```tsx
<Box surface="raised" padding="lg" radius="lg" border>
  Content
</Box>

<Box as="main" maxWidth="lg" paddingInline="lg" center fullWidth>
  Page content
</Box>
```

## Breadcrumbs

Import: `@tavojs/ui/breadcrumbs`

Use `Breadcrumbs` for page hierarchy.

Props:

- `items?: { label: Child; href?: string; current?: boolean }[]`
- `separator?: Child`

Example:

```tsx
<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Settings", current: true }]} />
```

Accessibility: Renders navigation with current-page state when provided.

## Button

Import: `@tavojs/ui/button`

Use `Button` for actions.

Props:

- `variant?: "solid" | "soft" | "outline" | "ghost" | "text"`
- `tone?: "primary" | "secondary" | "neutral" | "danger"`
- `size?: Size`
- `loading?: boolean`
- `disabled?: boolean`

Example:

```tsx
<Button>Save</Button>
<Button variant="outline" tone="neutral">Cancel</Button>
<Button variant="text">Learn more</Button>
<Button as="a" href="/settings" variant="soft">Open settings</Button>
```

Accessibility: `loading` sets `aria-busy` and disables the button or link action.

## ButtonGroup

Import: `@tavojs/ui/button-group`

Use `ButtonGroup` to group related button actions.

Props:

- `orientation?: "horizontal" | "vertical"`
- `fullWidth?: boolean`
- `tone?: "primary" | "secondary" | "neutral" | "danger"`
- `variant?: "solid" | "soft" | "outline" | "ghost" | "text"`

Example:

```tsx
<ButtonGroup tone="neutral" variant="outline">
  <Button>Day</Button>
  <Button variant="soft">Week</Button>
</ButtonGroup>
```

## Card

Import: `@tavojs/ui/card`

Use `Card` for discrete content blocks. Supports compound API.

Props:

- `eyebrow?: Child`
- `title?: Child`
- `actions?: Child`
- `surface?: "default" | "raised"`

Subcomponents:

- `Card.Root`
- `Card.Header`
- `Card.Content`
- `Card.Actions`
- `Card.Media`

Example:

```tsx
<Card.Root eyebrow="Plan" title="Scale" actions={<Badge>Popular</Badge>}>
  <Card.Content>Plan details</Card.Content>
</Card.Root>
```

## Checkbox

Import: `@tavojs/ui/checkbox`

Use `Checkbox` for binary choices.

Props:

- `checked?: boolean`
- `defaultChecked?: boolean`
- `indeterminate?: boolean`
- `disabled?: boolean`
- `size?: Size`
- `tone?: "primary" | "secondary" | "neutral"`

Example:

```tsx
<Checkbox checked aria-label="Enable notifications" />
```

Accessibility: Use with `FormControlLabel` or provide `aria-label`.

## ColorPicker

Import: `@tavojs/ui/color-picker`

Use `ColorPicker` for native solid-color selection or CSS paint strings such as alpha colors, variables, and gradients.

Props:

- `value?: string` - Controlled color value in `#rrggbb` format.
- `defaultValue?: string` - Initial color value for an uncontrolled picker.
- `name?: string` - Form field name submitted with the selected color.
- `size?: Size` - Control scale: `sm`, `md`, or `lg`.
- `format?: "hex" | "css"` - Keeps the backward-compatible native picker or enables CSS-string editing.
- `swatches?: Array<string | ColorPickerOption>` - Optional reusable paint choices.
- `tokens?: ColorPickerOption[]` - Optional labeled CSS token choices.
- `onValueInput?: (value: string) => void` - Runs for transient paint previews.
- `disabled?: boolean` - Disables color selection.
- `required?: boolean` - Marks the native input as required.
- `onValueChange?: (value: string) => void` - Runs with the selected hexadecimal color after a committed change.
- `onChange?: ValueChangeHandler<HTMLInputElement>` - Receives the native change event.

Example:

```tsx
<Field label="Brand color">
  <ColorPicker
    name="brand-color"
    value={brandColor}
    onValueChange={setBrandColor}
  />
</Field>

<ColorPicker
  format="css"
  label="Background"
  value="linear-gradient(90deg, #6633ff, transparent)"
  tokens={[{ label: "Accent", value: "var(--accent)" }]}
  onValueInput={previewPaint}
  onValueChange={commitPaint}
/>
```

Accessibility: Pair native mode with `Field` or `aria-label`; CSS mode accepts a visible `label` and keeps the solid-color chooser keyboard reachable.

## Chip

Import: `@tavojs/ui/chip`

Use `Chip` for selectable-looking tags, filters, and compact tokens.

Props:

- `tone?: Tone`
- `size?: Size`
- `selected?: boolean`
- `disabled?: boolean`

Example:

```tsx
<Chip tone="primary" selected>Active</Chip>
```

## CodeBlock

Import: `@tavojs/ui/code-block`

Use `CodeBlock` for code examples.

Props:

- `code?: string`
- `language?: string`
- `highlighted?: boolean` - defaults to `true` for string code.
- `editorTheme?: "auto" | "light" | "dark"` - defaults to `auto` and inherits the active Tavo.js theme tokens.
- `wrap?: boolean`

Example:

```tsx
<CodeBlock language="bash" code="npm install @tavojs/ui" />
```

```tsx
<CodeBlock
  language="tsx"
  editorTheme="dark"
  code={`import { Button } from "@tavojs/ui";

export function Example() {
  return <Button>Save</Button>;
}`}
/>
```

## Combobox

Import: `@tavojs/ui/combobox`

Use `Combobox` for datalist-backed suggestions.

Props:

- `name: string`
- `options: { label: string; value: string }[]`
- `size?: Size`
- `listId?: string`

Example:

```tsx
<Combobox name="framework" options={[{ label: "Tavo.js", value: "tavo" }]} />
```

Accessibility: Uses native `input` plus `datalist`.

## CommandMenu

Import: `@tavojs/ui/command-menu`

Use `CommandMenu` for command palette style action lists.

Props:

- `items: { label: string; description?: string; shortcut?: string; href?: string; disabled?: boolean; onSelect?: () => void }[]`
- `placeholder?: string`

Example:

```tsx
<CommandMenu items={[{ label: "Generate theme", shortcut: "G" }, { label: "Docs", href: "/docs" }]} />
```

## ConfirmDialog

Import: `@tavojs/ui/confirm-dialog`

Use `ConfirmDialog` for confirmation flows.

Props:

- `open?: boolean`
- `title?: Child`
- `description?: Child`
- `confirmLabel?: Child`
- `cancelLabel?: Child`
- `tone?: "primary" | "danger"`
- `onConfirm?: () => void`
- `onCancel?: () => void`

Example:

```tsx
<ConfirmDialog open title="Delete file" onConfirm={remove} onCancel={close} />
```

Accessibility: Built on `Dialog`, so it inherits modal roles, escape behavior, and focus trapping.

## DataToolbar

Import: `@tavojs/ui/data-toolbar`

Use `DataToolbar` above lists, tables, and resource views.

Props:

- `title?: string`
- `filters?: Child`
- `actions?: Child`

Example:

```tsx
<DataToolbar title="Members" filters={<FilterBar>...</FilterBar>} actions={<Button>Add</Button>} />
```

## DatePicker

Import: `@tavojs/ui/date-picker`

Use `DatePicker` for date input with a calendar popover. For a plain native date field, use `TextInput type="date"`.
Set `renderCalendarWhenClosed={false}` in dense SSR forms when closed popover calendar markup is not needed.

Props:

- `name?: string`
- `value?: string`
- `min?: string`
- `max?: string`
- `size?: Size`
- `year?: number`
- `month?: number`
- `open?: boolean`
- `renderCalendarWhenClosed?: boolean`

Example:

```tsx
<DatePicker name="due" value="2026-05-09" />
```

## Dialog

Import: `@tavojs/ui/dialog`

Use `Dialog` for modal flows. Supports compound API.

Props:

- `open?: boolean`
- `title?: Child`
- `onClose?: () => void`
- `fullScreen?: boolean`
- `closeLabel?: Child`
- `labelledBy?: string`
- `describedBy?: string`

Subcomponents:

- `Dialog.Root`
- `Dialog.Content`
- `Dialog.Header`
- `Dialog.Body`
- `Dialog.Footer`

Example:

```tsx
<Dialog open title="Publish" onClose={close}>
  Confirm this release?
</Dialog>
```

Accessibility: Uses `role="dialog"`, `aria-modal`, escape close, backdrop close, and tab focus trapping.

## Divider

Import: `@tavojs/ui/divider`

Use `Divider` to separate sections.

Props:

- `orientation?: "horizontal" | "vertical"`
- `label?: Child`

Example:

```tsx
<Divider label="Details" />
```

## Drawer

Import: `@tavojs/ui/drawer`

Use `Drawer` for side panels. Supports compound API.

Props:

- `open?: boolean`
- `side?: "left" | "right"`
- `onClose?: () => void`
- `labelledBy?: string`

Subcomponents:

- `Drawer.Root`
- `Drawer.Trigger`
- `Drawer.Content`
- `Drawer.Close`

Accessibility: Drawer content uses dialog semantics and focus trapping.

## EmptyState

Import: `@tavojs/ui/empty-state`

Use `EmptyState` for empty lists, empty search results, and first-run screens.

Props:

- `icon?: Child`
- `title?: Child`
- `description?: Child`
- `actions?: Child`

Example:

```tsx
<EmptyState title="No files" description="Upload a file to get started." actions={<Button>Upload</Button>} />
```

## Field

Import: `@tavojs/ui/field`

Use `Field` to label a control and wire hint, error, warning, and success messages.

Props:

- `label: Child`
- `hint?: Child`
- `error?: Child`
- `success?: Child`
- `warning?: Child`
- `required?: boolean`
- `optional?: boolean`
- `id?: string`

Subcomponents:

- `Field.Root`
- `Field.Message`
- `Field.Fieldset`
- `Field.Legend`
- `FormMessage`
- `Fieldset`
- `Legend`

Example:

```tsx
<Field label="Email" error="Use a valid email." required>
  <TextInput type="email" />
</Field>
```

Accessibility: Adds `id`, `aria-describedby`, and `aria-invalid` to child VNodes when possible.

## FilterBar

Import: `@tavojs/ui/filter-bar`

Use `FilterBar` to group filter inputs and filter actions.

Props:

- `actions?: Child`

Example:

```tsx
<FilterBar actions={<Button size="sm">Reset</Button>}>
  <SearchInput size="sm" />
</FilterBar>
```

## Flex

Import: `@tavojs/ui/flex`

Use `Flex` for token-backed flex layouts.

Props:

- `direction?: "row" | "column"`
- `gap?: "none" | "sm" | "md" | "lg" | number | string`
- `align?: "start" | "center" | "end" | "stretch"`
- `justify?: "start" | "center" | "end" | "between"`
- `wrap?: boolean`

Example:

```tsx
<Flex align="center" justify="between">...</Flex>
```

## FocusTrap

Import: `@tavojs/ui/focus-trap`

Use `FocusTrap` to keep keyboard focus inside a subtree.

Props:

- `active?: boolean`

Example:

```tsx
<FocusTrap active>{content}</FocusTrap>
```

Accessibility: Traps `Tab` and `Shift+Tab` within focusable descendants.

## FormControl

Import: `@tavojs/ui/form-control`

Use `FormControl` as a layout wrapper for individual controls.

Props:

- `fullWidth?: boolean`

Example:

```tsx
<FormControl fullWidth><TextInput /></FormControl>
```

## FormControlLabel

Import: `@tavojs/ui/form-control-label`

Use `FormControlLabel` to pair a control with label content.

Props:

- `label?: Child`
- `control?: Child`
- `size?: Size`

Example:

```tsx
<FormControlLabel label="Subscribe" control={<Checkbox />} />
```

## FormLabel

Import: `@tavojs/ui/form-label`

Use `FormLabel` for standalone field labels.

Example:

```tsx
<FormLabel>Account settings</FormLabel>
```

## Grid

Import: `@tavojs/ui/grid`

Use `Grid` for responsive grid layouts.

Props:

- `columns?: ResponsiveValue<number>`
- `minItemWidth?: ResponsiveValue<string>`
- `spacing?: ResponsiveValue<Spacing>`
- `align?: ResponsiveValue<"start" | "center" | "end" | "stretch">`

Example:

```tsx
<Grid minItemWidth="18rem" spacing="lg">...</Grid>
```

## GridRuler

Import: `@tavojs/ui/grid-ruler`

Use `GridRuler` as a visual design/debug utility.

Props:

- `spacing?: ResponsiveValue<Spacing>`

Example:

```tsx
<GridRuler spacing="md" />
```

## Icon

Import: `@tavojs/ui/icon`

Use `Icon` as a simple SVG wrapper.

Props:

- `width?: number`
- `height?: number`
- `viewBox?: string`
- `component?: Component<Record<string, unknown>>`
- `sx?: Sx`

Example:

```tsx
<Icon><path d="..." /></Icon>
```

Imported SVG components can be routed through `Icon` when they need UI props such as `sx`:

```tsx
import Logo from "./logo.svg?component";

<Icon component={Logo} sx={{ sm: { display: "none" } }} />
```

Accessibility: Add `aria-hidden` for decorative icons or a label for meaningful ones.

## IconButton

Import: `@tavojs/ui/icon-button`

Use `IconButton` for compact icon-only actions.

Props:

- `label: string`
- `variant?: "solid" | "soft" | "outline" | "ghost"`
- `tone?: "primary" | "secondary" | "neutral" | "danger"`
- `size?: Size`
- `href?: string`
- `loading?: boolean`
- `disabled?: boolean`

Example:

```tsx
<IconButton label="Open settings" href="/settings">
  <Icon aria-hidden="true"><path d="..." /></Icon>
</IconButton>
```

Accessibility: `label` is required and is rendered as `aria-label`.

## Image

Import: `@tavojs/ui/image`

Use `Image` for responsive image surfaces.

Props:

- `src?: string`
- `alt?: string`
- `width?: number | string`
- `height?: number | string`
- `objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"`
- `skeleton?: "text" | "circular" | "rectangular" | "rounded"`
- `fallback?: string`
- `widths?: number[]`
- `sizes?: string`
- `quality?: number`
- `format?: "webp" | "avif" | "jpeg" | "png" | "original"`
- `priority?: boolean`
- `unoptimized?: boolean`

Example:

```tsx
<Image src="/preview.png" alt="Dashboard preview" width="100%" height={320} objectFit="cover" />
```

When `src` is provided, Tavo.js UI delegates to the Tavo.js core `Image` component so SSR projects get optimized `/_tavo/image` URLs, responsive `srcset`, lazy loading, and priority support. UI-only behavior such as `skeleton`, `fallback`, and `objectFit` is layered on top. SVG sources are passed through unoptimized by default so they remain vector images; set `unoptimized={false}` only when rasterizing an SVG through the optimizer is intentional.

Remote image URLs require app-level SSR configuration. If a remote UI image produces a browser error like `/_tavo/image?... 500`, check the response body. For `tavo image: remote images are disabled.` or `tavo image: remote image host is not allowed.`, add a narrow allowlist in the app's root `tavo.config.ts`:

```ts
import { defineConfig } from "@tavojs/core/config";
import { tavoUi } from "@tavojs/ui/plugin";

export default defineConfig({
  ssr: {
    images: {
      allowRemote: true,
      remotePatterns: [
        { protocol: "https:", hostname: "static.coinstats.app" },
      ],
    },
  },
  plugins: [tavoUi()],
});
```

Restart the SSR dev server after changing `tavo.config.ts`. Use `unoptimized` for a specific image when it should bypass the Tavo.js optimizer.

## Inline

Import: `@tavojs/ui/inline`

Use `Inline` for horizontal wrapping layouts.

Props:

- `gap?: "none" | "sm" | "md" | "lg"`

Example:

```tsx
<Inline><Button>Save</Button><Button variant="ghost">Cancel</Button></Inline>
```

## Kbd

Import: `@tavojs/ui/kbd`

Use `Kbd` for keyboard shortcut labels.

Example:

```tsx
<Inline gap="sm"><Kbd>Cmd</Kbd><Kbd>K</Kbd></Inline>
```

## Link

Import: `@tavojs/ui/link`

Use `Link` for anchors or anchor-like actions.

Props:

- `href?: string`
- `to?: string`
- `replace?: boolean`
- `disabled?: boolean`
- `noUnderline?: boolean`

Example:

```tsx
<Link href="/docs">Read docs</Link>
<Link to="/docs">Read docs</Link>
```

## List

Import: `@tavojs/ui/list`

Use `List` and `ListItem` for structured prose lists.

Props:

- `ordered?: boolean`
- `marker?: Tone`
- `spacing?: "sm" | "md" | "lg"`
- `ListItem.title?: Child`
- `ListItem.meta?: Child`

Example:

```tsx
<List marker="secondary">
  <ListItem title="Theme">Generated tokens.</ListItem>
</List>
```

## MetricGrid

Import: `@tavojs/ui/metric-grid`

Use `MetricGrid` for stats and metric cards.

Props:

- `minItemWidth?: string`

Example:

```tsx
<MetricGrid><Stat label="Revenue" value="$84k" /></MetricGrid>
```

## NumberInput

Import: `@tavojs/ui/number-input`

Use `NumberInput` for native numeric input.

Props:

- `min?: number`
- `max?: number`
- `step?: number`
- `size?: Size`

Example:

```tsx
<NumberInput min={0} max={100} value={24} />
```

## Overlay

Import: `@tavojs/ui/overlay`

Use `Overlay` for centered overlay content and scrims.

Props:

- `open?: boolean`
- `scrim?: "soft" | "strong" | "none"`
- `center?: boolean`

Example:

```tsx
<Overlay open><Spinner /></Overlay>
```

## Page

Import: `@tavojs/ui/page`

Use `Page` as a main document region.

Props:

- `size?: ResponsiveValue<"sm" | "md" | "lg" | "xl" | "full">`
- `padding?: ResponsiveValue<"none" | "sm" | "md" | "lg">`

Example:

```tsx
<Page
  size={{ base: "full", lg: "xl" }}
  padding={{ base: "sm", md: "lg" }}
>
  ...
</Page>
```

## PageHeader

Import: `@tavojs/ui/page-header`

Use `PageHeader` for page titles and actions.

Props:

- `eyebrow?: Child`
- `title?: Child`
- `description?: Child`
- `actions?: Child`

Example:

```tsx
<PageHeader title="Settings" actions={<Button>Save</Button>} />
```

## Pagination

Import: `@tavojs/ui/pagination`

Use `Pagination` for paginated data.

Props:

- `page: number`
- `pageCount: number`
- `siblingCount?: number`
- `onChange?: (page: number) => void`
- `getHref?: (page: number) => string` - renders page and control actions as links when provided.
- `label?: string`

Example:

```tsx
<Pagination page={2} pageCount={12} onChange={setPage} />
<Pagination page={2} pageCount={12} getHref={(page) => `/docs?page=${page}`} />
```

Accessibility: Uses `nav`, `aria-label`, and `aria-current`.

## Panel

Import: `@tavojs/ui/panel`

Use `Panel` for structured dashboard sections.

Props:

- `title?: string`
- `description?: string`
- `actions?: Child`

Example:

```tsx
<Panel title="Usage" actions={<Badge>Live</Badge>}>...</Panel>
```

## Portal

Import: `@tavojs/ui/portal`

Use `Portal` as a structural placeholder for future runtime portal support.

Props:

- `children?: Child`

Note: Current implementation renders children in place because `@tavojs/core` does not expose a portal mount API yet.

## Progress

Import: `@tavojs/ui/progress`

Use `Progress` for determinate progress bars.

Props:

- `value?: number`
- `max?: number`
- `tone?: "primary" | "secondary" | "neutral" | "success" | "warning" | "danger" | "info"`
- `size?: Size`
- `label?: string`
- `showValue?: boolean`

Example:

```tsx
<Progress label="Storage" value={54} showValue />
```

## PropertyList

Import: `@tavojs/ui/property-list`

Use `PropertyList` for responsive key-value records.

Props:

- `divided?: boolean`
- `PropertyItem.label: string`
- `PropertyItem.value?: Child`

Example:

```tsx
<PropertyList>
  <PropertyItem label="Owner">Design Team</PropertyItem>
</PropertyList>
```

## Radio

Import: `@tavojs/ui/radio`

Use `Radio` for individual radio controls.

Props:

- `checked?: boolean`
- `defaultChecked?: boolean`
- `disabled?: boolean`
- `size?: Size`
- `tone?: "primary" | "secondary" | "neutral"`

Example:

```tsx
<Radio name="plan" value="scale" />
```

## RadioGroup

Import: `@tavojs/ui/radio-group`

Use `RadioGroup` to group radio options.

Props:

- `name: string`
- `orientation?: "horizontal" | "vertical"`

Example:

```tsx
<RadioGroup name="plan">
  <Radio value="starter" />
  <Radio value="scale" />
</RadioGroup>
```

Accessibility: Uses `fieldset` semantics and propagates `name` to child radios when possible.

## Resizable

Import: `@tavojs/ui/resizable`

Use `Resizable` for adjustable panel layouts.

Props:

- `direction?: "horizontal" | "vertical"`
- `orientation?: "horizontal" | "vertical"` - Separator orientation; `direction` remains supported for compatibility.
- `value?: number` / `defaultValue?: number`
- `min?: number` / `max?: number`
- `step?: number` / `largeStep?: number`
- `onValueInput?: (value: number) => void` / `onValueChange?: (value: number) => void`
- `Resizable.Panel.defaultSize?: ResponsiveValue<string>`

Example:

```tsx
<Resizable
  orientation="vertical"
  value={inspectorWidth}
  min={260}
  max={560}
  step={8}
  onValueInput={previewWidth}
  onValueChange={saveWidth}
>
  <Resizable.Panel>Inspector</Resizable.Panel>
  <Resizable.Handle aria-label="Resize inspector" />
</Resizable>
```

Accessibility: Handles expose separator orientation and numeric ARIA values. Arrow keys resize by `step`; Shift+Arrow uses `largeStep`; Escape cancels pointer drags.

## ResourceCard

Import: `@tavojs/ui/resource-card`

Use `ResourceCard` for resource tiles and product objects.

Props:

- `title: string`
- `description?: string`
- `meta?: string`
- `tone?: Tone`
- `actions?: Child`

Example:

```tsx
<ResourceCard title="Theme preview" meta="CLI" description="Generated artifact." />
```

## ScrollArea

Import: `@tavojs/ui/scroll-area`

Use `ScrollArea` to constrain overflowing content.

Props:

- `orientation?: "vertical" | "horizontal" | "both"`
- `maxHeight?: ResponsiveValue<string>`

Example:

```tsx
<ScrollArea maxHeight={{ base: "12rem", md: "24rem" }}>...</ScrollArea>
```

## SearchInput

Import: `@tavojs/ui/search-input`

Use `SearchInput` for labeled search and filtering fields. It keeps query state, filtering, debouncing, and result rendering in the consuming application.

Props:

- `size?: Size`
- `value?: string`
- `defaultValue?: string`
- `clearable?: boolean`
- `clearLabel?: string`
- `loading?: boolean`
- `leading?: Child`
- `trailing?: Child`
- `inputClassName?: string`
- `onClear?: () => void`
- `onInput?: ValueChangeHandler<HTMLInputElement>`

Example:

```tsx
<Field label="Search resources">
  <SearchInput
    value={query}
    placeholder="Name or category"
    clearable
    loading={isSearching}
    onInput={(event) => setQuery(event.currentTarget.value)}
    onClear={() => setQuery("")}
  />
</Field>
```

`clearable` is designed for controlled usage: provide `value` and update it in `onClear`. `leading` and `trailing` accept compact adornments such as icons, status indicators, or keyboard hints. Native search attributes—including `name`, `autoComplete`, `required`, `readOnly`, `minLength`, `maxLength`, and `pattern`—are forwarded to the input.

Accessibility: Pair the control with `Field`, a visible label, or `aria-label`. Loading sets `aria-busy` on the native input, and the clear action uses `clearLabel` as its accessible name.

## Section

Import: `@tavojs/ui/section`

Use `Section` for page sections with optional heading, description, and actions.

Props:

- `eyebrow?: Child`
- `title?: Child`
- `titleSize?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"`
- `description?: Child`
- `actions?: Child`
- `spacing?: ResponsiveValue<Spacing>`

Example:

```tsx
<Section title="Latest" description="Recent updates">...</Section>
<Section title="Related settings" titleSize="h3">...</Section>
```

## SegmentedControl

Import: `@tavojs/ui/segmented-control`

Use `SegmentedControl` for compact mutually exclusive choices.

Props:

- `name: string`
- `value?: string`
- `options: { label: string; value: string; disabled?: boolean }[]`
- `size?: Size`

Example:

```tsx
<SegmentedControl name="density" value="compact" options={[{ label: "Compact", value: "compact" }]} />
```

Accessibility: Renders a radio group.

## Select

Import: `@tavojs/ui/select`

Use `Select` for native select menus.

Props:

- `size?: Size`

Example:

```tsx
<Select><option>All states</option></Select>
```

## SettingsPanel

Import: `@tavojs/ui/settings-panel`

Use `SettingsPanel` for settings rows with optional actions.

Props:

- `title?: string`
- `description?: string`
- `actions?: Child`

Example:

```tsx
<SettingsPanel title="Notifications" actions={<Switch checked />} />
```

## Shell

Import: `@tavojs/ui/shell`

Use `Shell` for app frames.

Props:

- `sidebar?: Child`
- `header?: Child`
- `rail?: "left" | "right"`

Example:

```tsx
<Shell header={<AppBar />} sidebar={<Sidebar />}>Content</Shell>
```

## Sidebar

Import: `@tavojs/ui/sidebar`

Use `Sidebar` for navigation or secondary panels.

Props:

- `padding?: ResponsiveValue<"none" | "sm" | "md" | "lg">`

Example:

```tsx
<Sidebar><Button variant="soft">Overview</Button></Sidebar>
```

## Skeleton

Import: `@tavojs/ui/skeleton`

Use `Skeleton` for loading placeholders.

Props:

- `width?: number | string`
- `height?: number | string`
- `variant?: "text" | "circular" | "rectangular" | "rounded"`

Example:

```tsx
<Skeleton height="2rem" />
```

## Slider

Import: `@tavojs/ui/slider`

Use `Slider` for numeric range input.

Props:

- `min?: number`
- `max?: number`
- `step?: number`

Example:

```tsx
<Slider min={0} max={100} value={72} />
```

## Spacer

Import: `@tavojs/ui/spacer`

Use `Spacer` when a layout needs explicit token-backed space.

Props:

- `size?: ResponsiveValue<"xs" | "sm" | "md" | "lg" | "xl">`
- `axis?: "block" | "inline"`

Example:

```tsx
<Spacer size="lg" />
```

## Spinner

Import: `@tavojs/ui/spinner`

Use `Spinner` for indeterminate loading.

Props:

- `size?: Size`
- `tone?: "primary" | "secondary" | "neutral"`
- `label?: string`

Example:

```tsx
<Spinner label="Loading report" />
```

Accessibility: Uses `label` for screen-reader context.

## SplitPane

Import: `@tavojs/ui/split-pane`

Use `SplitPane` for main/aside layouts.

Props:

- `aside?: Child`
- `side?: "left" | "right"`
- `ratio?: ResponsiveValue<"third" | "half" | "golden">`
- `gap?: ResponsiveValue<"none" | "sm" | "md" | "lg">`

Example:

```tsx
<SplitPane aside={<Panel />}>Main content</SplitPane>
```

## Stack

Import: `@tavojs/ui/stack`

Use `Stack` for vertical spacing.

Props:

- `gap?: "none" | "sm" | "md" | "lg"`

Example:

```tsx
<Stack gap="lg">...</Stack>
```

## Stat

Import: `@tavojs/ui/stat`

Use `Stat` for metric cards.

Props:

- `label?: Child`
- `value?: Child`
- `hint?: Child`
- `trend?: Child`
- `tone?: Tone`

Example:

```tsx
<Stat label="Revenue" value="$84k" trend="+11%" tone="success" />
```

## StatusDot

Import: `@tavojs/ui/status-dot`

Use `StatusDot` for compact live or static statuses.

Props:

- `tone?: Tone`
- `size?: Size`
- `pulse?: boolean`
- `label?: string`

Example:

```tsx
<StatusDot tone="success" label="Online" pulse />
```

Accessibility: `label` becomes the accessible label.

## Stepper

Import: `@tavojs/ui/stepper`

Use `Stepper` for multi-step flows.

Props:

- `steps: { id?: string; title?: Child; label?: Child; description?: Child; status?: "complete" | "current" | "upcoming" | "error" }[]`
- `orientation?: "horizontal" | "vertical"`

Example:

```tsx
<Stepper steps={[{ id: "profile", title: "Profile", status: "current" }]} />
<Stepper steps={[{ label: "Billing", status: "upcoming" }]} />
```

Accessibility: Current step receives `aria-current="step"`.

## Surface

Import: `@tavojs/ui/surface`

Use `Surface` for token-backed panels with tone, padding, radius, border, and shadow controls.

Props:

- `tone?: "default" | "raised" | "subtle" | "neutral" | "primary" | "secondary"`
- `padding?: "none" | "sm" | "md" | "lg"`
- `radius?: "none" | "sm" | "md" | "lg" | "surface"`
- `border?: boolean | "strong"`
- `shadow?: boolean`

Example:

```tsx
<Surface tone="raised" padding="lg" radius="surface" border shadow />
```

## Switch

Import: `@tavojs/ui/switch`

Use `Switch` for boolean settings.

Props:

- `checked?: boolean`
- `defaultChecked?: boolean`
- `disabled?: boolean`
- `size?: Size`
- `tone?: "primary" | "secondary" | "neutral"`

Example:

```tsx
<Switch checked aria-label="Enable alerts" />
```

Accessibility: Renders an input with `role="switch"`.

## Table

Import: `@tavojs/ui/table`

Use `Table` for tabular data. Supports compound API.

Props:

- `compact?: boolean`
- `TableCell.numeric?: boolean`
- `TableHeaderCell.numeric?: boolean`

Subcomponents:

- `Table.Root`
- `Table.Data`
- `Table.Caption`
- `Table.Head`
- `Table.Body`
- `Table.Row`
- `Table.HeaderCell`
- `Table.Cell`

Example:

```tsx
<Table.Root>
  <Table.Head>
    <Table.Row><Table.HeaderCell>Name</Table.HeaderCell></Table.Row>
  </Table.Head>
</Table.Root>
```

Column-driven recipe:

```tsx
<Table.Data
  columns={[{ id: "name", header: "Name" }]}
  rows={[{ name: "Ada" }]}
/>
```


## Tabs

Import: `@tavojs/ui/tabs`

Use `Tabs` for tabbed content. Supports item-array mode and compound helpers.

Props:

- `tabs: { id: string; label: Child; content?: Child }[]`
- `activeId: string`
- `onChange?: (tabId: string) => void`
- `idPrefix?: string`
- `orientation?: "horizontal" | "vertical"`

Example:

```tsx
<Tabs tabs={tabs} activeId="overview" onChange={setTab} />
```

Use `Tabs.Content` children when tab content should stay outside the item data:

```tsx
<Tabs tabs={tabs} activeId={activeId} onChange={setTab}>
  <Tabs.Content id="overview">
    <OverviewPanel />
  </Tabs.Content>
  <Tabs.Content id="billing">
    <BillingPanel />
  </Tabs.Content>
</Tabs>
```

Accessibility: Uses tablist, tab, tabpanel roles and arrow/Home/End keyboard navigation.

## Text

Import: `@tavojs/ui/text`

Use `Text` for token-backed typography.

Props:

- `as?: string | Component<Record<string, unknown>>` - Changes the rendered root element or component while preserving Tavo.js UI styling and public props.
- `className?: string` - Optional class hook for app-level styling.
- `variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "body" | "hint" | "span"`
- `color?: "auto" | "heading" | "muted" | "inherit" | "primary" | "secondary" | Tone`
- `tone?: Tone | "default"`
- `error?: boolean`

Example:

```tsx
<Text variant="h1">Dashboard</Text>
<Text variant="p">Paragraph copy.</Text>
<Text color="muted">Updated just now.</Text>
```

## TextInput

Import: `@tavojs/ui/text-input`

Use `TextInput` for native text inputs.

Props:

- `size?: Size`

Example:

```tsx
<TextInput placeholder="Email" />
```

## Textarea

Import: `@tavojs/ui/textarea`

Use `Textarea` for multiline input.

Props:

- `resize?: "none" | "vertical" | "horizontal" | "both"`
- `rows?: number`

Example:

```tsx
<Textarea rows={6} resize="vertical" />
```

## Timeline

Import: `@tavojs/ui/timeline`

Use `Timeline` and `TimelineItem` for chronological milestones.

Props:

- `TimelineItem.title?: Child`
- `TimelineItem.meta?: Child`
- `TimelineItem.tone?: Tone`

Example:

```tsx
<Timeline>
  <TimelineItem title="Released" meta="today" tone="success">Version shipped.</TimelineItem>
</Timeline>
```

## Toast

Import: `@tavojs/ui/toast`

Use `Toast` for transient notifications and `ToastStack` for fixed positioning.

Props:

- `title?: Child`
- `tone?: "info" | "success" | "warning" | "danger"`
- `action?: Child`
- `onClose?: () => void`
- `closeLabel?: string`

Example:

```tsx
<ToastStack>
  <Toast title="Saved" tone="success" onClose={dismiss}>Changes saved.</Toast>
</ToastStack>
```

Accessibility: Uses `role="status"`. Manage focus intentionally for destructive or blocking notifications.

## Toolbar

Import: `@tavojs/ui/toolbar`

Use `Toolbar` to align groups of controls.

Props:

- `align?: ResponsiveValue<"start" | "center" | "end" | "stretch">`
- `justify?: ResponsiveValue<"start" | "center" | "end" | "between">`
- `gap?: ResponsiveValue<"none" | "sm" | "md" | "lg">`
- `wrap?: boolean`

Example:

```tsx
<Toolbar><Inline>...</Inline><Button>Save</Button></Toolbar>
```

## Tooltip

Import: `@tavojs/ui/tooltip`

Use `Tooltip` for short contextual hints.

Props:

- `content: Child`
- `side?: "top" | "right" | "bottom" | "left"`

Example:

```tsx
<Tooltip content="Export report"><Button>Export</Button></Tooltip>
```

## Collapsible

Import: `@tavojs/ui/collapsible`

Use `Collapsible` for compact reveal/hide sections.

Props:

- `open?: boolean`
- `defaultOpen?: boolean`
- `onOpenChange?: (open, reason) => void`

Subcomponents:

- `Collapsible.Root`
- `Collapsible.Trigger`
- `Collapsible.Content`
- `Collapsible.Close`

Example:

```tsx
<Collapsible open>
  <Collapsible.Trigger>Advanced settings</Collapsible.Trigger>
  <Collapsible.Content>Developer-only controls.</Collapsible.Content>
</Collapsible>
```

Accessibility: Built on native `details` and `summary`.

## DropdownMenu

Import: `@tavojs/ui/dropdown-menu`

Use `DropdownMenu` for contextual action lists opened from a trigger.

Props:

- `open?: boolean`
- `defaultOpen?: boolean`
- `align?: "start" | "end"`
- `onClose?: () => void`
- `onOpenChange?: (open, reason) => void`

Subcomponents:

- `DropdownMenu.Root`
- `DropdownMenu.Trigger`
- `DropdownMenu.Content`
- `DropdownMenu.Item`
- `DropdownMenu.Close`

Example:

```tsx
<DropdownMenu>
  <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item onSelect={duplicate}>Duplicate</DropdownMenu.Item>
    <DropdownMenu.Item closeOnSelect={false}>Keep menu open</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu>
```

Accessibility: Content uses `role="menu"` and items use `role="menuitem"`.

## InputGroup

Import: `@tavojs/ui/input-group`

Use `InputGroup` for controls with prefixes, suffixes, or inline actions.

Props:

- `size?: Size`

Subcomponents:

- `InputGroup.Root`
- `InputGroup.Addon`
- `InputGroup.Input`
- `InputGroup.Button`

Example:

```tsx
<InputGroup>
  <InputGroup.Addon>$</InputGroup.Addon>
  <InputGroup.Input name="amount" placeholder="Amount" />
  <InputGroup.Button>Apply</InputGroup.Button>
</InputGroup>
```

## Popover

Import: `@tavojs/ui/popover`

Use `Popover` for lightweight contextual panels.

Props:

- `open?: boolean`
- `defaultOpen?: boolean`
- `placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end"`
- `onOpenChange?: (open, reason) => void`

Subcomponents:

- `Popover.Root`
- `Popover.Trigger`
- `Popover.Content`
- `Popover.Close`

Example:

```tsx
<Popover>
  <Popover.Trigger>Filters</Popover.Trigger>
  <Popover.Content>Filter controls go here.</Popover.Content>
</Popover>
```

Accessibility: Trigger exposes `aria-haspopup="dialog"` and content uses dialog semantics.

## Toggle

Import: `@tavojs/ui/toggle`

Use `Toggle` for pressed/unpressed actions.

Props:

- `pressed?: boolean`
- `size?: Size`
- `variant?: "default" | "outline" | "ghost"`
- `href?: string`

Example:

```tsx
<Toggle pressed>Preview</Toggle>
```

Accessibility: Emits `aria-pressed`.

## ToggleGroup

Import: `@tavojs/ui/toggle-group`

Use `ToggleGroup` for single or multiple toggle selections.

Props:

- `name?: string`
- `value?: string | string[]`
- `defaultValue?: string | string[]`
- `items: { label: Child; value: string; accessibleLabel?: string; title?: string; disabled?: boolean }[]`
- `type?: "single" | "multiple"`
- `allowEmpty?: boolean`
- `fullWidth?: boolean`
- `onValueChange?: (value: string | string[] | undefined) => void`
- `size?: Size`
- `variant?: "default" | "outline" | "ghost"`

Example:

```tsx
<ToggleGroup
  name="view"
  value="grid"
  items={[{ label: "List", value: "list" }, { label: "Grid", value: "grid" }]}
/>
```

## VisuallyHidden

Import: `@tavojs/ui/visually-hidden`

Use `VisuallyHidden` for screen-reader-only content.

Props:

- `focusable?: boolean`

Example:

```tsx
<VisuallyHidden>Loading complete</VisuallyHidden>
```

Accessibility: Use `focusable` for skip links or hidden interactive labels.

## FileTrigger

Import: `@tavojs/ui/file-trigger`

Use `FileTrigger` when a native file picker should use the same visual and interaction contract as `Button`.

Props:

- `accept?: string` - Native accepted file types.
- `multiple?: boolean` - Allows more than one selected file.
- `capture?: boolean | "user" | "environment" | string` - Forwards the native capture hint.
- `name?: string` - Native form field name.
- `resetAfterSelection?: boolean` - Clears the native value so the same file can be selected again.
- `onFilesChange?: (files: FileList, event) => void` - Exposes selected native files without reading or uploading them.
- `variant?: ButtonVariant` - Reuses Button styling.
- `size?: Size` - Reuses Button sizing.

Example:

```tsx
<FileTrigger
  accept="application/json,.json"
  variant="text"
  onFilesChange={(files) => importFile(files[0])}
>
  Import JSON
</FileTrigger>
```

Accessibility: The visible trigger is a native button and works with pointer, Enter, and Space activation. The file input remains native and is reset only after the callback runs.

## NumberInput

Import: `@tavojs/ui/number-input`

Use `NumberInput` for numeric values that need typed preview and commit callbacks while preserving empty, signed, and decimal typing drafts.

Props:

- `value?: number | null` - Controlled numeric or unset value.
- `defaultValue?: number | null` - Initial uncontrolled value.
- `min?: number` / `max?: number` - Commit and keyboard-step limits.
- `step?: number` - Arrow-key increment.
- `label?: Child` - Visible accessible label.
- `prefix?: Child` / `suffix?: Child` - Visual affixes kept out of the accessible value.
- `onValueInput?: (value, draft) => void` - Typed transient callback for valid drafts.
- `onValueChange?: (value, draft) => void` - Typed commit callback.

Example:

```tsx
<NumberInput
  label="Width"
  value={width}
  min={0}
  step={1}
  suffix="px"
  onValueInput={previewWidth}
  onValueChange={saveWidth}
/>
```

Accessibility: The visible label wraps the input, affixes are hidden from assistive technology, and Arrow keys support native-like stepping with Shift for a larger increment.

## ObjectField

Import: `@tavojs/ui/object-field`

Use `ObjectField` for JSON-compatible records whose keys, value types, values, and raw JSON need structured editing.

Props:

- `label: Child` - Fieldset legend.
- `value: ObjectFieldValue` - Controlled JSON-compatible object.
- `valueKinds?: ObjectFieldValueKind[]` - Allowed row types.
- `showRaw?: boolean` - Enables the advanced JSON escape hatch.
- `error?: Child` - Host validation message.
- `onDraft?: (value, validation) => void` - Transient valid-object draft and validation state.
- `onCommit?: (value, validation) => void` - Valid structured commit.
- `onValidationChange?: (validation) => void` - Duplicate-key, number, and JSON validation updates.

Example:

```tsx
<ObjectField
  label="Options"
  value={{ color: "primary", hidden: false }}
  valueKinds={["text", "number", "boolean", "object", "array", "null"]}
  onDraft={setDraftOptions}
  onCommit={saveOptions}
/>
```

Accessibility: Rows have explicit Key, Type, and Value labels; add/remove controls have accessible names; errors use alert semantics without moving focus.

## TreeView

Import: `@tavojs/ui/tree-view`

Use `TreeView` for hierarchical content that needs roving focus, single or multiple selection, expansion, activation, and generic drop feedback.

Props:

- `selectedIds?: readonly string[]` - Controlled selected identifiers.
- `defaultSelectedIds?: readonly string[]` - Initial selection.
- `selectionMode?: "none" | "single" | "multiple"` - Selection behavior.
- `selectionAnchorId?: string` - Explicit contiguous-range anchor.
- `expandedIds?: readonly string[]` - Controlled expanded identifiers.
- `onSelectionChange?: (ids: string[]) => void` - Selection callback.
- `onActivate?: (id: string) => void` - Enter or double-click activation.
- `onDrop?: (event: TreeViewDropEvent) => void` - Opaque in-memory source/target drop request.

Example:

```tsx
<TreeView
  aria-label="Page layers"
  selectedIds={selectedIds}
  selectionMode="multiple"
  onSelectionChange={setSelectedIds}
  onActivate={revealNode}
  onDrop={moveNode}
>
  <TreeView.Item id="hero" label="Hero" description="Box" draggable>
    <TreeView.Item id="heading" label="Heading" />
  </TreeView.Item>
</TreeView>
```

Accessibility: Items use ARIA tree semantics and roving tab stops. Arrow, Home, End, Space, and Enter behavior is keyboard complete; expansion buttons are separately named.
