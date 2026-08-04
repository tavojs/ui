# Tavo.js UI Library Guide

`@tavojs/ui` is a Tavo.js-native component library built for product interfaces. It provides TSX components, colocated SCSS modules, generated CSS variables, theme tooling, grouped exports, CSS-only package entrypoints, demo templates, and metadata for documentation or design-system tooling.

## Installation

Install the UI package with its peer dependency:

```bash
npm install @tavojs/ui @tavojs/core
npm install --save-dev @tavojs/cli
```

`@tavojs/core` provides the application runtime. The separate `@tavojs/cli`
development dependency installs the `tavo` command used for local development,
builds, previews, and project inspection.

The default entrypoints ship precompiled CSS module maps and automatically load bundled component CSS. Consuming apps do not need `sass` or `sass-embedded`.

```ts
import { Button, Card, Field } from "@tavojs/ui";
```

Generated apps should default to `@tavojs/ui`, `@tavojs/ui/button`, or grouped entrypoints like `@tavojs/ui/layout`. The `/css` entrypoints remain available as aliases for builds that prefer explicit CSS-only imports:

```ts
import { Button, Card, Field } from "@tavojs/ui/css";
```

## Minimum Theme Config

The smallest valid config is:

```json
{
  "color": {
    "light": {
      "primary": "#006ecf"
    }
  }
}
```

`secondary` is optional and derived from `primary`. Dark mode, semantic colors, scale, typography, output selectors, and `defaultTheme` all have defaults.

Set `defaultTheme` to choose the fallback generated CSS mode:

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

`system` starts with light tokens and follows `prefers-color-scheme` for dark devices. `light` and `dark` choose an explicit CSS default and do not switch because of device preference. Apps using the runtime can call `createThemeControllerFromConfig(config)` so the config default is used while stored user choices still win after first load.

Typography can use one font stack or separate body/header stacks:

```json
{
  "typography": {
    "textFontFamily": "Inter, ui-sans-serif, system-ui, sans-serif",
    "headingFontFamily": "Fraunces, Georgia, serif"
  }
}
```

`fontFamily` remains supported as the shared fallback. The generated tokens are `font-family`, `font-family-text`, and `font-family-heading`.

## Theme Presets

Use `preset` when you want an opinionated starting point:

```json
{
  "preset": "enterprise",
  "color": {
    "light": {
      "primary": "#006ecf"
    }
  }
}
```

Available presets are `minimal`, `glass`, `enterprise`, `editorial`, `dense`, `mobile`, and `monochrome`. Presets merge first; explicit config values win.

## Color Methods

`analogous` creates shade-driven surfaces from primary, secondary, and neutral ramps. Solid action backgrounds still keep the exact configured primary and secondary colors, so a button using `tone="primary"` visibly reflects the brand color. Use it for most product interfaces.

`monochromatic` keeps exact primary and secondary action colors while enforcing strict white light canvases and black dark canvases. It is useful for stark brand systems and monochrome products.

`glass` keeps exact action colors, shade-driven hover and soft colors, translucent surfaces, borders, neutral fills, and `backdrop-filter`. Components that support glass surfaces use the token automatically.

`fixShade` defaults to `true`, so generated ramps are centered around shade `500` unless a config explicitly opts out.

Solid action text uses the highest-contrast black or white text for the exact action background. If a brand needs a non-black/non-white label color, override `color-primary-text` or `color-secondary-text` in `tokens.light` or `tokens.dark`.

## Scale Controls

The `scale` config controls product feel:

```json
{
  "scale": {
    "controlHeight": 42,
    "spacing": 8,
    "radius": 4,
    "shadow": 0.35,
    "border": 1,
    "density": "comfortable",
    "focus": 3,
    "motion": 1,
    "opacity": 0.58,
    "blur": 22,
    "glassAlpha": 0.62,
    "controlRadius": 4,
    "surfaceRadius": 6
  }
}
```

