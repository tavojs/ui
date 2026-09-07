import {
  createStore,
  type Store
} from "@tavojs/core/runtime";
import { buildCompressedTheme } from "@/theme/core/build";
import type { ResolvedThemeMode, TavoUiThemeConfig, ThemeMode, ThemeRuntimeState } from "@/theme/types";

const THEME_ATTRIBUTE = "data-tavo-theme";
const THEME_STORAGE_KEY = "tavo-ui.theme";
const LIVE_THEME_STYLE_ID = "tavo-ui.theme.runtime";
let liveThemeInstanceId = 0;
let liveThemeAttributeOwnerId = 0;

type ThemeAttributeLayer = {
  id: number;
  value: string | null;
};

type ThemeAttributeOwnership = {
  baseValue: string | null;
  appliedValue: string | null;
  layers: ThemeAttributeLayer[];
};

const liveThemeAttributeOwnership = new WeakMap<Document, ThemeAttributeOwnership>();

type DeepPartial<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [TKey in keyof T]?: DeepPartial<T[TKey]> }
    : T;

export type ThemeConfigPatch = DeepPartial<TavoUiThemeConfig>;

export type LiveThemeRuntimeState = ThemeRuntimeState & {
  config: TavoUiThemeConfig;
  warnings: string[];
  error: string | null;
  revision: number;
};

export type LiveThemeUpdateResult = {
  applied: boolean;
  warnings: string[];
  error?: string;
};

export type LiveThemeControllerOptions = {
  styleId?: string;
  nonce?: string;
  ownerDocument?: Document;
  styleHost?: HTMLElement;
  persistence?: boolean;
};

export type ThemeControllerOptions = {
  ownerDocument?: Document;
  persistence?: boolean;
};

export type LiveThemeController = {
  store: Store<LiveThemeRuntimeState>;
  setMode(mode: ThemeMode): void;
  toggleMode(): void;
  setConfig(config: TavoUiThemeConfig): LiveThemeUpdateResult;
  patchConfig(patch: ThemeConfigPatch): LiveThemeUpdateResult;
  updateConfig(
    updater: (config: TavoUiThemeConfig) => TavoUiThemeConfig
  ): LiveThemeUpdateResult;
  setProperty(path: string, value: unknown): LiveThemeUpdateResult;
  resetConfig(): LiveThemeUpdateResult;
  syncDocument(): void;
  watchSystem(): () => void;
  dispose(): void;
};

export type LiveThemeSnapshot = LiveThemeRuntimeState & {
  setMode(mode: ThemeMode): void;
  toggleMode(): void;
  setConfig(config: TavoUiThemeConfig): LiveThemeUpdateResult;
  patchConfig(patch: ThemeConfigPatch): LiveThemeUpdateResult;
  updateConfig(
    updater: (config: TavoUiThemeConfig) => TavoUiThemeConfig
  ): LiveThemeUpdateResult;
  setProperty(path: string, value: unknown): LiveThemeUpdateResult;
  resetConfig(): LiveThemeUpdateResult;
};

export type ThemeController = {
  store: Store<ThemeRuntimeState>;
  setMode(mode: ThemeMode): void;
  toggleMode(): void;
  syncDocument(): void;
  watchSystem(): () => void;
};

export type ThemeSnapshot = ThemeRuntimeState & {
  setMode(mode: ThemeMode): void;
  toggleMode(): void;
};

function currentThemeAttribute(root: HTMLElement): string | null {
  return typeof root.getAttribute === "function"
    ? root.getAttribute(THEME_ATTRIBUTE)
    : null;
}

function writeThemeAttributeValue(root: HTMLElement, value: string | null): void {
  if (value === null) root.removeAttribute(THEME_ATTRIBUTE);
  else root.setAttribute(THEME_ATTRIBUTE, value);
}

