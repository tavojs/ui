# @tavojs/ui

`@tavojs/ui` is a Tavo.js-native web UI library with 80 public components, compiled component CSS, project theme generation, and web tooling provided through `tavo-ui`.

## Documentation

Start with the [Tavo.js UI guide](https://tavojs.dev/docs/ui), configure the library through the [installation guide](https://tavojs.dev/docs/ui/installation), or browse the [80 public web components](https://tavojs.dev/docs/ui/components).

- [Library guide](docs/library.md)
- [CLI reference](docs/cli.md)
- [Component reference](docs/components.md)
- [Polymorphic `as` guide](docs/polymorphic-as.md)
- [Responsive sx guide](docs/responsive-sx.md)
- [Theming reference](docs/theming.md)

## What it contains

- Publishable component entrypoints compiled to `dist/`
- CSS-variable theme generation from a small config
- Tavo.js runtime theme controller helpers
- A local demo app powered by Tavo.js's stable router and development entrypoints

## Theme config

The root [tavo-ui.config.json](tavo-ui.config.json) drives the default generated palette. The generator accepts:

- `color.light.primary`
- `defaultTheme`
- `preset`
- `color.light.secondary` optional
- `color.dark.primary`
- `color.dark.secondary` optional
- `color.method`
- `color.fixShade`
- `semantic.light` and `semantic.dark` feedback colors
- `scale.unit`, `scale.controlHeight`, `scale.spacing`, `scale.radius`, `scale.shadow`, `scale.border`, `scale.density`, `scale.focus`, `scale.motion`, `scale.opacity`, `scale.blur`, `scale.glassAlpha`, `scale.controlRadius`, and `scale.surfaceRadius`
- `typography.fontFamily`, `typography.textFontFamily`, `typography.headingFontFamily`, `typography.bodySize`, and `typography.headingScale`
- `viewport.rootMin`, `viewport.rootMax`, `viewport.minWidth`, and `viewport.maxWidth`
- `breakpoints.sm`, `breakpoints.md`, and `breakpoints.lg`
- `output.selector`, `output.darkSelector`, and `output.includeMediaQuery`
- `tokens.light` and `tokens.dark` overrides
- `accessibility.contrast` and `accessibility.failOnViolation`

`color.method` can be `analogous`, `monochromatic`, or `glass`. `analogous` is shade-driven: generated primary, secondary, and neutral shades feed background, surface, border, hover, and soft tokens, while solid action backgrounds keep the exact configured primary and secondary colors. `monochromatic` is canvas-driven: light mode uses a strict white canvas, dark mode uses a strict black canvas, and `color-primary-bg` plus `color-secondary-bg` keep the exact configured primary and secondary colors. It also forces shade `50` to `#ffffff` and shade `950` to `#000000` for primary and secondary ramps. `glass` keeps exact action colors and shade-driven soft/hover colors while making surface, raised-surface, subtle-surface, border, and neutral tokens translucent, plus emits `backdrop-filter` for components that support glass surfaces.

`preset` can be `minimal`, `glass`, `enterprise`, `editorial`, `dense`, `mobile`, or `monochrome`. Presets are merged first, then explicit config values win.

If `secondary` is omitted, `@tavojs/ui` derives a neighboring analogous hue by rotating the primary hue 30 degrees, so secondary component tones remain distinct without requiring another input.

`color.fixShade` controls how the interior ramp is built before any monochromatic endpoint overrides are applied. It defaults to `true`, anchors the exact source at shade `500`, and interpolates monotonically toward light and dark endpoints. Set it to `false` to place the source color at its nearest lightness shade.

`scale.unit` is the smallest complete sizing input. A unit of `8` derives `space-1` as `8px`, the medium control size as `40px`, the medium radius as `8px`, body text as `16px`, and proportional focus and blur values. Explicit dimensional fields always override values derived from `unit`; explicit `controlHeight` and `spacing` also win over `density`.

Solid button text is chosen from black or white using contrast against the exact action background. For example, `#7C5CFF` receives black text because it has stronger AA contrast than white.

`scale.shadow` controls elevation intensity across the library. Use `0` to remove theme shadows, values below `1` for quieter elevation, and values above `1` when a product needs stronger depth. The default config uses `0.35` for a calmer UI.

`scale.border` controls token-driven border widths across cards, surfaces, fields, menus, and controls. Use `0` to remove those borders, fractional values like `0.5` for hairlines, and values above `1` for stronger outlines.

`scale.density`, `scale.focus`, `scale.motion`, `scale.opacity`, `scale.blur`, `scale.glassAlpha`, `scale.controlRadius`, and `scale.surfaceRadius` provide a broader visual contract for product teams that need compact UIs, calmer motion, different focus rings, stronger or softer glass, or distinct radii for controls versus surfaces. In `glass` mode, `scale.blur` feeds `--tui-backdrop-filter`, while `scale.glassAlpha` feeds `--tui-glass-chrome-alpha` for sticky chrome such as AppBar. Lower `glassAlpha` values reveal more backdrop color through translucent surfaces.

`viewport` controls the generated root `font-size`. Component dimensions are emitted mostly as `rem` tokens, so a viewport scale such as `rootMin: 14`, `rootMax: 16`, `minWidth: 320`, and `maxWidth: 960` makes spacing, controls, radii, and typography breathe better on mobile without per-component overrides.

`breakpoints` controls mobile-first responsive layout switches for `base`, `sm`, `md`, and `lg` responsive component props. It is separate from `viewport`: use `viewport` for fluid token scaling and `breakpoints` when a component should change layout or style at specific min-widths. The same values are written to `src/theme/breakpoints.scss` so component SCSS can use `@use "theme/breakpoints" as bp;` and `@include bp.tui-screen(md) { ... }`.

`typography.textFontFamily` controls normal body text, labels, and controls. `typography.headingFontFamily` controls headings and title-like component text. Existing `typography.fontFamily` remains the shared fallback when either specialized font is omitted.

The generator also emits product-level aliases for app surfaces: `color-app-bg`, `color-sidebar-bg`, `color-sidebar-border`, `color-header-bg`, `color-header-border`, `color-panel-bg`, `color-panel-border`, `color-danger-surface`, `color-selection-bg`, `color-focus-ring`, and `color-overlay-bg`.

Use the published schema for editor validation:

```json
{
  "$schema": "./node_modules/@tavojs/ui/schema.json"
}
```

Set `defaultTheme` to `light`, `dark`, or `system` when the generated CSS needs a default mode. `system` is the default and follows `prefers-color-scheme`. Explicit `light` or `dark` defaults stay in that mode until the runtime writes a different `data-tavo-theme`.

The public `@tavojs/ui/theme` entrypoint exports `tavoUiTokenMetadata`, `tavoUiTokenNames`, and `getTavoUiTokenMetadata(config)` for typed access to the complete supported CSS variable catalog. Validate application styles with:

```bash
npx tavo-ui validate-css --config tavo-ui.config.json src
```

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Peer dependencies

Install `@tavojs/core` in consuming apps. Install `@tavojs/cli` as a development dependency when the app uses `tavo dev`, `tavo build`, or other framework commands. Published component entrypoints use precompiled CSS module maps and bundled CSS, so apps do not need to install `sass` or `sass-embedded`.

```bash
npm install @tavojs/ui @tavojs/core
npm install --save-dev @tavojs/cli
```

Create and manage project theme assets with the CLI:

```bash
npx tavo-ui web init --config tavo-ui.config.json
npx tavo-ui web generate --config tavo-ui.config.json --out src/theme/generated/custom-theme.css
npx tavo-ui web check --config tavo-ui.config.json
npx tavo-ui web audit --config tavo-ui.config.json
npx tavo-ui web tokens --config tavo-ui.config.json --mode light
npx tavo-ui web tokens --config tavo-ui.config.json --format figma
npx tavo-ui web preview --config tavo-ui.config.json --out theme-preview.html
```

See the full [CLI reference](docs/cli.md) for command outputs, options, CI usage, and recommended project scripts.

Projects can also generate theme CSS automatically during `tavo dev` and `tavo build`, provided by the `@tavojs/cli` package, by adding the plugin:

```ts
import { defineConfig } from "@tavojs/core/config";
import { tavoUi } from "@tavojs/ui/plugin";

export default defineConfig({
  plugins: [tavoUi()]
});
```

With the plugin enabled, Tavo.js project source automatically receives the theme CSS generated from `tavo-ui.config.json` during dev and build. No app-level theme import is needed. Without the plugin, importing `@tavojs/ui/theme.css` still loads the package default theme.

`tavoUi()` uses the Tavo.js plugin API. Installing it enables its declared build contribution and the
`unsafeHeadHtml` permission used to place generated CSS in the server-rendered document head. Run
`tavo inspect plugins` after installation or upgrades to review the compiled ownership graph and
permission reason.

Use focused component entrypoints when you want smaller imports:

```ts
import { Button } from "@tavojs/ui/button";
import { Box } from "@tavojs/ui/box";
import { SearchInput } from "@tavojs/ui/search-input";
import { Section } from "@tavojs/ui/section";
import { Table, TableBody, TableCell } from "@tavojs/ui/table";
```

Use grouped entrypoints when you want product-area imports:

```ts
import { Page, Shell } from "@tavojs/ui/layout";
import { Field, TextInput } from "@tavojs/ui/forms";
import { Table, Toolbar } from "@tavojs/ui/data";
import { Dialog, Toast } from "@tavojs/ui/feedback";
import { componentMetadata } from "@tavojs/ui/metadata";
```

Use compound APIs when you want colocated component structure:

```tsx
<Card.Root title="Usage">
  <Card.Content>...</Card.Content>
  <Card.Actions>...</Card.Actions>
</Card.Root>

<Tabs.Root tabs={tabs} activeId={activeId} onChange={setActiveId} />
```

Page-building primitives like `Page`, `Section`, `Shell`, `Sidebar`, `SplitPane`, `Card`, `Box`, `Section`, `Toolbar`, `Box`, `Stack`, `Inline`, `Grid`, `List`, and `CodeBlock` are designed so product pages can be composed mostly with component props and theme tokens, keeping custom page SCSS optional. Form and accessibility primitives now include `Textarea`, `TextInput`, `SearchInput`, `Slider`, `ToggleGroup`, `DatePicker`, `Combobox`, `Fieldset`, `Legend`, `FormMessage`, `VisuallyHidden`, `Overlay`, `Portal`, and `FocusTrap`.

Recipe components provide app-ready compositions: `Card`, `Toolbar`, `Toolbar`, `CommandMenu`, `PropertyList`, `Grid`, `Card`, `Timeline`, `Stepper`, `StatusDot`, `Toast`, and `ConfirmDialog`.

API naming is intentionally consistent across the kit: use `tone` for semantic color, `variant` for visual treatment, `size` for control scale, `surface` or `tone` for background treatment, and `padding`, `radius`, `border`, and `shadow` for layout/elevation.

The consumer fixture in [fixtures/consumer](fixtures/consumer) imports the package through root and subpath entrypoints for publish-readiness smoke testing.

For normal Tavo.js and Vite projects, keep component imports on the default package entrypoints:

```ts
import { Button, Grid, Page, Section, Stat, Text } from "@tavojs/ui";
```

The default entrypoints automatically load bundled component CSS. Tavo.js projects using `tavoUi()` also get theme tokens injected automatically; projects without the plugin should import `@tavojs/ui/theme.css` once. The `/css` component entrypoints are equivalent CSS-safe aliases for apps that prefer explicit CSS import paths:

```ts
import "@tavojs/ui/theme.css";
import { Button, Card, Tabs } from "@tavojs/ui/css";
```

The `/css` entrypoints use the same component APIs. Focused and grouped subpaths are available too:

```ts
import { Button } from "@tavojs/ui/css/button";
import { Page, Shell } from "@tavojs/ui/css/layout";
import { auditThemeA11y } from "@tavojs/ui/css/a11y";
import { buildTheme } from "@tavojs/ui/css/theme";
```

The accessibility theme-audit helper is available from the normal package too:

```ts
import { auditThemeA11y } from "@tavojs/ui/a11y";

const audit = auditThemeA11y({
  color: { light: { primary: "#7C5CFF" } },
  accessibility: { contrast: "AA" }
});
```

Before publishing, run:

```bash
npm run release:check
```

The release checklist lives in [docs/release.md](docs/release.md).

## Project policies

See the public repository guidance for [contributing](https://github.com/tavojs/ui/blob/main/CONTRIBUTING.md), [security reporting](https://github.com/tavojs/ui/blob/main/SECURITY.md), the [MIT License](https://github.com/tavojs/ui/blob/main/LICENSE), and the [trademark policy](https://github.com/tavojs/ui/blob/main/TRADEMARKS.md).