Set `shadow` to `0` for flat products. Use fractional `border` values for hairlines. Use `density` to quickly move between compact, comfortable, and spacious UIs. In `glass` mode, `blur` controls the generated `--tui-blur-surface` token and shared `--tui-backdrop-filter`; Sheet, Sheet, Dialog, menus, popovers, and other glass-capable surfaces consume it automatically. `glassAlpha` controls sticky chrome opacity through `--tui-glass-chrome-alpha`; lower values make AppBar-style surfaces feel more transparent.

## Generated Token Families

The theme generator emits:

- Color tokens: `color-bg`, `color-surface`, `color-text`, `color-primary-bg`, `color-danger`, and many more.
- Product aliases: `color-app-bg`, `color-sidebar-bg`, `color-header-bg`, `color-panel-bg`, `color-selection-bg`, `color-focus-ring`, `color-overlay-bg`.
- Scale tokens: `size-*`, `space-*`, `radius-*`, `border-width`, `shadow-*`.
- Interaction tokens: `focus-width`, `motion-*`, `opacity-disabled`, `blur-surface`.

## CLI

The UI package includes a `tavo-ui` CLI for app projects. Use it to initialize config, generate theme CSS, validate contrast warnings, export tokens, and create static previews.

Create a config:

```bash
npx tavo-ui init --config tavo-ui.config.json
```

Generate theme CSS:

```bash
npx tavo-ui generate --config tavo-ui.config.json --out src/theme/generated/theme.css
```

Check theme contrast and config health:

```bash
npx tavo-ui check --config tavo-ui.config.json
npx tavo-ui audit --config tavo-ui.config.json
```

Export tokens:

```bash
npx tavo-ui tokens --config tavo-ui.config.json --mode light
npx tavo-ui tokens --config tavo-ui.config.json --format css
npx tavo-ui tokens --config tavo-ui.config.json --format figma
```

Generate a static preview:

```bash
npx tavo-ui preview --config tavo-ui.config.json --out theme-preview.html
```

See [CLI reference](cli.md) for all options, output formats, CI usage, and project script examples.

If you generate a physical theme file with the CLI, import that generated theme once in the app entry:

```tsx
import "./theme/generated/theme.css";
```

For the normal project setup, add the Tavo.js UI plugin to `tavo.config.ts`:

```ts
import { defineConfig } from "@tavojs/core/config";
import { tavoUi } from "@tavojs/ui/plugin";

export default defineConfig({
  plugins: [
    tavoUi({
      config: "tavo-ui.config.json"
    })
  ]
});
```

The plugin automatically attaches project-specific theme CSS generated from `tavo-ui.config.json` during dev and production builds. No app-level theme import is needed. Without the plugin, importing `@tavojs/ui/theme.css` uses the default theme shipped with the package.

The plugin follows the Tavo.js plugin API and declares its theme build contribution and its required
server-head permission in an inspectable manifest. Run `tavo inspect plugins` after installing or
upgrading it to review the effective ownership and permission reason.

## Imports

Root import:

```ts
import { Button, Card, Dialog } from "@tavojs/ui";
```

Focused imports:

```ts
import { Button } from "@tavojs/ui/button";
import { Field } from "@tavojs/ui/field";
```

Grouped imports:

```ts
import { Page, Shell } from "@tavojs/ui/layout";
import { Field, TextInput } from "@tavojs/ui/forms";
import { Table, Toolbar } from "@tavojs/ui/data";
import { Dialog, Toast } from "@tavojs/ui/feedback";
```

CSS alias grouped imports use the same bundled styles as the default entrypoints:

```ts
import { Page, Shell } from "@tavojs/ui/css/layout";
import { Field, TextInput } from "@tavojs/ui/css/forms";
```

CSS alias focused imports follow the same rule:

```ts
import { Button } from "@tavojs/ui/css/button";
import { Dialog } from "@tavojs/ui/css/dialog";
```

CSS alias utility imports:

```ts
import { buildTheme } from "@tavojs/ui/css/theme";
import { auditThemeA11y } from "@tavojs/ui/css/a11y";
import { componentMetadata } from "@tavojs/ui/css/metadata";
```

