import { h } from "@tavojs/core";
import * as UI from "../../dist/css/index.js";

const sampleRows = [
  { account: "Acme", status: "Active", spend: "$12,400" },
  { account: "Northstar", status: "Trial", spend: "$3,200" },
  { account: "Orbit", status: "Paused", spend: "$980" },
];

const chartData = [
  { label: "Jan", value: 32 },
  { label: "Feb", value: 48, tone: "success" },
  { label: "Mar", value: 41, tone: "warning" },
  { label: "Apr", value: 56 },
];

function iconSvg(props = {}) {
  return h(
    "svg",
    { viewBox: "0 0 16 16", ...props },
    h("path", { d: "M8 1l6 14H2L8 1z" })
  );
}

export const componentFixtures = {
  Alert: () =>
    h(
      UI.Alert,
      { title: "Sync complete", tone: "success" },
      "All records are up to date."
    ),
  AppBar: () =>
    h(
      UI.AppBar,
      {
        justify: { base: "between", md: "center" },
        gap: { base: "sm", lg: 12 },
      },
      [
        h(UI.Text, { weight: "bold" }, "Tavo"),
        h(UI.ButtonGroup, null, [
          h(UI.Button, null, "Save"),
          h(UI.Button, { variant: "outline" }, "Share"),
        ]),
      ]
    ),
  AspectRatio: () =>
    h(
      UI.AspectRatio,
      { ratio: "4/3" },
      h("img", { src: "/preview.png", alt: "" })
    ),
  Avatar: () =>
    h(UI.Avatar, { alt: "Ada Lovelace", initials: "AL", size: "lg" }),
  Box: () =>
    h(
      UI.Box,
      {
        padding: { base: "sm", md: "lg" },
        radius: { base: "none", lg: "md" },
        sx: { md: { display: "grid" } },
      },
      "Box"
    ),
  Breadcrumbs: () =>
    h(UI.Breadcrumbs, {
      items: [
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
        { label: "Apollo", current: true },
      ],
    }),
  Button: () =>
    h(
      UI.Button,
      { variant: "solid", tone: "primary", loading: true },
      "Save changes"
    ),
  ButtonGroup: () =>
    h(UI.ButtonGroup, null, [
      h(UI.Button, null, "Day"),
      h(UI.Button, { variant: "outline" }, "Week"),
      h(UI.Button, { variant: "ghost" }, "Month"),
    ]),
  Calendar: () =>
    h(UI.Calendar, { year: 2026, month: 0, selected: "2026-01-16" }),
  Card: () =>
    h(UI.Card, { component: "article" }, [
      h(
        UI.Card.Header,
        { sx: { lg: { display: "block" } } },
        "Quarterly summary"
      ),
      h(UI.Card.Content, null, "Revenue increased across three segments."),
      h(UI.Card.Actions, null, h(UI.Button, { size: "sm" }, "Open")),
    ]),
  Chart: () => h(UI.Chart, { label: "Revenue", data: chartData }),
  Checkbox: () =>
    h(UI.Checkbox, { name: "terms", checked: true, value: "accepted" }),
  Chip: () =>
    h(UI.Chip, { selected: true, onRemove: () => undefined }, "Enterprise"),
  CodeBlock: () =>
    h(UI.CodeBlock, {
      code: "const value = true;",
      language: "tsx",
      editorTheme: "dark",
    }),
  Collapsible: () =>
    h(UI.Collapsible, { open: true }, [
      h(UI.Collapsible.Trigger, null, "Advanced filters"),
      h(UI.Collapsible.Content, null, "Region, status, owner"),
    ]),
  Combobox: () =>
    h(UI.Combobox, {
      name: "owner",
      options: [
        { label: "Ada", value: "ada" },
        { label: "Grace", value: "grace" },
      ],
    }),
  CommandMenu: () =>
    h(UI.CommandMenu, {
      items: [
        { label: "Open docs", href: "/docs", shortcut: "D" },
        { label: "Create project", shortcut: "N" },
      ],
    }),
  ConfirmDialog: () =>
    h(UI.ConfirmDialog, {
      open: true,
      title: "Archive workspace",
      description: "Archive this workspace for everyone.",
      confirmLabel: "Archive",
      cancelLabel: "Cancel",
    }),
  DatePicker: () =>
    h(UI.DatePicker, {
      name: "due",
      value: "2026-01-16",
      year: 2026,
      month: 0,
      renderCalendarWhenClosed: false,
    }),
  Dialog: () =>
    h(
      UI.Dialog,
      { open: true, title: "Edit account", labelledBy: "dialog-title" },
      [
        h(UI.Dialog.Body, null, "Dialog body"),
        h(UI.Dialog.Footer, null, h(UI.Button, null, "Save")),
      ]
    ),
  Divider: () => h(UI.Divider, { label: "Details" }),
  DropdownMenu: () =>
    h(UI.DropdownMenu, { open: true }, [
      h(UI.DropdownMenu.Trigger, null, "Actions"),
      h(UI.DropdownMenu.Content, null, [
        h(UI.DropdownMenu.Item, null, "Edit"),
        h(UI.DropdownMenu.Item, { href: "/settings" }, "Settings"),
      ]),
    ]),
  EmptyState: () =>
    h(UI.EmptyState, {
      title: "No projects",
      description: "Create a project to start tracking activity.",
      actions: h(UI.Button, null, "Create project"),
    }),
  Field: () =>
    h(
      UI.Field,
      {
        label: "Email",
        hint: "Use your work email",
        error: "Use a valid email",
        required: true,
      },
      h(UI.TextInput, { type: "email" })
    ),
  Flex: () =>
    h(
      UI.Flex,
      {
        direction: { base: "column", md: "row" },
        align: { base: "stretch", lg: "center" },
        gap: { base: "sm", lg: 12 },
      },
      [h(UI.Chip, { size: "sm" }, "Live"), h(UI.Text, null, "Flexible layout")]
    ),
  FocusTrap: () =>
    h(UI.FocusTrap, { active: true }, h(UI.Button, null, "Focusable")),
  FormControl: () =>
    h(
      UI.FormControl,
      { fullWidth: true },
      h(UI.TextInput, { name: "name", placeholder: "Name" })
    ),
  FormControlLabel: () =>
    h(UI.FormControlLabel, {
      label: "Enable alerts",
      control: h(UI.Switch, { checked: true }),
    }),
  FormLabel: () => h(UI.FormLabel, { htmlFor: "account" }, "Account"),
  Grid: () =>
    h(
      UI.Grid,
      { columns: { base: 1, md: 3 }, spacing: { base: "sm", lg: "lg" } },
      [
        h(UI.Card, null, "One"),
        h(UI.Card, null, "Two"),
        h(UI.Card, null, "Three"),
      ]
    ),
  GridRuler: () => h(UI.GridRuler, { spacing: "lg" }),
  HoverCard: () =>
    h(UI.HoverCard, null, [
      h(UI.HoverCard.Trigger, null, "Ada"),
      h(UI.HoverCard.Content, null, "Product lead"),
    ]),
  Icon: () =>
    h(UI.Icon, {
      component: iconSvg,
      "aria-hidden": "true",
      sx: { sm: { display: "block" } },
    }),
  Image: () =>
    h(UI.Image, {
      src: "/preview.png",
      alt: "Dashboard",
      width: 320,
      height: 180,
      quality: 80,
    }),
  Inline: () =>
    h(UI.Inline, { component: "nav", gap: { base: "none", sm: "md" } }, [
      h(UI.Link, { href: "/overview" }, "Overview"),
      h(UI.Link, { href: "/reports" }, "Reports"),
    ]),
  InputGroup: () =>
    h(UI.InputGroup, null, [
      h(UI.InputGroup.Addon, { sx: { md: { display: "inline-flex" } } }, "$"),
      h(UI.InputGroup.Input, { name: "amount", placeholder: "Amount" }),
      h(UI.InputGroup.Button, null, "Apply"),
    ]),
  Kbd: () => h(UI.Kbd, null, "⌘K"),
  Link: () => h(UI.Link, { href: "/docs" }, "Read docs"),
  List: () =>
    h(UI.List, null, [
      h(UI.List.Item, { title: "First", meta: "Open" }, "Review docs"),
      h(UI.List.Item, { title: "Second", meta: "Done" }, "Ship release"),
    ]),
  Menubar: () =>
    h(UI.Menubar, null, [
      h(UI.Menubar.Item, { href: "/docs", current: true }, "Docs"),
      h(UI.Menubar.Item, null, "Settings"),
    ]),
  NavigationMenu: () =>
    h(UI.NavigationMenu, {
      items: [
        { label: "Docs", href: "/docs", current: true, description: "Guides" },
        { label: "API", href: "/api", description: "Reference" },
      ],
    }),
  Overlay: () =>
    h(UI.Overlay, { open: true }, h(UI.Card, null, "Overlay content")),
  Page: () =>
    h(
      UI.Page,
      { size: "lg", padding: "md" },
      h(UI.Section, { title: "Page title" }, "Page content")
    ),
  Pagination: () =>
    h(UI.Pagination, {
      page: 2,
      pageCount: 5,
      getHref: (page) => `/items?page=${page}`,
    }),
  Portal: () =>
    h(UI.Portal, null, h(UI.Toast, { title: "Saved" }, "Changes saved")),
  Popover: () =>
    h(UI.Popover, { open: true }, [
      h(UI.Popover.Trigger, { label: "Open filters" }, "Filters"),
      h(UI.Popover.Content, null, "Popover body"),
    ]),
  Progress: () =>
    h(UI.Progress, { value: 64, label: "Import progress", tone: "primary" }),
  PropertyList: () =>
    h(UI.PropertyList, null, [
      h(UI.PropertyList.Item, { label: "Owner", value: "Ada" }),
      h(
        UI.PropertyList.Item,
        { label: "Status" },
        h(UI.Chip, { tone: "success", size: "sm" }, "Active")
      ),
    ]),
  Radio: () => h(UI.Radio, { name: "plan", value: "pro", checked: true }),
  RadioGroup: () =>
    h(UI.RadioGroup, { name: "plan", orientation: "horizontal" }, [
      h(UI.Radio, { value: "starter" }, "Starter"),
      h(UI.Radio, { value: "pro", checked: true }, "Pro"),
    ]),
  Resizable: () =>
    h(UI.Resizable, null, [
      h(UI.Resizable.Panel, { defaultSize: "40%" }, "Left"),
      h(UI.Resizable.Handle),
      h(UI.Resizable.Panel, null, "Right"),
    ]),
  SearchInput: () =>
    h(UI.SearchInput, {
      placeholder: "Search accounts",
      "aria-label": "Search accounts",
    }),
  ScrollArea: () =>
    h(
      UI.ScrollArea,
      { orientation: "both", maxHeight: "12rem" },
      h(UI.List, null, h(UI.List.Item, null, "Scrollable item"))
    ),
  Section: () =>
    h(
      UI.Section,
      {
        title: "Recent activity",
        titleSize: "h3",
        description: "Latest account changes",
      },
      h(UI.Timeline, null, h(UI.Timeline.Item, { title: "Saved" }))
    ),
  Select: () =>
    h(UI.Select, { name: "status" }, [
      h("option", { value: "active" }, "Active"),
      h("option", { value: "paused" }, "Paused"),
    ]),
  Sheet: () =>
    h(UI.Sheet, { open: true, side: "bottom" }, [
      h(UI.Sheet.Trigger, null, "Open sheet"),
      h(
        UI.Sheet.Content,
        { open: true, side: "bottom", labelledBy: "sheet-title" },
        [h("h2", { id: "sheet-title" }, "Sheet"), h(UI.Sheet.Close, null)]
      ),
    ]),
  Shell: () =>
    h(
      UI.Shell,
      {
        header: h(UI.AppBar, null, "Header"),
        sidebar: h(
          UI.Sidebar,
          null,
          h(UI.NavigationMenu, {
            items: [{ label: "Home", href: "/", current: true }],
          })
        ),
      },
      h(UI.Page, null, "Main content")
    ),
  Sidebar: () =>
    h(
      UI.Sidebar,
      { padding: "lg" },
      h(UI.NavigationMenu, {
        orientation: "vertical",
        items: [{ label: "Dashboard", href: "/" }],
      })
    ),
  Skeleton: () =>
    h(UI.Skeleton, { width: "12rem", height: "2rem", radius: "md" }),
  Slider: () =>
    h(UI.Slider, { name: "confidence", value: 72, min: 0, max: 100 }),
  Spacer: () => h(UI.Spacer, { size: "lg", axis: "block" }),
  Spinner: () => h(UI.Spinner, { label: "Loading reports", size: "lg" }),
  SplitPane: () =>
    h(
      UI.SplitPane,
      { aside: h(UI.Sidebar, null, "Filters"), ratio: "third", gap: "none" },
      h(
        UI.Table.Root,
        null,
        h(
          UI.Table.Body,
          null,
          h(UI.Table.Row, null, h(UI.Table.Cell, null, "Main"))
        )
      )
    ),
  Stack: () =>
    h(
      UI.Stack,
      {
        component: "section",
        gap: { base: "sm", md: "lg" },
        sx: { md: { display: "grid" } },
      },
      [h(UI.Text, null, "First"), h(UI.Text, null, "Second")]
    ),
  Stat: () =>
    h(UI.Stat, {
      label: "Revenue",
      value: "$48k",
      hint: "Last 30 days",
      trend: "+12%",
      tone: "success",
    }),
  StatusDot: () =>
    h(UI.StatusDot, { tone: "success", pulse: true, label: "Online" }),
  Stepper: () =>
    h(UI.Stepper, {
      steps: [
        { id: "profile", title: "Profile", status: "complete" },
        { id: "billing", title: "Billing", status: "current" },
        { id: "confirm", title: "Confirm" },
      ],
    }),
  Switch: () => h(UI.Switch, { name: "enabled", checked: true }),
  Table: () =>
    h(UI.Table.Data, {
      columns: [
        { id: "account", header: "Account" },
        { id: "status", header: "Status" },
        { id: "spend", header: "Spend", numeric: true },
      ],
      rows: sampleRows,
    }),
  Tabs: () =>
    h(UI.Tabs, {
      activeId: "billing",
      idPrefix: "settings",
      tabs: [
        { id: "profile", label: "Profile", content: "Profile panel" },
        { id: "billing", label: "Billing", content: "Billing panel" },
      ],
    }),
  Text: () =>
    h(
      UI.Text,
      { variant: "p", tone: "muted", sx: { sm: { display: "block" } } },
      "Paragraph copy"
    ),
  Textarea: () =>
    h(
      UI.Textarea,
      { name: "notes", rows: 5, resize: "vertical" },
      "Account notes"
    ),
  TextInput: () =>
    h(UI.TextInput, {
      name: "email",
      type: "email",
      placeholder: "name@example.com",
    }),
  Timeline: () =>
    h(UI.Timeline, null, [
      h(
        UI.Timeline.Item,
        { title: "Kickoff", meta: "Jan 4" },
        "Started discovery"
      ),
      h(
        UI.Timeline.Item,
        { title: "Launch", meta: "Feb 1", tone: "success" },
        "Published release"
      ),
    ]),
  Toast: () =>
    h(
      UI.Toast,
      {
        title: "Saved",
        tone: "success",
        action: h(UI.Button, { size: "sm" }, "Undo"),
        onClose: () => undefined,
      },
      "Changes saved"
    ),
  Toggle: () => h(UI.Toggle, { pressed: true, href: "/preview" }, "Preview"),
  ToggleGroup: () =>
    h(UI.ToggleGroup, {
      name: "density",
      value: "compact",
      items: [
        { label: "Comfortable", value: "comfortable" },
        { label: "Compact", value: "compact" },
      ],
    }),
  Toolbar: () =>
    h(UI.Toolbar, { gap: "none" }, [
      h(
        UI.Button,
        { label: "Refresh", iconOnly: true, variant: "ghost" },
        h(UI.Icon, { component: iconSvg })
      ),
      h(UI.Button, null, "Create"),
    ]),
  Tooltip: () =>
    h(
      UI.Tooltip,
      { content: "Refresh data", side: "bottom" },
      h(UI.Button, null, "Refresh")
    ),
  VisuallyHidden: () =>
    h(UI.VisuallyHidden, { focusable: true }, "Accessible label"),
};

