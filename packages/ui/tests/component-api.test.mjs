import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  createStyleRegistry,
  h,
  renderToString,
  renderStyleTags,
  withStyleRegistry,
} from "@tavojs/core";
import { createRouter, RouterProvider } from "@tavojs/core/router";
import {
  AppBar,
  Box,
  Button,
  Calendar,
  Card,
  Chart,
  Chip,
  ColorPicker,
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
  FileTrigger,
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
  NumberInput,
  ObjectField,
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
  TreeView,
  clampResizableValue,
  nextTreeSelection,
  parseNumberInputDraft,
  validateObjectFieldEntries,
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

test("ColorPicker preserves native color input semantics and value changes", () => {
  let selected;
  const picker = ColorPicker({
    name: "brand-color",
    value: "#5b5bd6",
    size: "lg",
    onValueChange: (value) => {
      selected = value;
    },
  });

  assert.equal(picker.type, "input");
  assert.equal(picker.props.type, "color");
  assert.equal(picker.props.name, "brand-color");
  assert.equal(picker.props.value, "#5b5bd6");
  assert.match(picker.props.className, /size-lg/);

  picker.props.onChange({ currentTarget: { value: "#0f766e" } });
  assert.equal(selected, "#0f766e");
});

test("ColorPicker composes native and value change handlers", () => {
  const calls = [];
  const picker = ColorPicker({
    onChange: (event) => calls.push(`event:${event.currentTarget.value}`),
    onValueChange: (value) => calls.push(`value:${value}`),
  });

  picker.props.onChange({ currentTarget: { value: "#112233" } });
  assert.deepEqual(calls, ["event:#112233", "value:#112233"]);
});

test("Field labels and describes ColorPicker through its native input root", () => {
  const output = html(
    h(
      Field,
      { label: "Brand color", hint: "Choose a six-digit color." },
      h(ColorPicker, { name: "brand-color", value: "#5b5bd6" })
    )
  );

  assert.match(output, /<label[^>]*for="tui-brand-color"/);
  assert.match(output, /<input[^>]*type="color"/);
  assert.match(output, /<input[^>]*id="tui-brand-color"/);
  assert.match(output, /aria-describedby="tui-brand-color-message"/);
});

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
  const output = [
    html(h(DropdownMenu.Item, {
      href: "/settings",
      className: "custom-item",
      target: "_blank",
      rel: "noreferrer",
      download: "settings.html",
    }, "Settings")),
    html(h(DropdownMenu.Item, { href: "/disabled", disabled: true }, "Disabled")),
  ].join("");

  assert.match(output, /<a/);
  assert.match(output, /href="\/settings"/);
  assert.match(output, /role="menuitem"/);
  assert.match(output, /tabIndex="0"/);
  assert.match(output, /class="[^"]*custom-item/);
  assert.match(output, /target="_blank"/);
  assert.match(output, /rel="noreferrer"/);
  assert.match(output, /download="settings\.html"/);
  assert.match(output, /aria-disabled="true"/);
  assert.match(output, /tabIndex="-1"/);
  assert.doesNotMatch(output, /href="\/disabled"/);
});

test("DropdownMenuItem preserves user click and keyboard handlers", () => {
  let clicks = 0;
  let keydowns = 0;
  const item = resolveComponentVNode(
    h(DropdownMenu.Item, {
      href: "https://example.com/settings",
      onClick: () => { clicks += 1; },
      onKeyDown: () => { keydowns += 1; },
    }, "Settings")
  );

  item.props.onClick({
    defaultPrevented: false,
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
  });
  item.props.onKeyDown({ key: "Enter" });

  assert.equal(clicks, 1);
  assert.equal(keydowns, 1);
});

