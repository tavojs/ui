import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { checkPluginCompatibility } from "@tavojs/core/plugin";
import { buildThemeTokens, hexToHsl } from "@tavojs/ui-core";
import { compileString } from "sass";
import { tavoUi } from "../dist/plugin.js";
import { buildCompressedTheme } from "../dist/theme/core/build.js";
import { buildTheme } from "../dist/theme/index.js";

const config = {
  color: {
    light: {
      primary: "#116a67",
      secondary: "#d86c3d",
    },
    method: "monochromatic",
    fixShade: true,
  },
  scale: {
    controlHeight: 40,
    spacing: 8,
    radius: 6,
    shadow: 0.35,
    border: 0.5,
    density: "comfortable",
    focus: 2,
    motion: 0.5,
    opacity: 0.42,
    blur: 16,
    glassAlpha: 0.58,
    controlRadius: 4,
    surfaceRadius: 10,
  },
  typography: {
    textFontFamily: '"IBM Plex Sans", system-ui, sans-serif',
    headingFontFamily: '"Fraunces", Georgia, serif',
    bodySize: 16,
    headingScale: 1.2,
  },
  viewport: {
    rootMin: 15,
    rootMax: 17,
    minWidth: 360,
    maxWidth: 1200,
  },
  output: {
    selector: ":where(:root)",
    darkSelector: ':where(:root[data-theme="dark"])',
    includeMediaQuery: false,
  },
  tokens: {
    light: {
      "color-surface": "#fafafa",
    },
  },
  accessibility: {
    contrast: "AA",
    failOnViolation: false,
  },
};