## API Conventions

`tone` means semantic color: `primary`, `secondary`, `neutral`, `success`, `warning`, `danger`, or `info`.

`variant` means visual treatment: usually `solid`, `soft`, `outline`, `ghost`, or `text`.

`size` means control scale: `sm`, `md`, or `lg`.

Layout primitives use `padding`, `radius`, `shadow`, `border`, `spacing`, `gap`, `side`, `ratio`, and `align`.

Most components accept `BaseProps`: `children`, `className`, `id`, `role`, `style`, `tabIndex`, `disabled`, common event handlers, `aria-*`, `data-*`, and other passthrough attributes.

## Compound APIs

Some components support both direct named exports and compound access:

```tsx
<Card.Root title="Usage">
  <Card.Content>Body</Card.Content>
  <Card.Actions>
    <Button>Save</Button>
  </Card.Actions>
</Card.Root>

<Table.Root>
  <Table.Head>...</Table.Head>
  <Table.Body>...</Table.Body>
</Table.Root>

<Table.Data columns={columns} rows={rows} />
```

Existing named imports like `CardContent` and `TableCell` remain supported.

## Accessibility Philosophy

The kit handles common ARIA and keyboard affordances where the component can do so safely. Examples include dialog focus trapping, escape handling, tab keyboard navigation, field message wiring, menu keyboard movement, and status announcements.

Stateful app decisions remain app-owned. For example, `Toast` does not create a global notification manager, and `Dialog` does not manage its own open state.

## Accessibility Audits

Use the theme audit in CI or development tooling when you want structured issues instead of CLI output:

```ts
import { auditThemeA11y } from "@tavojs/ui/a11y";

const themeAudit = auditThemeA11y({
  color: { light: { primary: "#7C5CFF" } },
  accessibility: { contrast: "AA", failOnViolation: false }
});
```

`auditThemeA11y` returns contrast warnings as structured issues. When `accessibility.failOnViolation` is `true`, issues are returned with `severity: "error"` instead of throwing.

## Templates

The demo app includes route-based templates:

- `/templates/blog`
- `/templates/admin`
- `/templates/login-register`
- `/templates/landing`
- `/templates/pricing`
- `/templates/docs`
- `/templates/settings`
- `/templates/checkout`
- `/templates/analytics`
- `/templates/onboarding`
- `/templates/file-manager`
- `/templates/inbox`
- `/templates/calendar`
- `/templates/project-board`
- `/templates/command-center`

These are intentionally composed with library components and minimal inline token-backed layout styles.

## Metadata

Use metadata for docs, design handoff, search, or AI-assisted component selection. Every public component exposes structured import paths, intent guidance, prop summaries, short examples, composition hints, and accessibility guidance:

```ts
import {
  componentMetadata,
  findComponentsForIntent,
  getAgentComponentGuide,
  getComponentMetadata,
  getComponentsByCategory
} from "@tavojs/ui/metadata";

const field = getComponentMetadata("Field");
const formComponents = getComponentsByCategory("forms");
const matches = findComponentsForIntent("modal dialog focus trap");
const buttonGuide = getAgentComponentGuide("button");
```

AI agents should prefer `getAgentComponentGuide(name)` once a component is selected, because it returns the compact import, usage, prop, example, accessibility, and related-component guidance needed to generate UI without scanning the full docs. The same metadata helpers are available from `@tavojs/ui/css/metadata` for CSS-alias consumers.

## Publishing Notes

`@tavojs/core` is the only peer dependency. The package ships compiled JS, declarations, generated CSS module maps, compiled `components.css`, generated `theme.css`, CSS-safe JS entrypoints, schema, README, and docs.

Run `npm run release:check` before publishing. It verifies the published `@tavojs/core` peer dependency, regenerates package metadata, type-checks, tests, builds the library and demo, runs a packed consumer smoke test, and finishes with `npm run pack:dry`. See [release.md](release.md).
