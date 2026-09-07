export type StyleOptions = {
  attributes?: Record<string, string | number | boolean>;
};

type GlobalStyleRuntime = {
  getActiveStyleRegistry?(): unknown;
  style(id: string, css: string, options?: StyleOptions): void;
};

type ClientStyleGroup = {
  cache: ClientStyleGroupCache;
  document: Document;
  layerPrefix: string;
  node: HTMLStyleElement;
  rules: Map<string, string>;
  flushScheduled: boolean;
};

type ClientStyleEntry = {
  node: HTMLStyleElement;
  css: string;
  group?: ClientStyleGroup;
  references: number;
  cleanupRequested: boolean;
  cleanupScheduled: boolean;
};

type ClientStyleCache = WeakMap<Document, Map<string, ClientStyleEntry>>;
type ClientStyleGroupCache = WeakMap<Document, ClientStyleGroup>;

const GLOBAL_STYLE_RUNTIME_KEY = Symbol.for("tavo.style.runtime");
const GLOBAL_CLIENT_STYLE_CACHE_KEY = Symbol.for("tavo.style.client-cache");
const GLOBAL_CLIENT_SX_GROUP_CACHE_KEY = Symbol.for("tavo.style.client-sx-group-cache");
const GLOBAL_CLIENT_COMPONENT_GROUP_CACHE_KEY = Symbol.for(
  "tavo.style.client-component-group-cache"
);
const SX_STYLE_PREFIX = "tavo-ui.sx.";
const SX_STYLE_GROUP_ID = "tavo-ui.sx";
const COMPONENT_STYLE_PREFIX = "tui.";
const COMPONENT_STYLE_GROUP_ID = "tavo-ui.components";
const UI_LAYER_PRELUDE = "@layer tavo-ui.theme,tavo-ui.components,tavo-ui.overrides;";
const UI_COMPONENT_LAYER_PREFIX = "@layer tavo-ui.components{";
const UI_OVERRIDE_LAYER_PREFIX = "@layer tavo-ui.overrides{";

function getGlobalStyleRuntime(): GlobalStyleRuntime | undefined {
  return (globalThis as typeof globalThis & {
    [GLOBAL_STYLE_RUNTIME_KEY]?: GlobalStyleRuntime;
  })[GLOBAL_STYLE_RUNTIME_KEY];
}

function getClientStyleCache(): ClientStyleCache {
  const target = globalThis as typeof globalThis & {
    [GLOBAL_CLIENT_STYLE_CACHE_KEY]?: ClientStyleCache;
  };
  if (!target[GLOBAL_CLIENT_STYLE_CACHE_KEY]) {
    target[GLOBAL_CLIENT_STYLE_CACHE_KEY] = new WeakMap();
  }
  return target[GLOBAL_CLIENT_STYLE_CACHE_KEY];
}

function getClientStyleGroupCache(): ClientStyleGroupCache {
  const target = globalThis as typeof globalThis & {
    [GLOBAL_CLIENT_SX_GROUP_CACHE_KEY]?: ClientStyleGroupCache;
  };
  if (!target[GLOBAL_CLIENT_SX_GROUP_CACHE_KEY]) {
    target[GLOBAL_CLIENT_SX_GROUP_CACHE_KEY] = new WeakMap();
  }
  return target[GLOBAL_CLIENT_SX_GROUP_CACHE_KEY];
}

function getClientComponentGroupCache(): ClientStyleGroupCache {
  const target = globalThis as typeof globalThis & {
    [GLOBAL_CLIENT_COMPONENT_GROUP_CACHE_KEY]?: ClientStyleGroupCache;
  };
  if (!target[GLOBAL_CLIENT_COMPONENT_GROUP_CACHE_KEY]) {
    target[GLOBAL_CLIENT_COMPONENT_GROUP_CACHE_KEY] = new WeakMap();
  }
  return target[GLOBAL_CLIENT_COMPONENT_GROUP_CACHE_KEY];
}