test("buildTheme emits canonical variables with configured selectors, scale, and overrides", () => {
  const result = buildTheme(config);

  assert.match(result.cssText, /:where\(:root\) \{/);
  assert.match(
    result.cssText,
    /\tfont-size: clamp\(0\.9375rem, calc\(0\.8839rem \+ 0\.2381vw\), 1\.0625rem\);/
  );
  assert.match(
    result.cssText,
    /\*,\n\*::before,\n\*::after \{\n\tbox-sizing: border-box;\n\}/
  );
  assert.match(
    result.cssText,
    /\* \{\n\tscrollbar-color: var\(--tui-color-border-strong\) transparent;\n\tscrollbar-width: thin;\n\}/
  );
  assert.match(
    result.cssText,
    /\*::-webkit-scrollbar-thumb \{\n\tborder: 0\.18rem solid transparent;\n\tborder-radius: 999px;\n\tbackground: var\(--tui-color-border-strong\);\n\tbackground-clip: padding-box;\n\}/
  );
  assert.match(
    result.cssText,
    /body \{\n\tmargin: 0;\n\tpadding: 0;\n\tbackground: var\(--tui-color-app-bg\);\n\}/
  );
  assert.match(result.cssText, /--tui-color-surface: #ffffff;/);
  assert.match(result.cssText, /--tui-color-surface-raised: #fafafa;/);
  assert.match(result.cssText, /--tui-size-md: 2\.500rem;/);
  assert.match(result.cssText, /--tui-border-width: 0\.5px;/);
  assert.match(result.cssText, /--tui-border-width-strong: 1px;/);
  assert.match(result.cssText, /--tui-focus-width: 2px;/);
  assert.match(result.cssText, /--tui-motion-base: 90ms;/);
  assert.match(result.cssText, /--tui-opacity-disabled: 0\.42;/);
  assert.match(result.cssText, /--tui-interaction-hover-lift: 1px;/);
  assert.match(result.cssText, /--tui-interaction-active-scale: 0\.98;/);
  assert.match(result.cssText, /--tui-interaction-focus-alpha: 0\.28;/);
  assert.match(result.cssText, /--tui-interaction-disabled-opacity: 0\.42;/);
  assert.match(result.cssText, /--tui-blur-surface: 16px;/);
  assert.match(result.cssText, /--tui-glass-chrome-alpha: 58%;/);
  assert.match(result.cssText, /--tui-radius-control: 0\.250rem;/);
  assert.match(result.cssText, /--tui-radius-surface: 0\.625rem;/);
  assert.match(
    result.cssText,
    /--tui-font-family: "IBM Plex Sans", system-ui, sans-serif;/
  );
  assert.match(
    result.cssText,
    /--tui-font-family-text: "IBM Plex Sans", system-ui, sans-serif;/
  );
  assert.match(
    result.cssText,
    /--tui-font-family-heading: "Fraunces", Georgia, serif;/
  );
  assert.match(result.cssText, /--tui-color-sidebar-bg:/);
  assert.match(result.cssText, /--tui-color-header-bg:/);
  assert.match(result.cssText, /--tui-color-overlay-bg:/);
  assert.doesNotMatch(result.cssText, /prefers-color-scheme/);
  assert.equal(result.modes.light.tokens["color-surface"], "#ffffff");
  assert.equal(typeof result.modes.light.tokens["color-sidebar-bg"], "string");
  assert.equal(
    result.modes.light.tokens["color-focus-ring"],
    result.modes.light.tokens["color-focus"]
  );
  assert.equal(
    result.modes.light.tokens["color-selection-bg"],
    result.modes.light.tokens["color-primary-soft-bg"]
  );
});

test("compressed theme CSS preserves the expanded theme semantics", () => {
  const expanded = buildTheme(config).cssText;
  const compressed = buildCompressedTheme(config).cssText;

  assert.ok(compressed.length < expanded.length);
  assert.doesNotMatch(compressed, /[\r\n\t]/);
  assert.match(
    compressed,
    /font-size:clamp\([^;]*calc\([^;]* \+ [^;]*\)[^;]*\);/
  );
  assert.equal(
    compileString(compressed, { style: "compressed" }).css,
    compileString(expanded, { style: "compressed" }).css
  );
});

test("core buildThemeTokens exposes resolved tokens without CSS output", () => {
  const result = buildThemeTokens(config);

  assert.equal(result.modes.light.tokens["color-surface"], "#ffffff");
  assert.equal(result.staticTokens["size-md"], "2.500rem");
  assert.equal(result.breakpoints.md, 768);
  assert.equal("cssText" in result, false);
});

test("typography fontFamily remains the fallback for text and heading fonts", () => {
  const result = buildTheme({
    color: {
      light: {
        primary: "#7C5CFF",
      },
    },
    typography: {
      fontFamily: '"Aptos", system-ui, sans-serif',
    },
  });

  assert.match(
    result.cssText,
    /--tui-font-family: "Aptos", system-ui, sans-serif;/
  );
  assert.match(
    result.cssText,
    /--tui-font-family-text: "Aptos", system-ui, sans-serif;/
  );
  assert.match(
    result.cssText,
    /--tui-font-family-heading: "Aptos", system-ui, sans-serif;/
  );
});

test("viewport config emits responsive root font sizing", () => {
  const result = buildTheme({
    color: {
      light: {
        primary: "#116a67",
      },
    },
    viewport: {
      rootMin: 14,
      rootMax: 16,
      minWidth: 320,
      maxWidth: 960,
    },
  });

  assert.match(
    result.cssText,
    /:root \{\n\tcolor-scheme: light;\n\tfont-size: clamp\(0\.8750rem, calc\(0\.8125rem \+ 0\.3125vw\), 1\.0000rem\);/
  );
});

test("invalid viewport config throws a clear config error", () => {
  assert.throws(
    () =>
      buildTheme({
        color: {
          light: {
            primary: "#116a67",
          },
        },
        viewport: {
          rootMin: 18,
          rootMax: 16,
        },
      }),
    /viewport\.rootMin must be less than or equal to viewport\.rootMax/
  );

  assert.throws(
    () =>
      buildTheme({
        color: {
          light: {
            primary: "#116a67",
          },
        },
        viewport: {
          minWidth: 960,
          maxWidth: 320,
        },
      }),
    /viewport\.minWidth must be less than viewport\.maxWidth/
  );
});

test("breakpoint config emits responsive breakpoint tokens", () => {
  const result = buildTheme({
    color: {
      light: {
        primary: "#116a67",
      },
    },
    breakpoints: {
      sm: 520,
      md: 820,
      lg: 1180,
    },
  });

  assert.match(result.cssText, /--tui-breakpoint-sm: 520px;/);
  assert.match(result.cssText, /--tui-breakpoint-md: 820px;/);
  assert.match(result.cssText, /--tui-breakpoint-lg: 1180px;/);
});

test("invalid breakpoint config throws a clear config error", () => {
  assert.throws(
    () =>
      buildTheme({
        color: {
          light: {
            primary: "#116a67",
          },
        },
        breakpoints: {
          sm: 0,
        },
      }),
    /breakpoints\.sm must be a positive number/
  );

  assert.throws(
    () =>
      buildTheme({
        color: {
          light: {
            primary: "#116a67",
          },
        },
        breakpoints: {
          sm: 900,
          md: 768,
          lg: 1024,
        },
      }),
    /breakpoints must be ascending/
  );
});

test("interaction config emits interactive state tokens", () => {
  const result = buildTheme({
    color: {
      light: {
        primary: "#7C5CFF",
      },
    },
    interaction: {
      hoverLift: 0,
      activeScale: 0.96,
      focusAlpha: 0.18,
      disabledOpacity: 0.4,
      transition: 0.5,
    },
  });

  assert.match(result.cssText, /--tui-interaction-hover-lift: 0px;/);
  assert.match(result.cssText, /--tui-interaction-active-scale: 0\.96;/);
  assert.match(result.cssText, /--tui-interaction-focus-alpha: 0\.18;/);
  assert.match(result.cssText, /--tui-interaction-disabled-opacity: 0\.4;/);
  assert.match(result.cssText, /--tui-interaction-transition-fast: 60ms;/);
});

test("theme runtime writes data-tavo-theme on the document root", async () => {
  const previousDocument = globalThis.document;
  const previousWindow = globalThis.window;
  const attributes = new Map();
  const storage = new Map();

  globalThis.document = {
    getElementById() {
      return null;
    },
    documentElement: {
      setAttribute(name, value) {
        attributes.set(name, value);
      },
      removeAttribute(name) {
        attributes.delete(name);
      },
    },
  };
  globalThis.window = {
    localStorage: {
      getItem(key) {
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        storage.set(key, value);
      },
    },
    matchMedia() {
      return {
        matches: false,
        addEventListener() {},
        removeEventListener() {},
      };
    },
  };

  try {
    const { createThemeController } = await import("../dist/theme/runtime.js");
    const controller = createThemeController("system");

    controller.setMode("dark");
    assert.equal(attributes.get("data-tavo-theme"), "dark");
    assert.equal(attributes.has("data-theme"), false);

    controller.setMode("system");
    assert.equal(attributes.has("data-tavo-theme"), false);
  } finally {
    globalThis.document = previousDocument;
    globalThis.window = previousWindow;
  }
});

test("theme runtime config helper starts from defaultTheme", async () => {
  const previousDocument = globalThis.document;
  const previousWindow = globalThis.window;
  const attributes = new Map();
  const storage = new Map();

  globalThis.document = {
    getElementById() {
      return null;
    },
    documentElement: {
      setAttribute(name, value) {
        attributes.set(name, value);
      },
      removeAttribute(name) {
        attributes.delete(name);
      },
    },
  };
  globalThis.window = {
    localStorage: {
      getItem(key) {
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        storage.set(key, value);
      },
    },
    matchMedia(query) {
      return {
        matches: query.includes("dark") ? false : true,
        addEventListener() {},
        removeEventListener() {},
      };
    },
  };

  try {
    const { createThemeControllerFromConfig } = await import(
      "../dist/theme/runtime.js"
    );
    const controller = createThemeControllerFromConfig({
      defaultTheme: "dark",
    });

    assert.equal(controller.store.getState().mode, "dark");
    assert.equal(controller.store.getState().resolvedMode, "dark");

    controller.syncDocument();
    assert.equal(attributes.get("data-tavo-theme"), "dark");

    controller.setMode("system");
    assert.equal(attributes.has("data-tavo-theme"), false);
  } finally {
    globalThis.document = previousDocument;
    globalThis.window = previousWindow;
  }
});

test("theme runtime tolerates blocked storage and keeps snapshot callbacks stable", async () => {
  const previousDocument = globalThis.document;
  const previousWindow = globalThis.window;
  globalThis.document = {
    getElementById() {
      return null;
    },
    documentElement: {
      setAttribute() {},
      removeAttribute() {},
    },
  };
  globalThis.window = {
    localStorage: {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
    },
  };

  try {
    const { createThemeController, getThemeSnapshot } = await import(
      "../dist/theme/runtime.js"
    );
    const controller = createThemeController("system");
    controller.setMode("dark");

    const first = getThemeSnapshot(controller);
    const second = getThemeSnapshot(controller);
    assert.equal(first.mode, "dark");
    assert.equal(first.setMode, second.setMode);
    assert.equal(first.toggleMode, second.toggleMode);
  } finally {
    globalThis.document = previousDocument;
    globalThis.window = previousWindow;
  }
});

test("defaultTheme dark keeps dark as the CSS default", () => {
  const result = buildTheme({
    defaultTheme: "dark",
    color: {
      light: {
        primary: "#7C5CFF",
      },
      method: "analogous",
    },
    output: {
      includeMediaQuery: true,
    },
  });

  assert.match(result.cssText, /:root \{\n\tcolor-scheme: dark;/);
  assert.match(
    result.cssText,
    /:root\[data-tavo-theme="light"\] \{\n\tcolor-scheme: light;/
  );
  assert.match(
    result.cssText,
    /:root\[data-tavo-theme="dark"\] \{\n\tcolor-scheme: dark;/
  );
  assert.doesNotMatch(result.cssText, /prefers-color-scheme/);
});

test("defaultTheme light keeps light as the CSS default", () => {
  const result = buildTheme({
    defaultTheme: "light",
    color: {
      light: {
        primary: "#7C5CFF",
      },
      method: "analogous",
    },
    output: {
      includeMediaQuery: true,
    },
  });

  assert.match(result.cssText, /:root \{\n\tcolor-scheme: light;/);
  assert.match(
    result.cssText,
    /:root\[data-tavo-theme="dark"\] \{\n\tcolor-scheme: dark;/
  );
  assert.doesNotMatch(result.cssText, /prefers-color-scheme/);
});

test("defaultTheme system keeps system media-query behavior", () => {
  const result = buildTheme({
    defaultTheme: "system",
    color: {
      light: {
        primary: "#7C5CFF",
      },
    },
    output: {
      includeMediaQuery: true,
    },
  });

  assert.match(result.cssText, /:root \{\n\tcolor-scheme: light;/);
  assert.match(result.cssText, /prefers-color-scheme: dark/);
  assert.doesNotMatch(result.cssText, /data-tavo-theme="light"/);
});

test("invalid defaultTheme throws a clear config error", () => {
  assert.throws(
    () =>
      buildTheme({
        defaultTheme: "blue",
        color: {
          light: {
            primary: "#7C5CFF",
          },
        },
      }),
    /defaultTheme must be/
  );
});

test("CLI check and tokens commands run against the default config", () => {
  const checkOutput = execFileSync(
    "node",
    ["dist/cli/index.js", "check", "--config", "tavo-ui.config.json"],
    {
      encoding: "utf8",
    }
  );
  assert.match(checkOutput, /passed checks|completed with/);

  const tokensOutput = execFileSync(
    "node",
    [
      "dist/cli/index.js",
      "tokens",
      "--config",
      "tavo-ui.config.json",
      "--mode",
      "light",
    ],
    {
      encoding: "utf8",
    }
  );
  const tokens = JSON.parse(tokensOutput);
  assert.equal(typeof tokens.tokens["color-bg"], "string");

  const cssTokensOutput = execFileSync(
    "node",
    [
      "dist/cli/index.js",
      "tokens",
      "--config",
      "tavo-ui.config.json",
      "--format",
      "css",
    ],
    {
      encoding: "utf8",
    }
  );
  assert.match(cssTokensOutput, /--tui-color-bg:/);

  const lightCssTokensOutput = execFileSync(
    "node",
    [
      "dist/cli/index.js",
      "tokens",
      "--config",
      "tavo-ui.config.json",
      "--format",
      "css",
      "--mode",
      "light",
    ],
    {
      encoding: "utf8",
    }
  );
  assert.match(lightCssTokensOutput, /--tui-primary-50:/);
  assert.match(lightCssTokensOutput, /--tui-neutral-950:/);
  assert.match(lightCssTokensOutput, /--tui-space-1:/);
  assert.match(lightCssTokensOutput, /--tui-size-md:/);

  const figmaTokensOutput = execFileSync(
    "node",
    [
      "dist/cli/index.js",
      "tokens",
      "--config",
      "tavo-ui.config.json",
      "--mode",
      "light",
      "--format",
      "figma",
    ],
    {
      encoding: "utf8",
    }
  );
  const figmaTokens = JSON.parse(figmaTokensOutput);
  assert.equal(figmaTokens["color-bg"].type, "color");

  const auditOutput = execFileSync(
    "node",
    ["dist/cli/index.js", "audit", "--config", "tavo-ui.config.json"],
    {
      encoding: "utf8",
    }
  );
  const audit = JSON.parse(auditOutput);
  assert.equal(typeof audit.passed, "boolean");
});

test("CLI init writes the default dark purple theme config", () => {
  const directory = mkdtempSync(join(tmpdir(), "tavo-ui-init-"));
  const configPath = join(directory, "tavo-ui.config.json");

  try {
    execFileSync(
      "node",
      ["dist/cli/index.js", "init", "--config", configPath],
      { encoding: "utf8" }
    );
    const config = JSON.parse(readFileSync(configPath, "utf8"));

    assert.equal(config.defaultTheme, "dark");
    assert.deepEqual(config.color, {
      light: { primary: "#7C3AED" },
      dark: { primary: "#A78BFA" },
      method: "monochromatic",
      fixShade: true,
    });
    assert.deepEqual(config.scale, { unit: 8 });
    assert.deepEqual(Object.keys(config).sort(), [
      "$schema",
      "color",
      "defaultTheme",
      "scale",
    ]);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("monochromatic ramps keep strict white and black endpoints", () => {
  const result = buildTheme({
    color: {
      light: {
        primary: "#0096ff",
        secondary: "#363646",
      },
      method: "monochromatic",
      fixShade: false,
    },
  });

  assert.equal(result.modes.light.primary[50], "#ffffff");
  assert.equal(result.modes.light.primary[950], "#000000");
  assert.equal(result.modes.light.secondary[50], "#ffffff");
  assert.equal(result.modes.light.secondary[950], "#000000");
});

test("fixShade affects monochromatic interior shades before endpoint overrides", () => {
  const baseConfig = {
    color: {
      light: {
        primary: "#e9ff19",
        secondary: "#363646",
      },
      method: "monochromatic",
    },
  };

  const free = buildTheme({ color: { ...baseConfig.color, fixShade: false } });
  const fixed = buildTheme({ color: { ...baseConfig.color, fixShade: true } });

  assert.notEqual(
    free.modes.light.primary[300],
    fixed.modes.light.primary[300]
  );
  assert.equal(free.modes.light.primary[50], "#ffffff");
  assert.equal(fixed.modes.light.primary[50], "#ffffff");
  assert.equal(free.modes.light.primary[950], "#000000");
  assert.equal(fixed.modes.light.primary[950], "#000000");
});

test("CLI tokens preserve strict monochromatic endpoints", () => {
  const directory = mkdtempSync(join(tmpdir(), "tavo-ui-theme-"));
  const configPath = join(directory, "tavo-ui.config.json");

  try {
    writeFileSync(
      configPath,
      `${JSON.stringify(
        {
          color: {
            light: {
              primary: "#0096ff",
              secondary: "#363646",
            },
            method: "monochromatic",
            fixShade: true,
          },
        },
        null,
        2
      )}\n`
    );

    const tokensOutput = execFileSync(
      "node",
      [
        "dist/cli/index.js",
        "tokens",
        "--config",
        configPath,
        "--mode",
        "light",
      ],
      {
        encoding: "utf8",
      }
    );
    const tokens = JSON.parse(tokensOutput);

    assert.equal(tokens.primary[50], "#ffffff");
    assert.equal(tokens.primary[950], "#000000");
    assert.equal(tokens.secondary[50], "#ffffff");
    assert.equal(tokens.secondary[950], "#000000");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("monochromatic uses strict light and dark canvases", () => {
  const lightPrimary = buildTheme({
    color: {
      light: {
        primary: "#e9ff19",
        secondary: "#363646",
      },
      method: "monochromatic",
      fixShade: false,
    },
  });
  const darkPrimary = buildTheme({
    color: {
      light: {
        primary: "#116a67",
        secondary: "#d86c3d",
      },
      method: "monochromatic",
      fixShade: false,
    },
  });

  assert.equal(lightPrimary.modes.light.tokens["color-bg"], "#ffffff");
  assert.equal(lightPrimary.modes.light.tokens["color-app-bg"], "#ffffff");
  assert.equal(lightPrimary.modes.light.tokens["color-surface"], "#ffffff");
  assert.equal(
    lightPrimary.modes.light.tokens["color-surface-raised"],
    "#fafafa"
  );
  assert.equal(
    lightPrimary.modes.light.tokens["color-surface-subtle"],
    "#f4f4f4"
  );
  assert.equal(lightPrimary.modes.light.tokens["color-border"], "#e5e5e5");
  assert.equal(lightPrimary.modes.light.tokens["color-text"], "#000000");
  assert.equal(lightPrimary.modes.light.tokens["color-heading"], "#000000");
  assert.equal(lightPrimary.modes.light.tokens["color-neutral-bg"], "#f4f4f4");
  assert.equal(lightPrimary.modes.dark.tokens["color-bg"], "#000000");
  assert.equal(lightPrimary.modes.dark.tokens["color-app-bg"], "#000000");
  assert.equal(lightPrimary.modes.dark.tokens["color-surface"], "#050505");
  assert.equal(
    lightPrimary.modes.dark.tokens["color-surface-raised"],
    "#0d0d0d"
  );
  assert.equal(
    lightPrimary.modes.dark.tokens["color-surface-subtle"],
    "#171717"
  );
  assert.equal(lightPrimary.modes.dark.tokens["color-border"], "#2a2a2a");
  assert.equal(lightPrimary.modes.dark.tokens["color-text"], "#ffffff");
  assert.equal(lightPrimary.modes.dark.tokens["color-heading"], "#ffffff");
  assert.equal(lightPrimary.modes.dark.tokens["color-neutral-bg"], "#171717");
  assert.equal(lightPrimary.modes.light.tokens["color-primary-bg"], "#e9ff19");
  assert.equal(
    lightPrimary.modes.light.tokens["color-secondary-bg"],
    "#363646"
  );
  assert.equal(lightPrimary.modes.light.tokens["color-link"], "#e9ff19");
  assert.equal(lightPrimary.modes.light.tokens["color-focus"], "#e9ff19");
  assert.equal(darkPrimary.modes.light.tokens["color-bg"], "#ffffff");
  assert.equal(darkPrimary.modes.light.tokens["color-app-bg"], "#ffffff");
  assert.equal(darkPrimary.modes.light.tokens["color-surface"], "#ffffff");
  assert.equal(darkPrimary.modes.light.tokens["color-text"], "#000000");
  assert.equal(darkPrimary.modes.dark.tokens["color-bg"], "#000000");
  assert.equal(darkPrimary.modes.dark.tokens["color-app-bg"], "#000000");
  assert.equal(darkPrimary.modes.dark.tokens["color-surface"], "#050505");
  assert.equal(darkPrimary.modes.dark.tokens["color-text"], "#ffffff");
  assert.equal(darkPrimary.modes.light.tokens["color-primary-bg"], "#116a67");
  assert.equal(darkPrimary.modes.light.tokens["color-secondary-bg"], "#d86c3d");
});

test("monochromatic keeps structural tokens strict after token overrides", () => {
  const result = buildTheme({
    color: {
      light: {
        primary: "#7C5CFF",
        secondary: "#A78BFA",
      },
      method: "monochromatic",
    },
    tokens: {
      light: {
        "color-bg": "#f4f4f5",
        "color-app-bg": "#f4f4f5",
        "color-surface": "#ede9fe",
        "color-heading": "#7C5CFF",
        "color-panel-bg": "#ede9fe",
        "color-border": "#c4b5fd",
      },
      dark: {
        "color-bg": "#0B1020",
        "color-app-bg": "#0B1020",
        "color-surface": "#12172A",
        "color-heading": "#A78BFA",
        "color-panel-bg": "#12172A",
        "color-border": "#1B2240",
      },
    },
  });

  assert.equal(result.modes.light.tokens["color-bg"], "#ffffff");
  assert.equal(result.modes.light.tokens["color-app-bg"], "#ffffff");
  assert.equal(result.modes.light.tokens["color-surface"], "#ffffff");
  assert.equal(result.modes.light.tokens["color-panel-bg"], "#ffffff");
  assert.equal(result.modes.light.tokens["color-border"], "#e5e5e5");
  assert.equal(result.modes.light.tokens["color-heading"], "#000000");
  assert.equal(result.modes.light.tokens["color-primary-bg"], "#7c5cff");
  assert.equal(result.modes.light.tokens["color-secondary-bg"], "#a78bfa");
  assert.equal(result.modes.dark.tokens["color-bg"], "#000000");
  assert.equal(result.modes.dark.tokens["color-app-bg"], "#000000");
  assert.equal(result.modes.dark.tokens["color-surface"], "#050505");
  assert.equal(result.modes.dark.tokens["color-panel-bg"], "#050505");
  assert.equal(result.modes.dark.tokens["color-border"], "#2a2a2a");
  assert.equal(result.modes.dark.tokens["color-heading"], "#ffffff");
});

test("analogous uses generated shade surfaces instead of monochrome canvas tokens", () => {
  const color = {
    light: {
      primary: "#e9ff19",
      secondary: "#363646",
    },
    fixShade: false,
  };
  const analogous = buildTheme({ color: { ...color, method: "analogous" } });
  const monochromatic = buildTheme({
    color: { ...color, method: "monochromatic" },
  });

  assert.equal(
    analogous.modes.light.tokens["color-bg"],
    analogous.modes.light.neutral[50]
  );
  assert.equal(
    analogous.modes.light.tokens["color-surface"],
    analogous.modes.light.neutral[100]
  );
  assert.equal(
    analogous.modes.light.tokens["color-surface-subtle"],
    analogous.modes.light.neutral[200]
  );
  assert.equal(analogous.modes.light.tokens["color-primary-bg"], "#e9ff19");
  assert.equal(analogous.modes.light.tokens["color-secondary-bg"], "#363646");
  assert.notEqual(
    analogous.modes.light.tokens["color-bg"],
    monochromatic.modes.light.tokens["color-bg"]
  );
  assert.notEqual(
    analogous.modes.light.tokens["color-surface"],
    monochromatic.modes.light.tokens["color-surface"]
  );
  assert.equal(
    analogous.modes.light.tokens["color-primary-bg"],
    monochromatic.modes.light.tokens["color-primary-bg"]
  );
});

test("glass uses translucent surfaces and backdrop filtering", () => {
  const result = buildTheme({
    color: {
      light: {
        primary: "#006ecf",
        secondary: "#3c93fa",
      },
      dark: {
        primary: "#8fc7ff",
        secondary: "#9f7aea",
      },
      method: "glass",
    },
    tokens: {
      dark: {
        "color-surface": "#12172A",
        "color-surface-raised": "#12172A",
        "color-panel-bg": "#12172A",
        "color-sidebar-bg": "#12172A",
        "color-header-bg": "#12172A",
        "color-neutral-bg": "#1B2240",
      },
    },
  });

  assert.match(result.modes.light.tokens["color-surface"], /^rgba\(/);
  assert.match(result.modes.light.tokens["color-surface-raised"], /^rgba\(/);
  assert.match(result.modes.light.tokens["color-border"], /^rgba\(/);
  assert.match(result.modes.light.tokens["color-neutral-bg"], /^rgba\(/);
  assert.equal(
    result.modes.light.tokens["backdrop-filter"],
    "blur(var(--tui-blur-surface, 22px)) saturate(1.35)"
  );
  assert.equal(result.modes.light.tokens["color-primary-bg"], "#006ecf");
  assert.equal(result.modes.dark.tokens["color-primary-bg"], "#8fc7ff");
  assert.match(result.modes.dark.tokens["color-surface"], /^rgba\(/);
  assert.match(result.modes.dark.tokens["color-surface-raised"], /^rgba\(/);
  assert.match(result.modes.dark.tokens["color-panel-bg"], /^rgba\(/);
  assert.match(result.modes.dark.tokens["color-sidebar-bg"], /^rgba\(/);
  assert.match(result.modes.dark.tokens["color-header-bg"], /^rgba\(/);
  assert.match(result.modes.dark.tokens["color-neutral-bg"], /^rgba\(/);
  assert.equal(
    result.modes.dark.tokens["backdrop-filter"],
    "blur(var(--tui-blur-surface, 22px)) saturate(1.35)"
  );
  assert.match(
    result.cssText,
    /--tui-backdrop-filter: blur\(var\(--tui-blur-surface, 22px\)\) saturate\(1\.35\);/
  );
});

test("presets merge first and explicit config values win", () => {
  const result = buildTheme({
    preset: "enterprise",
    color: {
      light: {
        primary: "#006ecf",
      },
    },
    scale: {
      shadow: 0,
    },
  });

  assert.equal(result.config.preset, "enterprise");
  assert.equal(result.config.color.method, "analogous");
  assert.equal(result.config.color.fixShade, true);
  assert.equal(result.config.scale?.density, "compact");
  assert.equal(result.config.scale?.shadow, 0);
  assert.equal(result.modes.light.tokens["shadow-sm"], "none");
  assert.equal(result.modes.light.tokens["color-primary-bg"], "#006ecf");
});

test("fixShade defaults to true when omitted", () => {
  const implicit = buildTheme({
    color: {
      light: {
        primary: "#7c5cff",
      },
      method: "analogous",
    },
  });
  const explicit = buildTheme({
    color: {
      light: {
        primary: "#7c5cff",
      },
      method: "analogous",
      fixShade: true,
    },
  });

  assert.equal(
    implicit.modes.light.primary[500],
    explicit.modes.light.primary[500]
  );
  assert.equal(
    implicit.modes.light.primary[600],
    explicit.modes.light.primary[600]
  );
  assert.equal(
    implicit.modes.dark.primary[400],
    explicit.modes.dark.primary[400]
  );
});

test("solid action tokens keep configured colors when fixShade is true", () => {
  const result = buildTheme({
    color: {
      light: {
        primary: "#7c5cff",
        secondary: "#a78bfa",
      },
      dark: {
        primary: "#7c5cff",
        secondary: "#a78bfa",
      },
      method: "analogous",
      fixShade: true,
    },
  });

  assert.equal(result.modes.light.tokens["color-primary-bg"], "#7c5cff");
  assert.equal(result.modes.light.tokens["color-secondary-bg"], "#a78bfa");
  assert.equal(result.modes.dark.tokens["color-primary-bg"], "#7c5cff");
  assert.equal(result.modes.dark.tokens["color-secondary-bg"], "#a78bfa");
  assert.equal(result.modes.light.tokens["color-primary-text"], "#000000");
  assert.equal(result.modes.light.tokens["color-secondary-text"], "#000000");
});

test("monochromatic light primary action keeps configured purple primary", () => {
  const result = buildTheme({
    color: {
      light: {
        primary: "#8B5CF6",
        secondary: "#22D3EE",
      },
      dark: {
        primary: "#8B5CF6",
        secondary: "#22D3EE",
      },
      method: "monochromatic",
      fixShade: true,
    },
  });

  assert.equal(result.modes.light.primary[500], "#8b5cf6");
  assert.equal(result.modes.light.tokens["color-primary-bg"], "#8b5cf6");
  assert.equal(result.modes.light.tokens["color-primary-bg-hover"], "#8b5cf6");
  assert.equal(result.modes.light.tokens["color-secondary-bg"], "#22d3ee");
  assert.match(
    result.cssText,
    /:root \{[\s\S]*--tui-color-primary-bg: #8b5cf6;/
  );
});

test("generated CSS keeps light primary color in light overrides", async () => {
  const { buildThemeCss } = await import("../scripts/theme-utils.mjs");
  const config = {
    defaultTheme: "dark",
    color: {
      light: {
        primary: "#006ecf",
        secondary: "#3c93fa",
      },
      dark: {
        primary: "#8fc7ff",
        secondary: "#a78bfa",
      },
      method: "analogous",
      fixShade: true,
    },
    output: {
      includeMediaQuery: true,
    },
  };
  const result = buildTheme(config);
  const cssText = buildThemeCss(config);
  const base = cssText.match(/:root \{[\s\S]*?\}/)?.[0] ?? "";
  const lightOverride =
    cssText.match(/:root\[data-tavo-theme="light"\] \{[\s\S]*?\}/)?.[0] ?? "";

  assert.equal(result.modes.light.tokens["color-primary-bg"], "#006ecf");
  assert.equal(result.modes.dark.tokens["color-primary-bg"], "#8fc7ff");
  assert.match(base, /--tui-color-primary-bg: #8fc7ff;/);
  assert.match(lightOverride, /--tui-color-primary-bg: #006ecf;/);
  assert.match(lightOverride, /--tui-primary-500: #006ecf;/);
});

test("unknown preset throws a clear config error", () => {
  assert.throws(
    () =>
      buildTheme({
        preset: "unknown",
        color: {
          light: {
            primary: "#006ecf",
          },
        },
      }),
    /Theme config preset must be one of/
  );
});

test("CLI preview command writes a static HTML preview", () => {
  const directory = mkdtempSync(join(tmpdir(), "tavo-ui-preview-"));
  const previewPath = join(directory, "preview.html");

  try {
    const output = execFileSync(
      "node",
      [
        "dist/cli/index.js",
        "preview",
        "--config",
        "tavo-ui.config.json",
        "--out",
        previewPath,
      ],
      { encoding: "utf8" }
    );
    const html = readFileSync(previewPath, "utf8");

    assert.match(output, /Generated preview/);
    assert.match(html, /Tavo UI Theme Preview/);
    assert.match(html, /--tui-color-bg:/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("CLI preview cannot close its generated style element", () => {
  const directory = mkdtempSync(join(tmpdir(), "tavo-ui-preview-xss-"));
  const configPath = join(directory, "config.json");
  const previewPath = join(directory, "preview.html");
  const payload =
    '</style><script id="tavo-preview-xss">globalThis.__xss=1</script><style>';

  try {
    writeFileSync(
      configPath,
      JSON.stringify({
        color: { light: { primary: "#116a67" } },
        tokens: { light: { probe: payload } },
      })
    );
    execFileSync(
      "node",
      [
        "dist/cli/index.js",
        "preview",
        "--config",
        configPath,
        "--out",
        previewPath,
      ],
      { encoding: "utf8" }
    );

    const html = readFileSync(previewPath, "utf8");
    assert.equal(html.includes(payload), false);
    assert.equal(
      html.includes(
        '<\\/style><script id="tavo-preview-xss">globalThis.__xss=1</script><style>'
      ),
      true
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("CLI validates commands and keeps preview output HTML-specific", () => {
  const directory = mkdtempSync(join(tmpdir(), "tavo-ui-cli-"));
  const cliPath = join(process.cwd(), "dist", "cli", "index.js");
  const configPath = join(directory, "tavo-ui.config.json");

  try {
    writeFileSync(
      configPath,
      JSON.stringify({ color: { light: { primary: "#116a67" } } })
    );

    const help = spawnSync("node", [cliPath, "--help"], {
      cwd: directory,
      encoding: "utf8",
    });
    assert.equal(help.status, 0);
    assert.match(help.stdout, /Usage: tavo-ui web/);

    const invalid = spawnSync("node", [cliPath, "generat"], {
      cwd: directory,
      encoding: "utf8",
    });
    assert.notEqual(invalid.status, 0);
    assert.match(invalid.stderr, /Unknown command: generat/);

    execFileSync("node", [cliPath, "preview"], {
      cwd: directory,
      encoding: "utf8",
    });
    assert.equal(existsSync(join(directory, "tavo-ui-preview.html")), true);
    assert.equal(
      existsSync(
        join(directory, "src", "theme", "generated", "default-theme.css")
      ),
      false
    );

    execFileSync("node", [cliPath, "generate"], {
      cwd: directory,
      encoding: "utf8",
    });
    assert.equal(
      existsSync(
        join(directory, "src", "theme", "generated", "default-theme.css")
      ),
      true
    );

    const scssOutput = spawnSync(
      "node",
      [cliPath, "generate", "--out", "theme.scss"],
      {
        cwd: directory,
        encoding: "utf8",
      }
    );
    assert.notEqual(scssOutput.status, 0);
    assert.match(scssOutput.stderr, /must use the \.css extension/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("package generation is idempotent", () => {
  const docsPath = join(process.cwd(), "docs", "components.md");
  const before = readFileSync(docsPath, "utf8");

  execFileSync("node", ["scripts/generate-package.mjs"], { encoding: "utf8" });

  assert.equal(readFileSync(docsPath, "utf8"), before);
});

test("published component entrypoints emit JS without SCSS module imports", () => {
  const entry = readFileSync("dist/components/Button/Button.js", "utf8");
  const styles = readFileSync(
    "dist/components/Button/Button.module.css.js",
    "utf8"
  );
  const browserEntry = readFileSync(
    "dist/browser/components/Button/index.js",
    "utf8"
  );
  const cssEntry = readFileSync("dist/css/components/Button/Button.js", "utf8");
  const group = readFileSync("dist/css/groups/layout.js", "utf8");

  assert.doesNotMatch(entry, /\.module\.scss/);
  assert.match(entry, /\.module\.css\.js/);
  assert.doesNotMatch(cssEntry, /\.module\.scss/);
  assert.match(cssEntry, /\.module\.css\.js/);
  assert.match(group, /\.\.\/components\/Page\/index\.js/);
  assert.match(
    browserEntry,
    /export \* from "\.\.\/\.\.\/\.\.\/components\/Button\/index\.js";/
  );
  assert.doesNotMatch(browserEntry, /components\.css/);
  assert.match(styles, /\.\.\/\.\.\/style-runtime\.js/);
  assert.doesNotMatch(styles, /@tavojs\/core\/style/);
  assert.match(styles, /export const cssId = "tui.tb"/);
  assert.match(styles, /export const cssText = /);
  assert.match(
    styles,
    /@layer tavo-ui\.theme,tavo-ui\.components,tavo-ui\.overrides;@layer tavo-ui\.components/
  );
  assert.match(styles, /"button": "tb_button"/);
  assert.ok(existsSync("dist/style-runtime.js"));
  assert.ok(existsSync("dist/css/style-runtime.js"));
  assert.ok(existsSync("dist/css/components.css"));
  assert.ok(existsSync("dist/theme.css"));
});

test("published component runtime CSS is compressed without changing CSS semantics", async () => {
  const [button, propertyList, tooltip] = await Promise.all([
    import("../dist/components/Button/Button.module.css.js"),
    import("../dist/components/PropertyList/PropertyList.module.css.js"),
    import("../dist/components/Tooltip/Tooltip.module.css.js"),
  ]);

  assert.equal(button.cssId, "tui.tb");
  assert.equal(button.default.button, "tb_button");
  assert.equal(typeof button.cssText, "string");

  for (const { cssText } of [button, propertyList, tooltip]) {
    assert.doesNotMatch(cssText, /[\r\n\t]/);
    assert.doesNotMatch(cssText, / {2,}/);
    assert.match(
      cssText,
      /^@layer tavo-ui\.theme,tavo-ui\.components,tavo-ui\.overrides;@layer tavo-ui\.components\{/
    );
    assert.doesNotThrow(() => compileString(cssText, { style: "compressed" }));
  }

  assert.match(button.cssText, /\.tb_button\{/);
  assert.match(button.cssText, /\.tb_button:hover\{/);
  assert.match(button.cssText, /--button-bg:\s*var\(--tui-color-primary-bg\)/);
  assert.match(button.cssText, /color-mix\(in srgb,/);
  assert.match(propertyList.cssText, /\.tp_divided \.tp_item\+\.tp_item\{/);
  assert.match(propertyList.cssText, /@media\(max-width: 560px\)/);
  assert.match(tooltip.cssText, /calc\(100% \+ var\(--tui-space-2\)\)/);

  const arithmeticFixture = compileString(
    ".fixture { width: calc(var(--a) + var(--b)); } .item + .item { color: red; }",
    { style: "compressed" }
  ).css;
  assert.match(arithmeticFixture, /calc\(var\(--a\) \+ var\(--b\)\)/);
  assert.match(arithmeticFixture, /\.item\+\.item\{/);
  assert.doesNotThrow(() =>
    compileString(arithmeticFixture, { style: "compressed" })
  );
});

test("published package exposes theme breakpoint SCSS entrypoint", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  const breakpointScss = readFileSync("dist/theme/breakpoints.scss", "utf8");

  assert.equal(
    packageJson.exports["./theme/breakpoints"],
    "./dist/theme/breakpoints.scss"
  );
  assert.equal(
    packageJson.exports["./theme/breakpoints.scss"],
    "./dist/theme/breakpoints.scss"
  );
  assert.ok(existsSync("dist/theme/breakpoints.scss"));
  assert.ok(existsSync("dist/css/theme/breakpoints.scss"));
  assert.match(breakpointScss, /\$tui-breakpoints:/);
  assert.match(breakpointScss, /@mixin tui-screen/);
});

test("tavoUi exposes a declarative Tavo plugin manifest", () => {
  const plugin = tavoUi({ silent: true });

  assert.equal(plugin.id, "@tavojs/ui");
  assert.equal(plugin.version, "1.0.0");
  assert.equal(plugin.apiVersion, 1);
  assert.deepEqual(plugin.manifest.build?.plugins, [{ id: "theme" }]);
  assert.deepEqual(plugin.manifest.head, [
    {
      id: "theme",
      key: "@tavojs/ui:theme",
      cardinality: "singleton",
      unsafeHeadHtml: true,
    },
  ]);
  assert.equal(plugin.manifest.permissions?.[0]?.name, "unsafeHeadHtml");
  assert.equal(plugin.manifest.permissions?.[0]?.required, true);
  assert.deepEqual(checkPluginCompatibility(plugin), {
    compatible: true,
    currentVersion: 1,
    requestedVersion: 1,
    diagnostic: undefined,
  });
});

test("tavoUi plugin generates theme CSS during Vite build hooks", async () => {
  const directory = mkdtempSync(join(tmpdir(), "tavo-ui-plugin-"));
  const configPath = join(directory, "tavo-ui.config.json");

  try {
    writeFileSync(
      configPath,
      JSON.stringify(
        {
          color: { light: { primary: "#7C5CFF" }, method: "monochromatic" },
        },
        null,
        2
      )
    );
    const sourcePath = join(directory, "src", "page.tsx");
    mkdirSync(join(directory, "src"), { recursive: true });
    writeFileSync(sourcePath, "export const page = true;");

    const phase = await tavoUi({ silent: true }).build();
    const vitePlugin = phase.build?.plugins?.theme;

    assert.ok(vitePlugin);
    vitePlugin.configResolved({ root: directory });
    vitePlugin.buildStart();

    assert.equal(
      vitePlugin.resolveId("@tavojs/ui/theme.css"),
      "\0@tavojs/ui/theme.css"
    );
    assert.match(
      vitePlugin.transform("export const page = true;", sourcePath),
      /import "@tavojs\/ui\/theme\.css";/
    );
    const css = vitePlugin.load("\0@tavojs/ui/theme.css");
    assert.doesNotMatch(css, /[\r\n\t]/);
    assert.match(css, /--tui-color-primary-bg: #7c5cff;/);
    assert.match(css, /--tui-font-family-text:/);
    assert.doesNotThrow(() => compileString(css, { style: "compressed" }));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("tavoUi server phase emits compact SSR theme CSS", async () => {
  const phase = await tavoUi({ silent: true }).server();
  const html = phase.head?.theme?.() ?? "";
  const css =
    html.match(
      /^<style data-tavo-style="tavo-ui\.theme">([\s\S]*)<\/style>$/
    )?.[1] ?? "";

  assert.ok(css.length > 0);
  assert.doesNotMatch(css, /[\r\n\t]/);
  assert.match(css, /^:root\{/);
  assert.match(css, /calc\([^;]* \+ [^;]*\)/);
  assert.doesNotThrow(() => compileString(css, { style: "compressed" }));
});

test("tavoUi plugin logs generated theme once during dev startup", async () => {
  const directory = mkdtempSync(join(tmpdir(), "tavo-ui-plugin-log-"));
  const configPath = join(directory, "tavo-ui.config.json");
  const originalInfo = console.info;
  const messages = [];

  try {
    writeFileSync(
      configPath,
      JSON.stringify(
        {
          color: { light: { primary: "#7C5CFF" }, method: "monochromatic" },
        },
        null,
        2
      )
    );

    const phase = await tavoUi().build();
    const vitePlugin = phase.build?.plugins?.theme;
    assert.ok(vitePlugin);

    console.info = (message) => {
      messages.push(String(message));
    };
    vitePlugin.configResolved({ root: directory });
    vitePlugin.configureServer({
      watcher: {
        add() {},
        on() {},
      },
    });
    vitePlugin.buildStart();
    vitePlugin.load("\0@tavojs/ui/theme.css");

    assert.deepEqual(messages, [
      "tavo-ui: generated project theme for @tavojs/ui/theme.css",
    ]);
  } finally {
    console.info = originalInfo;
    rmSync(directory, { recursive: true, force: true });
  }
});

test("component controls apply configured text and heading font tokens", () => {
  const css = readFileSync("dist/components.css", "utf8");

  assert.match(
    css,
    /\/\* components\/Button\/Button\.module\.scss \*\/[\s\S]*font-family:\s*var\(--tui-font-family-text/
  );
  assert.match(
    css,
    /\/\* components\/TextInput\/TextInput\.module\.scss \*\/[\s\S]*font-family:\s*var\(--tui-font-family-text/
  );
  assert.match(
    css,
    /\/\* components\/DropdownMenu\/DropdownMenu\.module\.scss \*\/[\s\S]*font-family:\s*var\(--tui-font-family-text/
  );
  assert.match(
    css,
    /\/\* components\/Dialog\/Dialog\.module\.scss \*\/[\s\S]*font-family:\s*var\(--tui-font-family-heading/
  );
});

test("Button keeps usable padding without theme spacing tokens", () => {
  const css = readFileSync("dist/components.css", "utf8");
  const buttonCss =
    css.match(
      /\/\* components\/Button\/Button\.module\.scss \*\/[\s\S]*?(?=\/\* components\/|$)/
    )?.[0] ?? "";

  assert.match(buttonCss, /\.tb_button\s*\{/);
  assert.match(
    buttonCss,
    /--button-hover-bg:\s*var\(\s*--tui-button-hover-bg,\s*color-mix\(in srgb, var\(--button-bg\) 88%, var\(--button-color\) 12%\)\s*\)/
  );
  assert.match(buttonCss, /background:\s*var\(--button-bg\)/);
  assert.match(
    buttonCss,
    /padding-block:\s*var\(--tui-button-padding-block, 0\.375rem\)/
  );
  assert.match(
    buttonCss,
    /padding-inline:\s*var\(--tui-button-padding-inline, var\(--tui-button-padding-inline-md, var\(--tui-space-4, 1rem\)\)\)/
  );
  assert.match(
    buttonCss,
    /min-height:\s*var\(--tui-button-min-height, var\(--tui-size-md, 2\.5rem\)\)/
  );
  assert.match(
    buttonCss,
    /font-weight:\s*var\(--tui-button-font-weight, normal\)/
  );
  assert.match(buttonCss, /line-height:\s*var\(--tui-button-line-height, 1\)/);
});

test("compiled component CSS scopes repeated module class names", () => {
  const css = readFileSync("dist/components.css", "utf8");

  assert.match(css, /\.tb_button\s*\{/);
  assert.match(css, /\.tig_button\s*\{/);
  assert.doesNotMatch(css, /(^|[^_a-zA-Z0-9-])\.button\b/);
  assert.doesNotMatch(css, /(^|[^_a-zA-Z0-9-])\.size-sm\b/);
  assert.doesNotMatch(css, /:global\(/);
  assert.match(css, /\.tar_root\s*>\s*\*/);
});

test("Box isolates responsive instance variables from nested Boxes", () => {
  const css = readFileSync("dist/components.css", "utf8");
  const boxRule = css.match(/\.tbo_box\s*\{([^}]+)\}/)?.[1] ?? "";

  for (const property of [
    "--tui-box-padding",
    "--tui-box-padding-sm",
    "--tui-box-padding-md",
    "--tui-box-padding-lg",
    "--tui-box-padding-inline",
    "--tui-box-padding-inline-sm",
    "--tui-box-padding-inline-md",
    "--tui-box-padding-inline-lg",
    "--tui-box-max-width",
    "--tui-box-max-width-sm",
    "--tui-box-max-width-md",
    "--tui-box-max-width-lg",
    "--tui-box-radius",
    "--tui-box-radius-sm",
    "--tui-box-radius-md",
    "--tui-box-radius-lg",
  ]) {
    assert.match(boxRule, new RegExp(`${property}:\\s*initial`));
  }
});

test("glass-capable chrome and panels consume backdrop filter tokens", () => {
  const css = readFileSync("dist/components.css", "utf8");
  const appBarCss =
    css.match(
      /\/\* components\/AppBar\/AppBar\.module\.scss \*\/[\s\S]*?(?=\/\* components\/|$)/
    )?.[0] ?? "";
  const sheetCss =
    css.match(
      /\/\* components\/Sheet\/Sheet\.module\.scss \*\/[\s\S]*?(?=\/\* components\/|$)/
    )?.[0] ?? "";

  assert.doesNotMatch(appBarCss, /92%/);
  assert.match(appBarCss, /--tui-glass-chrome-alpha, 62%/);
  assert.match(
    appBarCss,
    /-webkit-backdrop-filter:\s*var\(--tui-backdrop-filter, blur\(var\(--tui-blur-surface, 22px\)\) saturate\(1\.35\)\)/
  );
  assert.match(
    sheetCss,
    /-webkit-backdrop-filter:\s*var\(--tui-backdrop-filter, blur\(4px\)\)/
  );
  assert.match(
    sheetCss,
    /-webkit-backdrop-filter:\s*var\(--tui-backdrop-filter, none\)/
  );
  assert.match(
    sheetCss,
    /backdrop-filter:\s*var\(--tui-backdrop-filter, none\)/
  );
});

test("invalid glass alpha throws a clear config error", () => {
  assert.throws(
    () =>
      buildTheme({
        color: {
          light: {
            primary: "#7C5CFF",
          },
          method: "glass",
        },
        scale: {
          glassAlpha: 1.2,
        },
      }),
    /scale\.glassAlpha must be a number between 0 and 1/
  );
});

test("scale.shadow controls generated elevation tokens", () => {
  const quiet = buildTheme({
    color: {
      light: {
        primary: "#006ecf",
      },
      method: "glass",
    },
    scale: {
      shadow: 0.25,
    },
  });
  const disabled = buildTheme({
    color: {
      light: {
        primary: "#006ecf",
      },
      method: "glass",
    },
    scale: {
      shadow: 0,
    },
  });

  assert.match(quiet.modes.light.tokens["shadow-sm"], /^0 1px 2px rgba/);
  assert.match(quiet.modes.light.tokens["shadow-md"], /^0 8px 20px rgba/);
  assert.match(quiet.modes.light.tokens["shadow-lg"], /^0 16px 36px rgba/);
  assert.equal(disabled.modes.light.tokens["shadow-sm"], "none");
  assert.equal(disabled.modes.light.tokens["shadow-md"], "none");
  assert.equal(disabled.modes.light.tokens["shadow-lg"], "none");
});

test("scale.border controls generated border width tokens", () => {
  const result = buildTheme({
    color: {
      light: {
        primary: "#006ecf",
      },
      method: "glass",
    },
    scale: {
      border: 0,
    },
  });

  assert.match(result.cssText, /--tui-border-width: 0px;/);
  assert.match(result.cssText, /--tui-border-width-strong: 0px;/);
});

test("same config produces distinct method visuals through semantic tokens", () => {
  const color = {
    light: {
      primary: "#006ecf",
      secondary: "#3c93fa",
    },
    dark: {
      primary: "#006ecf",
      secondary: "#3c93fa",
    },
    fixShade: false,
  };
  const analogous = buildTheme({ color: { ...color, method: "analogous" } });
  const monochromatic = buildTheme({
    color: { ...color, method: "monochromatic" },
  });

  assert.notEqual(
    analogous.modes.light.tokens["color-bg"],
    monochromatic.modes.light.tokens["color-bg"]
  );
  assert.notEqual(
    analogous.modes.light.tokens["color-surface"],
    monochromatic.modes.light.tokens["color-surface"]
  );
  assert.notEqual(
    analogous.modes.light.tokens["color-border"],
    monochromatic.modes.light.tokens["color-border"]
  );
  assert.equal(monochromatic.modes.light.tokens["color-primary-bg"], "#006ecf");
  assert.equal(
    monochromatic.modes.light.tokens["color-secondary-bg"],
    "#3c93fa"
  );
  assert.equal(monochromatic.modes.light.tokens["color-bg"], "#ffffff");
  assert.equal(monochromatic.modes.dark.tokens["color-bg"], "#000000");
  assert.equal(monochromatic.modes.dark.tokens["color-text"], "#ffffff");
  assert.equal(analogous.modes.light.tokens["color-primary-bg"], "#006ecf");
});

test("secondary color is optional and derived from primary", () => {
  const result = buildTheme({
    color: {
      light: {
        primary: "#006ecf",
      },
      method: "monochromatic",
      fixShade: false,
    },
  });

  assert.equal(typeof result.modes.light.secondary[500], "string");
  assert.equal(result.modes.light.tokens["color-primary-bg"], "#006ecf");
  assert.ok(
    Object.values(result.modes.light.secondary).includes(
      result.modes.light.tokens["color-secondary-bg"]
    )
  );
  const primaryHue = hexToHsl(result.modes.light.tokens["color-primary-bg"]).h;
  const secondaryHue = hexToHsl(
    result.modes.light.tokens["color-secondary-bg"]
  ).h;
  const hueDistance = Math.abs(((secondaryHue - primaryHue + 540) % 360) - 180);
  assert.ok(hueDistance >= 29 && hueDistance <= 31);
});

test("CLI accepts configs without secondary color", () => {
  const directory = mkdtempSync(join(tmpdir(), "tavo-ui-theme-"));
  const configPath = join(directory, "tavo-ui.config.json");

  try {
    writeFileSync(
      configPath,
      `${JSON.stringify(
        {
          color: {
            light: {
              primary: "#006ecf",
            },
            method: "analogous",
          },
        },
        null,
        2
      )}\n`
    );

    const tokensOutput = execFileSync(
      "node",
      [
        "dist/cli/index.js",
        "tokens",
        "--config",
        configPath,
        "--mode",
        "light",
      ],
      {
        encoding: "utf8",
      }
    );
    const tokens = JSON.parse(tokensOutput);

    assert.equal(typeof tokens.secondary[500], "string");
    assert.equal(typeof tokens.tokens["color-secondary-bg"], "string");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
