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

In `glass` mode, `scale.blur` drives `--tui-blur-surface` and the shared `--tui-backdrop-filter`. Increase it for stronger Sheet, Dialog, popover, menu, and surface blur. Non-glass themes resolve these component filters to `none`, so sticky chrome and overlays avoid unnecessary backdrop paint. `scale.glassAlpha` drives `--tui-glass-chrome-alpha`, which controls how opaque sticky chrome such as AppBar should be before blur is applied.

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

New themes use a fixed 16px root by default. This keeps `rem`-based spacing, controls, radii, and typography stable during a continuous browser resize. Configure `viewport.strategy` when a product needs a different behavior:

- `fixed`: one root size; `rootMin` and `rootMax` must match.
- `fluid`: continuous `clamp()` interpolation between the configured widths.
- `stepped`: discrete interpolated sizes at `sm`, `md`, `lg`, and `maxWidth`.

Existing viewport objects without `strategy` retain the earlier fluid behavior. For an explicit fixed root:

```json
{
  "viewport": {
    "strategy": "fixed",
    "rootMin": 16,
    "rootMax": 16,
    "minWidth": 320,
    "maxWidth": 960
  }
}
```

For discrete responsive density without changing every `rem` value at every viewport pixel:

```json
{
  "viewport": {
    "strategy": "stepped",
    "rootMin": 14,
    "rootMax": 16,
    "minWidth": 320,
    "maxWidth": 960
  }
}
```

Use `strategy: "fluid"` with the same range when continuous scaling is worth the additional full-page style and layout invalidation.

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

### Live Theme Properties

Use a live theme controller when an editor, preview, or application setting needs to change generated theme properties without reloading the page:

```ts
import config from "../tavo-ui.config.json";
import {
  createLiveThemeController,
  mountLiveThemeController,
} from "@tavojs/ui/theme";

const theme = createLiveThemeController(config);
const unmountTheme = mountLiveThemeController(theme);

theme.setProperty("color.light.primary", "#ff4d67");
theme.patchConfig({
  scale: { radius: 12 },
  typography: { bodySize: 18 },
});

// Call when the application shell is unmounted.
unmountTheme();
```

`setProperty` accepts a dot-separated config path. `patchConfig` recursively merges a typed partial config, `setConfig` replaces the complete source config, and `updateConfig` supports immutable updater functions. `resetConfig` restores the config passed to `createLiveThemeController`.

Updates regenerate both color modes and all derived tokens, then replace one dedicated `style[data-tavo-style="tavo-ui.theme.runtime"]` element. Multiple changes in the same animation frame are coalesced, so sliders and color inputs can update on their normal `input` event. The current mode is preserved while properties change.

The controller keeps the last valid stylesheet when an update fails. Read `error`, `warnings`, `config`, and `revision` from `controller.store`, or use `subscribeLiveTheme`:

```ts
import { subscribeLiveTheme } from "@tavojs/ui/theme";

const unsubscribe = subscribeLiveTheme(theme, (snapshot) => {
  validationMessage.textContent = snapshot.error ?? snapshot.warnings.join("\n");
}, { immediate: true });
```

Applications with a Content Security Policy can pass the style nonce:

```ts
const theme = createLiveThemeController(config, { nonce });
```

`breakpoints` and `output` are build-time sections. A live update that changes either section returns `{ applied: false, error }` and leaves the active config and stylesheet unchanged. CSS media-query thresholds are compiled into component and responsive `sx` rules, while output selectors define the build-time stylesheet contract. Changing `defaultTheme` updates the stored live config but does not replace the user's current mode; it is used the next time a controller is created.

### Reactive Tavo.js UI

For reactive Tavo.js UI, subscribe to `controller.store` from an MVC controller and copy the selected state into the component model:

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
