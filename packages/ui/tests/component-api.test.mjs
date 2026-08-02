import assert from "node:assert/strict";
import test from "node:test";
import {
  createStyleRegistry,
  h,
  renderToString,
  renderStyleTags,
  withStyleRegistry,
} from "@tavojs/core";
import {
  AppBar,
  Box,
  Button,
  Calendar,
  Card,
  Chart,
  Chip,
  CodeBlock,
  AspectRatio,
  Collapsible,
  CommandMenu,
  DatePicker,
  Dialog,
  Divider,
  DropdownMenu,
  Flex,
  Field,
  Grid,
  GridRuler,
  HoverCard,
  Icon,
  Image,
  Inline,
  InputGroup,
  List,
  Link,
  Menubar,
  NavigationMenu,
  Page,
  Pagination,
  Popover,
  Progress,
  Radio,
  RadioGroup,
  Resizable,
  ScrollArea,
  Section,
  Sidebar,
  SearchInput,
  Select,
  Sheet,
  Shell,
  SplitPane,
  Spacer,
  Stack,
  Stepper,
  Switch,
  Table,
  Tabs,
  Text,
  TextInput,
  Textarea,
  Toggle,
  ToggleGroup,
  Toolbar,
} from "../dist/css/index.js";

function html(vnode) {
  return renderToString(vnode);
}

function htmlWithStyles(vnode) {
  const registry = createStyleRegistry();
  const output = withStyleRegistry(registry, () => renderToString(vnode));
  return `${renderStyleTags(registry)}${output}`;
}

function resolveComponentVNode(vnode) {
  let resolved = vnode;
  while (typeof resolved.type === "function") {
    resolved = resolved.type(resolved.props ?? {});
  }
  return resolved;
}

function findVNodeByType(vnode, type) {
  if (!vnode || typeof vnode !== "object") return undefined;
  if (vnode.type === type) return vnode;

  const children = vnode.props?.children;
  for (const child of Array.isArray(children) ? children : [children]) {
    const match = findVNodeByType(child, type);
    if (match) return match;
  }

  return undefined;
}

test("Button exposes loading and disabled state through native attributes", () => {
  const output = html(
    h(Button, { loading: true, variant: "solid", tone: "primary" }, "Save")
  );

  assert.match(output, /<button/);
  assert.match(output, /disabled/);
  assert.match(output, /aria-busy="true"/);
  assert.match(output, /Save/);
});

test("Button omits default modifier classes", () => {
  const output = html(h(Button, null, "Save"));

  assert.match(output, /class="tb_button"/);
  assert.doesNotMatch(output, /variant-solid/);
  assert.doesNotMatch(output, /tone-primary/);
});

test("components omit default modifier classes", () => {
  const output = [
    html(h(Chip, null, "New")),
    html(h(CodeBlock, { code: "const value = true;" })),
    html(h(Divider, null)),
    html(h(InputGroup, null, h(InputGroup.Input, { name: "amount" }))),
    html(h(List, null, h(List.Item, null, "Item"))),
    html(
      h(Popover, { open: true }, [
        h(Popover.Trigger, null, "Open"),
        h(Popover.Content, null, "Body"),
      ])
    ),
    html(h(Progress, { value: 40 })),
    html(h(Sheet, { open: true }, h(Sheet.Content, { open: true }, "Body"))),
    html(h(Shell, { sidebar: "Navigation" }, "Content")),
    html(
      h(SplitPane, null, [
        h(SplitPane.Aside, null, "Aside"),
        h(SplitPane.Main, null, "Main"),
      ])
    ),
    html(h(Stack, null, "Stack")),
    html(h(Stepper, { steps: [{ id: "one", title: "One" }] })),
    html(h(Box, null, "Box")),
    html(h(Switch, { name: "enabled" })),
    html(h(Toolbar, null, "Tools")),
  ].join("");

  assert.doesNotMatch(output, /tone-neutral/);
  assert.doesNotMatch(output, /theme-auto/);
  assert.doesNotMatch(output, /orientation-horizontal/);
  assert.doesNotMatch(output, /size-md/);
  assert.doesNotMatch(output, /marker-primary/);
  assert.doesNotMatch(output, /spacing-md/);
  assert.doesNotMatch(output, /placement-bottom-start/);
  assert.doesNotMatch(output, /tone-primary/);
  assert.doesNotMatch(output, /side-right/);
  assert.doesNotMatch(output, /rail-left/);
  assert.doesNotMatch(output, /ratio-third/);
  assert.doesNotMatch(output, /gap-md/);
  assert.doesNotMatch(output, /tone-default/);
  assert.doesNotMatch(output, /padding-md/);
  assert.doesNotMatch(output, /radius-surface/);
});

test("Button does not infer anchor rendering from href", () => {
  const output = html(
    h(
      Button,
      { href: "/settings", variant: "soft", tone: "secondary" },
      "Settings"
    )
  );

  assert.match(output, /<button/);
  assert.match(output, /variant-soft/);
  assert.doesNotMatch(output, /<a/);
  assert.doesNotMatch(output, /href="\/settings"/);
});

test("Button renders an anchor when as is anchor", () => {
  const output = html(
    h(
      Button,
      { as: "a", href: "/settings", variant: "soft", tone: "secondary" },
      "Settings"
    )
  );

  assert.match(output, /<a/);
  assert.match(output, /href="\/settings"/);
  assert.match(output, /variant-soft/);
  assert.doesNotMatch(output, /<button/);
});

test("Button preserves explicit native button type", () => {
  const submit = html(h(Button, { type: "submit" }, "Save"));
  const implicit = html(h(Button, null, "Cancel"));

  assert.match(submit, /<button/);
  assert.match(submit, /type="submit"/);
  assert.match(implicit, /type="button"/);
});

test("Link renders core to prop as an anchor href", () => {
  const output = html(h(Link, { to: "/docs" }, "Read docs"));

  assert.match(output, /<a\b/);
  assert.match(output, /href="\/docs"/);
  assert.match(output, />Read docs<\/a>/);
});

