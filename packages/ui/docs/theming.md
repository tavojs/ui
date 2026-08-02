# Theming Reference

This document focuses on theme generation and token behavior.

## Config Shape

```ts
type TavoUiThemeConfig = {
  $schema?: string;
  preset?: "minimal" | "glass" | "enterprise" | "editorial" | "dense" | "mobile" | "monochrome";
  defaultTheme?: "light" | "dark" | "system";
  color: {
    light: { primary: string; secondary?: string };
    dark?: { primary?: string; secondary?: string };
    method?: "analogous" | "monochromatic" | "glass";
    fixShade?: boolean; // defaults to true
  };
  scale?: {
    unit?: number;
    controlHeight?: number;
    spacing?: number;
    radius?: number;
    shadow?: number;
    border?: number;
    density?: "compact" | "comfortable" | "spacious";
    focus?: number;
    motion?: number;
    opacity?: number;
    blur?: number;
    glassAlpha?: number;
    controlRadius?: number;
    surfaceRadius?: number;
  };
  typography?: {
    fontFamily?: string;
    textFontFamily?: string;
    headingFontFamily?: string;
    bodySize?: number;
    captionSize?: number;
    labelSize?: number;
    headingScale?: number;
  };
  semantic?: {
    success?: string;
    warning?: string;
    danger?: string;
    info?: string;
    light?: { success?: string; warning?: string; danger?: string; info?: string };
    dark?: { success?: string; warning?: string; danger?: string; info?: string };
  };
  output?: {
    selector?: string;
    darkSelector?: string;
    includeMediaQuery?: boolean;
  };
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
  tokens?: {
    light?: Record<string, string>;
    dark?: Record<string, string>;
  };
  accessibility?: {
    contrast?: "AA" | "AAA";
    failOnViolation?: boolean;
  };
};
```

## Minimal Derived Theme

Only a primary color is required. Add one base unit when the complete dimensional system should scale from a single value:

```json
{
  "color": {
    "light": {
      "primary": "#8b5cf6"
    }
  },
  "scale": {
    "unit": 8
  }
}
```

With `unit: 8`, the generator derives an `8px` base spacing, `40px` medium control, `8px` medium radius, `16px` body size, and proportional focus and blur tokens. Explicit scale and typography values override these derivations. Density only adjusts built-in defaults; explicit `unit`, `controlHeight`, and `spacing` remain exact.

## Recommended Configs

Minimal:

```json
{
  "color": {
    "light": {
      "primary": "#006ecf"
    }
  }
}
```

Product dashboard:

```json
{
  "preset": "enterprise",
  "color": {
    "light": {
      "primary": "#006ecf"
    }
  },
  "scale": {
    "density": "compact",
    "shadow": 0.2,
    "border": 1
  }
}
```

Glass product:

```json
{
  "preset": "glass",
  "color": {
    "light": {
      "primary": "#2563eb",
      "secondary": "#8b5cf6"
    }
  },
  "scale": {
    "blur": 24,
    "glassAlpha": 0.56,
    "shadow": 0.3
  }
}
```

In `glass` mode, `scale.blur` drives `--tui-blur-surface` and the shared `--tui-backdrop-filter`. Increase it for stronger Sheet, Sheet, Dialog, popover, menu, and surface blur. `scale.glassAlpha` drives `--tui-glass-chrome-alpha`, which controls how opaque sticky chrome such as AppBar should be before blur is applied.

## Typography Fonts

Use `typography.fontFamily` when the whole product should use one font stack. Use `textFontFamily` and `headingFontFamily` when body copy and headers need different fonts:

```json
{
  "typography": {
    "textFontFamily": "Inter, ui-sans-serif, system-ui, sans-serif",
    "headingFontFamily": "Fraunces, Georgia, serif",
    "bodySize": 16,
    "headingScale": 1.24
  }
}
```

## Viewport Scale

Use `viewport` to scale the root `font-size` between mobile and desktop widths. Because generated size, spacing, radius, and typography tokens use `rem`, this improves mobile density across the component system:

```json
{
  "viewport": {
    "rootMin": 14,
    "rootMax": 16,
    "minWidth": 320,
    "maxWidth": 960
  }
}
```

This emits a `font-size: clamp(...)` declaration on the configured root selector.

## Breakpoints

Use `breakpoints` for mobile-first responsive component props and SCSS media queries. The default handles are `base`, `sm`, `md`, and `lg`; `base` always applies, while `sm`, `md`, and `lg` apply from their configured min-widths:

```json
{
  "breakpoints": {
    "sm": 480,
    "md": 768,
    "lg": 1024
  }
}
```

The generator emits breakpoint tokens such as `--tui-breakpoint-md` and publishes SCSS breakpoint mixins for project styles:

```scss
@use "@tavojs/ui/theme/breakpoints" as bp;

@include bp.tui-screen(md) {
  .panel {
    grid-template-columns: 1fr 1fr;
  }
}
```

Layout primitives accept responsive props:

```tsx
<Box padding={{ base: "sm", md: "lg" }}>
  <Flex direction={{ base: "column", md: "row" }} gap={{ base: "sm", lg: "lg" }} />
</Box>
```

