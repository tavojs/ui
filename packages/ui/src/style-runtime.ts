export type StyleOptions = {
  attributes?: Record<string, string | number | boolean>;
};

type GlobalStyleRuntime = {
  style(id: string, css: string, options?: StyleOptions): void;
};

type ClientStyleEntry = {
  node: HTMLStyleElement;
  references: number;
  cleanupRequested: boolean;
  cleanupScheduled: boolean;
};

type ClientStyleCache = WeakMap<Document, Map<string, ClientStyleEntry>>;

const GLOBAL_STYLE_RUNTIME_KEY = Symbol.for("tavo.style.runtime");
const GLOBAL_CLIENT_STYLE_CACHE_KEY = Symbol.for("tavo.style.client-cache");

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

function getClientStyles(targetDocument: Document): Map<string, ClientStyleEntry> {
  const cache = getClientStyleCache();
  let styles = cache.get(targetDocument);
  if (!styles) {
    styles = new Map();
    for (const node of targetDocument.head.querySelectorAll<HTMLStyleElement>(
      "style[data-tavo-style]"
    )) {
      const id = node.getAttribute("data-tavo-style");
      if (id && !styles.has(id)) {
        styles.set(id, {
          node,
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

function removeClientStyle(
  styles: Map<string, ClientStyleEntry>,
  id: string,
  entry: ClientStyleEntry
): void {
  if (styles.get(id) !== entry) {
    return;
  }
  if (typeof entry.node.remove === "function") {
    entry.node.remove();
  } else {
    entry.node.parentNode?.removeChild(entry.node);
  }
  styles.delete(id);
}

function ensureClientStyle(id: string, css: string, options?: StyleOptions): void {
  if (typeof document === "undefined" || !id) {
    return;
  }
  const styles = getClientStyles(document);
  const existing = styles.get(id);
  if (existing && existing.node.isConnected) {
    existing.cleanupRequested = false;
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
  if (runtime) {
    runtime.style(id, css, options);
    return;
  }
  ensureClientStyle(id, css, options);
}

export const useStyle = style;