test("Disabled Link with to removes href and exposes disabled state", () => {
  const output = html(h(Link, { to: "/docs", disabled: true }, "Read docs"));

  assert.match(output, /<a\b/);
  assert.match(output, /aria-disabled="true"/);
  assert.doesNotMatch(output, /href="\/docs"/);
});

test("Link accepts className in href and router modes", () => {
  const output = [
    html(h(Link, { href: "/docs", className: "custom-link" }, "Docs")),
    html(h(Link, { to: "/settings", className: "router-link" }, "Settings")),
  ].join("");

  assert.match(output, /class="[^"]*custom-link/);
  assert.match(output, /class="[^"]*router-link/);
  assert.match(output, /href="\/settings"/);
});

test("router Link forwards anchor props and blocks executable URL protocols", () => {
  const output = html(
    h(
      Link,
      {
        to: "/settings",
        target: "_blank",
        rel: "noreferrer",
        "aria-label": "Open settings",
        "data-track": "settings",
      },
      "Settings"
    )
  );
  const unsafe = html(h(Link, { to: "javascript:alert(1)" }, "Unsafe"));

  assert.match(output, /target="_blank"/);
  assert.match(output, /rel="noreferrer"/);
  assert.match(output, /aria-label="Open settings"/);
  assert.match(output, /data-track="settings"/);
  assert.doesNotMatch(unsafe, /href=/);
});

test("Button supports the text variant", () => {
  const output = html(h(Button, { variant: "text", tone: "danger" }, "Delete"));

  assert.match(output, /variant-text/);
  assert.match(output, /tone-danger/);
  assert.match(output, />Delete</);
});

test("Text supports paragraph variant alias", () => {
  const output = html(h(Text, { variant: "p" }, "Paragraph copy"));

  assert.match(output, /<p/);
  assert.match(output, /Paragraph copy/);
  assert.doesNotMatch(output, /variant-p/);
});

test("Text accepts className", () => {
  const output = html(h(Text, { className: "custom-copy" }, "Styled copy"));

  assert.match(output, /class="[^"]*custom-copy/);
  assert.match(output, />Styled copy</);
});

test("Text uses as for element selection and variant for typography", () => {
  const output = html(
    h(Text, { as: "label", variant: "h3", htmlFor: "email" }, "Email")
  );

  assert.match(output, /<label/);
  assert.match(output, /htmlFor="email"/);
  assert.match(output, /variant-h3/);
  assert.doesNotMatch(output, /\scomponent=/);
});

test("single-root primitives support polymorphic as", () => {
  const output = [
    html(
      h(
        Box,
        {
          as: "main",
          padding: "md",
          sx: { color: "red" },
        },
        "Main content"
      )
    ),
    html(h(Text, { as: "label", htmlFor: "email" }, "Email")),
    html(h(Card.Root, { as: "article", title: "Release notes" }, "Body")),
  ].join("");

  assert.match(output, /<main/);
  assert.match(output, /Main content/);
  assert.match(output, /<label/);
  assert.match(output, /htmlFor="email"/);
  assert.match(output, /<article/);
  assert.doesNotMatch(output, /\sas=/);
  assert.doesNotMatch(output, /\scomponent=/);
  assert.doesNotMatch(output, /\ssx=/);
  assert.doesNotMatch(output, /<section/);
});

test("custom as components receive class names, children, style, and public props", () => {
  function RouterLink({ to, children, ...props }) {
    return h("a", { ...props, href: to }, children);
  }

  const output = html(
    h(
      Button,
      {
        as: RouterLink,
        to: "/settings",
        style: { display: "inline-flex" },
        "data-track": "settings",
      },
      "Settings"
    )
  );

  assert.match(output, /<a/);
  assert.match(output, /href="\/settings"/);
  assert.match(output, /class="tb_button"/);
  assert.match(output, /style="display:inline-flex"/);
  assert.match(output, /data-track="settings"/);
  assert.match(output, />Settings</);
});

test("action primitives preserve disabled and loading behavior with as", () => {
  const button = html(
    h(Button, { as: "a", href: "/save", loading: true }, "Save")
  );
  const toggle = html(
    h(Toggle, { as: "span", pressed: true, disabled: true }, "Preview")
  );

  assert.match(button, /<a/);
  assert.doesNotMatch(button, /href="\/save"/);
  assert.match(button, /aria-disabled="true"/);
  assert.match(button, /aria-busy="true"/);
  assert.match(button, /tabIndex="-1"/);
  assert.match(toggle, /<span/);
  assert.match(toggle, /aria-pressed="true"/);
  assert.match(toggle, /aria-disabled="true"/);
});

test("Button supports accessible icon-only link mode", () => {
  const output = html(
    h(
      Button,
      {
        as: "a",
        href: "/settings",
        label: "Open settings",
        iconOnly: true,
        variant: "outline",
      },
      "⚙"
    )
  );

  assert.match(output, /<a/);
  assert.match(output, /href="\/settings"/);
  assert.match(output, /aria-label="Open settings"/);
  assert.match(output, /variant-outline/);
});

test("Icon supports imported svg components with sx", () => {
  function Logo(props = {}) {
    return h(
      "svg",
      { viewBox: "0 0 10 10", ...props },
      h("path", { d: "M0 0h10v10H0z" })
    );
  }

  const output = htmlWithStyles(
    h(Icon, {
      component: Logo,
      style: { display: "none" },
      sx: {
        sm: { display: "block" },
      },
      "aria-hidden": "true",
    })
  );

  assert.match(
    output,
    /<style data-tavo-style="tavo-ui\.sx\.[a-z0-9]+">@layer tavo-ui\.theme,tavo-ui\.components,tavo-ui\.overrides;@layer tavo-ui\.overrides\{@media \(min-width:480px\)\{\.tsx_[a-z0-9]+\{display:block\}\}\}<\/style>/
  );
  assert.doesNotMatch(output, /!important/);
  assert.match(output, /<svg/);
  assert.match(output, /viewBox="0 0 10 10"/);
  assert.match(output, /width="24"/);
  assert.match(output, /height="24"/);
  assert.match(output, /class="[^"]*tsx_[a-z0-9]+/);
  assert.match(output, /style="display:none"/);
  assert.match(output, /aria-hidden="true"/);
});