export const scenarioFixtures = {
  "dashboard-page": () =>
    h(UI.Page, { size: "xl" }, [
      h(UI.Section, {
        eyebrow: "Analytics",
        title: "Product performance",
        description:
          "A dashboard page for metrics, trend summaries, and report tables.",
        actions: h(UI.ButtonGroup, null, [
          h(UI.Button, null, "Export"),
          h(UI.Button, { variant: "outline" }, "Share"),
        ]),
      }),
      h(UI.Grid, { minItemWidth: "12rem" }, [
        h(UI.Stat, {
          label: "Revenue",
          value: "$128k",
          trend: "+18%",
          tone: "success",
        }),
        h(UI.Stat, { label: "Activation", value: "64%", trend: "+4%" }),
        h(UI.Stat, {
          label: "Churn",
          value: "2.1%",
          trend: "-1%",
          tone: "success",
        }),
      ]),
      h(UI.Grid, { columns: { base: 1, lg: 2 }, spacing: "lg" }, [
        h(UI.Card, null, [
          h(UI.Card.Header, null, "Revenue"),
          h(
            UI.Card.Content,
            null,
            h(UI.Chart, { label: "Revenue", data: chartData })
          ),
        ]),
        h(UI.Card, null, [
          h(UI.Card.Header, null, "Activity"),
          h(UI.Card.Content, null, componentFixtures.Timeline()),
        ]),
      ]),
    ]),
  "form-workflow": () =>
    h(
      UI.Page,
      { size: "md" },
      h(
        UI.Card,
        {
          title: "Team settings",
          description: "Manage account profile and notification defaults.",
          actions: h(UI.Button, null, "Save"),
        },
        h(UI.Stack, null, [
          h(
            UI.Field,
            { label: "Workspace name", required: true },
            h(UI.TextInput, { value: "Acme" })
          ),
          h(
            UI.Fieldset,
            {
              legend: "Notifications",
              hint: "Choose what should be sent to the team.",
            },
            [
              h(UI.FormControlLabel, {
                label: "Product updates",
                control: h(UI.Checkbox, { checked: true }),
              }),
              h(UI.FormControlLabel, {
                label: "Weekly digest",
                control: h(UI.Switch, { checked: true }),
              }),
            ]
          ),
          h(UI.ToggleGroup, {
            name: "density",
            value: "compact",
            items: [
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ],
          }),
        ])
      )
    ),
  "navigation-shell": () =>
    h(
      UI.Shell,
      {
        header: h(UI.AppBar, { justify: "between" }, [
          h(UI.Text, { weight: "bold" }, "Tavo"),
          h(UI.CommandMenu, { items: [{ label: "Open docs", href: "/docs" }] }),
        ]),
        sidebar: h(
          UI.Sidebar,
          null,
          h(UI.NavigationMenu, {
            orientation: "vertical",
            items: [
              { label: "Dashboard", href: "/", current: true },
              { label: "Settings", href: "/settings" },
            ],
          })
        ),
      },
      h(
        UI.Page,
        null,
        h(
          UI.Section,
          { title: "Overview" },
          h(UI.Table.Data, {
            columns: [
              { id: "account", header: "Account" },
              { id: "status", header: "Status" },
              { id: "spend", header: "Spend", numeric: true },
            ],
            rows: sampleRows,
          })
        )
      )
    ),
  "data-table": () =>
    h(UI.Card, null, [
      h(
        UI.Card.Header,
        null,
        h(UI.Toolbar, {
          title: "Accounts",
          filters: h(UI.Toolbar, null, [
            h(UI.SearchInput, { placeholder: "Search" }),
            h(UI.Select, null, h("option", null, "Active")),
          ]),
          actions: h(UI.Button, null, "Export"),
        })
      ),
      h(
        UI.Card.Content,
        null,
        h(UI.Table.Data, {
          columns: [
            { id: "account", header: "Account" },
            { id: "status", header: "Status" },
            { id: "spend", header: "Spend", numeric: true },
          ],
          rows: [...sampleRows, ...sampleRows, ...sampleRows],
        })
      ),
      h(
        UI.Card.Actions,
        null,
        h(UI.Pagination, {
          page: 2,
          pageCount: 7,
          getHref: (page) => `/accounts?page=${page}`,
        })
      ),
    ]),
  "overlay-stack": () =>
    h(
      UI.Overlay,
      { open: true },
      h(UI.Stack, null, [
        h(
          UI.Dialog,
          { open: true, title: "Confirm changes", labelledBy: "confirm-title" },
          h(UI.Dialog.Body, null, "This action updates active accounts.")
        ),
        h(UI.Popover, { open: true }, [
          h(UI.Popover.Trigger, null, "More"),
          h(UI.Popover.Content, null, "Popover body"),
        ]),
        h(UI.ToastStack, null, [
          h(UI.Toast, { title: "Saved", tone: "success" }, "Changes saved"),
          h(UI.Toast, { title: "Queued" }, "Export is running"),
        ]),
      ])
    ),
};