function getClientStyles(targetDocument: Document): Map<string, ClientStyleEntry> {
  const cache = getClientStyleCache();
  let styles = cache.get(targetDocument);
  if (!styles) {
    styles = new Map();
    for (const node of targetDocument.head.querySelectorAll<HTMLStyleElement>(
      "style[data-tavo-style]"
    )) {
      const id = node.getAttribute("data-tavo-style");
      if (
        id &&
        id !== SX_STYLE_GROUP_ID &&
        id !== COMPONENT_STYLE_GROUP_ID &&
        !styles.has(id)
      ) {
        styles.set(id, {
          node,
          css: node.textContent ?? "",
          references: 0,
          cleanupRequested: false,
          cleanupScheduled: false
        });
      }
    }
    cache.set(targetDocument, styles);
  }
  return styles;
}

function removeNode(node: HTMLStyleElement): void {
  if (typeof node.remove === "function") {
    node.remove();
  } else {
    node.parentNode?.removeChild(node);
  }
}

function isExternalStyle(node: HTMLStyleElement): boolean {
  return (
    typeof node.hasAttribute === "function" && node.hasAttribute("data-tavo-style-external")
  );
}

function groupedStyleCss(rules: Map<string, string>, layerPrefix: string): string {
  let layeredCss = "";
  let fallbackCss = "";
  for (const rule of rules.values()) {
    const normalized = rule.startsWith(UI_LAYER_PRELUDE)
      ? rule.slice(UI_LAYER_PRELUDE.length)
      : rule;
    if (normalized.startsWith(layerPrefix) && normalized.endsWith("}")) {
      layeredCss += normalized.slice(layerPrefix.length, -1);
    } else {
      fallbackCss += normalized;
    }
  }
  return `${UI_LAYER_PRELUDE}${layerPrefix}${layeredCss}}${fallbackCss}`;
}

function scheduleStyleGroupFlush(group: ClientStyleGroup): void {
  if (group.flushScheduled) {
    return;
  }
  group.flushScheduled = true;
  queueMicrotask(() => {
    group.flushScheduled = false;
    if (group.rules.size > 0 && group.node.isConnected) {
      group.node.textContent = groupedStyleCss(group.rules, group.layerPrefix);
    }
  });
}

function applyHydratedNonce(source: HTMLStyleElement | undefined, target: HTMLStyleElement): void {
  const nonce = source?.getAttribute("nonce");
  if (nonce) {
    target.setAttribute("nonce", nonce);
  }
}

function getClientStyleGroup(
  targetDocument: Document,
  styles: Map<string, ClientStyleEntry>,
  cache: ClientStyleGroupCache,
  groupId: string,
  layerPrefix: string,
  hydratedSource?: HTMLStyleElement
): ClientStyleGroup {
  const existing = cache.get(targetDocument);
  if (existing && existing.node.isConnected) {
    return existing;
  }

  const node = targetDocument.createElement("style");
  node.setAttribute("data-tavo-style", groupId);
  applyHydratedNonce(hydratedSource, node);
  targetDocument.head.appendChild(node);
  if (existing) {
    existing.node = node;
    for (const entry of styles.values()) {
      if (entry.group === existing) {
        entry.node = node;
      }
    }
    scheduleStyleGroupFlush(existing);
    return existing;
  }
  const group: ClientStyleGroup = {
    cache,
    document: targetDocument,
    layerPrefix,
    node,
    rules: new Map(),
    flushScheduled: false
  };
  cache.set(targetDocument, group);
  return group;
}

function removeClientStyle(
  styles: Map<string, ClientStyleEntry>,
  id: string,
  entry: ClientStyleEntry
): void {
  if (styles.get(id) !== entry) {
    return;
  }
  if (isExternalStyle(entry.node)) {
    entry.cleanupRequested = false;
    return;
  }
  if (entry.group) {
    const group = entry.group;
    group.rules.delete(id);
    styles.delete(id);
    if (group.rules.size === 0) {
      removeNode(group.node);
      group.cache.delete(group.document);
    } else {
      scheduleStyleGroupFlush(group);
    }
    return;
  }
  removeNode(entry.node);
  styles.delete(id);
}