test("Icon preserves imported svg viewBox unless explicitly overridden", () => {
  function Logo(props = {}) {
    return h(
      "svg",
      { viewBox: "0 0 1024 1024", width: "1em", height: "1em", ...props },
      h("path", { d: "M0 0h10v10H0z" })
    );
  }

  const preserved = html(
    h(Icon, { component: Logo, width: "24px", height: "24px" })
  );
  const overridden = html(
    h(Icon, {
      component: Logo,
      width: "24px",
      height: "24px",
      viewBox: "0 0 24 24",
    })
  );

  assert.match(preserved, /viewBox="0 0 1024 1024"/);
  assert.match(preserved, /width="24px"/);
  assert.match(preserved, /height="24px"/);
  assert.match(overridden, /viewBox="0 0 24 24"/);
});

test("sx uses mobile-first sm media queries", () => {
  const output = htmlWithStyles(
    h(Flex, { sx: { sm: { display: "none" } } }, "Toolbar actions")
  );

  assert.match(
    output,
    /<style data-tavo-style="tavo-ui\.sx\.[a-z0-9]+">@layer tavo-ui\.theme,tavo-ui\.components,tavo-ui\.overrides;@layer tavo-ui\.overrides\{@media \(min-width:480px\)\{\.tsx_[a-z0-9]+\{display:none\}\}\}<\/style>/
  );
  assert.doesNotMatch(output, /@media \(max-width:479px\)/);
  assert.doesNotMatch(output, /@media \(max-width:480px\)/);
  assert.match(output, /class="[^"]*tsx_[a-z0-9]+/);
  assert.doesNotMatch(output, /\ssx=/);
});

test("sx base and lg produce hidden-until-desktop visibility rules", () => {
  const output = htmlWithStyles(
    h(
      Flex,
      { sx: { base: { display: "none" }, lg: { display: "flex" } } },
      "Desktop navigation"
    )
  );

  assert.match(
    output,
    /<style data-tavo-style="tavo-ui\.sx\.[a-z0-9]+">@layer tavo-ui\.theme,tavo-ui\.components,tavo-ui\.overrides;@layer tavo-ui\.overrides\{\.tsx_[a-z0-9]+\{display:none\}@media \(min-width:1024px\)\{\.tsx_[a-z0-9]+\{display:flex\}\}\}<\/style>/
  );
  assert.doesNotMatch(output, /!important/);
  assert.match(output, /class="[^"]*tsx_[a-z0-9]+/);
  assert.doesNotMatch(output, /\ssx=/);
});

test("sx supports nested pseudo and state selectors", () => {
  const output = htmlWithStyles(
    h(
      Button,
      {
        sx: {
          backgroundColor: "red",
          "&:hover": {
            backgroundColor: "blue",
          },
          "&:active, &:focus-visible": {
            outline: "2px solid currentColor",
            transform: "translateY(1px)",
          },
          "&[data-state='open']": {
            opacity: 1,
          },
          md: {
            "&:hover": {
              backgroundColor: "green",
            },
          },
        },
      },
      "Save"
    )
  );

  assert.match(output, /\.tsx_[a-z0-9]+\{background-color:red\}/);
  assert.match(output, /\.tsx_[a-z0-9]+:hover\{background-color:blue\}/);
  assert.match(
    output,
    /\.tsx_[a-z0-9]+:active,\.tsx_[a-z0-9]+:focus-visible\{outline:2px solid currentColor;transform:translateY\(1px\)\}/
  );
  assert.match(output, /\.tsx_[a-z0-9]+\[data-state='open'\]\{opacity:1\}/);
  assert.match(
    output,
    /@media \(min-width:768px\)\{\.tsx_[a-z0-9]+:hover\{background-color:green\}\}/
  );
  assert.doesNotMatch(output, /object Object/);
  assert.doesNotMatch(output, /\ssx=/);
});

test("Table cells support sx without forwarding it to DOM", () => {
  const output = htmlWithStyles(
    h(Table.Root, null, [
      h(
        Table.Head,
        null,
        h(Table.Row, null, [
          h(
            Table.HeaderCell,
            {
              sx: { base: { display: "none" }, md: { display: "table-cell" } },
            },
            "Graph"
          ),
        ])
      ),
      h(
        Table.Body,
        null,
        h(Table.Row, null, [
          h(
            Table.Cell,
            {
              sx: { base: { display: "none" }, md: { display: "table-cell" } },
            },
            "Sparkline"
          ),
        ])
      ),
    ])
  );

  assert.match(
    output,
    /<style data-tavo-style="tavo-ui\.sx\.[a-z0-9]+">@layer tavo-ui\.theme,tavo-ui\.components,tavo-ui\.overrides;@layer tavo-ui\.overrides\{\.tsx_[a-z0-9]+\{display:none\}@media \(min-width:768px\)\{\.tsx_[a-z0-9]+\{display:table-cell\}\}\}<\/style>/
  );
  assert.match(output, /<th class="[^"]*tsx_[a-z0-9]+/);
  assert.match(output, /<td class="[^"]*tsx_[a-z0-9]+/);
  assert.doesNotMatch(output, /\ssx=/);
});

