import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Appearance, useColorScheme, useWindowDimensions, type ColorSchemeName } from "react-native";
import { buildThemeTokens, type ResolvedThemeMode, type TavoUiThemeConfig, type ThemeMode } from "@tavojs/ui-core";
import autoConfig from "./auto-config.js";
import { createNativeTheme, createNativeThemeFromBuild, type NativeStyle, type NativeTheme } from "./native.js";

export type ThemeStorage = {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
};

export type NativeThemeSnapshot = {
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  theme: NativeTheme;
  setMode(mode: ThemeMode): void;
  toggleMode(): void;
};

export type TavoThemeProviderProps = {
  children?: ReactNode;
  config?: TavoUiThemeConfig;
  mode?: ThemeMode;
  defaultMode?: ThemeMode;
  storage?: ThemeStorage;
  storageKey?: string;
};

const defaultConfig: TavoUiThemeConfig = {
  preset: "mobile",
  defaultTheme: "system",
  color: { light: { primary: "#006ecf" } }
};

const ThemeContext = createContext<NativeThemeSnapshot | null>(null);
const fallbackConfig = autoConfig ?? defaultConfig;
const fallbackSnapshots: Partial<Record<ResolvedThemeMode, NativeThemeSnapshot>> = {};
const noop = () => {};

function resolveMode(mode: ThemeMode, scheme: ColorSchemeName): ResolvedThemeMode {
  if (mode === "light" || mode === "dark") {
    return mode;
  }
  return scheme === "dark" ? "dark" : "light";
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

export function TavoThemeProvider({
  children,
  config,
  mode,
  defaultMode,
  storage,
  storageKey = "tavo-ui.theme"
}: TavoThemeProviderProps) {
  const resolvedConfig = config ?? autoConfig ?? defaultConfig;
  const scheme = useColorScheme();
  const initialMode = mode ?? defaultMode ?? resolvedConfig.defaultTheme ?? "system";
  const [uncontrolledMode, setUncontrolledMode] = useState<ThemeMode>(initialMode);
  const currentMode = mode ?? uncontrolledMode;
  const resolvedMode = resolveMode(currentMode, scheme);

  useEffect(() => {
    let active = true;
    if (!storage || mode !== undefined) {
      return () => {
        active = false;
      };
    }

    void Promise.resolve()
      .then(() => storage.getItem(storageKey))
      .then((savedMode) => {
        if (active && isThemeMode(savedMode)) {
          setUncontrolledMode(savedMode);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [mode, storage, storageKey]);

  const setMode = useCallback(
    (nextMode: ThemeMode) => {
      if (mode === undefined) {
        setUncontrolledMode(nextMode);
      }
      if (storage) {
        void Promise.resolve()
          .then(() => storage.setItem(storageKey, nextMode))
          .catch(() => {});
      }
    },
    [mode, storage, storageKey]
  );

  const toggleMode = useCallback(() => {
    setMode(resolvedMode === "dark" ? "light" : "dark");
  }, [resolvedMode, setMode]);

  const build = useMemo(() => buildThemeTokens(resolvedConfig), [resolvedConfig]);
  const theme = useMemo(() => createNativeThemeFromBuild(build, resolvedMode), [build, resolvedMode]);
  const snapshot = useMemo<NativeThemeSnapshot>(
    () => ({
      mode: currentMode,
      resolvedMode,
      theme,
      setMode,
      toggleMode
    }),
    [currentMode, resolvedMode, setMode, theme, toggleMode]
  );

  return <ThemeContext.Provider value={snapshot}>{children}</ThemeContext.Provider>;
}

export function useTheme(): NativeThemeSnapshot {
  const contextSnapshot = useContext(ThemeContext);
  if (contextSnapshot) {
    return contextSnapshot;
  }

  const scheme = Appearance.getColorScheme();
  const mode = fallbackConfig.defaultTheme ?? "system";
  const resolvedMode = resolveMode(mode, scheme);
  const cached = fallbackSnapshots[resolvedMode];
  if (cached) {
    return cached;
  }

  const fallbackSnapshot: NativeThemeSnapshot = {
    mode,
    resolvedMode,
    theme: createNativeTheme(fallbackConfig, resolvedMode),
    setMode: noop,
    toggleMode: noop
  };
  fallbackSnapshots[resolvedMode] = fallbackSnapshot;
  return fallbackSnapshot;
}

export function useThemeTokens() {
  return useTheme().theme.tokens;
}

export function useTavoStyles<TStyle extends NativeStyle>(
  factory: (theme: NativeTheme, window: ReturnType<typeof useWindowDimensions>) => TStyle
): TStyle {
  const { theme } = useTheme();
  const window = useWindowDimensions();
  return useMemo(() => factory(theme, window), [factory, theme, window]);
}