function ensureGroupedClientStyle(
  id: string,
  css: string,
  cache: ClientStyleGroupCache,
  groupId: string,
  layerPrefix: string
): void {
  const styles = getClientStyles(document);
  const existing = styles.get(id);
  if (existing && existing.node.isConnected) {
    existing.cleanupRequested = false;
    const isExternal = isExternalStyle(existing.node);
    if (!existing.group && !isExternal) {
      const hydratedNode = existing.node;
      const group = getClientStyleGroup(
        document,
        styles,
        cache,
        groupId,
        layerPrefix,
        hydratedNode
      );
      const hydratedNonce = hydratedNode.getAttribute("nonce");
      const groupNonce = group.node.getAttribute("nonce");
      if (hydratedNonce && hydratedNonce !== groupNonce) {
        return;
      }
      group.rules.set(id, css);
      existing.node = group.node;
      existing.css = css;
      existing.group = group;
      removeNode(hydratedNode);
      scheduleStyleGroupFlush(group);
    } else if (existing.group && existing.css !== css) {
      existing.css = css;
      existing.group.rules.set(id, css);
      scheduleStyleGroupFlush(existing.group);
    }
    return;
  }
  if (existing) {
    styles.delete(id);
  }

  const group = getClientStyleGroup(document, styles, cache, groupId, layerPrefix);
  group.rules.set(id, css);
  styles.set(id, {
    node: group.node,
    css,
    group,
    references: 0,
    cleanupRequested: false,
    cleanupScheduled: false
  });
  scheduleStyleGroupFlush(group);
}

function ensureClientStyle(id: string, css: string, options?: StyleOptions): void {
  if (typeof document === "undefined" || !id) {
    return;
  }
  const styles = getClientStyles(document);
  const existing = styles.get(id);
  if (existing && existing.node.isConnected) {
    existing.cleanupRequested = false;
    if (existing.css !== css && !isExternalStyle(existing.node)) {
      existing.node.textContent = css;
      existing.css = css;
    }
    return;
  }
  if (existing) {
    styles.delete(id);
  }
  const node = document.createElement("style");
  node.setAttribute("data-tavo-style", id);
  for (const [key, value] of Object.entries(options?.attributes ?? {})) {
    if (!/^[A-Za-z_:][A-Za-z0-9:._-]*$/.test(key) || value === false) {
      continue;
    }
    node.setAttribute(key, value === true ? "" : String(value));
  }
  node.textContent = css;
  document.head.appendChild(node);
  styles.set(id, {
    node,
    css,
    references: 0,
    cleanupRequested: false,
    cleanupScheduled: false
  });
}

export function retainClientStyle(id: string): () => void {
  if (typeof document === "undefined" || !id) {
    return () => {};
  }
  const styles = getClientStyles(document);
  const entry = styles.get(id);
  if (!entry) {
    return () => {};
  }
  entry.references += 1;
  let active = true;
  return () => {
    if (!active) {
      return;
    }
    active = false;
    entry.references = Math.max(0, entry.references - 1);
    if (entry.references === 0 && entry.cleanupRequested) {
      removeClientStyle(styles, id, entry);
    }
  };
}

export function requestClientStyleCleanup(id: string): void {
  if (typeof document === "undefined" || !id) {
    return;
  }
  const styles = getClientStyles(document);
  const entry = styles.get(id);
  if (!entry) {
    return;
  }
  entry.cleanupRequested = true;
  if (entry.cleanupScheduled) {
    return;
  }
  entry.cleanupScheduled = true;
  queueMicrotask(() => {
    entry.cleanupScheduled = false;
    if (entry.references === 0 && entry.cleanupRequested) {
      removeClientStyle(styles, id, entry);
    }
  });
}

export function style(id: string, css: string, options?: StyleOptions): void {
  const runtime = getGlobalStyleRuntime();
  if (runtime?.getActiveStyleRegistry?.()) {
    runtime.style(id, css, options);
    return;
  }
  if (typeof document !== "undefined") {
    if (id.startsWith(SX_STYLE_PREFIX)) {
      ensureGroupedClientStyle(
        id,
        css,
        getClientStyleGroupCache(),
        SX_STYLE_GROUP_ID,
        UI_OVERRIDE_LAYER_PREFIX
      );
    } else if (id.startsWith(COMPONENT_STYLE_PREFIX)) {
      ensureGroupedClientStyle(
        id,
        css,
        getClientComponentGroupCache(),
        COMPONENT_STYLE_GROUP_ID,
        UI_COMPONENT_LAYER_PREFIX
      );
    } else {
      ensureClientStyle(id, css, options);
    }
    return;
  }
  if (runtime) {
    runtime.style(id, css, options);
  }
}

export const useStyle = style;
