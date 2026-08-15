import fs from "node:fs";
import path from "node:path";
import { componentEntries, groupEntries } from "./component-manifest.mjs";

const root = process.cwd();
const packagePath = path.join(root, "package.json");
const metadataPath = path.join(root, "src", "metadata.ts");
const componentsIndexPath = path.join(root, "src", "components", "index.ts");
const groupsDir = path.join(root, "src", "groups");
const componentDocsPath = path.join(root, "docs", "components.md");
const generatedDocsStart = "<!-- tavo-ui:component-index:start -->";
const generatedDocsEnd = "<!-- tavo-ui:component-index:end -->";

function writeFileIfChanged(filePath, content) {
  if (
    fs.existsSync(filePath) &&
    fs.readFileSync(filePath, "utf8") === content
  ) {
    return false;
  }
  fs.writeFileSync(filePath, content);
  return true;
}
const categoryLabels = {
  layout: "Layout",
  forms: "Forms",
  data: "Data",
  feedback: "Feedback",
  content: "Content",
  recipes: "Recipes",
  navigation: "Navigation",
};
const categoryAgentDefaults = {
  layout: {
    status: "stable",
    whenToUse:
      "Use when composing page structure, spacing, responsive regions, or token-backed surfaces.",
    avoidWhen:
      "Avoid for interactive form state; combine with form, feedback, or data components instead.",
    props: [
      {
        name: "children",
        type: "Child",
        description: "Content rendered inside the layout primitive.",
      },
      {
        name: "className",
        type: "string",
        description: "Optional class hook for app-level styling.",
      },
      {
        name: "sx",
        type: "Sx",
        description:
          "Mobile-first responsive style overrides registered through Tavo.js UI.",
      },
    ],
    accessibility: {
      summary:
        "Layout primitives are semantic-neutral unless a component prop selects an element role.",
      checklist: [
        "Choose semantic elements such as main, nav, aside, or section when the region has document meaning.",
        "Keep heading order and landmark labels app-owned.",
      ],
    },
  },
  forms: {
    status: "stable",
    whenToUse:
      "Use when collecting input, triggering actions, or presenting selectable controls.",
    avoidWhen: "Avoid wrapping controls without labels or accessible names.",
    props: [
      {
        name: "size",
        type: "Size",
        defaultValue: "md",
        description: "Control scale: sm, md, or lg when supported.",
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Disables the control when supported.",
      },
      {
        name: "aria-*",
        type: "unknown",
        description:
          "ARIA attributes are passed through for accessible labeling and state.",
      },
    ],
    accessibility: {
      summary:
        "Form components pass through native attributes and should be paired with visible labels or accessible names.",
      checklist: [
        "Use Field, FormLabel, FormControlLabel, or aria-label for labeling.",
        "Preserve native input semantics whenever possible.",
        "Expose validation with error text and aria-invalid where relevant.",
      ],
    },
  },
  data: {
    status: "stable",
    whenToUse:
      "Use when displaying metrics, progress, tabular records, timelines, or resource state.",
    avoidWhen: "Avoid using data components as decorative layout containers.",
    props: [
      {
        name: "children",
        type: "Child",
        description: "Structured data content or component-specific slots.",
      },
      {
        name: "tone",
        type: "Tone",
        description: "Semantic tone where status or emphasis is supported.",
      },
      {
        name: "className",
        type: "string",
        description: "Optional class hook for app-level styling.",
      },
    ],
    accessibility: {
      summary:
        "Data components should preserve readable order and expose labels for non-textual values.",
      checklist: [
        "Use captions or nearby headings for tables and charts.",
        "Do not rely on color alone for status.",
        "Keep values and labels available as text.",
      ],
    },
  },
  feedback: {
    status: "stable",
    whenToUse:
      "Use for status, loading, overlays, dialogs, tooltips, and temporary feedback.",
    avoidWhen: "Avoid using feedback components as primary page layout.",
    props: [
      {
        name: "tone",
        type: "Tone",
        description: "Semantic tone where status messaging is supported.",
      },
      {
        name: "open",
        type: "boolean",
        description:
          "Controlled visibility state for overlay-style components when supported.",
      },
      {
        name: "children",
        type: "Child",
        description: "Feedback message or overlay content.",
      },
    ],
    accessibility: {
      summary:
        "Feedback components should announce status changes and manage focus only when the component owns that behavior.",
      checklist: [
        "Use Dialog, Sheet, or FocusTrap for modal workflows.",
        "Use Toast or native live-region semantics for dynamic announcements.",
        "Make dismiss and escape behavior clear for overlays.",
      ],
    },
  },
  content: {
    status: "stable",
    whenToUse:
      "Use for text, media, labels, code snippets, lists, and compact content structure.",
    avoidWhen:
      "Avoid replacing interactive controls with content-only components.",
    props: [
      {
        name: "children",
        type: "Child",
        description: "Visible content rendered by the component.",
      },
      {
        name: "className",
        type: "string",
        description: "Optional class hook for app-level styling.",
      },
      {
        name: "sx",
        type: "Sx",
        description: "Mobile-first responsive style overrides where supported.",
      },
    ],
    accessibility: {
      summary:
        "Content components should keep meaningful text and media alternatives available to assistive technology.",
      checklist: [
        "Provide alt text for meaningful images.",
        "Use semantic text variants for headings and paragraphs.",
        "Do not hide essential content visually unless VisuallyHidden is intentional.",
      ],
    },
  },
  recipes: {
    status: "stable",
    whenToUse:
      "Use when an app screen needs a ready-made composition for common product workflows.",
    avoidWhen:
      "Avoid when a low-level primitive would express a simpler one-off layout more clearly.",
    props: [
      {
        name: "title",
        type: "Child",
        description: "Primary label or heading for the recipe when supported.",
      },
      {
        name: "description",
        type: "Child",
        description: "Supporting copy for the recipe when supported.",
      },
      {
        name: "actions",
        type: "Child",
        description: "Action slot for buttons or controls when supported.",
      },
    ],
    accessibility: {
      summary:
        "Recipes compose lower-level components and inherit their labeling and keyboard expectations.",
      checklist: [
        "Keep recipe titles descriptive.",
        "Use real controls in action slots.",
        "Preserve list, table, or form semantics inside the composition.",
      ],
    },
  },
  navigation: {
    status: "stable",
    whenToUse:
      "Use when exposing page hierarchy, app navigation, or current-page state.",
    avoidWhen: "Avoid for arbitrary button groups that do not navigate.",
    props: [
      {
        name: "items",
        type: "Array",
        description: "Navigation items when supported by the component.",
      },
      {
        name: "aria-label",
        type: "string",
        description: "Accessible label for navigation landmarks when needed.",
      },
      {
        name: "children",
        type: "Child",
        description: "Navigation content or custom item structure.",
      },
    ],
    accessibility: {
      summary:
        "Navigation components should expose current-page state and landmark labels when context is not obvious.",
      checklist: [
        "Use aria-current for active destinations where supported.",
        "Add aria-label when multiple nav landmarks exist.",
        "Keep link text descriptive.",
      ],
    },
  },
};
const componentAgentOverrides = {
  Calendar: {
    whenToUse:
      "Use Calendar for a visible month grid with optional controlled month and year selection and previous/next navigation.",
    props: [
      { name: "year", type: "number", description: "Displayed year." },
      { name: "month", type: "number", description: "Displayed zero-based month." },
      {
        name: "yearRange",
        type: "{ start: number; end: number }",
        description: "Inclusive year options shown by the year selector.",
      },
      {
        name: "onMonthChange",
        type: "(year: number, month: number) => void",
        description: "Makes the month and year in the top heading selectable and requests a controlled visible-month change.",
      },
      {
        name: "onSelect",
        type: "(value: string) => void",
        description: "Runs when an enabled date is selected.",
      },
    ],
    examples: [
      {
        title: "Selectable month and year",
        code: '<Calendar year={year} month={month} yearRange={{ start: 2020, end: 2030 }} onMonthChange={(nextYear, nextMonth) => setView({ year: nextYear, month: nextMonth })} />',
      },
    ],
  },
  Button: {
    whenToUse:
      "Use Button for primary, secondary, destructive, or link-style actions.",
    avoidWhen:
      "Avoid for navigation lists; use Link, Menubar, NavigationMenu, or Breadcrumbs.",
    props: [
      {
        name: "variant",
        type: '"solid" | "soft" | "outline" | "ghost" | "text"',
        defaultValue: "solid",
        description: "Visual treatment.",
      },
      {
        name: "tone",
        type: '"primary" | "secondary" | "neutral" | "danger"',
        defaultValue: "primary",
        description: "Action tone.",
      },
      {
        name: "loading",
        type: "boolean",
        defaultValue: "false",
        description: "Disables the action and exposes aria-busy.",
      },
      {
        name: "iconOnly",
        type: "boolean",
        defaultValue: "false",
        description:
          "Uses square icon-only sizing; pair with label or aria-label.",
      },
    ],
    examples: [
      {
        title: "Primary action",
        code: '<Button variant="solid" tone="primary">Save</Button>',
      },
      {
        title: "Link action",
        code: '<Button as="a" href="/settings" variant="soft">Settings</Button>',
      },
    ],
  },
  Field: {
    whenToUse:
      "Use Field to wire labels, helper text, errors, required state, and ARIA attributes around a form control.",
    avoidWhen:
      "Avoid manually duplicating label and aria-describedby wiring for common fields.",
    props: [
      { name: "label", type: "Child", description: "Visible field label." },
      {
        name: "description",
        type: "Child",
        description: "Helper text announced with the control.",
      },
      {
        name: "error",
        type: "Child",
        description: "Validation message and invalid state.",
      },
      {
        name: "required",
        type: "boolean",
        defaultValue: "false",
        description: "Marks the field as required.",
      },
    ],
    examples: [
      {
        title: "Labeled text input",
        code: '<Field label="Email" error={emailError}><TextInput type="email" /></Field>',
      },
    ],
  },
  Dialog: {
    whenToUse:
      "Use Dialog for modal workflows that require focused user attention.",
    avoidWhen: "Avoid for simple inline messages; use Alert or Toast.",
    props: [
      {
        name: "open",
        type: "boolean",
        description: "Controls whether the dialog is visible.",
      },
      { name: "title", type: "Child", description: "Dialog title." },
      {
        name: "onClose",
        type: "TavoEventHandler",
        description:
          "Close callback for escape or dismiss actions where supported.",
      },
    ],
    examples: [
      {
        title: "Modal content",
        code: '<Dialog open title="Invite teammate">...</Dialog>',
      },
    ],
  },
  Table: {
    whenToUse: "Use Table for structured rows and columns of comparable data.",
    avoidWhen: "Avoid for purely visual grids; use Grid or Stack instead.",
    props: [
      {
        name: "compact",
        type: "boolean",
        defaultValue: "false",
        description: "Uses denser row spacing when supported.",
      },
      {
        name: "caption",
        type: "Child",
        description: "Accessible table caption when supported.",
      },
      {
        name: "columns",
        type: "TableDataColumn[]",
        description: "Column definitions for Table.Data.",
      },
      {
        name: "rows",
        type: "Record<string, unknown>[]",
        description: "Rows for Table.Data.",
      },
    ],
    examples: [
      {
        title: "Compound table",
        code: '<Table.Root caption="Invoices"><Table.Head><Table.Row><Table.HeaderCell>Status</Table.HeaderCell></Table.Row></Table.Head><Table.Body><Table.Row><Table.Cell>Paid</Table.Cell></Table.Row></Table.Body></Table.Root>',
      },
    ],
  },
};
const searchTermsByComponent = {
  Alert: [
    "inline status",
    "message",
    "feedback",
    "success warning danger info",
  ],
  AppBar: ["top navigation", "header bar", "app chrome"],
  Button: [
    "action",
    "submit",
    "primary action",
    "link action",
    "icon only action",
    "accessible icon button",
  ],
  Calendar: ["month grid", "calendar", "date selection"],
  Card: ["content card", "discrete surface", "content block"],
  Checkbox: ["boolean option", "multi select", "checked"],
  CommandMenu: ["command palette", "quick actions", "search commands"],
  ConfirmDialog: ["confirmation", "destructive action", "confirm delete"],
  DatePicker: ["date input", "date field", "calendar popover", "due date"],
  Dialog: ["modal", "modal dialog", "focused workflow"],
  EmptyState: ["empty state", "no results", "error state", "onboarding state"],
  Field: [
    "form field",
    "label input",
    "validation message",
    "aria describedby",
  ],
  Grid: ["responsive grid", "columns", "layout grid"],
  InputGroup: ["input addon", "input with button", "combined input"],
  NavigationMenu: ["navigation", "current page", "nav links"],
  Page: ["page layout", "main region", "document page"],
  Pagination: ["paged data", "page navigation", "next previous"],
  Popover: ["floating panel", "contextual disclosure", "popup"],
  Progress: ["progress", "loading progress", "completion"],
  PropertyList: ["key value", "details list", "record details"],
  RadioGroup: ["single choice", "radio options", "fieldset"],
  SearchInput: ["search", "query input", "filter search"],
  Select: ["select", "dropdown field", "native select"],
  Sheet: ["edge dialog", "bottom sheet", "side sheet"],
  Shell: ["application shell", "sidebar layout", "app layout"],
  Sidebar: ["sidebar layout", "navigation rail", "side navigation"],
  Skeleton: ["loading placeholder", "skeleton state", "placeholder"],
  Slider: ["range input", "numeric range", "slider"],
  Spinner: ["loading spinner", "busy indicator", "progress"],
  Stat: ["metric", "kpi", "dashboard stat"],
  StatusDot: ["status indicator", "online offline", "semantic dot"],
  Stepper: ["wizard steps", "checkout steps", "setup progress"],
  Table: ["data table", "rows columns", "records", "tabular data"],
  Tabs: ["tabbed interface", "switch panels", "tabs"],
  TextInput: ["text input", "email input", "field input"],
  Textarea: ["multiline input", "long text", "message input"],
  Toast: ["notification", "toast", "temporary feedback"],
  Toggle: ["pressed state", "toggle button", "on off action"],
  ToggleGroup: ["toggle group", "segmented toggles", "multi toggle"],
  Toolbar: ["action toolbar", "control row", "button row"],
  Tooltip: ["tooltip", "hover label", "supplemental label"],
  VisuallyHidden: ["screen reader text", "hidden label", "accessible name"],
};
const compoundMembersByComponent = {
  Card: ["Root", "Header", "Media", "Content", "Actions"],
  Collapsible: ["Root", "Trigger", "Content"],
  DropdownMenu: ["Root", "Trigger", "Content", "Item"],
  HoverCard: ["Root", "Trigger", "Content"],
  InputGroup: ["Root", "Addon", "Input", "Button"],
  List: ["Root", "Item"],
  Popover: ["Root", "Trigger", "Content"],
  Resizable: ["Root", "Panel", "Handle"],
  Sheet: ["Root", "Trigger", "Content", "Close"],
  SplitPane: ["Root", "Aside", "Main"],
  Table: ["Root", "Head", "Body", "Row", "HeaderCell", "Cell", "Data"],
  Tabs: ["Root", "List", "Trigger", "Content", "Indicator"],
  ToggleGroup: ["Root", "Item"],
};
const commonPairingsByComponent = {
  Alert: ["Button", "Link", "Toast"],
  AppBar: ["Toolbar", "NavigationMenu", "Button"],
  AspectRatio: ["Image", "Card", "Box"],
  Avatar: ["Text", "Chip", "Timeline"],
  Box: ["Stack", "Inline", "Grid"],
  Breadcrumbs: ["Section", "Link", "NavigationMenu"],
  Button: ["ButtonGroup", "Icon", "Toolbar"],
  ButtonGroup: ["Button", "Toggle", "Toolbar"],
  Calendar: ["DatePicker", "Popover", "Field"],
  Card: ["Stack", "Button", "Chip"],
  Chart: ["Stat", "Grid", "Table"],
  Checkbox: ["Field", "FormControlLabel", "FormControl"],
  Chip: ["Toolbar", "StatusDot", "Card"],
  CodeBlock: ["Tabs", "Card", "Text"],
  Collapsible: ["Section", "Button", "Text"],
  Combobox: ["Field", "InputGroup", "Toolbar"],
  CommandMenu: ["Dialog", "SearchInput", "Kbd"],
  ConfirmDialog: ["Dialog", "Button", "Alert"],
  DatePicker: ["Field", "Calendar", "Popover"],
  Dialog: ["FocusTrap", "Overlay", "Button"],
  Divider: ["Stack", "Section", "Card"],
  DropdownMenu: ["Button", "Icon", "Toolbar"],
  EmptyState: ["Button", "Card", "Text"],
  Field: ["TextInput", "FormLabel", "FormMessage"],
  Flex: ["Box", "Stack", "Inline"],
  FocusTrap: ["Dialog", "Sheet", "Overlay"],
  FormControl: ["Field", "FormLabel", "FormMessage"],
  FormControlLabel: ["Checkbox", "Radio", "Switch"],
  FormLabel: ["Field", "FormControl", "TextInput"],
  Grid: ["Card", "Box", "Stat"],
  GridRuler: ["Grid", "Box", "Section"],
  HoverCard: ["Avatar", "Button", "Text"],
  Icon: ["Button", "Tooltip", "StatusDot"],
  Image: ["AspectRatio", "Card", "Avatar"],
  Inline: ["Chip", "Button", "StatusDot"],
  InputGroup: ["TextInput", "Button", "SearchInput"],
  Kbd: ["CommandMenu", "Text", "Tooltip"],
  Link: ["Text", "Breadcrumbs", "Alert"],
  List: ["Card", "Section", "Text"],
  Menubar: ["NavigationMenu", "AppBar", "Link"],
  NavigationMenu: ["AppBar", "Sidebar", "Link"],
  Overlay: ["Dialog", "Sheet", "FocusTrap"],
  Page: ["Section", "Shell", "Toolbar"],
  Pagination: ["Table", "Toolbar", "Button"],
  Portal: ["Dialog", "Popover", "Tooltip"],
  Popover: ["Button", "Calendar", "DropdownMenu"],
  Progress: ["StatusDot", "Toast", "Spinner"],
  PropertyList: ["Card", "Table", "Chip"],
  Radio: ["RadioGroup", "FormControlLabel", "Field"],
  RadioGroup: ["Radio", "Field", "FormControl"],
  Resizable: ["SplitPane", "Card", "Sidebar"],
  SearchInput: ["Field", "Toolbar", "CommandMenu"],
  ScrollArea: ["Table", "Card", "Sidebar"],
  Section: ["Page", "Card", "Stack"],
  Select: ["Field", "Toolbar", "Table"],
  Sheet: ["Overlay", "Button", "FocusTrap"],
  Shell: ["AppBar", "Sidebar", "Page"],
  Sidebar: ["Shell", "NavigationMenu", "ScrollArea"],
  Skeleton: ["Card", "Table", "Image"],
  Slider: ["Field", "TextInput", "Text"],
  Spacer: ["Stack", "Inline", "Box"],
  Spinner: ["Button", "Progress", "StatusDot"],
  SplitPane: ["Card", "Resizable", "Sidebar"],
  Stack: ["Box", "Card", "Section"],
  Stat: ["Grid", "Chart", "Chip"],
  StatusDot: ["Chip", "Table", "Timeline"],
  Stepper: ["Progress", "Button", "Card"],
  Switch: ["FormControlLabel", "Field", "Card"],
  Table: ["Toolbar", "Pagination", "ScrollArea"],
  Tabs: ["CodeBlock", "Card", "ToggleGroup"],
  Text: ["Link", "Chip", "Kbd"],
  TextInput: ["Field", "InputGroup", "SearchInput"],
  Textarea: ["Field", "FormMessage", "Button"],
  Timeline: ["StatusDot", "Card", "Text"],
  Toast: ["Button", "Alert", "StatusDot"],
  Toggle: ["ToggleGroup", "Toolbar", "Button"],
  ToggleGroup: ["Toggle", "Toolbar", "Tabs"],
  Toolbar: ["Button", "Icon", "ButtonGroup"],
  Tooltip: ["Button", "Icon", "Kbd"],
  VisuallyHidden: ["Button", "Icon", "Tooltip"],
};

