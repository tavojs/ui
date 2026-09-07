import assert from "node:assert/strict";
import {
  readFileSync,
  readdirSync,
} from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  createStyleRegistry,
  renderToString,
  withStyleRegistry,
} from "@tavojs/core";
import * as publicComponents from "../dist/components/index.js";
import {
  tavoUiRuntimeCatalog,
  tavoUiRuntimeCatalogMetadata,
} from "../dist/runtime-catalog/index.js";
import browserRuntimeCatalog, {
  tavoUiRuntimeCatalog as browserNamedRuntimeCatalog,
} from "../dist/browser/runtime-catalog/index.js";
import { componentEntries } from "../scripts/component-manifest.mjs";
import {
  buildRuntimeCatalogComponentsSource,
  buildRuntimeCatalogMetadataSource,
} from "../scripts/generate-runtime-catalog.mjs";
import {
  compoundMembersByComponent,
  runtimeCatalogAliases,
  runtimeCatalogCanonicalProps,
  runtimeCatalogOmittedStructuredProps,
  runtimeCatalogReviewedProps,
  runtimeCatalogReservedProps,
  runtimeCatalogSemanticProps,
} from "../scripts/runtime-catalog-review.mjs";

const uiRoot = fileURLToPath(new URL("..", import.meta.url));
const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

const entryKeys = [
  "aliases",
  "capabilities",
  "events",
  "handlerProps",
  "instrumentation",
  "name",
  "props",
  "source",
];
const policyKeys = new Set([
  "allowedValues",
  "itemProperties",
  "nullable",
  "required",
  "responsive",
  "semantic",
  "urlPolicy",
  "validatorId",
]);
const eventKeys = new Set(["elementType", "prop", "value"]);

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function metadataEntry(name) {
  const entry = tavoUiRuntimeCatalogMetadata.entries.find(
    (candidate) => candidate.name === name,
  );
  assert.ok(entry, `Missing runtime metadata for '${name}'.`);
  return entry;
}

function listSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    return entry.isDirectory() ? listSourceFiles(filePath) : [filePath];
  });
}

