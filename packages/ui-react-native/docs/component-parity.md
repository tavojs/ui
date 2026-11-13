# Component Parity

The native package exports all 85 component names in `@tavojs/ui` plus four native-specific components (`Badge`, `IconButton`, `SegmentedControl`, and `Surface`). Each component is available from the package root and a kebab-case subpath.

## Added native counterparts

| Area                    | Components                                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout                  | `AppBar`, `AspectRatio`, `Grid`, `GridRuler`, `Page`, `Section`, `Shell`, `Sidebar`, `SplitPane`, `Toolbar`, `Overlay`, `Portal`, `FocusTrap`, `Resizable`, `VisuallyHidden`                |
| Display                 | `Breadcrumbs`, `Chart`, `CodeBlock`, `EmptyState`, `Kbd`, `List`, `PropertyList`, `Stat`, `Stepper`, `Table`, `Timeline`                                                                    |
| Navigation and feedback | `Collapsible`, `CommandMenu`, `ConfirmDialog`, `Dialog`, `DropdownMenu`, `HoverCard`, `Menubar`, `NavigationMenu`, `Popover`, `Sheet`, `Tabs`, `Toast`, `Tooltip`, `TreeView`               |
| Forms                   | `Calendar`, `ColorPicker`, `Combobox`, `DatePicker`, `FileTrigger`, `FormControlLabel`, `InputGroup`, `Link`, `NumberInput`, `ObjectField`, `Pagination`, `SearchInput`, `Select`, `Slider` |

## Native adaptations

- `Dialog`, `Sheet`, `Overlay`, and `Portal` use React Native `Modal`. `Popover`, `DropdownMenu`, and `HoverCard` use anchored floating native views. Native `HoverCard` and `Tooltip` open on press because touch screens do not have hover.
- `Calendar` and `DatePicker` use ISO date strings (`YYYY-MM-DD`). `Select`, `Combobox`, and `CommandMenu` use pressable native lists and text input.
- `Grid`, `Table`, `Chart`, `Stepper`, and `Timeline` use native `View`, `ScrollView`, and `Text` layouts. Compound components such as `Table.Row`, `List.Item`, and `TreeView.Item` are available alongside named exports.
- `Link` uses React Native `Linking` for `href` and `to`. Apps with a navigation router can provide `onPress` and omit `href`/`to`.
- `FileTrigger` requires a `picker` callback supplied by the app. The callback receives `{ accept, multiple }` and returns files shaped like `{ uri, name?, type?, size? }`. React Native core does not provide a document picker.
- `FocusTrap` uses `accessibilityViewIsModal` for native screen reader focus. `AppBar` cannot implement web `position="sticky"` by itself; the parent `ScrollView` must configure sticky headers.
- DOM event, ARIA, CSS, and HTML element props have native equivalents where available. Browser-only behavior such as HTML form submission and file inputs is not carried over.

The original shared native components remain available. `ButtonGroup`, `Field`, `FormControl`, `RadioGroup`, `SegmentedControl`, `Toggle`, and `ToggleGroup` continue to use their existing native APIs.