const activeComponentNames = new Set(
  componentEntries.map((entry) => entry.name)
);

function canonicalizeComponentNames(names, owner) {
  return [
    ...new Set(
      names.filter((name) => name !== owner && activeComponentNames.has(name))
    ),
  ];
}

const polymorphicComponents = new Set([
  "Alert",
  "AppBar",
  "Box",
  "Button",
  "Card",
  "Chip",
  "Divider",
  "Flex",
  "Inline",
  "Kbd",
  "Section",
  "Skeleton",
  "Spinner",
  "Stack",
  "StatusDot",
  "Text",
  "Toggle",
  "Toolbar",
  "VisuallyHidden",
]);

const polymorphicProp = {
  name: "as",
  type: "string | Component<Record<string, unknown>>",
  required: false,
  description:
    "Changes the rendered root element or component while preserving Tavo.js UI styling and public props.",
};

const classNameProp = {
  name: "className",
  type: "string",
  required: false,
  description:
    "Optional class hook applied to the public root element owned by the component.",
};

function withPolymorphicProps(componentName, props) {
  if (
    !polymorphicComponents.has(componentName) ||
    props.some((prop) => prop.name === "as")
  ) {
    return props;
  }
  return [polymorphicProp, ...props];
}

function withClassNameProp(props) {
  if (props.some((prop) => prop.name === "className")) {
    return props;
  }
  return [classNameProp, ...props];
}