test("Collapsible and DropdownMenu can hide their arrows", () => {
  const collapsible = html(
    h(Collapsible, { showArrow: false }, [
      h(Collapsible.Trigger, null, "More"),
      h(Collapsible.Content, null, "Details"),
    ])
  );
  const dropdown = html(
    h(DropdownMenu, { showArrow: false }, [
      h(DropdownMenu.Trigger, null, "Actions"),
      h(DropdownMenu.Content, null, h(DropdownMenu.Item, null, "Edit")),
    ])
  );

  assert.match(collapsible, /data-show-arrow="false"/);
  assert.match(dropdown, /data-show-arrow="false"/);
  assert.doesNotMatch(html(h(Collapsible, null, h(Collapsible.Trigger, null, "More"))), /data-show-arrow/);
  assert.doesNotMatch(html(h(DropdownMenu, null, h(DropdownMenu.Trigger, null, "Actions"))), /data-show-arrow/);
});

test("Collapsible can center its trigger independently of the arrow", () => {
  const centered = html(
    h(Collapsible, { centerTrigger: true },
      h(Collapsible.Trigger, null, "Centered")
    )
  );
  const defaultAlignment = html(
    h(Collapsible, null, h(Collapsible.Trigger, null, "Default"))
  );

  assert.match(centered, /data-center-trigger="true"/);
  assert.doesNotMatch(defaultAlignment, /data-center-trigger/);
});

