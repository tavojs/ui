import {
  Fragment,
  h,
  type Component,
} from "@tavojs/core/runtime";
import { generatedTavoUiRuntimeCatalogComponents } from "./components.generated.ts";
import { generatedTavoUiRuntimeCatalogMetadata } from "./metadata.generated.ts";
import type {
  RuntimeComponentCatalog,
  RuntimeComponentCatalogEntryMetadata,
  RuntimeComponentInstrumentationAdapter,
  RuntimeComponentEntry,
  RuntimeInstrumentationRegistration,
} from "./types.ts";

export type {
  CanonicalRuntimeInstrumentation,
  RuntimeComponentCatalog,
  RuntimeComponentCatalogEntryMetadata,
  RuntimeComponentCatalogMetadata,
  RuntimeComponentEntry,
  RuntimeComponentEventMetadata,
  RuntimeComponentInstrumentationAdapter,
  RuntimeComponentPropMetadata,
  RuntimeInstrumentationRegistration,
} from "./types.ts";

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreeze(child);
    }
  }
  return value;
}

function disposeRegistration(
  registration: RuntimeInstrumentationRegistration | undefined,
): undefined {
  registration?.dispose();
  return undefined;
}

const singleRootInstrumentationAdapter: RuntimeComponentInstrumentationAdapter =
  Object.freeze({
    render(input) {
      let registration: RuntimeInstrumentationRegistration | undefined;
      const ref = (element: Element | null) => {
        registration = disposeRegistration(registration);
        if (element) {
          registration = input.instrumentation.registerElement(
            input.entityId,
            element,
          );
        }
      };
      return h(
        input.component,
        { ...input.props, ref },
        ...input.children,
      );
    },
  });

const rangeInstrumentationAdapter: RuntimeComponentInstrumentationAdapter =
  Object.freeze({
    render(input) {
      let start: Element | undefined;
      let end: Element | undefined;
      let registration: RuntimeInstrumentationRegistration | undefined;
      const updateRegistration = () => {
        registration = disposeRegistration(registration);
        if (start && end) {
          registration = input.instrumentation.registerRange(
            input.entityId,
            start,
            end,
          );
        }
      };
      const startRef = (element: Element | null) => {
        start = element ?? undefined;
        updateRegistration();
      };
      const endRef = (element: Element | null) => {
        end = element ?? undefined;
        updateRegistration();
      };
      return h(
        Fragment,
        { key: `${input.entityId}:instrumented-range` },
        h("template", {
          key: `${input.entityId}:range-start`,
          ref: startRef,
          "data-tavo-runtime-boundary": "start",
        }),
        h(input.component, { ...input.props }, ...input.children),
        h("template", {
          key: `${input.entityId}:range-end`,
          ref: endRef,
          "data-tavo-runtime-boundary": "end",
        }),
      );
    },
  });

const trustedInstrumentationAdapters: Readonly<
  Record<
    RuntimeComponentCatalogEntryMetadata["instrumentation"],
    RuntimeComponentInstrumentationAdapter
  >
> = Object.freeze({
  "single-root": singleRootInstrumentationAdapter,
  range: rangeInstrumentationAdapter,
});

function resolvePublicComponent(
  canonicalName: string,
): Component<Record<string, unknown>> {
  const candidate = generatedTavoUiRuntimeCatalogComponents[canonicalName];
  if (typeof candidate !== "function") {
    throw new TypeError(
      `Runtime catalog component '${canonicalName}' is not publicly executable.`,
    );
  }
  return candidate as Component<Record<string, unknown>>;
}

export const tavoUiRuntimeCatalogMetadata = deepFreeze(
  generatedTavoUiRuntimeCatalogMetadata,
);

const executableEntries = Object.freeze(
  tavoUiRuntimeCatalogMetadata.entries.map((metadata) => {
    const adapter = trustedInstrumentationAdapters[metadata.instrumentation];
    if (!adapter) {
      throw new TypeError(
        `No trusted instrumentation adapter exists for '${metadata.name}'.`,
      );
    }
    return Object.freeze({
      metadata,
      component: resolvePublicComponent(metadata.name),
      instrumentationAdapter: adapter,
    });
  }),
);

const entriesByName = new Map<string, RuntimeComponentEntry>();
for (const entry of executableEntries) {
  for (const name of [entry.metadata.name, ...entry.metadata.aliases]) {
    const key = name.toLowerCase();
    const existing = entriesByName.get(key);
    if (existing && existing !== entry) {
      throw new TypeError(
        `Runtime catalog name '${name}' conflicts with '${existing.metadata.name}'.`,
      );
    }
    entriesByName.set(key, entry);
  }
}

export const tavoUiRuntimeCatalog: RuntimeComponentCatalog = Object.freeze({
  metadata: tavoUiRuntimeCatalogMetadata,
  resolve(name) {
    return entriesByName.get(name.toLowerCase());
  },
  list() {
    return executableEntries;
  },
});

export default tavoUiRuntimeCatalog;