test("common non-layout components consume sx without forwarding it to DOM", () => {
  const output = htmlWithStyles(
    h("div", null, [
      h(
        Button,
        { sx: { base: { display: "none" }, md: { display: "inline-flex" } } },
        "Save"
      ),
      h(Text, { sx: { sm: { display: "none" } } }, "Caption"),
      h(Image, {
        src: null,
        fallback: "Missing",
        sx: { base: { display: "none" }, md: { display: "block" } },
      }),
      h(
        Card.Header,
        { sx: { base: { display: "none" }, lg: { display: "block" } } },
        "Header"
      ),
      h(
        InputGroup.Addon,
        { sx: { base: { display: "none" }, md: { display: "inline-flex" } } },
        "$"
      ),
      h(
        Table.Root,
        { sx: { base: { display: "none" }, lg: { display: "table" } } },
        [
          h(
            Table.Body,
            null,
            h(
              Table.Row,
              {
                sx: { base: { display: "none" }, md: { display: "table-row" } },
              },
              [h(Table.Cell, null, "Cell")]
            )
          ),
        ]
      ),
    ])
  );

  assert.match(output, /@layer tavo-ui\.overrides/);
  assert.match(output, /<button[^>]+class="[^"]*tsx_[a-z0-9]+/);
  assert.match(output, /<p[^>]+class="[^"]*tsx_[a-z0-9]+/);
  assert.match(output, /<div[^>]+class="[^"]*tsx_[a-z0-9]+/);
  assert.match(output, /<span[^>]+class="[^"]*tsx_[a-z0-9]+/);
  assert.match(output, /<table[^>]+class="[^"]*tsx_[a-z0-9]+/);
  assert.match(output, /<tr[^>]+class="[^"]*tsx_[a-z0-9]+/);
  assert.doesNotMatch(output, /\ssx=/);
});

test("Disabled link Button removes href and exposes disabled state", () => {
  const output = html(
    h(Button, { as: "a", href: "/settings", disabled: true }, "Settings")
  );

  assert.match(output, /<a/);
  assert.match(output, /aria-disabled="true"/);
  assert.match(output, /tabIndex="-1"|tabindex="-1"/);
  assert.doesNotMatch(output, /href="\/settings"/);
});

test("Field wires generated ids, descriptions, and invalid state into its control", () => {
  const output = htmlWithStyles(
    h(
      Field,
      { label: "Email", error: "Use a valid email", required: true },
      h(TextInput, { type: "email" })
    )
  );

  assert.match(output, /for="tui-email"/);
  assert.match(output, /id="tui-email"/);
  assert.match(output, /aria-describedby="tui-email-message"/);
  assert.match(output, /aria-invalid="true"/);
  assert.match(output, /Use a valid email/);
});

test("Field does not reference a message that is not rendered", () => {
  const output = html(
    h(Field, { label: "Email" }, h(TextInput, { type: "email" }))
  );

  assert.match(output, /id="tui-email"/);
  assert.doesNotMatch(output, /aria-describedby/);
  assert.doesNotMatch(output, /tui-email-message/);
});

test("Field describes only the first control and respects its explicit id", () => {
  const output = html(
    h(Field, { label: "Account", hint: "Primary account" }, [
      h(TextInput, { id: "account-email" }),
      h(TextInput, { id: "account-backup" }),
    ])
  );

  assert.match(output, /for="account-email"/);
  assert.equal(
    (output.match(/aria-describedby="account-email-message"/g) ?? []).length,
    1
  );
  assert.equal((output.match(/id="account-email"/g) ?? []).length, 1);
  assert.equal((output.match(/id="account-backup"/g) ?? []).length, 1);
});

test("Field does not target a later control id when the first control has none", () => {
  const output = html(
    h(Field, { label: "Account" }, [
      h(TextInput, {}),
      h(TextInput, { id: "account-backup" }),
    ])
  );

  assert.match(output, /for="tui-account"/);
  assert.equal((output.match(/id="tui-account"/g) ?? []).length, 1);
  assert.equal((output.match(/id="account-backup"/g) ?? []).length, 1);
});

test("text-like inputs forward onChange to the core event runtime", () => {
  for (const Component of [TextInput, SearchInput]) {
    const onInput = () => {};
    const onChange = () => {};
    const root = resolveComponentVNode(
      Component({
        onInput,
        onChange,
      })
    );
    const vnode = Component === SearchInput ? findVNodeByType(root, "input") : root;

    assert.equal(vnode.props.onChange, onChange);
    assert.equal(vnode.props.onInput, onInput);
  }

  const onChange = () => {};
  const textarea = Textarea({
    onChange,
  });

  assert.equal(textarea.props.onChange, onChange);
  assert.equal(textarea.props.onInput, undefined);
});

test("SearchInput enforces native search semantics and preserves Field wiring", () => {
  const output = html(
    h(
      Field,
      { label: "Resources", hint: "Filter by name" },
      h(SearchInput, {
        type: "email",
        name: "resource-query",
        placeholder: "Search resources",
      })
    )
  );

  assert.match(output, /<input[^>]*type="search"/);
  assert.doesNotMatch(output, /type="email"/);
  assert.match(output, /<input[^>]*id="tui-resources"/);
  assert.match(output, /<input[^>]*aria-describedby="tui-resources-message"/);
  assert.match(output, /for="tui-resources"/);
  assert.doesNotMatch(output, /<label[^>]*>.*<button/s);
});

test("SearchInput renders controlled clear, loading, and adornment states", () => {
  const output = html(
    h(SearchInput, {
      value: "tokens",
      clearable: true,
      onClear: () => {},
      clearLabel: "Reset component search",
      loading: true,
      leading: "Find",
      trailing: "⌘K",
      className: "search-root",
      inputClassName: "search-control",
      size: "sm",
    })
  );

  assert.match(output, /class="[^"]*search-root[^"]*"/);
  assert.match(output, /<input[^>]*class="[^"]*search-control[^"]*"/);
  assert.match(output, /<input[^>]*aria-busy="true"/);
  assert.match(output, />Find</);
  assert.match(output, />⌘K</);
  assert.match(output, /<button[^>]*type="button"[^>]*aria-label="Reset component search"/);
});

test("SearchInput only exposes clear for a non-empty controlled value", () => {
  const empty = html(
    h(SearchInput, { value: "", clearable: true, onClear: () => {} })
  );
  const uncontrolled = html(
    h(SearchInput, {
      defaultValue: "initial",
      clearable: true,
      onClear: () => {},
    })
  );

  assert.doesNotMatch(empty, /aria-label="Clear search"/);
  assert.doesNotMatch(uncontrolled, /aria-label="Clear search"/);
});

test("SearchInput clear action invokes onClear", () => {
  let cleared = false;
  const vnode = SearchInput({
    value: "query",
    clearable: true,
    onClear: () => {
      cleared = true;
    },
  });
  const clearButton = findVNodeByType(vnode, "button");

  assert.ok(clearButton);
  clearButton.props.onClick();
  assert.equal(cleared, true);
});