function createLiveThemeAttributeOwner(
  ownerDocument: Document,
  mode: ThemeMode
): Readonly<{ update(mode: ThemeMode): void; dispose(): void }> {
  const root = ownerDocument.documentElement;
  let ownership = liveThemeAttributeOwnership.get(ownerDocument);
  if (!ownership) {
    const baseValue = currentThemeAttribute(root);
    ownership = { baseValue, appliedValue: baseValue, layers: [] };
    liveThemeAttributeOwnership.set(ownerDocument, ownership);
  }
  const state = ownership;
  const layer: ThemeAttributeLayer = {
    id: ++liveThemeAttributeOwnerId,
    value: mode === "system" ? null : mode
  };
  state.layers.push(layer);
  writeThemeAttributeValue(root, layer.value);
  state.appliedValue = layer.value;
  let active = true;

  return Object.freeze({
    update(nextMode: ThemeMode) {
      if (!active) return;
      layer.value = nextMode === "system" ? null : nextMode;
      if (state.layers.at(-1)?.id === layer.id) {
        writeThemeAttributeValue(root, layer.value);
        state.appliedValue = layer.value;
      }
    },
    dispose() {
      if (!active) return;
      active = false;
      const index = state.layers.findIndex((candidate) => candidate.id === layer.id);
      if (index === -1) return;
      const wasActiveLayer = index === state.layers.length - 1;
      state.layers.splice(index, 1);
      if (
        wasActiveLayer &&
        currentThemeAttribute(root) === state.appliedValue
      ) {
        const nextValue = state.layers.at(-1)?.value ?? state.baseValue;
        writeThemeAttributeValue(root, nextValue);
        state.appliedValue = nextValue;
      }
      if (state.layers.length === 0) {
        liveThemeAttributeOwnership.delete(ownerDocument);
      }
    }
  });
}

function resolveMode(mode: ThemeMode, ownerWindow?: Window): ResolvedThemeMode {
  if (mode === "light" || mode === "dark") {
    return mode;
  }

  if (
    ownerWindow !== undefined &&
    typeof ownerWindow.matchMedia === "function" &&
    ownerWindow.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

function applyThemeAttribute(mode: ThemeMode, ownerDocument?: Document): void {
  const targetDocument = ownerDocument ?? (typeof document !== "undefined" ? document : undefined);
  if (!targetDocument) {
    return;
  }

  const root = targetDocument.documentElement;
  if (mode === "system") {
    root.removeAttribute(THEME_ATTRIBUTE);
    return;
  }

  root.setAttribute(THEME_ATTRIBUTE, mode);
}

function readInitialMode(defaultMode: ThemeMode, ownerWindow?: Window, persistence = true): ThemeMode {
  if (!persistence || ownerWindow === undefined) {
    return defaultMode;
  }

  try {
    const saved = ownerWindow.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
  } catch {
    // Storage can be unavailable in sandboxed or privacy-restricted contexts.
  }

  return defaultMode;
}

function createThemeControllerInternal(
  defaultMode: ThemeMode = "system",
  options: ThemeControllerOptions = {},
  managesDocumentAttribute = true
): ThemeController {
  const ownerDocument = options.ownerDocument ?? (typeof document !== "undefined" ? document : undefined);
  const ownerWindow = options.ownerDocument
    ? options.ownerDocument.defaultView ?? undefined
    : ownerDocument?.defaultView ?? (typeof window !== "undefined" ? window : undefined);
  const persistence = options.persistence !== false;
  const initialMode = readInitialMode(defaultMode, ownerWindow, persistence);
  const store = createStore<ThemeRuntimeState>({
    mode: initialMode,
    resolvedMode: resolveMode(initialMode, ownerWindow)
  });

  function commit(mode: ThemeMode, resolvedMode = resolveMode(mode, ownerWindow)): void {
    const current = store.getState();
    if (current.mode === mode && current.resolvedMode === resolvedMode) {
      if (managesDocumentAttribute) applyThemeAttribute(mode, ownerDocument);
      return;
    }
    store.setState({
      mode,
      resolvedMode
    });
    if (managesDocumentAttribute) applyThemeAttribute(mode, ownerDocument);

    if (persistence && ownerWindow !== undefined && current.mode !== mode) {
      try {
        ownerWindow.localStorage.setItem(THEME_STORAGE_KEY, mode);
      } catch {
        // Theme switching must still work when persistence is blocked.
      }
    }
  }

  return {
    store,
    setMode(mode) {
      commit(mode);
    },
    toggleMode() {
      const current = store.getState();
      commit(current.resolvedMode === "dark" ? "light" : "dark");
    },
    syncDocument() {
      if (managesDocumentAttribute) {
        applyThemeAttribute(store.getState().mode, ownerDocument);
      }
    },
    watchSystem() {
      if (ownerWindow === undefined) {
        return () => {};
      }

      if (typeof ownerWindow.matchMedia !== "function") {
        return () => {};
      }

      const media = ownerWindow.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        if (store.getState().mode === "system") {
          commit("system", media.matches ? "dark" : "light");
        }
      };

      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }
  };
}

export function createThemeController(
  defaultMode: ThemeMode = "system",
  options: ThemeControllerOptions = {}
): ThemeController {
  return createThemeControllerInternal(defaultMode, options, true);
}

export function createThemeControllerFromConfig(config: Pick<TavoUiThemeConfig, "defaultTheme">): ThemeController {
  return createThemeController(config.defaultTheme ?? "system");
}

export function mountThemeController(controller: ThemeController): () => void {
  controller.syncDocument();
  return controller.watchSystem();
}

export function getThemeSnapshot(controller: ThemeController): ThemeSnapshot {
  const state = controller.store.getState();
  return {
    ...state,
    setMode: controller.setMode,
    toggleMode: controller.toggleMode
  };
}

export function subscribeTheme(
  controller: ThemeController,
  listener: (snapshot: ThemeSnapshot) => void,
  options?: { immediate?: boolean }
): () => void {
  if (options?.immediate) {
    listener(getThemeSnapshot(controller));
  }

  return controller.store.subscribe((nextState) => {
    listener({
      ...nextState,
      setMode: controller.setMode,
      toggleMode: controller.toggleMode
    });
  });
}

function cloneConfig<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneConfig(item)) as T;
  }
  if (typeof value !== "object" || value === null) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, cloneConfig(item)])
  ) as T;
}

