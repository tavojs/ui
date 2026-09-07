import assert from "node:assert/strict";
import test from "node:test";
import {
  componentMetadata,
  findComponentsForIntent,
  getAgentComponentGuide,
  getComponentMetadata,
  getComponentsByCategory,
} from "../dist/metadata.js";

const requiredFields = [
  "name",
  "slug",
  "category",
  "importPath",
  "cssImportPath",
  "description",
  "status",
  "summary",
  "whenToUse",
  "avoidWhen",
  "props",
  "examples",
  "composition",
  "accessibilityGuidance",
  "searchTerms",
];
const a11yCriticalComponents = new Set([
  "Button",
  "Checkbox",
  "ColorPicker",
  "Combobox",
  "CommandMenu",
  "ConfirmDialog",
  "DatePicker",
  "Dialog",
  "DropdownMenu",
  "Sheet",
  "Field",
  "FileTrigger",
  "FocusTrap",
  "NumberInput",
  "ObjectField",
  "Pagination",
  "Progress",
  "Radio",
  "RadioGroup",
  "SearchInput",
  "ToggleGroup",
  "Select",
  "Slider",
  "Switch",
  "Table",
  "Tabs",
  "Textarea",
  "TextInput",
  "Toast",
  "Tooltip",
  "TreeView",
  "VisuallyHidden",
]);

test("componentMetadata exposes complete agent-facing records for every public component", () => {
  assert.equal(componentMetadata.length, 85);

  for (const component of componentMetadata) {
    for (const field of requiredFields) {
      assert.ok(component[field], `${component.name} should include ${field}`);
    }

    assert.match(
      component.importPath,
      new RegExp(`@tavojs/ui/${component.slug}$`)
    );
    assert.match(
      component.cssImportPath,
      new RegExp(`@tavojs/ui/css/${component.slug}$`)
    );
    assert.ok(
      component.props.length >= 1,
      `${component.name} should document props`
    );
    assert.ok(
      component.examples.length >= 1,
      `${component.name} should document an example`
    );
    assert.equal(
      component.examples.some(
        (example) =>
          example.code === `<${component.name}>...</${component.name}>`
      ),
      false,
      `${component.name} should not use the generic placeholder example`
    );
    assert.ok(
      component.whenToUse.includes(component.name) ||
        component.whenToUse.includes("`"),
      `${component.name} should have component-specific usage guidance`
    );
    assert.ok(
      component.props.some((prop) => prop.description.length > 0),
      `${component.name} should document meaningful prop guidance`
    );
    assert.ok(
      component.accessibilityGuidance.summary,
      `${component.name} should document accessibility guidance`
    );
    assert.ok(
      component.accessibilityGuidance.checklist.length >= 1,
      `${component.name} should document an accessibility checklist`
    );
    assert.ok(
      component.searchTerms.length >= 1,
      `${component.name} should expose search terms for intent matching`
    );
    assert.ok(
      component.status === "stable" || component.status === "experimental",
      `${component.name} should use a current component status`
    );
    assert.ok(component.authoring, `${component.name} should expose authoring metadata`);
    for (const propName of component.authoring.designProps) {
      const prop = component.props.find((candidate) => candidate.name === propName);
      assert.ok(prop?.authoring, `${component.name}.${propName} should have an authoring target`);
    }
    for (const member of component.composition.compoundMembers ?? []) {
      assert.ok(
        component.authoring.members?.[member],
        `${component.name}.${member} should declare member authoring coverage`
      );
    }
  }
});

test("design authoring metadata keeps curated and documented props", () => {
  const button = componentMetadata.find((component) => component.name === "Button");
  assert.ok(button?.props.some((prop) => prop.name === "size"));
  assert.deepEqual(
    button?.props.find((prop) => prop.name === "size")?.authoring?.choices,
    ["sm", "md", "lg"]
  );
  assert.deepEqual(
    button?.authoring.designProps.sort(),
    ["size", "tone", "variant"]
  );
  assert.deepEqual(
    componentMetadata.find((component) => component.name === "Card")
      ?.authoring.members?.Content.designProps,
    []
  );
});