function readComponentDocsSections() {
  if (!fs.existsSync(componentDocsPath)) {
    return {};
  }

  const docs = fs.readFileSync(componentDocsPath, "utf8");
  const headingPattern = /^## ([A-Z][A-Za-z0-9]+)$/gm;
  const matches = [...docs.matchAll(headingPattern)];
  const sections = {};
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const next = matches[index + 1];
    sections[match[1]] = docs
      .slice((match.index ?? 0) + match[0].length, next?.index ?? docs.length)
      .trim();
  }
  return sections;
}

const componentDocsSections = readComponentDocsSections();

function sentenceFromSection(section) {
  const paragraph = section
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("Use "));
  return paragraph?.replace(/\.$/, "");
}

function parseDocsProps(section) {
  const propsStart = section.indexOf("\nProps:");
  if (propsStart === -1) {
    return [];
  }

  const afterProps = section.slice(propsStart + "\nProps:".length);
  const propsEnd = afterProps.search(/\n(?:Example:|Accessibility:|## )/);
  const propsBlock =
    propsEnd === -1 ? afterProps : afterProps.slice(0, propsEnd);
  return propsBlock
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- `"))
    .map((line) => {
      const match = line.match(/^- `([^`]+)`(?:\s*-\s*(.*))?$/);
      if (!match) {
        return undefined;
      }
      const signature = match[1];
      const description = match[2]?.trim();
      const nameMatch = signature.match(/^([A-Za-z0-9_.]+)(\??):\s*(.+)$/);
      if (!nameMatch) {
        return undefined;
      }
      return {
        name: nameMatch[1],
        type: nameMatch[3],
        required: nameMatch[2] !== "?",
        description:
          description || `Configures ${nameMatch[1]} for this component.`,
      };
    })
    .filter(Boolean)
    .slice(0, 8);
}

function parseDocsExample(entry, section) {
  const codeMatch = section.match(/```tsx\n([\s\S]*?)\n```/);
  const code = codeMatch?.[1]?.trim();
  if (code) {
    return { title: `${entry.name} example`, code };
  }
  return { title: `${entry.name} example`, code: `<${entry.name} />` };
}

function parseDocsAccessibility(section) {
  const match = section.match(/Accessibility:\s*([^\n]+)/);
  return match?.[1]?.trim();
}

function componentExport(entry) {
  return {
    types: `./dist/components/${entry.name}/index.d.ts`,
    browser: `./dist/browser/components/${entry.name}/index.js`,
    import: `./dist/components/${entry.name}/index.js`,
  };
}

function cssComponentExport(entry) {
  return {
    types: `./dist/css/components/${entry.name}/index.d.ts`,
    browser: `./dist/browser/components/${entry.name}/index.js`,
    import: `./dist/css/components/${entry.name}/index.js`,
  };
}

function buildExports() {
  const exportsMap = {
    ".": {
      types: "./dist/index.d.ts",
      browser: "./dist/browser/index.js",
      import: "./dist/index.js",
    },
    "./cli": {
      types: "./dist/cli/index.d.ts",
      import: "./dist/cli/index.js",
    },
    "./css": {
      types: "./dist/css/index.d.ts",
      browser: "./dist/browser/index.js",
      import: "./dist/css/index.js",
    },
    "./css/layout": {
      types: "./dist/css/groups/layout.d.ts",
      browser: "./dist/browser/groups/layout.js",
      import: "./dist/css/groups/layout.js",
    },
    "./css/forms": {
      types: "./dist/css/groups/forms.d.ts",
      browser: "./dist/browser/groups/forms.js",
      import: "./dist/css/groups/forms.js",
    },
    "./css/data": {
      types: "./dist/css/groups/data.d.ts",
      browser: "./dist/browser/groups/data.js",
      import: "./dist/css/groups/data.js",
    },
    "./css/feedback": {
      types: "./dist/css/groups/feedback.d.ts",
      browser: "./dist/browser/groups/feedback.js",
      import: "./dist/css/groups/feedback.js",
    },
    "./css/navigation": {
      types: "./dist/css/groups/navigation.d.ts",
      browser: "./dist/browser/groups/navigation.js",
      import: "./dist/css/groups/navigation.js",
    },
    "./css/metadata": {
      types: "./dist/css/metadata.d.ts",
      import: "./dist/css/metadata.js",
    },
    "./css/theme": {
      types: "./dist/css/theme/index.d.ts",
      import: "./dist/css/theme/index.js",
    },
    "./css/a11y": {
      types: "./dist/css/a11y/index.d.ts",
      import: "./dist/css/a11y/index.js",
    },
    "./theme": {
      types: "./dist/theme/index.d.ts",
      import: "./dist/theme/index.js",
    },
    "./theme/breakpoints": "./dist/theme/breakpoints.scss",
    "./theme/breakpoints.scss": "./dist/theme/breakpoints.scss",
    "./a11y": {
      types: "./dist/a11y/index.d.ts",
      import: "./dist/a11y/index.js",
    },
    "./theme.css": "./dist/theme.css",
    "./components.css": "./dist/components.css",
    "./metadata": {
      types: "./dist/metadata.d.ts",
      import: "./dist/metadata.js",
    },
    "./plugin": {
      types: "./dist/plugin.d.ts",
      import: "./dist/plugin.js",
    },
    "./layout": {
      types: "./dist/groups/layout.d.ts",
      browser: "./dist/browser/groups/layout.js",
      import: "./dist/groups/layout.js",
    },
    "./forms": {
      types: "./dist/groups/forms.d.ts",
      browser: "./dist/browser/groups/forms.js",
      import: "./dist/groups/forms.js",
    },
    "./data": {
      types: "./dist/groups/data.d.ts",
      browser: "./dist/browser/groups/data.js",
      import: "./dist/groups/data.js",
    },
    "./feedback": {
      types: "./dist/groups/feedback.d.ts",
      browser: "./dist/browser/groups/feedback.js",
      import: "./dist/groups/feedback.js",
    },
    "./navigation": {
      types: "./dist/groups/navigation.d.ts",
      browser: "./dist/browser/groups/navigation.js",
      import: "./dist/groups/navigation.js",
    },
  };

  for (const entry of componentEntries) {
    exportsMap[`./${entry.slug}`] = componentExport(entry);
    exportsMap[`./css/${entry.slug}`] = cssComponentExport(entry);
  }

  exportsMap["./schema.json"] = "./schema.json";
  return exportsMap;
}

function buildMetadataSource() {
  function mergeAgentFields(entry) {
    const defaults = categoryAgentDefaults[entry.category];
    const override = componentAgentOverrides[entry.name] ?? {};
    const docsSection = componentDocsSections[entry.name] ?? "";
    const docsWhenToUse = sentenceFromSection(docsSection);
    const docsProps = parseDocsProps(docsSection);
    const docsExample = parseDocsExample(entry, docsSection);
    const docsAccessibility = parseDocsAccessibility(docsSection);
    const pairings = canonicalizeComponentNames(
      commonPairingsByComponent[entry.name] ?? [],
      entry.name
    );
    const related = canonicalizeComponentNames(
      [...(entry.related ?? []), ...pairings],
      entry.name
    );
    const compoundMembers = compoundMembersByComponent[entry.name];
    const componentSpecificProps = docsProps.length
      ? docsProps
      : defaults.props.map((prop) => ({
          ...prop,
          description: `${prop.description} Applies to ${entry.name}.`,
        }));
    return {
      status: "stable",
      summary: entry.description,
      whenToUse:
        docsWhenToUse ??
        `Use ${entry.name} when you need ${entry.description.toLowerCase()}`,
      avoidWhen: `Avoid ${entry.name} when ${defaults.avoidWhen
        .replace(/^Avoid\s+/i, "")
        .replace(/\.$/, "")}.`,
      props: componentSpecificProps,
      examples: [docsExample],
      searchTerms: searchTermsByComponent[entry.name] ?? [
        entry.name,
        entry.slug,
        entry.description,
      ],
      composition: {
        related,
        ...(compoundMembers ? { compoundMembers } : {}),
        commonPairings: pairings.slice(0, 3),
      },
      accessibilityGuidance: defaults.accessibility,
      ...override,
      composition: {
        related,
        ...(compoundMembers ? { compoundMembers } : {}),
        commonPairings: pairings.slice(0, 3),
        ...(override.composition ?? {}),
      },
      accessibilityGuidance:
        override.accessibilityGuidance ??
        (entry.accessibility
          ? {
              summary: entry.accessibility,
              checklist: [entry.accessibility],
            }
          : docsAccessibility
          ? {
              summary: docsAccessibility,
              checklist: [docsAccessibility],
            }
          : defaults.accessibility),
    };
  }

  const entries = componentEntries.map((entry) => {
    const agentFields = mergeAgentFields(entry);
    const props = withClassNameProp(
      withPolymorphicProps(entry.name, agentFields.props)
    );
    const fields = [
      `name: ${JSON.stringify(entry.name)}`,
      `slug: ${JSON.stringify(entry.slug)}`,
      `category: ${JSON.stringify(entry.category)}`,
      `importPath: ${JSON.stringify(`@tavojs/ui/${entry.slug}`)}`,
      `cssImportPath: ${JSON.stringify(`@tavojs/ui/css/${entry.slug}`)}`,
      `description: ${JSON.stringify(entry.description)}`,
      `status: ${JSON.stringify(agentFields.status)}`,
      `summary: ${JSON.stringify(agentFields.summary)}`,
      `whenToUse: ${JSON.stringify(agentFields.whenToUse)}`,
      `avoidWhen: ${JSON.stringify(agentFields.avoidWhen)}`,
      `props: ${JSON.stringify(props)}`,
      `examples: ${JSON.stringify(agentFields.examples)}`,
      `composition: ${JSON.stringify(agentFields.composition)}`,
      `accessibilityGuidance: ${JSON.stringify(
        agentFields.accessibilityGuidance
      )}`,
      `searchTerms: ${JSON.stringify(agentFields.searchTerms)}`,
    ];

    if (entry.related?.length) {
      fields.push(`related: ${JSON.stringify(entry.related)}`);
    }

    if (entry.accessibility) {
      fields.push(`accessibility: ${JSON.stringify(entry.accessibility)}`);
    }

    return `  { ${fields.join(", ")} }`;
  });

  return `export type ComponentCategory = "layout" | "forms" | "data" | "feedback" | "content" | "recipes" | "navigation";
export type ComponentStatus = "stable" | "experimental";
export type ComponentPropMetadata = {
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string;
  description: string;
};
export type ComponentExample = {
  title: string;
  code: string;
};
export type ComponentCompositionMetadata = {
  related?: string[];
  compoundMembers?: string[];
  commonPairings?: string[];
};
export type ComponentAccessibilityGuidance = {
  summary: string;
  checklist: string[];
};
export type ComponentMetadata = {
  name: string;
  slug: string;
  category: ComponentCategory;
  importPath: string;
  cssImportPath: string;
  description: string;
  status: ComponentStatus;
  summary: string;
  whenToUse: string;
  avoidWhen: string;
  props: ComponentPropMetadata[];
  examples: ComponentExample[];
  composition: ComponentCompositionMetadata;
  related?: string[];
  accessibility?: string;
  accessibilityGuidance: ComponentAccessibilityGuidance;
  searchTerms: string[];
};
export type AgentComponentGuide = {
  component: string;
  importPath: string;
  cssImportPath: string;
  summary: string;
  whenToUse: string;
  avoidWhen: string;
  props: ComponentPropMetadata[];
  examples: ComponentExample[];
  accessibility: ComponentAccessibilityGuidance;
  related: string[];
};

export const componentMetadata: ComponentMetadata[] = [
${entries.join(",\n")}
];

type ComponentSearchDocument = {
  component: ComponentMetadata;
  haystack: string;
  name: string;
  slug: string;
  searchTerms: string;
};

const componentMetadataByName = new Map<string, ComponentMetadata>();
const componentMetadataByCategory = new Map<ComponentCategory, ComponentMetadata[]>();
const componentSearchIndex: ComponentSearchDocument[] = componentMetadata.map((component) => {
  const name = component.name.toLowerCase();
  const slug = component.slug.toLowerCase();
  const searchTerms = component.searchTerms.join(" ").toLowerCase();
  const haystack = [
    name,
    slug,
    component.category,
    component.description,
    component.whenToUse,
    component.avoidWhen,
    searchTerms,
    component.examples.map((example) => \`\${example.title} \${example.code}\`).join(" "),
    component.accessibilityGuidance.summary,
    component.accessibilityGuidance.checklist.join(" "),
    component.props.map((prop) => \`\${prop.name} \${prop.type} \${prop.description}\`).join(" "),
    component.composition.related?.join(" ") ?? "",
    component.composition.compoundMembers?.join(" ") ?? "",
    component.composition.commonPairings?.join(" ") ?? ""
  ].join(" ").toLowerCase();

  componentMetadataByName.set(name, component);
  componentMetadataByName.set(slug, component);
  const category = componentMetadataByCategory.get(component.category);
  if (category) {
    category.push(component);
  } else {
    componentMetadataByCategory.set(component.category, [component]);
  }

  return { component, haystack, name, slug, searchTerms };
});

export function getComponentMetadata(name: string): ComponentMetadata | undefined {
  return componentMetadataByName.get(name.toLowerCase());
}

export function getComponentsByCategory(category: ComponentCategory): ComponentMetadata[] {
  return [...(componentMetadataByCategory.get(category) ?? [])];
}

export function findComponentsForIntent(query: string): ComponentMetadata[] {
  const normalizedQuery = query.toLowerCase();
  const terms = normalizedQuery.split(/[^a-z0-9]+/).filter(Boolean);
  if (terms.length === 0) {
    return [];
  }

  const results: Array<{ component: ComponentMetadata; score: number }> = [];
  for (const document of componentSearchIndex) {
    let score = document.haystack.includes(normalizedQuery) ? 8 : 0;
    for (const term of terms) {
      if (document.name === term || document.slug === term) {
        score += 10;
        continue;
      }
      if (document.name.includes(term) || document.slug.includes(term)) {
        score += 6;
        continue;
      }
      if (document.searchTerms.includes(term)) {
        score += 4;
        continue;
      }
      if (document.component.category === term) {
        score += 2;
        continue;
      }
      if (document.haystack.includes(term)) {
        score += 1;
      }
    }
    if (score > 0) {
      results.push({ component: document.component, score });
    }
  }

  results.sort((left, right) => right.score - left.score || left.component.name.localeCompare(right.component.name));
  return results.map((result) => result.component);
}

export function getAgentComponentGuide(name: string): AgentComponentGuide | undefined {
  const component = getComponentMetadata(name);
  if (!component) {
    return undefined;
  }

  return {
    component: component.name,
    importPath: component.importPath,
    cssImportPath: component.cssImportPath,
    summary: component.summary,
    whenToUse: component.whenToUse,
    avoidWhen: component.avoidWhen,
    props: component.props,
    examples: component.examples,
    accessibility: component.accessibilityGuidance,
    related: component.composition.related ?? component.related ?? []
  };
}
`;
}

function buildGroupSource(groupName) {
  const names = groupEntries[groupName];
  return `${names
    .map((name) => `export * from "@/components/${name}";`)
    .join("\n")}\n`;
}

function buildComponentsIndexSource() {
  return `${componentEntries
    .map((entry) => `export * from "@/components/${entry.name}";`)
    .join("\n")}\n`;
}

function escapeMarkdownCell(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\n+/g, " ");
}