Responsive layout props and `sx` are mobile-first. `base` applies at every width, while `sm`, `md`, and `lg` apply from their configured min-width upward. For example, `sx={{ sm: { display: "none" } }}` keeps the component's default display below `480px` and hides it from `480px` upward. Use `sx={{ base: { display: "none" }, lg: { display: "flex" } }}` for content that should stay hidden until `1024px`.

See the [responsive `sx` guide](responsive-sx.md) for more visibility examples.

The generator emits:

- `--tui-font-family`: backwards-compatible alias for the text font
- `--tui-font-family-text`: body, labels, controls, and normal text
- `--tui-font-family-heading`: h1-h6 text and title-like component labels

If `textFontFamily` or `headingFontFamily` is omitted, each falls back to `fontFamily`, then to the default system UI stack.

## Output Selectors

By default, `defaultTheme` is `system`: light tokens are emitted at `:root`, dark tokens at `:root[data-tavo-theme="dark"]`, and a media query is included for system dark preference.

Use `defaultTheme` when an app needs a default mode before a user preference is known:

```json
{
  "defaultTheme": "dark",
  "color": {
    "light": {
      "primary": "#7C5CFF"
    }
  }
}
```

When `defaultTheme` is `dark`, the base selector receives dark tokens and an explicit `:root[data-tavo-theme="light"]` override is emitted. When `defaultTheme` is `light`, the base selector stays light and `:root[data-tavo-theme="dark"]` remains available for user-selected dark mode. When `defaultTheme` is `system`, the generated CSS follows `prefers-color-scheme` until the runtime sets `data-tavo-theme`.

Runtime setup can reuse the same config value:

```ts
import config from "../tavo-ui.config.json";
import { createThemeControllerFromConfig, mountThemeController } from "@tavojs/ui/theme";

const theme = createThemeControllerFromConfig(config);
mountThemeController(theme);
```

The config runtime helper starts from `config.defaultTheme` and still lets stored user choices win. The runtime controller writes `data-tavo-theme` on `<html>` for explicit `light` or `dark` modes and removes it for `system`; it does not write a generic `data-theme` attribute. If an app customizes `output.darkSelector` to use another attribute, wire that attribute in the app shell or keep the selector aligned with `data-tavo-theme`.

## Supported Token Metadata

The complete supported CSS variable catalog is public and typed:

```ts
import {
  getTavoUiTokenMetadata,
  tavoUiTokenMetadata,
  tavoUiTokenNames,
} from "@tavojs/ui/theme";

tavoUiTokenNames.includes("--tui-space-1"); // true
tavoUiTokenMetadata.find((token) => token.group === "spacing");
```

`tavoUiTokenMetadata` contains every built-in static, semantic, and palette variable. Call `getTavoUiTokenMetadata(config)` when tooling should also include project-defined entries from `tokens.light` and `tokens.dark`.

Use the CLI to validate application stylesheets against that same catalog:

```bash
npx tavo-ui validate-css --config tavo-ui.config.json src
```

Customize selectors:

```json
{
  "output": {
    "selector": ":where(:root)",
    "darkSelector": ":where(:root[data-theme=\"dark\"])",
    "includeMediaQuery": false
  }
}
```

## Token Overrides

Overrides happen after generated semantic tokens:

```json
{
  "tokens": {
    "light": {
      "color-sidebar-bg": "#ffffff"
    },
    "dark": {
      "color-sidebar-bg": "#050505"
    }
  }
}
```

Solid action buttons use:

- `color-primary-bg`: exact configured primary color.
- `color-primary-text`: generated black or white contrast text for that primary color.
- `color-primary-bg-hover`: generated ramp shade for interaction feedback.
- `color-secondary-bg` and `color-secondary-text`: the same model for the configured secondary color.

This keeps brand colors stable even when `fixShade` is enabled, while still allowing generated hover and soft states.

## Contrast Auditing

Run:

```bash
npx tavo-ui audit --config tavo-ui.config.json
```

The audit reports contrast warnings found during theme generation. Set `accessibility.failOnViolation` to `true` when CI should fail on violations.

## Runtime Theme Control

The package exposes runtime helpers:

```ts
import { createThemeController, getThemeSnapshot, mountThemeController } from "@tavojs/ui/theme";

const controller = createThemeController("system");
mountThemeController(controller);

const theme = getThemeSnapshot(controller);
theme.setMode("dark");
```

For reactive Tavo UI, subscribe to `controller.store` from an MVC controller and copy the selected state into the component model:

```tsx
import { createTavo, TavoController } from "@tavojs/core";
import type { Store } from "@tavojs/core";
import type { ThemeRuntimeState } from "@tavojs/ui/theme";

class ThemeControlsController extends TavoController {
  declare model: Store<ThemeRuntimeState>;

  onInit() {
    this.select(controller.store, (state) => state, (state) => this.model.setState(state), {
      immediate: true,
    });
  }
}

const ThemeControls = createTavo({
  model: () => controller.store.getState(),
  controller: ThemeControlsController,
  view: ({ state }) => <button>{state.mode}</button>,
});
```