test("nested Collapsible arrows respond only to their directly owned open state", () => {
  const output = html(
    h(Collapsible, { open: true }, [
      h(Collapsible.Trigger, null, "Outer"),
      h(Collapsible.Content, null,
        h(Collapsible, { open: false }, [
          h(Collapsible.Trigger, null, "Inner"),
          h(Collapsible.Content, null, "Inner content"),
        ])
      ),
    ])
  );
  const css = readFileSync(
    new URL("../src/components/Collapsible/Collapsible.module.scss", import.meta.url),
    "utf8"
  );

  assert.match(output, /<details[^>]* open/);
  assert.match(output, /<details[^>]*><summary/);
  assert.match(css, /\.root\[open\]\s*>\s*\.trigger::after/);
  assert.doesNotMatch(css, /\.root\[open\]\s+\.trigger::after/);
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

test("Image uses the Tavo.js core optimizer while keeping UI classes", () => {
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
  const calendarTrigger = findVNode(
    picker,
    (node) => node.type === Popover.Trigger
  );
  assert.ok(calendarTrigger);
  const input = findVNode(
    picker,
    (node) => node.type === TextInput && node.props?.type === "date"
  );
  input.props.onChange({ currentTarget: { value: "2026-01-17" } });
  assert.equal(selected, "2026-01-17");
});

test("Calendar month and year selectors request controlled changes", () => {
  const changes = [];
  const calendar = Calendar({
    year: 2026,
    month: 4,
    yearRange: { start: 2025, end: 2027 },
    onMonthChange: (year, month) => changes.push([year, month]),
  });
  const selects = [];

  function collectSelects(value) {
    if (Array.isArray(value)) {
      value.forEach(collectSelects);
      return;
    }
    if (!value || typeof value !== "object" || !("type" in value)) {
      return;
    }
    if (value.type === "select") {
      selects.push(value);
    }
    collectSelects(value.props?.children);
  }

  collectSelects(calendar);
  const disclosure = findVNodeByType(calendar, "details");
  assert.equal(disclosure, undefined);
  assert.equal(selects.length, 2);
  assert.equal(selects[0].props["aria-label"], "Month");
  assert.equal(selects[0].props.value, "4");
  assert.equal(selects[1].props["aria-label"], "Year");
  assert.equal(selects[1].props.value, "2026");

  const previousButton = findVNodeByType(calendar, "button");
  const buttons = [];
  function collectButtons(value) {
    if (Array.isArray(value)) {
      value.forEach(collectButtons);
      return;
    }
    if (!value || typeof value !== "object" || !("type" in value)) return;
    if (value.type === "button") buttons.push(value);
    collectButtons(value.props?.children);
  }
  collectButtons(calendar);
  assert.equal(previousButton.props["aria-label"], "Previous month");
  assert.equal(buttons[1].props["aria-label"], "Next month");

  selects[0].props.onInput({ currentTarget: { value: "8" } });
  selects[1].props.onInput({ currentTarget: { value: "2027" } });
  buttons[0].props.onClick();
  buttons[1].props.onClick();
  assert.deepEqual(changes, [[2026, 8], [2027, 4], [2026, 3], [2026, 5]]);

  const output = html(h(Calendar, {
    year: 2026,
    month: 4,
    yearRange: { start: 2025, end: 2027 },
    onMonthChange: () => {},
  }));
  assert.doesNotMatch(output, /<details|<summary/);
  assert.match(output, /aria-label="Month"/);
  assert.match(output, /aria-label="Year"/);
  assert.match(output, /value="2025"/);
  assert.match(output, /value="2027"/);
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

test("DropdownMenu.Item canonicalizes internal hrefs through the active router", () => {
  const router = createRouter(
    [{ path: "/docs", component: () => null }],
    { routing: { trailingSlash: "always" } }
  );
  const output = html(
    h(
      RouterProvider,
      { router, pathname: "/" },
      h(
        DropdownMenu,
        { open: true },
        h(DropdownMenu.Content, null, [
          h(DropdownMenu.Item, { href: "/docs" }, "Docs"),
          h(DropdownMenu.Item, {
            href: "https://example.com/docs",
            target: "_blank",
            rel: "noreferrer",
          }, "External"),
          h(DropdownMenu.Item, { href: "/assets/guide.pdf", download: true }, "Guide"),
        ])
      )
    )
  );

  assert.match(output, /href="\/docs\/"/);
  assert.match(output, /role="menuitem"/);
  assert.match(output, /href="https:\/\/example\.com\/docs"/);
  assert.match(output, /target="_blank"/);
  assert.match(output, /rel="noreferrer"/);
  assert.match(output, /href="\/assets\/guide\.pdf"/);
  assert.match(output, /download/);
  assert.doesNotMatch(output, /guide\.pdf\//);
});

test("NumberInput preserves intermediate drafts and emits typed preview and commit values", () => {
  assert.deepEqual(parseNumberInputDraft("-"), { valid: false, value: null });
  assert.deepEqual(parseNumberInputDraft("."), { valid: false, value: null });
  assert.deepEqual(parseNumberInputDraft(""), { valid: true, value: null });
  assert.deepEqual(parseNumberInputDraft("-1.25"), { valid: true, value: -1.25 });

  const inputs = [];
  const changes = [];
  const number = NumberInput({
    label: "Width",
    value: 12,
    min: 0,
    max: 20,
    suffix: "px",
    onValueInput: (value, draft) => inputs.push([value, draft]),
    onValueChange: (value, draft) => changes.push([value, draft]),
  });
  const input = findVNodeByType(number, "input");

  input.props.onInput({ defaultPrevented: false, currentTarget: { value: "-" }, target: { value: "-" } });
  assert.deepEqual(inputs, []);
  input.props.onInput({ defaultPrevented: false, currentTarget: { value: "14.5" }, target: { value: "14.5" } });
  assert.deepEqual(inputs, [[14.5, "14.5"]]);
  const currentTarget = { value: "24" };
  input.props.onChange({ defaultPrevented: false, currentTarget, target: currentTarget });
  assert.deepEqual(changes, [[20, "20"]]);
  assert.equal(currentTarget.value, "20");

  const output = html(number);
  assert.match(output, />Width</);
  assert.match(output, /inputMode="decimal"/);
  assert.match(output, /aria-valuemin="0"/);
});

test("NumberInput keyboard stepping supports a larger modified step", () => {
  const committed = [];
  const number = NumberInput({ value: 5, min: 0, max: 20, step: 2, onValueChange: (value) => committed.push(value) });
  const input = findVNodeByType(number, "input");
  const currentTarget = { value: "5" };
  input.props.onKeyDown({
    key: "ArrowUp",
    shiftKey: true,
    defaultPrevented: false,
    currentTarget,
    preventDefault() {},
  });
  assert.equal(currentTarget.value, "20");
  assert.deepEqual(committed, [20]);
});

test("ToggleGroup supports Child labels, empty single selection, and full-width layout", () => {
  const values = [];
  const group = ToggleGroup({
    value: "grid",
    allowEmpty: true,
    fullWidth: true,
    onValueChange: (value) => values.push(value),
    items: [
      { label: h(Icon, null, "L"), accessibleLabel: "List view", title: "List", value: "list" },
      { label: h(Icon, null, "G"), accessibleLabel: "Grid view", title: "Grid", value: "grid" },
    ],
  });
  const selectedInput = group.props.children[1].props.children[0];
  selectedInput.props.onClick({ preventDefault() {}, currentTarget: { checked: true }, defaultPrevented: false });

  assert.deepEqual(values, [undefined]);
  assert.match(group.props.className, /fullWidth/);
  const output = html(group);
  assert.match(output, /aria-label="Grid view"/);
  assert.match(output, /title="Grid"/);
});

test("ColorPicker CSS mode previews arbitrary CSS paints and separates input from commit", () => {
  const inputs = [];
  const changes = [];
  const picker = ColorPicker({
    format: "css",
    label: "Background",
    value: "linear-gradient(90deg, #000, transparent)",
    tokens: [{ label: "Accent", value: "var(--accent)" }],
    onValueInput: (value) => inputs.push(value),
    onValueChange: (value) => changes.push(value),
  });
  const textInput = findVNodeByType(picker, "input");
  const eventTarget = { value: "color(display-p3 1 0 0 / .5)" };
  textInput.props.onInput({ defaultPrevented: false, currentTarget: eventTarget, target: eventTarget });
  textInput.props.onChange({ defaultPrevented: false, currentTarget: eventTarget, target: eventTarget });

  assert.deepEqual(inputs, [eventTarget.value]);
  assert.deepEqual(changes, [eventTarget.value]);
  const output = html(picker);
  assert.match(output, /linear-gradient/);
  assert.match(output, /aria-label="Accent"/);
  assert.match(output, /var\(--accent\)/);
});

test("FileTrigger forwards native files and resets the input after selection", () => {
  let selected;
  const trigger = FileTrigger({
    accept: ".json",
    variant: "text",
    onFilesChange: (files) => { selected = files; },
    children: "Import",
  });
  const fileInput = trigger.props.children[1];
  const files = { 0: { name: "project.json" }, length: 1 };
  const currentTarget = { files, value: "/fake/project.json" };
  fileInput.props.onChange({ currentTarget });

  assert.equal(selected, files);
  assert.equal(currentTarget.value, "");
  const output = html(trigger);
  assert.match(output, /type="file"/);
  assert.match(output, /accept="\.json"/);
  assert.match(output, />Import</);
});

test("Resizable exposes controlled separator values and clamps keyboard changes", () => {
  assert.equal(clampResizableValue(12, 20, 40), 20);
  assert.equal(clampResizableValue(55, 20, 40), 40);
  const values = [];
  const root = Resizable({
    orientation: "vertical",
    value: 32,
    min: 24,
    max: 48,
    step: 4,
    largeStep: 12,
    onValueChange: (value) => values.push(value),
    children: h(Resizable.Handle, { "aria-label": "Resize inspector" }),
  });
  const handle = resolveComponentVNode(root.props.children[0]);
  const owner = {
    dataset: { value: "32" },
    style: { setProperty() {} },
  };
  const attributes = {};
  handle.props.onKeyDown({
    key: "ArrowRight",
    shiftKey: true,
    defaultPrevented: false,
    preventDefault() {},
    currentTarget: {
      closest: () => owner,
      setAttribute: (name, value) => { attributes[name] = value; },
    },
  });

  assert.deepEqual(values, [44]);
  assert.equal(attributes["aria-valuenow"], "44");
  const output = html(root);
  assert.match(output, /aria-orientation="vertical"/);
  assert.match(output, /aria-valuemin="24"/);
  assert.match(output, /aria-valuemax="48"/);
});

test("TreeView implements deterministic additive and contiguous multi-selection", () => {
  const order = ["a", "b", "c", "d"];
  assert.deepEqual(nextTreeSelection(order, ["a"], "c", "multiple", { range: true, anchorId: "a" }), ["a", "b", "c"]);
  assert.deepEqual(nextTreeSelection(order, ["a", "c"], "c", "multiple", { additive: true }), ["a"]);
  assert.deepEqual(nextTreeSelection(order, [], "b", "single"), ["b"]);

  const output = html(
    h(TreeView, { "aria-label": "Layers", selectedIds: ["child"], selectionMode: "multiple", expandedIds: ["parent"] },
      h(TreeView.Item, { id: "parent", label: "Parent" },
        h(TreeView.Item, { id: "child", label: "Child", description: "Text" })
      )
    )
  );
  assert.match(output, /role="tree"/);
  assert.match(output, /aria-multiselectable="true"/);
  assert.match(output, /role="group"/);
  assert.match(output, /aria-selected="true"/);
  assert.match(output, /aria-level="2"/);
});

test("ObjectField validates duplicate keys and renders structured accessible controls", () => {
  const validation = validateObjectFieldEntries([["color", "red"], ["color", "blue"]]);
  assert.equal(validation.valid, false);
  assert.equal(validation.issues.filter((issue) => issue.field === "key").length, 2);

  const output = html(
    h(ObjectField, {
      label: "Options",
      value: { color: "primary", hidden: false, count: 2 },
      showRaw: true,
    })
  );
  assert.match(output, /<fieldset/);
  assert.match(output, /<legend[^>]*>Options/);
  assert.match(output, />Key</);
  assert.match(output, />Type</);
  assert.match(output, />Value</);
  assert.match(output, /Advanced JSON/);
  assert.match(output, /aria-label="Remove color"/);
});

test("controlled overlay APIs expose defaults, close-on-select, and close primitives", () => {
  const output = [
    html(h(Collapsible, { defaultOpen: true }, [h(Collapsible.Trigger, null, "More"), h(Collapsible.Content, null, "Body")])),
    html(h(Popover, { defaultOpen: true }, [h(Popover.Trigger, null, "Open"), h(Popover.Content, null, "Body"), h(Popover.Close, null, "Done")])),
    html(h(DropdownMenu, { defaultOpen: true }, [h(DropdownMenu.Trigger, null, "Actions"), h(DropdownMenu.Content, null, h(DropdownMenu.Close, null, "Done"))])),
  ].join("");
  assert.equal((output.match(/<details[^>]* open/g) ?? []).length, 3);
  assert.match(output, />Done</);

  const details = { dataset: {}, open: true, dispatchEvent() {} };
  let selected = 0;
  const item = resolveComponentVNode(h(DropdownMenu.Item, { onSelect: () => { selected += 1; } }, "Save"));
  item.props.onClick({
    defaultPrevented: false,
    currentTarget: { closest: () => details },
  });
  assert.equal(selected, 1);
  assert.equal(details.open, false);
  assert.equal(details.dataset.tuiOpenReason, "selection");
});

test("overlay behavior handles Escape and restores focus to its trigger", async () => {
  const changes = [];
  const root = Popover({ defaultOpen: true, onOpenChange: (open, reason) => changes.push([open, reason]) });
  const behavior = root.props.use.find((candidate) => typeof candidate === "function");
  const previousDocument = globalThis.document;
  const documentListeners = new Map();
  globalThis.document = {
    addEventListener: (name, listener) => documentListeners.set(name, listener),
    removeEventListener: (name) => documentListeners.delete(name),
  };

  let triggerFocus = 0;
  let contentFocus = 0;
  const trigger = { focus: () => { triggerFocus += 1; } };
  const content = { focus: () => { contentFocus += 1; } };
  const listeners = new Map();
  const details = {
    dataset: {},
    open: true,
    querySelector: (selector) => selector === ":scope > summary" ? trigger : content,
    addEventListener: (name, listener) => listeners.set(name, listener),
    removeEventListener: (name) => listeners.delete(name),
    dispatchEvent: (event) => listeners.get(event.type)?.(event),
  };

  try {
    const cleanup = behavior(details);
    let prevented = false;
    listeners.get("keydown")({
      key: "Escape",
      defaultPrevented: false,
      preventDefault: () => { prevented = true; },
      stopPropagation() {},
    });
    listeners.get("toggle")();
    await Promise.resolve();

    assert.equal(prevented, true);
    assert.deepEqual(changes, [[false, "escape"]]);
    assert.equal(contentFocus, 1);
    assert.equal(triggerFocus, 1);
    cleanup();
  } finally {
    globalThis.document = previousDocument;
  }
});