test("runtime catalog exposes frozen raw serializable metadata for the exact UI version", () => {
  assert.equal(tavoUiRuntimeCatalogMetadata.formatVersion, 1);
  assert.equal(tavoUiRuntimeCatalog.metadata, tavoUiRuntimeCatalogMetadata);
  assert.equal(browserRuntimeCatalog, tavoUiRuntimeCatalog);
  assert.equal(browserNamedRuntimeCatalog, tavoUiRuntimeCatalog);
  assert.deepEqual(
    JSON.parse(JSON.stringify(tavoUiRuntimeCatalogMetadata)),
    tavoUiRuntimeCatalogMetadata,
  );
  assert.equal(Object.isFrozen(tavoUiRuntimeCatalogMetadata), true);
  assert.equal(Object.isFrozen(tavoUiRuntimeCatalogMetadata.entries), true);

  for (const entry of tavoUiRuntimeCatalogMetadata.entries) {
    assert.deepEqual(Object.keys(entry).sort(), entryKeys);
    assert.deepEqual(Object.keys(entry.source).sort(), [
      "kind",
      "packageName",
      "packageVersion",
    ]);
    assert.equal(entry.source.kind, "tavo-ui");
    assert.equal(entry.source.packageName, "@tavojs/ui");
    assert.equal(entry.source.packageVersion, packageJson.version);
    assert.match(entry.source.packageVersion, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
    assert.equal(Object.hasOwn(entry, "description"), false);
    assert.equal(Object.hasOwn(entry, "category"), false);
    assert.equal(Object.isFrozen(entry), true);
    assert.equal(Object.isFrozen(entry.props), true);
  }
});

test("runtime catalog deterministically follows all reviewed public component exports", () => {
  const expectedNames = componentEntries.flatMap(({ name }) => [
    name,
    ...(compoundMembersByComponent[name] ?? []).map(
      (memberName) => `${name}.${memberName}`,
    ),
  ]);
  const entries = tavoUiRuntimeCatalog.list();

  assert.equal(componentEntries.length, 85);
  assert.equal(expectedNames.length, 150);
  assert.equal(entries.length, 150);
  assert.deepEqual(
    tavoUiRuntimeCatalogMetadata.entries.map((entry) => entry.name),
    expectedNames,
  );
  assert.deepEqual(
    entries.map((entry) => entry.metadata.name),
    expectedNames,
  );
  assert.equal(new Set(expectedNames.map((name) => name.toLowerCase())).size, 150);

  for (const { name } of componentEntries) {
    const rootComponent = publicComponents[name];
    assert.equal(typeof rootComponent, "function", `'${name}' is not public.`);
    assert.equal(tavoUiRuntimeCatalog.resolve(name)?.component, rootComponent);
    assert.deepEqual(
      Object.keys(rootComponent)
        .filter((memberName) => typeof rootComponent[memberName] === "function")
        .sort(),
      [...(compoundMembersByComponent[name] ?? [])].sort(),
      `'${name}' has an unreviewed or stale callable compound member.`,
    );

    for (const memberName of compoundMembersByComponent[name] ?? []) {
      const canonicalName = `${name}.${memberName}`;
      const memberComponent = rootComponent[memberName];
      assert.equal(
        typeof memberComponent,
        "function",
        `'${canonicalName}' is not a real public compound member.`,
      );
      assert.equal(
        tavoUiRuntimeCatalog.resolve(canonicalName)?.component,
        memberComponent,
      );
    }
  }

  for (const canonicalName of [
    "List.Root",
    "SplitPane.Aside",
    "SplitPane.Main",
    "ToggleGroup.Item",
  ]) {
    assert.equal(typeof tavoUiRuntimeCatalog.resolve(canonicalName)?.component, "function");
  }
});

test("catalog generation re-extracts the reviewed callback surface from public types", () => {
  const componentsPath = path.join(
    uiRoot,
    "src",
    "runtime-catalog",
    "components.generated.ts",
  );
  const generatedPath = path.join(
    uiRoot,
    "src",
    "runtime-catalog",
    "metadata.generated.ts",
  );
  assert.equal(
    readFileSync(componentsPath, "utf8"),
    buildRuntimeCatalogComponentsSource({ componentEntries }),
  );
  const regenerated = buildRuntimeCatalogMetadataSource({
    root: uiRoot,
    packageVersion: packageJson.version,
    componentEntries,
  });
  assert.equal(readFileSync(generatedPath, "utf8"), regenerated);

  runtimeCatalogOmittedStructuredProps.add("Chart.missingStructuredProp");
  try {
    assert.throws(
      () => buildRuntimeCatalogMetadataSource({
        root: uiRoot,
        packageVersion: packageJson.version,
        componentEntries,
      }),
      /structured prop omission review is stale: Chart\.missingStructuredProp/i,
    );
  } finally {
    runtimeCatalogOmittedStructuredProps.delete("Chart.missingStructuredProp");
  }
  runtimeCatalogOmittedStructuredProps.delete("Chart.data");
  try {
    assert.throws(
      () => buildRuntimeCatalogMetadataSource({
        root: uiRoot,
        packageVersion: packageJson.version,
        componentEntries,
      }),
      /structured array prop 'Chart\.data' requires an explicit reviewed omission/i,
    );
  } finally {
    runtimeCatalogOmittedStructuredProps.add("Chart.data");
  }

  assert.equal(metadataEntry("Chip").handlerProps.includes("onRemove"), true);
  assert.equal(
    metadataEntry("Resizable").handlerProps.includes("onResizeCancel"),
    true,
  );
  assert.equal(
    metadataEntry("SearchInput").handlerProps.includes("onClear"),
    true,
  );
  assert.equal(
    metadataEntry("TreeView").handlerProps.includes("onExpandedChange"),
    true,
  );
  assert.equal(metadataEntry("Table.Data").handlerProps.includes("columns"), true);
  for (const componentName of ["Breadcrumbs", "NavigationMenu"]) {
    assert.equal(metadataEntry(componentName).handlerProps.includes("items"), false);
  }
  assert.equal(Object.hasOwn(metadataEntry("Breadcrumbs").props, "items"), true);
  assert.equal(Object.hasOwn(metadataEntry("NavigationMenu").props, "items"), false);
});

test("canonical names and reviewed aliases resolve case-insensitively", () => {
  for (const entry of tavoUiRuntimeCatalog.list()) {
    const names = [entry.metadata.name, ...entry.metadata.aliases];
    for (const name of names) {
      assert.equal(tavoUiRuntimeCatalog.resolve(name), entry);
      assert.equal(tavoUiRuntimeCatalog.resolve(name.toLowerCase()), entry);
      assert.equal(tavoUiRuntimeCatalog.resolve(name.toUpperCase()), entry);
    }
  }

  for (const [canonicalName, aliases] of Object.entries(runtimeCatalogAliases)) {
    assert.deepEqual(metadataEntry(canonicalName).aliases, [...aliases].sort());
  }
  assert.equal(
    tavoUiRuntimeCatalog.resolve("tree"),
    tavoUiRuntimeCatalog.resolve("TreeView"),
  );
  assert.equal(
    tavoUiRuntimeCatalog.resolve("TREEITEM"),
    tavoUiRuntimeCatalog.resolve("TreeView.Item"),
  );
  assert.equal(tavoUiRuntimeCatalog.resolve("NotAComponent"), undefined);
  assert.equal(tavoUiRuntimeCatalog.resolve("TreeView.Missing"), undefined);
});

test("prop, handler, and semantic event surfaces are closed", () => {
  for (const entry of tavoUiRuntimeCatalogMetadata.entries) {
    assert.deepEqual(
      entry.handlerProps,
      [...new Set(entry.handlerProps)].sort(),
      `${entry.name} handler props must be sorted and unique.`,
    );

    for (const reservedName of runtimeCatalogReservedProps) {
      assert.equal(
        Object.hasOwn(entry.props, reservedName),
        false,
        `${entry.name}.${reservedName} must remain reserved.`,
      );
    }
    for (const [propName, policy] of Object.entries(entry.props)) {
      assert.equal(/^on[A-Z]/.test(propName), false);
      assert.equal(entry.handlerProps.includes(propName), false);
      assert.ok(Object.keys(policy).every((key) => policyKeys.has(key)));
    }
    for (const event of Object.values(entry.events)) {
      assert.ok(Object.keys(event).every((key) => eventKeys.has(key)));
      assert.equal(entry.handlerProps.includes(event.prop), true);
      assert.equal(Object.hasOwn(entry.props, event.prop), false);
    }

    assert.equal(
      Object.hasOwn(entry.props, "unknownProp"),
      false,
      `${entry.name} unexpectedly has an open prop policy.`,
    );
  }

  assert.equal(metadataEntry("Button").handlerProps.includes("onClick"), true);
  assert.equal(Object.hasOwn(metadataEntry("Button").props, "onClick"), false);
  assert.equal(metadataEntry("CommandMenu").handlerProps.includes("items"), true);
  assert.equal(metadataEntry("Pagination").handlerProps.includes("getHref"), true);
  assert.equal(metadataEntry("Table.Data").handlerProps.includes("columns"), true);
});

test("structured array props without a reviewed item policy remain omitted", () => {
  const omittedProps = [
    ["Chart", "data"],
    ["Combobox", "options"],
    ["Table.Data", "rows"],
    ["Tabs", "tabs"],
    ["Tabs.Root", "tabs"],
  ];
  assert.deepEqual(
    [...runtimeCatalogOmittedStructuredProps].sort(),
    omittedProps.map(([componentName, propName]) => `${componentName}.${propName}`).sort(),
  );
  assert.deepEqual(
    tavoUiRuntimeCatalogMetadata.entries.flatMap((entry) =>
      Object.entries(entry.props)
        .filter(([, policy]) => policy.validatorId === "json-array")
        .map(([propName]) => `${entry.name}.${propName}`),
    ),
    [],
    "A structured array reached the catalog without a reviewed item policy.",
  );
  for (const [componentName, propName] of omittedProps) {
    assert.equal(Object.hasOwn(metadataEntry(componentName).props, propName), false);
  }
});

test("optional responsive props retain closed policies and responsive capabilities", () => {
  const responsiveSurface = Object.fromEntries(
    tavoUiRuntimeCatalogMetadata.entries.flatMap((entry) => {
      const responsiveProps = Object.entries(entry.props)
        .filter(([, policy]) => policy.responsive === true)
        .map(([propName, policy]) => [propName, policy.validatorId]);
      return responsiveProps.length > 0
        ? [[entry.name, Object.fromEntries(responsiveProps)]]
        : [];
    }),
  );
  assert.deepEqual(responsiveSurface, {
    AppBar: {
      align: "literal-enum",
      direction: "literal-enum",
      gap: "string",
      justify: "literal-enum",
    },
    AspectRatio: { ratio: "string" },
    Box: {
      maxWidth: "literal-enum",
      padding: "literal-enum",
      paddingInline: "literal-enum",
      radius: "literal-enum",
    },
    Flex: {
      align: "literal-enum",
      direction: "literal-enum",
      gap: "string",
      justify: "literal-enum",
    },
    Grid: {
      align: "literal-enum",
      columns: "finite-number",
      minItemWidth: "string",
      spacing: "literal-enum",
    },
    GridRuler: { spacing: "literal-enum" },
    Inline: { gap: "literal-enum" },
    Page: { padding: "literal-enum", size: "literal-enum" },
    "Resizable.Panel": { defaultSize: "string" },
    ScrollArea: { maxHeight: "string" },
    Section: { spacing: "literal-enum" },
    Sidebar: { padding: "literal-enum" },
    Spacer: { size: "literal-enum" },
    SplitPane: { gap: "literal-enum", ratio: "literal-enum" },
    "SplitPane.Root": { gap: "literal-enum", ratio: "literal-enum" },
    Stack: { gap: "literal-enum" },
    Toolbar: {
      align: "literal-enum",
      gap: "literal-enum",
      justify: "literal-enum",
    },
  });

  const box = metadataEntry("Box");
  assert.equal(box.capabilities.includes("responsive-styles"), true);
  assert.deepEqual(plain(box.props.padding), {
    allowedValues: ["lg", "md", "none", "sm"],
    responsive: true,
    semantic: "json",
    validatorId: "literal-enum",
  });
  assert.deepEqual(plain(box.props.maxWidth), {
    allowedValues: ["full", "lg", "md", "sm", "xl"],
    responsive: true,
    semantic: "json",
    validatorId: "literal-enum",
  });

  const flex = metadataEntry("Flex");
  assert.equal(flex.capabilities.includes("responsive-styles"), true);
  assert.deepEqual(plain(flex.props.direction), {
    allowedValues: ["column-reverse", "column", "row-reverse", "row"],
    responsive: true,
    semantic: "json",
    validatorId: "literal-enum",
  });
  assert.deepEqual(plain(flex.props.gap), {
    responsive: true,
    semantic: "json",
    validatorId: "string",
  });
});

test("reviewed native prop policies preserve generator parity", () => {
  const expectedReviewedProps = {
    Button: ["type", "name", "value"],
    Field: ["hint", "success", "warning", "optional"],
    TextInput: [
      "type",
      "name",
      "value",
      "defaultValue",
      "placeholder",
      "required",
      "readOnly",
      "autoComplete",
      "inputMode",
    ],
    SearchInput: [
      "name",
      "value",
      "defaultValue",
      "placeholder",
      "required",
      "readOnly",
    ],
    Textarea: [
      "name",
      "value",
      "defaultValue",
      "placeholder",
      "required",
      "readOnly",
      "rows",
    ],
    Select: ["name", "value", "defaultValue", "required"],
    Switch: ["name", "value"],
    Checkbox: ["name", "value"],
    Slider: ["name", "value", "defaultValue", "min", "max", "step"],
    Image: ["loading", "decoding"],
  };

  assert.deepEqual(
    Object.fromEntries(
      Object.entries(runtimeCatalogReviewedProps).map(([name, policies]) => [
        name,
        Object.keys(policies),
      ]),
    ),
    expectedReviewedProps,
  );
  for (const [componentName, policies] of Object.entries(
    runtimeCatalogReviewedProps,
  )) {
    const entry = metadataEntry(componentName);
    for (const [propName, policy] of Object.entries(policies)) {
      assert.deepEqual(
        plain(entry.props[propName]),
        plain(policy),
        `${componentName}.${propName} diverged from the reviewed native policy.`,
      );
    }
    if (compoundMembersByComponent[componentName]?.includes("Root")) {
      const rootEntry = metadataEntry(`${componentName}.Root`);
      for (const [propName, policy] of Object.entries(policies)) {
        assert.deepEqual(plain(rootEntry.props[propName]), plain(policy));
      }
    }
  }

});

test("reviewed canonical fixture props remain explicit and narrow", () => {
  const expectedCanonicalProps = {
    Alert: ["title"],
    Box: ["as"],
    Breadcrumbs: ["items"],
    Divider: ["label"],
    EmptyState: ["description", "title"],
    Field: ["label"],
    Link: ["aria-label"],
    SearchInput: ["aria-label"],
    Section: ["description", "eyebrow", "title"],
    Switch: ["aria-label"],
    Text: ["as"],
  };

  assert.deepEqual(
    Object.fromEntries(
      Object.entries(runtimeCatalogCanonicalProps).map(([name, policies]) => [
        name,
        Object.keys(policies),
      ]),
    ),
    expectedCanonicalProps,
  );
  for (const [componentName, policies] of Object.entries(
    runtimeCatalogCanonicalProps,
  )) {
    const entry = metadataEntry(componentName);
    for (const [propName, policy] of Object.entries(policies)) {
      assert.deepEqual(
        plain(entry.props[propName]),
        plain(policy),
        `${componentName}.${propName} diverged from its reviewed canonical policy.`,
      );
    }
  }

  assert.deepEqual(plain(metadataEntry("Text").props.as), {
    allowedValues: ["h1", "h2", "h3", "p", "span"],
    semantic: "json",
    validatorId: "literal-enum",
  });
  assert.deepEqual(plain(metadataEntry("Box").props.as), {
    allowedValues: ["article", "form"],
    semantic: "json",
    validatorId: "literal-enum",
  });
  assert.equal(metadataEntry("Field").props.label.required, true);
});

test("reviewed URL and asset policies are emitted exactly", () => {
  const reviewedPolicies = Object.fromEntries(
    Object.entries(runtimeCatalogSemanticProps).sort(([left], [right]) =>
      left.localeCompare(right),
    ),
  );
  const actualPolicies = {};
  for (const entry of tavoUiRuntimeCatalogMetadata.entries) {
    for (const [propName, policy] of Object.entries(entry.props)) {
      if (policy.semantic === "url" || policy.semantic === "asset") {
        actualPolicies[`${entry.name}.${propName}`] = plain(policy);
      }
    }
  }
  assert.deepEqual(actualPolicies, plain(reviewedPolicies));

  assert.equal(Object.hasOwn(metadataEntry("Button").props, "href"), false);
  for (const componentName of [
    "Link",
    "Toggle",
    "DropdownMenu.Item",
    "Menubar.Item",
  ]) {
    const output = renderToString(
      tavoUiRuntimeCatalog.resolve(componentName).component({
        href: "/docs",
        children: "Docs",
      }),
    );
    assert.match(output, /href="\/docs"/, `${componentName}.href was not rendered.`);
  }

  for (const entry of tavoUiRuntimeCatalogMetadata.entries) {
    for (const propName of ["downloadUrl", "href", "src", "to", "url"]) {
      const policy = entry.props[propName];
      if (!policy) continue;
      assert.equal(
        policy.semantic === "url" || policy.semantic === "asset",
        true,
        `${entry.name}.${propName} must use an explicit URL or asset policy.`,
      );
      assert.notEqual(policy.validatorId, "string");
    }
  }
});

test("navigation URL entries expose projection-compatible press adapters", () => {
  const navigationEntries = [];
  for (const entry of tavoUiRuntimeCatalogMetadata.entries) {
    const hasNavigationProp = Object.values(entry.props).some(
      (policy) =>
        policy.semantic === "url" &&
        ["internal-route", "external-link", "download"].includes(
          policy.urlPolicy,
        ),
    );
    if (!hasNavigationProp) continue;

    navigationEntries.push(entry.name);
    assert.deepEqual(
      plain(entry.events.press),
      { prop: "onClick", value: "argument" },
      `${entry.name} would fail runtime navigation projection without a reviewed press adapter.`,
    );
    assert.equal(entry.handlerProps.includes("onClick"), true);
    assert.equal(entry.capabilities.includes("semantic-events"), true);
  }
  assert.deepEqual(navigationEntries.sort(), [
    "DropdownMenu.Item",
    "Link",
    "Menubar.Item",
    "Toggle",
  ]);

  for (const componentName of ["DropdownMenu.Item", "Menubar.Item"]) {
    let receivedEvent;
    const projectedEvent = {
      currentTarget: { closest: () => null },
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
    };
    const itemNode = tavoUiRuntimeCatalog.resolve(componentName).component({
      href: "/docs",
      children: "Docs",
      onClick: (event) => {
        receivedEvent = event;
      },
    });
    assert.equal(itemNode.props.href, "/docs");
    assert.equal(typeof itemNode.type, "function");

    const renderedLink = itemNode.type(itemNode.props);
    assert.equal(typeof renderedLink.props.onClick, "function");
    renderedLink.props.onClick(projectedEvent);
    assert.equal(
      receivedEvent,
      projectedEvent,
      `${componentName} did not forward the runtime-owned onClick handler.`,
    );
  }
});

test("executable entries have a closed UI-owned shape", () => {
  const entries = tavoUiRuntimeCatalog.list();
  assert.equal(Object.isFrozen(entries), true);
  assert.equal(Object.isFrozen(tavoUiRuntimeCatalogMetadata), true);

  for (const [index, entry] of entries.entries()) {
    assert.deepEqual(Object.keys(entry).sort(), [
      "component",
      "instrumentationAdapter",
      "metadata",
    ]);
    assert.equal(entry.metadata, tavoUiRuntimeCatalogMetadata.entries[index]);
    assert.equal(typeof entry.component, "function");
    assert.equal(typeof entry.instrumentationAdapter.render, "function");
    assert.equal(Object.hasOwn(entry, "events"), false);
    assert.equal(Object.hasOwn(entry, "props"), false);
    assert.equal(Object.hasOwn(entry.metadata, "instrumentationAdapter"), false);
  }

  const adapters = entries.map((entry) => entry.instrumentationAdapter);
  assert.equal(new Set(adapters).size, 2);
});

test("trusted single-root and range adapters register and dispose owned targets", () => {
  const singleCalls = [];
  const singleInstrumentation = {
    registerElement(entityId, element) {
      const call = { kind: "element", entityId, element, disposed: 0 };
      singleCalls.push(call);
      return {
        dispose() {
          call.disposed += 1;
        },
      };
    },
    registerRange() {
      assert.fail("single-root adapter registered a range");
    },
    registerPortalHost() {
      assert.fail("single-root adapter registered a portal host");
    },
    rendered() {},
  };
  const component = () => null;
  const singleVNode = tavoUiRuntimeCatalog
    .resolve("Button")
    .instrumentationAdapter.render({
      entityId: "entity_001",
      component,
      props: { id: "save" },
      children: ["Save"],
      instrumentation: singleInstrumentation,
    });
  assert.equal(singleVNode.type, component);
  assert.equal(singleVNode.props.id, "save");
  assert.deepEqual(singleVNode.props.children, ["Save"]);

  const firstElement = { id: "first" };
  const secondElement = { id: "second" };
  singleVNode.props.ref(firstElement);
  assert.deepEqual(singleCalls.map(({ kind, entityId, element }) => ({ kind, entityId, element })), [
    { kind: "element", entityId: "entity_001", element: firstElement },
  ]);
  singleVNode.props.ref(secondElement);
  assert.equal(singleCalls[0].disposed, 1);
  assert.equal(singleCalls[1].element, secondElement);
  singleVNode.props.ref(null);
  assert.equal(singleCalls[1].disposed, 1);

  const rangeCalls = [];
  const rangeInstrumentation = {
    registerElement() {
      assert.fail("range adapter registered a single element");
    },
    registerRange(entityId, start, end) {
      const call = { kind: "range", entityId, start, end, disposed: 0 };
      rangeCalls.push(call);
      return {
        dispose() {
          call.disposed += 1;
        },
      };
    },
    registerPortalHost() {
      assert.fail("range adapter registered a portal host");
    },
    rendered() {},
  };
  const rangeVNode = tavoUiRuntimeCatalog
    .resolve("Alert")
    .instrumentationAdapter.render({
      entityId: "entity_002",
      component,
      props: { tone: "info" },
      children: ["Message"],
      instrumentation: rangeInstrumentation,
    });
  const [startBoundary, renderedComponent, endBoundary] =
    rangeVNode.props.children;
  assert.equal(startBoundary.type, "template");
  assert.equal(startBoundary.props["data-tavo-runtime-boundary"], "start");
  assert.equal(renderedComponent.type, component);
  assert.equal(endBoundary.type, "template");
  assert.equal(endBoundary.props["data-tavo-runtime-boundary"], "end");

  const firstStart = { id: "start-1" };
  const secondStart = { id: "start-2" };
  const end = { id: "end" };
  startBoundary.props.ref(firstStart);
  assert.equal(rangeCalls.length, 0);
  endBoundary.props.ref(end);
  assert.deepEqual(
    rangeCalls.map(({ kind, entityId, start, end: rangeEnd }) => ({
      kind,
      entityId,
      start,
      end: rangeEnd,
    })),
    [{ kind: "range", entityId: "entity_002", start: firstStart, end }],
  );
  startBoundary.props.ref(secondStart);
  assert.equal(rangeCalls[0].disposed, 1);
  assert.equal(rangeCalls[1].start, secondStart);
  assert.equal(rangeCalls[1].end, end);
  endBoundary.props.ref(null);
  assert.equal(rangeCalls[1].disposed, 1);
  assert.equal(rangeCalls.length, 2);
});

test("all executable entries render through trusted adapters and mount component styles", () => {
  const instrumentation = {
    registerElement() {
      return { dispose() {} };
    },
    registerRange() {
      return { dispose() {} };
    },
    registerPortalHost() {
      return { dispose() {} };
    },
    rendered() {},
  };
  const sampleValue = (policy) => {
    switch (policy.validatorId) {
      case "string":
      case "class-name":
        return "sample";
      case "finite-number":
        return 1;
      case "boolean":
        return false;
      case "literal-enum":
        return policy.allowedValues[0];
      case "string-list":
      case "json-array":
        return [];
      case "json-record":
      case "json":
        return {};
      case "url-string":
        return "/sample";
      case "asset-reference":
        return null;
      default:
        assert.fail(`Unknown validator '${policy.validatorId}'.`);
    }
  };

  const styleRegistry = createStyleRegistry();
  const outputs = withStyleRegistry(styleRegistry, () =>
    tavoUiRuntimeCatalog.list().map((entry, index) => {
      const props = Object.fromEntries(
        Object.entries(entry.metadata.props)
          .filter(([, policy]) => policy.required)
          .map(([name, policy]) => [name, sampleValue(policy)]),
      );
      return renderToString(
        entry.instrumentationAdapter.render({
          entityId: `entity_${String(index).padStart(3, "0")}`,
          component: entry.component,
          props,
          children: [],
          instrumentation,
        }),
      );
    }),
  );

  assert.equal(outputs.length, 150);
  assert.equal(outputs.every((output) => typeof output === "string"), true);
  assert.ok(styleRegistry.entries().length >= 80);
  assert.equal(styleRegistry.has("tui.tb"), true);
});

test("UI package has no external catalog authority dependencies", () => {
  const runtimePackageName = "@tavojs/" + "template-runtime";
  const authorityPackageName = ["@tavojs", "template-contract"].join("/");
  assert.equal(JSON.stringify(packageJson).includes(runtimePackageName), false);
  assert.equal(JSON.stringify(packageJson).includes(authorityPackageName), false);

  const sourceFiles = ["src", "scripts", "tests", "dist"].flatMap((directory) =>
    listSourceFiles(path.join(uiRoot, directory)),
  );
  const packageFiles = [
    ...sourceFiles,
    path.join(uiRoot, "package.json"),
    path.join(uiRoot, "README.md"),
    path.join(uiRoot, "CHANGELOG.md"),
    path.resolve(uiRoot, "../../package-lock.json"),
  ];
  const offenders = packageFiles.filter((filePath) => {
    const source = readFileSync(filePath, "utf8");
    return (
      source.includes(runtimePackageName) || source.includes(authorityPackageName)
    );
  });
  assert.deepEqual(offenders, []);
});