test("only Icon exposes the implementation component prop", () => {
  assert.deepEqual(
    componentMetadata
      .filter((component) =>
        component.props.some((prop) => prop.name === "component")
      )
      .map((component) => component.name),
    ["Icon"]
  );
});

test("critical components have structured accessibility guidance", () => {
  const critical = componentMetadata.filter((component) =>
    a11yCriticalComponents.has(component.name)
  );

  assert.equal(critical.length, a11yCriticalComponents.size);
  assert.equal(
    critical.every((component) =>
      Boolean(component.accessibilityGuidance.summary)
    ),
    true
  );
});

test("metadata helpers resolve components by name, slug, category, and intent", () => {
  assert.equal(getComponentMetadata("Button")?.slug, "button");
  assert.equal(getComponentMetadata("text-input")?.name, "TextInput");
  assert.equal(getComponentMetadata("Carousel"), undefined);
  assert.equal(getComponentMetadata("LiveRegion"), undefined);
  assert.ok(
    getComponentsByCategory("forms").some(
      (component) => component.name === "Field"
    )
  );

  const intentMatches = findComponentsForIntent("modal dialog focus");
  assert.equal(intentMatches[0]?.name, "Dialog");
});

test("compound component metadata exposes expected members", () => {
  assert.deepEqual(getComponentMetadata("Card")?.composition.compoundMembers, [
    "Root",
    "Header",
    "Media",
    "Content",
    "Actions",
  ]);
  assert.deepEqual(getComponentMetadata("Sheet")?.composition.compoundMembers, [
    "Root",
    "Trigger",
    "Content",
    "Close",
  ]);
  assert.deepEqual(getComponentMetadata("Tabs")?.composition.compoundMembers, [
    "Root",
    "List",
    "Trigger",
    "Content",
    "Indicator",
  ]);
  assert.deepEqual(getComponentMetadata("Table")?.composition.compoundMembers, [
    "Root",
    "Caption",
    "Head",
    "Body",
    "Row",
    "HeaderCell",
    "Cell",
    "Data",
  ]);
  assert.deepEqual(getComponentMetadata("Dialog")?.composition.compoundMembers, [
    "Root",
    "Content",
    "Header",
    "Body",
    "Footer",
  ]);
  assert.deepEqual(getComponentMetadata("Field")?.composition.compoundMembers, [
    "Root",
    "Message",
    "Fieldset",
    "Legend",
  ]);
  assert.deepEqual(getComponentMetadata("Menubar")?.composition.compoundMembers, [
    "Root",
    "Item",
  ]);
  assert.deepEqual(
    getComponentMetadata("Popover")?.composition.compoundMembers,
    ["Root", "Trigger", "Content", "Close"]
  );
  assert.deepEqual(getComponentMetadata("TreeView")?.composition.compoundMembers, ["Root", "Item"]);
});

test("intent search ranks common agent queries to the expected components", () => {
  const expectations = {
    "date input": "DatePicker",
    modal: "Dialog",
    "data table": "Table",
    "empty state": "EmptyState",
    "sidebar layout": "Sidebar",
    "icon only action": "Button",
  };

  for (const [query, expected] of Object.entries(expectations)) {
    assert.equal(findComponentsForIntent(query)[0]?.name, expected);
  }
});

test("getAgentComponentGuide returns compact import and usage guidance", () => {
  const guide = getAgentComponentGuide("button");

  assert.equal(guide?.component, "Button");
  assert.equal(guide?.importPath, "@tavojs/ui/button");
  assert.equal(guide?.cssImportPath, "@tavojs/ui/css/button");
  assert.ok(guide?.props.some((prop) => prop.name === "variant"));
  assert.match(guide?.examples[0]?.code ?? "", /<Button/);
  assert.ok(Array.isArray(guide?.related));
});
