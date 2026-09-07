import type { Child, Component } from "@tavojs/core/runtime";

/**
 * Raw UI-owned policy facts. Consumers are responsible for interpreting and
 * validating these serializable records at their own trust boundary.
 */
export type RuntimeComponentPropMetadata = Readonly<Record<string, unknown>>;

export type RuntimeComponentEventMetadata = Readonly<Record<string, unknown>>;

export type RuntimeComponentCatalogEntryMetadata = Readonly<{
  name: string;
  aliases: readonly string[];
  handlerProps: readonly string[];
  events: Readonly<Record<string, RuntimeComponentEventMetadata>>;
  props: Readonly<Record<string, RuntimeComponentPropMetadata>>;
  instrumentation: "single-root" | "range";
  capabilities: readonly string[];
  source: Readonly<{
    kind: string;
    packageName: string;
    packageVersion: string;
  }>;
}>;

export type RuntimeComponentCatalogMetadata = Readonly<{
  formatVersion: number;
  entries: readonly RuntimeComponentCatalogEntryMetadata[];
}>;

export type RuntimeInstrumentationRegistration = Readonly<{
  dispose(): void;
}>;

export type CanonicalRuntimeInstrumentation = Readonly<{
  registerElement(
    entityId: string,
    element: Element,
  ): RuntimeInstrumentationRegistration;
  registerRange(
    entityId: string,
    start: Node,
    end: Node,
  ): RuntimeInstrumentationRegistration;
  registerPortalHost(
    entityId: string,
    portalHostId: string,
    element: Element,
  ): RuntimeInstrumentationRegistration;
  rendered(result: never): void;
}>;

export type RuntimeComponentInstrumentationAdapter = Readonly<{
  render(
    input: Readonly<{
      entityId: string;
      component: Component<Record<string, unknown>>;
      props: Readonly<Record<string, unknown>>;
      children: readonly Child[];
      instrumentation: CanonicalRuntimeInstrumentation;
    }>,
  ): Child;
}>;

export type RuntimeComponentEntry = Readonly<{
  metadata: RuntimeComponentCatalogEntryMetadata;
  component: Component<Record<string, unknown>>;
  instrumentationAdapter: RuntimeComponentInstrumentationAdapter;
}>;

export type RuntimeComponentCatalog = Readonly<{
  metadata: RuntimeComponentCatalogMetadata;
  resolve(name: string): RuntimeComponentEntry | undefined;
  list(): readonly RuntimeComponentEntry[];
}>;