test("Select keeps native onChange semantics", () => {
  const onChange = () => {};
  const vnode = Select({ onChange });

  assert.equal(vnode.props.onChange, onChange);
  assert.equal(vnode.props.onInput, undefined);
});

test("Tabs renders no markup for an empty item array", () => {
  const output = html(h(Tabs, { tabs: [], activeId: "missing" }));

  assert.equal(output, "");
});

test("Tabs renders the active tab and panel relationships", () => {
  const output = htmlWithStyles(
    h(Tabs, {
      activeId: "billing",
      idPrefix: "settings",
      tabs: [
        { id: "profile", label: "Profile", content: "Profile panel" },
        { id: "billing", label: "Billing", content: "Billing panel" },
      ],
    })
  );

  assert.match(output, /role="tablist"/);
  assert.match(output, /id="settings-tab-billing"/);
  assert.match(output, /aria-selected="true"/);
  assert.match(output, /aria-labelledby="settings-tab-billing"/);
  assert.match(output, /Billing panel/);
});

test("Tabs renders matching compound content children", () => {
  const output = htmlWithStyles(
    h(
      Tabs,
      {
        activeId: "coins",
        idPrefix: "markets",
        tabs: [
          { id: "coins", label: "Coins" },
          { id: "watchlist", label: "Watchlist" },
        ],
      },
      [
        h(Tabs.Content, { id: "coins" }, "Coins table"),
        h(Tabs.Content, { id: "watchlist" }, "Watchlist table"),
      ]
    )
  );

  assert.match(output, /id="markets-tabpanel-coins"/);
  assert.match(output, /aria-labelledby="markets-tab-coins"/);
  assert.match(output, /Coins table/);
  assert.doesNotMatch(output, /Watchlist table/);
});

test("RadioGroup propagates its name to descendant Radio controls", () => {
  const output = html(
    h(RadioGroup, { name: "plan" }, [
      h(Radio, { value: "starter" }, "Starter"),
      h(Radio, { value: "pro", name: "custom" }, "Pro"),
    ])
  );

  assert.match(output, /name="plan"/);
  assert.match(output, /name="custom"/);
});

test("Dialog renders nothing when closed and a modal dialog when open", () => {
  assert.equal(html(h(Dialog, { open: false, title: "Closed" }, "Body")), "");

  const output = html(
    h(
      Dialog,
      { open: true, title: "Confirm", labelledBy: "dialog-title" },
      "Body"
    )
  );

  assert.match(output, /role="dialog"/);
  assert.match(output, /aria-modal="true"/);
  assert.match(output, /id="dialog-title"/);
  assert.match(output, /Confirm/);
  assert.match(output, /Body/);
});

test("Dialog handles Escape once on the dialog node", () => {
  let closes = 0;
  const root = Dialog({
    open: true,
    title: "Confirm",
    onClose: () => {
      closes += 1;
    },
  });
  const dialog = root.props.children.find(
    (child) => child?.props?.role === "dialog"
  );
  assert.equal(root.props.onKeyDown, undefined);

  dialog.props.onKeyDown({
    key: "Escape",
    defaultPrevented: false,
    currentTarget: {},
    preventDefault() {},
  });
  assert.equal(closes, 1);
});

test("DropdownMenu exposes menu and menuitem roles", () => {
  const output = html(
    h(DropdownMenu, { open: true }, [
      h(DropdownMenu.Trigger, null, "Actions"),
      h(DropdownMenu.Content, null, [
        h(DropdownMenu.Item, null, "Edit"),
        h(DropdownMenu.Item, { href: "/settings" }, "Settings"),
      ]),
    ])
  );

  assert.match(output, /aria-haspopup="menu"/);
  assert.match(output, /role="menu"/);
  assert.match(output, /role="menuitem"/);
});

test("DropdownMenuItem renders links when href is provided", () => {
  const output = html(h(DropdownMenu.Item, { href: "/settings" }, "Settings"));

  assert.match(output, /<a/);
  assert.match(output, /href="\/settings"/);
  assert.match(output, /role="menuitem"/);
});

test("CodeBlock highlights code strings with editor theme tokens", () => {
  const output = html(
    h(CodeBlock, {
      code: "const value = true;",
      language: "tsx",
      editorTheme: "dark",
    })
  );

  assert.match(output, /data-language="tsx"/);
  assert.match(output, /theme-dark/);
  assert.match(output, /data-token="tokenKeyword"/);
  assert.match(output, /data-token="tokenLiteral"/);
  assert.match(output, /const/);
});

test("CodeBlock can render plain code without syntax token spans", () => {
  const output = html(
    h(CodeBlock, { code: "const value = true;", highlighted: false })
  );

  assert.doesNotMatch(output, /data-token=/);
  assert.match(output, /const value = true;/);
});

test("CodeBlock renders escaped newline sequences as visual line breaks", () => {
  const output = html(
    h(CodeBlock, {
      code: "npm run typecheck\\nnpm run build\\nnpm run preview:ssr",
      language: "bash",
    })
  );

  assert.match(
    output,
    /npm run typecheck\nnpm run build\nnpm run preview/
  );
  assert.doesNotMatch(output, /typecheck\\\\n/);
});

test("CommandMenu renders link items when href is provided", () => {
  const output = html(
    h(CommandMenu, {
      items: [
        { label: "Open docs", href: "/docs", shortcut: "D" },
        { label: "Disabled", href: "/disabled", disabled: true },
      ],
    })
  );

  assert.match(output, /href="\/docs"/);
  assert.match(output, /role="menuitem"/);
  assert.match(output, /aria-disabled="true"/);
  assert.doesNotMatch(output, /href="\/disabled"/);
});