function mergeConfig<T>(current: T, patch: DeepPartial<T>): T {
  if (
    typeof current !== "object" ||
    current === null ||
    Array.isArray(current) ||
    typeof patch !== "object" ||
    patch === null ||
    Array.isArray(patch)
  ) {
    return cloneConfig(patch) as T;
  }

  const merged = cloneConfig(current) as Record<string, unknown>;
  for (const [key, value] of Object.entries(patch)) {
    const previous = merged[key];
    merged[key] =
      typeof previous === "object" &&
      previous !== null &&
      !Array.isArray(previous) &&
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
        ? mergeConfig(previous, value as DeepPartial<typeof previous>)
        : cloneConfig(value);
  }
  return merged as T;
}

function equalConfigSection(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }
  if (
    typeof left !== "object" ||
    left === null ||
    typeof right !== "object" ||
    right === null ||
    Array.isArray(left) !== Array.isArray(right)
  ) {
    return false;
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((item, index) => equalConfigSection(item, right[index]))
    );
  }

  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftRecord).sort();
  const rightKeys = Object.keys(rightRecord).sort();
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key, index) =>
        key === rightKeys[index] && equalConfigSection(leftRecord[key], rightRecord[key])
    )
  );
}

function liveBuildConfig(config: TavoUiThemeConfig): TavoUiThemeConfig {
  return {
    ...config,
    defaultTheme: "system",
    output: {
      selector: ":root",
      darkSelector: ':root[data-tavo-theme="dark"]',
      includeMediaQuery: true
    }
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function findLiveStyle(
  targetDocument: Document,
  styleId: string,
  styleHost?: HTMLElement
): HTMLStyleElement | undefined {
  return Array.from(
    (styleHost ?? targetDocument.head).querySelectorAll<HTMLStyleElement>(
      "style[data-tavo-style]"
    )
  ).find((node) => node.getAttribute("data-tavo-style") === styleId);
}

function writeLiveStyle(
  css: string,
  styleId: string,
  nonce: string | undefined,
  ownerDocument?: Document,
  styleHost?: HTMLElement
): void {
  const targetDocument = ownerDocument ?? (typeof document !== "undefined" ? document : undefined);
  if (!targetDocument) return;
  const host = styleHost ?? targetDocument.head;
  let node = findLiveStyle(targetDocument, styleId, styleHost);
  if (!node) {
    node = targetDocument.createElement("style");
    node.setAttribute("data-tavo-style", styleId);
    host.appendChild(node);
  }
  if (nonce) {
    node.setAttribute("nonce", nonce);
  }
  node.textContent = css;
}

function removeLiveStyle(
  styleId: string,
  ownerDocument?: Document,
  styleHost?: HTMLElement
): void {
  const targetDocument = ownerDocument ?? (typeof document !== "undefined" ? document : undefined);
  if (!targetDocument) return;
  findLiveStyle(targetDocument, styleId, styleHost)?.remove();
}

export function createLiveThemeController(
  config: TavoUiThemeConfig,
  options: LiveThemeControllerOptions = {}
): LiveThemeController {
  const initialConfig = cloneConfig(config);
  const initialBuild = buildCompressedTheme(liveBuildConfig(initialConfig));
  const explicitOwnerDocument = options.ownerDocument ?? options.styleHost?.ownerDocument;
  const ownerDocument = explicitOwnerDocument ?? (typeof document !== "undefined" ? document : undefined);
  const ownerWindow = explicitOwnerDocument
    ? explicitOwnerDocument.defaultView ?? undefined
    : ownerDocument?.defaultView ?? (typeof window !== "undefined" ? window : undefined);
  const modeController = createThemeControllerInternal(
    initialConfig.defaultTheme ?? "system",
    {
      ownerDocument,
      persistence: options.persistence
    },
    false
  );
  const initialMode = modeController.store.getState();
  const store = createStore<LiveThemeRuntimeState>({
    ...initialMode,
    config: cloneConfig(initialConfig),
    warnings: [...initialBuild.warnings],
    error: null,
    revision: 0
  });
  const isolatedOwner = options.ownerDocument !== undefined || options.styleHost !== undefined || options.persistence === false;
  const requestedStyleId = options.styleId || LIVE_THEME_STYLE_ID;
  const styleId = isolatedOwner
    ? `${requestedStyleId}.${++liveThemeInstanceId}`
    : requestedStyleId;
  let themeAttributeOwner: ReturnType<typeof createLiveThemeAttributeOwner> | undefined;
  let cssText = initialBuild.cssText;
  let synced = false;
  let disposed = false;
  let frame: number | undefined;
  let styleUpdateScheduled = false;
  let scheduledGeneration = 0;
  const systemUnsubscribers = new Set<() => void>();

  function ensureThemeAttributeOwner(): void {
    if (!ownerDocument || themeAttributeOwner) return;
    themeAttributeOwner = createLiveThemeAttributeOwner(
      ownerDocument,
      modeController.store.getState().mode
    );
  }

  function updateOwnedAttributeValue(): void {
    themeAttributeOwner?.update(modeController.store.getState().mode);
  }

  const unsubscribeMode = modeController.store.subscribe((modeState) => {
    store.setState({
      ...store.getState(),
      ...modeState
    });
    updateOwnedAttributeValue();
  });

  function commitError(error: string): LiveThemeUpdateResult {
    const current = store.getState();
    store.setState({
      ...current,
      error
    });
    return { applied: false, warnings: [...current.warnings], error };
  }

  function applyStyle(): void {
    if (!synced || disposed) {
      return;
    }
    writeLiveStyle(cssText, styleId, options.nonce, ownerDocument, options.styleHost);
  }

  function scheduleStyle(): void {
    if (!synced || disposed) {
      return;
    }
    const generation = ++scheduledGeneration;
    if (styleUpdateScheduled) {
      return;
    }
    styleUpdateScheduled = true;

    if (ownerWindow !== undefined && typeof ownerWindow.requestAnimationFrame === "function") {
      frame = ownerWindow.requestAnimationFrame(() => {
        frame = undefined;
        styleUpdateScheduled = false;
        if (generation <= scheduledGeneration) {
          applyStyle();
        }
      });
      return;
    }

    queueMicrotask(() => {
      styleUpdateScheduled = false;
      if (generation <= scheduledGeneration) {
        applyStyle();
      }
    });
  }

  function setConfig(nextConfig: TavoUiThemeConfig): LiveThemeUpdateResult {
    if (disposed) {
      return commitError("Cannot update a disposed live theme controller.");
    }

    const current = store.getState();
    if (!equalConfigSection(current.config.breakpoints, nextConfig.breakpoints)) {
      return commitError("Theme breakpoints are build-time values and cannot be changed live.");
    }
    if (!equalConfigSection(current.config.output, nextConfig.output)) {
      return commitError("Theme output selectors are build-time values and cannot be changed live.");
    }

    try {
      const sourceConfig = cloneConfig(nextConfig);
      const result = buildCompressedTheme(liveBuildConfig(sourceConfig));
      cssText = result.cssText;
      store.setState({
        ...current,
        config: sourceConfig,
        warnings: [...result.warnings],
        error: null,
        revision: current.revision + 1
      });
      scheduleStyle();
      return { applied: true, warnings: [...result.warnings] };
    } catch (error) {
      return commitError(errorMessage(error));
    }
  }

  function patchConfig(patch: ThemeConfigPatch): LiveThemeUpdateResult {
    return setConfig(mergeConfig<TavoUiThemeConfig>(store.getState().config, patch));
  }

  function updateConfig(
    updater: (config: TavoUiThemeConfig) => TavoUiThemeConfig
  ): LiveThemeUpdateResult {
    try {
      return setConfig(updater(cloneConfig(store.getState().config)));
    } catch (error) {
      return commitError(errorMessage(error));
    }
  }

  function setProperty(path: string, value: unknown): LiveThemeUpdateResult {
    const parts = path.split(".").filter(Boolean);
    if (parts.length === 0) {
      return commitError("Theme property path cannot be empty.");
    }
    if (
      parts.some(
        (part) => part === "__proto__" || part === "prototype" || part === "constructor"
      )
    ) {
      return commitError("Theme property path contains an unsafe segment.");
    }

    const nextConfig = cloneConfig(store.getState().config) as unknown as Record<string, unknown>;
    let target = nextConfig;
    for (const part of parts.slice(0, -1)) {
      const child = target[part];
      if (typeof child !== "object" || child === null || Array.isArray(child)) {
        target[part] = {};
      }
      target = target[part] as Record<string, unknown>;
    }
    target[parts.at(-1) as string] = cloneConfig(value);
    return setConfig(nextConfig as unknown as TavoUiThemeConfig);
  }

  const controller: LiveThemeController = {
    store,
    setMode(mode) {
      if (disposed) return;
      ensureThemeAttributeOwner();
      modeController.setMode(mode);
      updateOwnedAttributeValue();
    },
    toggleMode() {
      if (disposed) return;
      ensureThemeAttributeOwner();
      modeController.toggleMode();
      updateOwnedAttributeValue();
    },
    setConfig,
    patchConfig,
    updateConfig,
    setProperty,
    resetConfig() {
      return setConfig(cloneConfig(initialConfig));
    },
    syncDocument() {
      if (disposed) {
        return;
      }
      synced = true;
      ensureThemeAttributeOwner();
      modeController.syncDocument();
      updateOwnedAttributeValue();
      applyStyle();
    },
    watchSystem() {
      if (disposed) return () => {};
      const unwatch = modeController.watchSystem();
      let active = true;
      const trackedUnwatch = () => {
        if (!active) return;
        active = false;
        systemUnsubscribers.delete(trackedUnwatch);
        unwatch();
      };
      systemUnsubscribers.add(trackedUnwatch);
      return trackedUnwatch;
    },
    dispose() {
      if (disposed) {
        return;
      }
      disposed = true;
      synced = false;
      scheduledGeneration += 1;
      if (
        frame !== undefined &&
        ownerWindow !== undefined &&
        typeof ownerWindow.cancelAnimationFrame === "function"
      ) {
        ownerWindow.cancelAnimationFrame(frame);
      }
      frame = undefined;
      styleUpdateScheduled = false;
      for (const unwatch of [...systemUnsubscribers]) unwatch();
      unsubscribeMode();
      removeLiveStyle(styleId, ownerDocument, options.styleHost);
      themeAttributeOwner?.dispose();
      themeAttributeOwner = undefined;
    }
  };

  return controller;
}

export function mountLiveThemeController(controller: LiveThemeController): () => void {
  controller.syncDocument();
  const unwatchSystem = controller.watchSystem();
  return () => {
    unwatchSystem();
    controller.dispose();
  };
}

export function getLiveThemeSnapshot(controller: LiveThemeController): LiveThemeSnapshot {
  return {
    ...controller.store.getState(),
    setMode: controller.setMode,
    toggleMode: controller.toggleMode,
    setConfig: controller.setConfig,
    patchConfig: controller.patchConfig,
    updateConfig: controller.updateConfig,
    setProperty: controller.setProperty,
    resetConfig: controller.resetConfig
  };
}

export function subscribeLiveTheme(
  controller: LiveThemeController,
  listener: (snapshot: LiveThemeSnapshot) => void,
  options?: { immediate?: boolean }
): () => void {
  if (options?.immediate) {
    listener(getLiveThemeSnapshot(controller));
  }

  return controller.store.subscribe(() => {
    listener(getLiveThemeSnapshot(controller));
  });
}