function buildGeneratedComponentDocs() {
  const byCategory = componentEntries.reduce((groups, entry) => {
    groups[entry.category] = groups[entry.category] ?? [];
    groups[entry.category].push(entry);
    return groups;
  }, {});
  const categories = Object.keys(categoryLabels).filter(
    (category) => byCategory[category]?.length
  );
  const lines = [
    generatedDocsStart,
    "## Generated Component Index",
    "",
    "This section is generated from `scripts/component-manifest.mjs`. Run `npm run generate:package` after adding, removing, or renaming components.",
    "",
  ];

  for (const category of categories) {
    lines.push(`### ${categoryLabels[category]}`, "");
    lines.push(
      "| Component | Recommended import | CSS alias import | Description |"
    );
    lines.push("| --- | --- | --- | --- |");

    for (const entry of byCategory[category]) {
      lines.push(
        `| \`${entry.name}\` | \`@tavojs/ui/${
          entry.slug
        }\` | \`@tavojs/ui/css/${entry.slug}\` | ${escapeMarkdownCell(
          entry.description
        )} |`
      );
    }

    lines.push("");
  }

  lines.push(generatedDocsEnd);
  return lines.join("\n");
}

function writeGeneratedComponentDocs() {
  if (!fs.existsSync(componentDocsPath)) {
    return;
  }

  const source = fs.readFileSync(componentDocsPath, "utf8");
  const generated = buildGeneratedComponentDocs();
  if (
    source.includes(generatedDocsStart) &&
    source.includes(generatedDocsEnd)
  ) {
    const start = source.indexOf(generatedDocsStart);
    const end = source.indexOf(generatedDocsEnd) + generatedDocsEnd.length;
    const updated = `${source.slice(0, start)}${generated}${source.slice(end)}`;
    writeFileIfChanged(componentDocsPath, `${updated.trimEnd()}\n`);
    return;
  }

  const insertionPoint = source.indexOf("\n## Alert");
  if (insertionPoint === -1) {
    writeFileIfChanged(
      componentDocsPath,
      `${source.trimEnd()}\n\n${generated}\n`
    );
    return;
  }

  writeFileIfChanged(
    componentDocsPath,
    `${source.slice(0, insertionPoint)}\n\n${generated}\n${source.slice(
      insertionPoint
    )}\n`
  );
}