test("new disclosure primitives expose native and ARIA semantics", () => {
  const output = [
    html(
      h(Collapsible, { open: true }, [
        h(Collapsible.Trigger, null, "More"),
        h(Collapsible.Content, null, "Details"),
      ])
    ),
    html(
      h(Popover, { open: true }, [
        h(Popover.Trigger, { label: "Open filters" }, "Filters"),
        h(Popover.Content, null, "Popover body"),
      ])
    ),
    html(
      h(DropdownMenu, { open: true }, [
        h(DropdownMenu.Trigger, null, "Actions"),
        h(
          DropdownMenu.Content,
          null,
          h(DropdownMenu.Item, { href: "/settings" }, "Settings")
        ),
      ])
    ),
  ].join("");

  assert.match(output, /<details/);
  assert.match(output, /<summary/);
  assert.match(output, /aria-haspopup="dialog"/);
  assert.match(output, /role="dialog"/);
  assert.match(output, /aria-haspopup="menu"/);
  assert.match(output, /role="menu"/);
  assert.match(output, /href="\/settings"/);
});

test("AspectRatio applies an aspect-ratio style", () => {
  const output = html(
    h(AspectRatio, { ratio: "4/3" }, h("img", { src: "/image.png", alt: "" }))
  );

  assert.match(output, /aspect-ratio:\s*4\/3|aspectRatio/);
  assert.match(output, /<img/);
});

test("InputGroup renders addons, input, and button slots", () => {
  const output = html(
    h(InputGroup, null, [
      h(InputGroup.Addon, null, "$"),
      h(InputGroup.Input, { name: "amount", placeholder: "Amount" }),
      h(InputGroup.Button, null, "Apply"),
    ])
  );

  assert.match(output, /\$/);
  assert.match(output, /name="amount"/);
  assert.match(output, /placeholder="Amount"/);
  assert.match(output, /Apply/);
});

test("Image uses the Tavo core optimizer while keeping UI classes", () => {
  const output = html(
    h(Image, {
      src: "/preview.png",
      alt: "Dashboard",
      width: 320,
      height: 180,
      quality: 80,
    })
  );

  assert.match(output, /<span class="[^"]*_frame/);
  assert.match(
    output,
    /style="[^"]*width:\s*320px;[^"]*height:\s*180px;[^"]*aspect-ratio:\s*320\/180/
  );
  assert.doesNotMatch(output, /_skeleton/);
  assert.match(output, /class="[^"]*_image/);
  assert.match(
    output,
    /src="\/_tavo\/image\?src=%2Fpreview\.png&amp;w=1600&amp;q=80&amp;f=webp"/
  );
  assert.match(
    output,
    /srcset="[^"]*\/_tavo\/image\?src=%2Fpreview\.png&amp;w=320&amp;q=80&amp;f=webp 320w/
  );
  assert.match(output, /loading="lazy"/);
});

test("Image renders a skeleton only when src is missing", () => {
  const output = html(
    h(Image, { skeleton: "rounded", width: 320, height: 180 })
  );

  assert.match(output, /class="[^"]*_skeleton/);
  assert.match(output, /style="[^"]*width:\s*320/);
  assert.doesNotMatch(output, /<img/);
});

test("Image keeps SVG sources unoptimized by default", () => {
  const output = html(
    h(Image, {
      src: "/logo.svg?version=1",
      alt: "Logo",
      width: 128,
      height: 64,
    })
  );

  assert.match(output, /src="\/logo\.svg\?version=1"/);
  assert.doesNotMatch(output, /_tavo\/image/);
  assert.doesNotMatch(output, /srcset=/);
});

test("DatePicker can skip closed calendar markup", () => {
  const output = html(
    h(DatePicker, {
      name: "due",
      value: "2026-01-16",
      renderCalendarWhenClosed: false,
    })
  );

  assert.match(output, /name="due"/);
  assert.doesNotMatch(output, /data-value="2026-01-16"/);
  assert.doesNotMatch(output, /role="grid"/);
});

test("Calendar selection is wired through DatePicker", () => {
  function findVNode(value, predicate) {
    if (Array.isArray(value)) {
      for (const item of value) {
        const match = findVNode(item, predicate);
        if (match) return match;
      }
      return undefined;
    }
    if (!value || typeof value !== "object" || !("type" in value)) {
      return undefined;
    }
    if (predicate(value)) {
      return value;
    }
    return findVNode(value.props?.children, predicate);
  }

  let selected;
  const onValueChange = (value) => {
    selected = value;
  };
  const calendar = Calendar({ year: 2026, month: 0, onSelect: onValueChange });
  const day = findVNode(
    calendar,
    (node) =>
      node.type === "button" && node.props?.["data-value"] === "2026-01-16"
  );
  day.props.onClick();
  assert.equal(selected, "2026-01-16");

  const picker = DatePicker({ year: 2026, month: 0, onValueChange });
  const nestedCalendar = findVNode(picker, (node) => node.type === Calendar);
  assert.equal(nestedCalendar.props.onSelect, onValueChange);
  const input = findVNode(
    picker,
    (node) => node.type === TextInput && node.props?.type === "date"
  );
  input.props.onChange({ currentTarget: { value: "2026-01-17" } });
  assert.equal(selected, "2026-01-17");
});

test("numeric components normalize non-finite and out-of-range inputs", () => {
  const progress = html(
    h(Progress, {
      value: Number.NaN,
      max: Number.POSITIVE_INFINITY,
      showValue: true,
    })
  );
  assert.match(progress, /aria-valuemax="100"/);
  assert.match(progress, /aria-valuenow="0"/);
  assert.doesNotMatch(progress, /NaN|Infinity/);

  const chart = html(
    h(Chart, {
      max: 0,
      data: [
        { label: "Invalid", value: Number.NaN },
        { label: "Negative", value: -5 },
        { label: "Valid", value: 10 },
      ],
    })
  );
  assert.match(chart, /role="figure"/);
  assert.match(chart, />-5<\/span>/);
  assert.doesNotMatch(chart, /NaN|Infinity/);

  const pagination = html(
    h(Pagination, {
      page: Number.POSITIVE_INFINITY,
      pageCount: Number.POSITIVE_INFINITY,
      siblingCount: Number.POSITIVE_INFINITY,
    })
  );
  assert.match(pagination, /aria-current="page"/);
  assert.doesNotThrow(() =>
    html(
      h(Pagination, {
        page: 1e308,
        pageCount: 1e308,
        siblingCount: 1e308,
      })
    )
  );

  const normalizedCalendar = html(h(Calendar, { year: 2026, month: 12 }));
  assert.match(normalizedCalendar, /data-value="2027-01-01"/);
  assert.doesNotMatch(normalizedCalendar, /2026-13/);
  assert.doesNotThrow(() =>
    html(h(Calendar, { year: Number.POSITIVE_INFINITY, month: Number.NaN }))
  );
});

