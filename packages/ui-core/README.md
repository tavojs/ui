# @tavojs/ui-core

Platform-neutral Tavo.js UI theme config validation and token generation.

Most Tavo.js web applications should install `@tavojs/ui` instead. Use UI Core directly for custom renderers, build tooling, or platform-neutral token pipelines. See the [UI Core documentation](https://tavojs.dev/docs/ui-core) for the task-first guide and API reference.

`@tavojs/ui-core` takes a small theme config and returns resolved color ramps, semantic tokens, static sizing tokens, breakpoint tokens, and accessibility warnings. It does not depend on a renderer, CSS framework, or runtime UI package.

## Install

```sh
npm install @tavojs/ui-core
```

## Quick Start

```ts
import { buildThemeTokens } from "@tavojs/ui-core";

const result = buildThemeTokens({
  color: {
    light: {
      primary: "#116a67"
    }
  },
  scale: { unit: 8 }
});

console.log(result.modes.light.tokens["color-primary-bg"]);
console.log(result.staticTokens["radius-md"]);
```

## Public API

```ts
import { buildThemeTokens, resolveThemeBreakpoints, resolveThemeConfig } from "@tavojs/ui-core";
```

### `buildThemeTokens(config)`

Validates and resolves the complete theme.

Returns:

- `modes.light` and `modes.dark`: resolved color ramps, semantic colors, and mode-specific tokens.
- `staticTokens`: sizing, spacing, radius, typography, motion, interaction, blur, and breakpoint tokens.
- `breakpoints`: resolved numeric breakpoint values.
- `config`: the resolved config after preset defaults are applied.
- `warnings`: accessibility warnings when `accessibility.contrast` is enabled.

### `resolveThemeConfig(config)`

Applies a preset before explicit config values. Explicit values always win.

```ts
const config = resolveThemeConfig({
  preset: "enterprise",
  color: { light: { primary: "#7c5cff" } },
  scale: { density: "spacious" }
});
```

### `resolveThemeBreakpoints(config)`

Merges user breakpoint overrides with defaults.

```ts
resolveThemeBreakpoints({
  color: { light: { primary: "#116a67" } },
  breakpoints: { md: 820 }
});
// { sm: 480, md: 820, lg: 1024 }
```

## Theme Config

Only `color.light.primary` is required.

Use `scale.unit` when one value should derive the complete dimensional system. For example, `unit: 8` produces an `8px` base spacing, `40px` medium control, `8px` medium radius, and `16px` body size. Explicit dimensional values override the derivation.

```ts
import type { TavoUiThemeConfig } from "@tavojs/ui-core";

const config: TavoUiThemeConfig = {
  preset: "glass",
  defaultTheme: "system",
  color: {
    light: {
      primary: "#2563eb",
      secondary: "#14b8a6"
    },
    dark: {
      primary: "#7fb3ff"
    },
    method: "glass",
    fixShade: false
  },
  scale: {
    density: "comfortable",
    controlHeight: 42,
    radius: 8,
    shadow: 0.35,
    blur: 22
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    headingScale: 1.24
  },
  accessibility: {
    contrast: "AA"
  }
};
```

## Presets

Available presets:

- `minimal`
- `glass`
- `enterprise`
- `editorial`
- `dense`
- `mobile`
- `monochrome`

Presets are starting points. You can override any nested value in the same config.

## Color Methods

- `analogous`: builds a tonal ramp from the provided hue and uses neutral surfaces.
- `monochromatic`: keeps the UI strictly black, white, and neutral while preserving exact action colors.
- `glass`: emits translucent surface tokens and a `backdrop-filter` token for glass-style interfaces.

## Viewport Strategies

The root font size defaults to a fixed 16px value. Set `viewport.strategy` to `fluid` for continuous `clamp()` scaling or `stepped` for discrete changes at the resolved UI breakpoints. Existing viewport objects without a strategy retain fluid behavior. Fixed configurations require matching `rootMin` and `rootMax` values.

## Token Overrides

Use `tokens.light` and `tokens.dark` for targeted overrides.

```ts
const result = buildThemeTokens({
  color: { light: { primary: "#116a67" } },
  tokens: {
    light: {
      "color-panel-bg": "#ffffff"
    },
    dark: {
      "color-panel-bg": "#101418"
    }
  }
});
```

For `monochromatic` and `glass`, structural tokens are intentionally re-applied after overrides so the method remains visually consistent.

## Accessibility

Set `accessibility.contrast` to collect warnings for important foreground/background pairs.

```ts
const result = buildThemeTokens({
  color: { light: { primary: "#777777" } },
  accessibility: { contrast: "AAA" }
});

console.log(result.warnings);
```

To make violations throw:

```ts
buildThemeTokens({
  color: { light: { primary: "#777777" } },
  accessibility: {
    contrast: "AAA",
    failOnViolation: true
  }
});
```

## Emitting CSS Variables

The package returns plain token records so consumers can decide how to emit them.

```ts
import { buildThemeTokens } from "@tavojs/ui-core";

const theme = buildThemeTokens({
  color: { light: { primary: "#116a67" } }
});

function toCssVariables(tokens: Record<string, string>) {
  return Object.entries(tokens)
    .map(([name, value]) => `--tui-${name}: ${value};`)
    .join("\n");
}

const lightCss = toCssVariables({
  ...theme.staticTokens,
  ...theme.modes.light.tokens
});
```

## Development

```sh
npm install
npm test
npm run typecheck
npm run build:lib
```

The build emits ESM and `.d.ts` files into `dist/`. Source imports use the `@/` alias and `scripts/postbuild.mjs` rewrites those aliases to relative imports in the published output.

For a map of the internal modules, see [docs/theme-engine.md](./docs/theme-engine.md).

## Project policies

See the public repository guidance for [contributing](https://github.com/tavojs/ui/blob/main/CONTRIBUTING.md), [security reporting](https://github.com/tavojs/ui/blob/main/SECURITY.md), the [MIT License](https://github.com/tavojs/ui/blob/main/LICENSE), and the [trademark policy](https://github.com/tavojs/ui/blob/main/TRADEMARKS.md).