function assertManifest() {
  const seenSlugs = new Set();
  const seenNames = new Set();
  for (const entry of componentEntries) {
    if (seenNames.has(entry.name) || seenSlugs.has(entry.slug)) {
      throw new Error(
        `Duplicate component manifest entry: ${entry.name} / ${entry.slug}`
      );
    }
    seenNames.add(entry.name);
    seenSlugs.add(entry.slug);

    const componentPath = path.join(
      root,
      "src",
      "components",
      entry.name,
      `${entry.name}.tsx`
    );
    if (!fs.existsSync(componentPath)) {
      throw new Error(
        `Component manifest points to missing file: ${componentPath}`
      );
    }
  }

  for (const [groupName, names] of Object.entries(groupEntries)) {
    for (const name of names) {
      if (!seenNames.has(name)) {
        throw new Error(
          `Group "${groupName}" references unknown component "${name}"`
        );
      }
    }
  }
}

assertManifest();

const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
packageJson.exports = buildExports();
writeFileIfChanged(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
writeFileIfChanged(metadataPath, buildMetadataSource());
writeFileIfChanged(componentsIndexPath, buildComponentsIndexSource());
for (const groupName of Object.keys(groupEntries)) {
  writeFileIfChanged(
    path.join(groupsDir, `${groupName}.ts`),
    buildGroupSource(groupName)
  );
}
writeGeneratedComponentDocs();

console.log(
  `Generated ${componentEntries.length} component exports, metadata entries, ${
    Object.keys(groupEntries).length
  } groups, and component docs index.`
);