test("remaining parity components render their core structures", () => {
  const output = [
    html(h(Calendar, { year: 2026, month: 0, selected: "2026-01-16" })),
    html(
      h(DatePicker, { name: "due", value: "2026-01-16", year: 2026, month: 0 })
    ),
    html(
      h(Chart, {
        label: "Revenue",
        data: [
          { label: "Jan", value: 10 },
          { label: "Feb", value: 20, tone: "success" },
        ],
      })
    ),
    html(
      h(Table.Data, {
        columns: [
          { id: "name", header: "Name" },
          { id: "score", header: "Score", numeric: true },
        ],
        rows: [{ name: "Ada", score: 42 }],
      })
    ),
    html(
      h(ScrollArea, { orientation: "both", maxHeight: "12rem" }, "Scrollable")
    ),
    html(
      h(Resizable, null, [
        h(Resizable.Panel, { defaultSize: "40%" }, "Left"),
        h(Resizable.Handle),
        h(Resizable.Panel, null, "Right"),
      ])
    ),
  ].join("");

  assert.match(output, /January 2026/);
  assert.match(output, /data-value="2026-01-16"/);
  assert.match(output, /name="due"/);
  assert.match(output, /aria-label="Revenue"/);
  assert.match(output, /Ada/);
  assert.match(output, /role="separator"/);
  assert.match(output, /Scrollable/);
});

test("remaining menu and navigation parity components expose semantics", () => {
  const output = [
    html(
      h(DropdownMenu, { open: true }, [
        h(DropdownMenu.Trigger, null, "Context"),
        h(
          DropdownMenu.Content,
          null,
          h(DropdownMenu.Item, { href: "/copy" }, "Copy")
        ),
      ])
    ),
    html(
      h(HoverCard, null, [
        h(HoverCard.Trigger, null, "User"),
        h(HoverCard.Content, null, "Profile"),
      ])
    ),
    html(
      h(
        Menubar,
        null,
        h(Menubar.Item, { href: "/docs", current: true }, "Docs")
      )
    ),
    html(
      h(NavigationMenu, {
        items: [
          {
            label: "Docs",
            href: "/docs",
            current: true,
            description: "Guides",
          },
        ],
      })
    ),
    html(
      h(
        Sheet,
        { open: true, side: "bottom" },
        h(Sheet.Content, { open: true, side: "bottom" }, "Sheet body")
      )
    ),
    html(h(Select, null, h("option", { value: "one" }, "One"))),
  ].join("");

  assert.match(output, /role="menu"/);
  assert.match(output, /href="\/copy"/);
  assert.match(output, /role="tooltip"/);
  assert.match(output, /role="menubar"/);
  assert.match(output, /aria-current="page"/);
  assert.match(output, /Sheet body/);
  assert.match(output, /<select/);
});

test("Pagination renders links when getHref is provided", () => {
  const output = html(
    h(Pagination, {
      page: 2,
      pageCount: 3,
      getHref: (page) => `/items?page=${page}`,
    })
  );

  assert.match(output, /<a/);
  assert.match(output, /href="\/items\?page=1"/);
  assert.match(output, /href="\/items\?page=3"/);
  assert.match(output, /aria-current="page"/);
});

test("Toggle and ToggleGroup expose pressed state", () => {
  const output = [
    html(h(Toggle, { pressed: true, href: "/preview" }, "Preview")),
    html(
      h(ToggleGroup, {
        name: "view",
        value: "grid",
        items: [
          { label: "List", value: "list" },
          { label: "Grid", value: "grid" },
        ],
      })
    ),
  ].join("");

  assert.match(output, /<a/);
  assert.match(output, /href="\/preview"/);
  assert.match(output, /aria-pressed="true"/);
  assert.match(output, /role="radiogroup"/);
  assert.match(output, /type="radio"/);
  assert.match(output, /checked/);
});

test("gap primitives support gap none", () => {
  const output = [
    html(h(Stack, { gap: "none" }, "Stack")),
    html(h(Inline, { gap: "none" }, "Inline")),
    html(h(Flex, { gap: "none" }, "Flex")),
    html(h(Toolbar, { gap: "none" }, "Toolbar")),
    html(h(SplitPane, { gap: "none", aside: "Aside" }, "Main")),
  ].join("");

  assert.match(output, /gap-none/);
  assert.doesNotMatch(output, /style="[^"]*gap: none/);
});

