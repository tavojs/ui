/**
 * Reviewed runtime-catalog facts that cannot be inferred safely from TypeScript
 * component signatures. Root component names remain owned by component-manifest.mjs.
 */
export const compoundMembersByComponent = Object.freeze({
  Card: ["Root", "Header", "Media", "Content", "Actions"],
  Collapsible: ["Root", "Trigger", "Content", "Close"],
  Dialog: ["Root", "Content", "Header", "Body", "Footer"],
  DropdownMenu: ["Root", "Trigger", "Content", "Item", "Close"],
  Field: ["Root", "Message", "Fieldset", "Legend"],
  HoverCard: ["Root", "Trigger", "Content"],
  InputGroup: ["Root", "Addon", "Input", "Button"],
  List: ["Root", "Item"],
  Menubar: ["Root", "Item"],
  Popover: ["Root", "Trigger", "Content", "Close"],
  Resizable: ["Root", "Panel", "Handle"],
  Sheet: ["Root", "Trigger", "Content", "Close"],
  SplitPane: ["Root", "Aside", "Main"],
  Table: ["Root", "Caption", "Head", "Body", "Row", "HeaderCell", "Cell", "Data"],
  Tabs: ["Root", "List", "Trigger", "Content", "Indicator"],
  ToggleGroup: ["Root", "Item"],
  TreeView: ["Root", "Item"],
});

export const runtimeCatalogAliases = Object.freeze({
  TreeView: ["Tree"],
  "TreeView.Item": ["TreeItem"],
});

const stringProp = Object.freeze({
  validatorId: "string",
  semantic: "json",
});
const numberProp = Object.freeze({
  validatorId: "finite-number",
  semantic: "json",
});
const booleanProp = Object.freeze({
  validatorId: "boolean",
  semantic: "json",
});
const literalProp = (allowedValues) =>
  Object.freeze({
    validatorId: "literal-enum",
    semantic: "json",
    allowedValues: Object.freeze([...allowedValues]),
  });
const requiredStringProp = Object.freeze({
  ...stringProp,
  required: true,
});
const externalUrlProp = Object.freeze({
  validatorId: "url-string",
  semantic: "url",
  urlPolicy: "external-link",
});
const breadcrumbsItemsProp = Object.freeze({
  validatorId: "record-list",
  semantic: "json",
  itemProperties: Object.freeze({
    label: requiredStringProp,
    href: externalUrlProp,
    current: booleanProp,
  }),
});

/**
 * Closed policies for safe native props that the open BaseProps index prevents
 * TypeScript from enumerating. This is the reviewed UI-side counterpart of the
 * generator's componentInheritedProps allowlist.
 */
export const runtimeCatalogReviewedProps = Object.freeze({
  Button: Object.freeze({
    type: stringProp,
    name: stringProp,
    value: stringProp,
  }),
  Field: Object.freeze({
    hint: stringProp,
    success: stringProp,
    warning: stringProp,
    optional: booleanProp,
  }),
  TextInput: Object.freeze({
    type: stringProp,
    name: stringProp,
    value: stringProp,
    defaultValue: stringProp,
    placeholder: stringProp,
    required: booleanProp,
    readOnly: booleanProp,
    autoComplete: stringProp,
    inputMode: stringProp,
  }),
  SearchInput: Object.freeze({
    name: stringProp,
    value: stringProp,
    defaultValue: stringProp,
    placeholder: stringProp,
    required: booleanProp,
    readOnly: booleanProp,
  }),
  Textarea: Object.freeze({
    name: stringProp,
    value: stringProp,
    defaultValue: stringProp,
    placeholder: stringProp,
    required: booleanProp,
    readOnly: booleanProp,
    rows: numberProp,
  }),
  Select: Object.freeze({
    name: stringProp,
    value: stringProp,
    defaultValue: stringProp,
    required: booleanProp,
  }),
  Switch: Object.freeze({
    name: stringProp,
    value: stringProp,
  }),
  Checkbox: Object.freeze({
    name: stringProp,
    value: stringProp,
  }),
  Slider: Object.freeze({
    name: stringProp,
    value: numberProp,
    defaultValue: numberProp,
    min: numberProp,
    max: numberProp,
    step: numberProp,
  }),
  Image: Object.freeze({
    loading: literalProp(["eager", "lazy"]),
    decoding: literalProp(["async", "auto", "sync"]),
  }),
});

/**
 * Closed canonical-data policies for public props that cannot be inferred from
 * component signatures. Child-valued props deliberately admit only strings,
 * polymorphic roots admit only reviewed inert tags, and structured URL data is
 * described with the contract-owned record-list validator.
 */
