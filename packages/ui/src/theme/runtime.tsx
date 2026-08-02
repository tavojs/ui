import {
  createStore,
  type Store
} from "@tavojs/core";
import type { ResolvedThemeMode, TavoUiThemeConfig, ThemeMode, ThemeRuntimeState } from "@/theme/types";

const THEME_ATTRIBUTE = "data-tavo-theme";
const THEME_STORAGE_KEY = "tavo-ui.theme";

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

function resolveMode(mode: ThemeMode): ResolvedThemeMode {
  if (mode === "light" || mode === "dark") {
    return mode;
  }

  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

function applyThemeAttribute(mode: ThemeMode): void {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  if (mode === "system") {
    root.removeAttribute(THEME_ATTRIBUTE);
    return;
  }

  root.setAttribute(THEME_ATTRIBUTE, mode);
}

function readInitialMode(defaultMode: ThemeMode): ThemeMode {
  if (typeof window === "undefined") {
    return defaultMode;
  }

  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
  } catch {
    // Storage can be unavailable in sandboxed or privacy-restricted contexts.
  }

  return defaultMode;
}

export function createThemeController(defaultMode: ThemeMode = "system"): ThemeController {
  const initialMode = readInitialMode(defaultMode);
  const store = createStore<ThemeRuntimeState>({
    mode: initialMode,
    resolvedMode: resolveMode(initialMode)
  });

  function commit(mode: ThemeMode, resolvedMode = resolveMode(mode)): void {
    const current = store.getState();
    if (current.mode === mode && current.resolvedMode === resolvedMode) {
      applyThemeAttribute(mode);
      return;
    }
    store.setState({
      mode,
      resolvedMode
    });
    applyThemeAttribute(mode);

    if (typeof window !== "undefined" && current.mode !== mode) {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, mode);
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
      applyThemeAttribute(store.getState().mode);
    },
    watchSystem() {
      if (typeof window === "undefined") {
        return () => {};
      }

      if (typeof window.matchMedia !== "function") {
        return () => {};
      }

      const media = window.matchMedia("(prefers-color-scheme: dark)");
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