test("layout primitives support responsive props with static style preserved", () => {
  const output = [
    html(
      h(
        Stack,
        { gap: { base: "sm", md: "lg" }, style: { color: "red" } },
        "Stack"
      )
    ),
    html(h(Inline, { gap: { base: "none", sm: "md" } }, "Inline")),
    html(
      h(
        Flex,
        {
          direction: { base: "column", md: "row" },
          align: { base: "stretch", lg: "center" },
          gap: { base: "sm", lg: 12 },
        },
        "Flex"
      )
    ),
    html(
      h(
        AppBar,
        {
          align: "end",
          justify: { base: "between", md: "center" },
          gap: { base: "sm", lg: 12 },
        },
        "AppBar"
      )
    ),
    html(
      h(
        Grid,
        { columns: { base: 1, md: 3 }, spacing: { base: "sm", lg: "lg" } },
        "Grid"
      )
    ),
    html(
      h(
        Box,
        {
          padding: { base: "sm", md: "lg" },
          radius: { base: "none", lg: "md" },
        },
        "Box"
      )
    ),
    html(
      h(
        Page,
        {
          size: { base: "full", md: "lg" },
          padding: { base: "sm", lg: "lg" },
        },
        "Page"
      )
    ),
    html(h(Sidebar, { padding: { base: "none", sm: "md" } }, "Sidebar")),
    html(h(Section, { spacing: { base: "sm", md: "lg" } }, "Section")),
    html(h(Spacer, { size: { base: "xs", lg: "xl" } })),
    html(
      h(
        Toolbar,
        {
          align: { base: "stretch", md: "center" },
          justify: { base: "start", lg: "between" },
          gap: { base: "none", sm: "lg" },
        },
        "Toolbar"
      )
    ),
    html(
      h(
        SplitPane,
        {
          aside: "Aside",
          ratio: { base: "half", lg: "golden" },
          gap: { base: "sm", md: "lg" },
        },
        "Main"
      )
    ),
    html(h(AspectRatio, { ratio: { base: "1/1", md: "16/9" } }, "Media")),
    html(h(Resizable.Panel, { defaultSize: { base: "100%", lg: "40%" } }, "Panel")),
    html(h(ScrollArea, { maxHeight: { base: "12rem", md: "24rem" } }, "Scroll")),
    html(h(GridRuler, { spacing: { base: "sm", lg: "lg" } })),
  ].join("");

  assert.match(output, /--tui-stack-gap:var\(--tui-space-2\)/);
  assert.match(output, /--tui-stack-gap-md:var\(--tui-space-6\)/);
  assert.match(output, /color:red/);
  assert.match(output, /--tui-inline-gap:0/);
  assert.match(output, /--tui-inline-gap-sm:var\(--tui-space-4\)/);
  assert.match(output, /--tui-flex-direction:column/);
  assert.match(output, /--tui-flex-direction-md:row/);
  assert.match(output, /--tui-flex-align-lg:center/);
  assert.match(output, /--tui-flex-gap-lg:12px/);
  assert.match(output, /--tui-flex-align:flex-end/);
  assert.match(output, /--tui-flex-justify:space-between/);
  assert.match(output, /--tui-flex-justify-md:center/);
  assert.match(output, /--tui-grid-columns:repeat\(1, minmax\(0, 1fr\)\)/);
  assert.match(output, /--tui-grid-columns-md:repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(output, /--tui-box-padding-md:var\(--tui-space-6\)/);
  assert.match(output, /--tui-box-radius-lg:var\(--tui-radius-md\)/);
  assert.match(output, /--tui-page-max-width:none/);
  assert.match(output, /--tui-page-max-width-md:78rem/);
  assert.match(output, /--tui-page-padding-lg:var\(--tui-space-6\)/);
  assert.match(output, /--tui-sidebar-padding:0/);
  assert.match(output, /--tui-sidebar-padding-sm:var\(--tui-space-5\)/);
  assert.match(output, /--tui-section-gap-md:var\(--tui-space-6\)/);
  assert.match(output, /--tui-spacer-size-lg:calc\(var\(--tui-space-6\) \* 1.5\)/);
  assert.match(output, /--tui-toolbar-align:stretch/);
  assert.match(output, /--tui-toolbar-justify-lg:space-between/);
  assert.match(output, /--tui-toolbar-gap-sm:var\(--tui-space-6\)/);
  assert.match(output, /--tui-split-columns-lg:minmax\(14rem, 0.62fr\) minmax\(0, 1fr\)/);
  assert.match(output, /--tui-split-gap-md:var\(--tui-space-6\)/);
  assert.match(output, /--tui-aspect-ratio-md:16\/9/);
  assert.match(output, /--tui-resizable-panel-basis-lg:40%/);
  assert.match(output, /--tui-scroll-area-max-height-md:24rem/);
  assert.match(output, /--tui-grid-ruler-gap-lg:var\(--tui-space-6\)/);
});

test("sx emits scoped media CSS without replacing style", () => {
  const output = htmlWithStyles(
    h(
      Box,
      {
        style: { color: "red" },
        sx: {
          base: { display: "block" },
          md: { display: "grid", gridTemplateColumns: "1fr 1fr" },
        },
      },
      "Box"
    )
  );

  assert.match(
    output,
    /<style data-tavo-style="tavo-ui\.sx\.[a-z0-9]+">@layer tavo-ui\.theme,tavo-ui\.components,tavo-ui\.overrides;@layer tavo-ui\.overrides\{\.tsx_[a-z0-9]+\{display:block\}@media \(min-width:768px\)/
  );
  assert.match(output, /grid-template-columns:1fr 1fr/);
  assert.doesNotMatch(output, /!important/);
  assert.match(output, /class="[^"]*tsx_[a-z0-9]+/);
  assert.match(output, /style="color:red"/);
  assert.doesNotMatch(output, /data-tavo-sx-id/);
});

test("inline style remains stronger than sx", () => {
  const output = htmlWithStyles(
    h(
      Box,
      {
        style: { display: "none" },
        sx: {
          sm: { display: "block" },
        },
      },
      "Box"
    )
  );

  assert.match(output, /style="display:none"/);
  assert.match(
    output,
    /@layer tavo-ui\.overrides\{@media \(min-width:480px\)\{\.tsx_[a-z0-9]+\{display:block\}\}\}/
  );
  assert.doesNotMatch(output, /!important/);
});

test("Stepper accepts title items and label aliases", () => {
  const output = html(
    h(Stepper, {
      steps: [
        { id: "profile", title: "Profile", status: "complete" },
        { label: "Billing", status: "current" },
      ],
    })
  );

  assert.match(output, /Profile/);
  assert.match(output, /Billing/);
  assert.match(output, /aria-current="step"/);
});

test("layout primitives support as overrides", () => {
  const output = [
    html(h(Stack, { as: "section" }, "Stack")),
    html(h(Inline, { as: "nav" }, "Inline")),
    html(h(Card, { as: "article" }, "Card")),
  ].join("");

  assert.match(output, /<section/);
  assert.match(output, /<nav/);
  assert.match(output, /<article/);
});

test("Section titleSize controls heading element and variant", () => {
  const output = html(
    h(Section, { title: "Compact heading", titleSize: "h3" }, "Body")
  );

  assert.match(output, /<h3/);
  assert.match(output, /variant-h3/);
  assert.doesNotMatch(output, /<h2/);
});
