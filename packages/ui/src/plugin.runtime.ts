import fs from "node:fs";
import path from "node:path";
import { buildCompressedTheme } from "@/theme/core/build";
import type { TavoUiThemeConfig } from "@/theme/types";
import type { TavoUiPluginOptions } from "./plugin";

export type VitePlugin = {
  name: string;
  enforce?: "pre" | "post";
  resolveId?: (id: string) => string | undefined;
  load?: (id: string) => string | undefined;
  transform?: (code: string, id: string) => string | undefined;
  configResolved?: (config: { root: string }) => void;
  buildStart?: () => void;
  configureServer?: (server: {
    watcher?: {
      add?: (file: string) => void;
      on?: (event: "all", handler: (event: string, file: string) => void) => void;
    };
    moduleGraph?: {
      getModuleById?: (id: string) => unknown;
      invalidateModule?: (module: unknown) => void;
    };
    ws?: {
      send?: (payload: { type: "full-reload" }) => void;
    };
  }) => void;
};

type ResolvedTavoUiPluginOptions = Required<TavoUiPluginOptions>;

const DEFAULT_CONFIG = "tavo-ui.config.json";
const THEME_CSS_IMPORT = "@tavojs/ui/theme.css";
const THEME_CSS_IMPORT_CODE = `import "${THEME_CSS_IMPORT}";`;
const VIRTUAL_THEME_CSS_ID = "\0@tavojs/ui/theme.css";
const SOURCE_MODULE_RE = /\.[cm]?[jt]sx?$/;

export function normalizeOptions(options: TavoUiPluginOptions): ResolvedTavoUiPluginOptions {
  return {
    config: options.config ?? DEFAULT_CONFIG,
    out: options.out ?? false,
    watch: options.watch ?? true,
    silent: options.silent ?? false,
    required: options.required ?? true,
    inject: options.inject ?? true
  };
}

export function escapeStyleText(value: string): string {
  return value.replace(/<\/style/gi, "<\\/style");
}

function resolveProjectPath(root: string, filePath: string): string {
  return path.isAbsolute(filePath) ? filePath : path.resolve(root, filePath);
}

function realpathIfExists(filePath: string): string {
  try {
    return fs.realpathSync(filePath);
  } catch {
    return filePath;
  }
}

function readThemeConfig(configPath: string): TavoUiThemeConfig {
  return JSON.parse(fs.readFileSync(configPath, "utf8")) as TavoUiThemeConfig;
}

function isProjectSourceModule(root: string, id: string): boolean {
  const filePath = realpathIfExists(id.split("?")[0]);
  const normalizedFilePath = filePath.split(path.sep).join("/");
  if (!SOURCE_MODULE_RE.test(filePath) || normalizedFilePath.includes("/node_modules/")) {
    return false;
  }
  const relative = path.relative(root, filePath);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    return false;
  }
  const normalizedRelative = relative.split(path.sep).join("/");
  if (normalizedRelative.startsWith(".") || /^(dist|build|node_modules)\//.test(normalizedRelative)) {
    return false;
  }
  return !/(^|\/)(tavo|vite)\.config\.[cm]?[jt]s$/.test(normalizedRelative);
}

export function createThemeCss(
  root: string,
  options: ResolvedTavoUiPluginOptions
): string | undefined {
  const configPath = resolveProjectPath(root, options.config);

  if (!fs.existsSync(configPath)) {
    if (options.required) {
      throw new Error(`tavo-ui: missing theme config at ${configPath}`);
    }
    return undefined;
  }

  const result = buildCompressedTheme(readThemeConfig(configPath));
  if (options.out) {
    const outPath = resolveProjectPath(root, options.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    if (!fs.existsSync(outPath) || fs.readFileSync(outPath, "utf8") !== result.cssText) {
      fs.writeFileSync(outPath, result.cssText);
    }
  }

  if (!options.silent) {
    for (const warning of result.warnings) {
      console.warn(`tavo-ui: ${warning}`);
    }
    const output = options.out
      ? ` and wrote ${path.relative(root, resolveProjectPath(root, options.out))}`
      : "";
    console.info(`tavo-ui: generated project theme for ${THEME_CSS_IMPORT}${output}`);
  }

  return result.cssText;
}

export function createTavoUiVitePlugin(options: TavoUiPluginOptions): VitePlugin {
  const resolvedOptions = normalizeOptions(options);
  let root = realpathIfExists(process.cwd());
  let themeCss: string | undefined;

  const regenerate = () => {
    themeCss = createThemeCss(root, resolvedOptions);
  };

  return {
    name: "@tavojs/ui/theme",
    enforce: "pre",
    resolveId(id) {
      return id === THEME_CSS_IMPORT ? VIRTUAL_THEME_CSS_ID : undefined;
    },
    load(id) {
      if (id !== VIRTUAL_THEME_CSS_ID) {
        return undefined;
      }
      if (themeCss === undefined) {
        regenerate();
      }
      return themeCss ?? "";
    },
    transform(code, id) {
      if (!resolvedOptions.inject || !isProjectSourceModule(root, id) || code.includes(THEME_CSS_IMPORT)) {
        return undefined;
      }
      return `${THEME_CSS_IMPORT_CODE}\n${code}`;
    },
    configResolved(config) {
      root = realpathIfExists(config.root);
    },
    buildStart() {
      regenerate();
    },
    configureServer(server) {
      const configPath = resolveProjectPath(root, resolvedOptions.config);

      if (!resolvedOptions.watch) {
        return;
      }

      server.watcher?.add?.(configPath);
      server.watcher?.on?.("all", (_event, file) => {
        if (path.resolve(file) === configPath) {
          regenerate();
          const module = server.moduleGraph?.getModuleById?.(VIRTUAL_THEME_CSS_ID);
          if (module) {
            server.moduleGraph?.invalidateModule?.(module);
          }
          server.ws?.send?.({ type: "full-reload" });
        }
      });
    }
  };
}