export const runtimeCatalogCanonicalProps = Object.freeze({
  Alert: Object.freeze({
    title: stringProp,
  }),
  Box: Object.freeze({
    as: literalProp(["article", "form"]),
  }),
  Breadcrumbs: Object.freeze({
    items: breadcrumbsItemsProp,
  }),
  Divider: Object.freeze({
    label: stringProp,
  }),
  EmptyState: Object.freeze({
    description: stringProp,
    title: stringProp,
  }),
  Field: Object.freeze({
    label: requiredStringProp,
  }),
  Link: Object.freeze({
    "aria-label": stringProp,
  }),
  SearchInput: Object.freeze({
    "aria-label": stringProp,
  }),
  Section: Object.freeze({
    description: stringProp,
    eyebrow: stringProp,
    title: stringProp,
  }),
  Switch: Object.freeze({
    "aria-label": stringProp,
  }),
  Text: Object.freeze({
    as: literalProp(["h1", "h2", "h3", "p", "span"]),
  }),
});

/**
 * Structured props whose required item shapes cannot be represented by the
 * contract's closed ComponentPropPolicy vocabulary. Keep them unavailable to
 * canonical data until the contract owns an executable item-schema policy.
 */
export const runtimeCatalogOmittedStructuredProps = new Set([
  "Chart.data",
  "Combobox.options",
  "Table.Data.rows",
  "Tabs.tabs",
  "Tabs.Root.tabs",
]);

const argumentEvent = (prop) => Object.freeze({ prop, value: "argument" });
const valueEvent = (prop, elementType) =>
  Object.freeze({ prop, value: "value", elementType });
const checkedEvent = (prop) =>
  Object.freeze({
    prop,
    value: "checked",
    elementType: "HTMLInputElement",
  });

/** Only reviewed DOM-compatible semantic mappings belong here. */
export const runtimeCatalogEvents = Object.freeze({
  Box: { submit: argumentEvent("onSubmit") },
  Button: {
    blur: argumentEvent("onBlur"),
    focus: argumentEvent("onFocus"),
    press: argumentEvent("onClick"),
  },
  Checkbox: { change: checkedEvent("onChange") },
  Combobox: {
    change: valueEvent("onChange", "HTMLInputElement"),
    input: valueEvent("onInput", "HTMLInputElement"),
  },
  "DropdownMenu.Item": { press: argumentEvent("onClick") },
  Link: { press: argumentEvent("onClick") },
  "Menubar.Item": { press: argumentEvent("onClick") },
  SearchInput: {
    change: valueEvent("onChange", "HTMLInputElement"),
    input: valueEvent("onInput", "HTMLInputElement"),
  },
  Select: {
    change: valueEvent("onChange", "HTMLSelectElement"),
  },
  Slider: {
    change: valueEvent("onChange", "HTMLInputElement"),
    input: valueEvent("onInput", "HTMLInputElement"),
  },
  Switch: { change: checkedEvent("onChange") },
  TextInput: {
    blur: argumentEvent("onBlur"),
    change: valueEvent("onChange", "HTMLInputElement"),
    focus: argumentEvent("onFocus"),
    input: valueEvent("onInput", "HTMLInputElement"),
  },
  Textarea: {
    change: valueEvent("onChange", "HTMLTextAreaElement"),
    input: valueEvent("onInput", "HTMLTextAreaElement"),
  },
  Toggle: { press: argumentEvent("onClick") },
});

/** URL and asset semantics are security review, never type-inferred. */
export const runtimeCatalogSemanticProps = Object.freeze({
  "Avatar.src": {
    validatorId: "asset-reference",
    semantic: "asset",
    nullable: true,
  },
  "DropdownMenu.Item.href": {
    validatorId: "url-string",
    semantic: "url",
    urlPolicy: "external-link",
  },
  "Image.src": {
    validatorId: "asset-reference",
    semantic: "asset",
    nullable: true,
  },
  "Link.href": {
    validatorId: "url-string",
    semantic: "url",
    urlPolicy: "external-link",
  },
  "Link.to": {
    validatorId: "url-string",
    semantic: "url",
    urlPolicy: "internal-route",
  },
  "Menubar.Item.href": {
    validatorId: "url-string",
    semantic: "url",
    urlPolicy: "external-link",
  },
  "Toggle.href": {
    validatorId: "url-string",
    semantic: "url",
    urlPolicy: "external-link",
  },
});

/**
 * These entries have a reviewed, stable public DOM root that forwards `ref`.
 * All other entries use range boundaries, including variable-root compositions.
 */
export const runtimeCatalogSingleRootEntries = new Set([
  "Box",
  "Button",
  "Checkbox",
  "Link",
  "Select",
  "Slider",
  "TextInput",
  "Textarea",
  "Toggle",
]);

export const runtimeCatalogReservedProps = new Set([
  "children",
  "component",
  "dangerouslySetInnerHTML",
  "innerHTML",
  "key",
  "outerHTML",
  "ref",
  "style",
  "sx",
  "transition",
  "use",
  "viewTransitionClass",
  "viewTransitionName",
]);

export const nestedUrlPropNames = new Set([
  "downloadUrl",
  "href",
  "src",
  "to",
  "url",
]);
