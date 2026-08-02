# CLI Reference

The `@tavojs/ui` package ships a `tavo-ui` command for project theme setup, validation, token export, and preview generation.

Install the UI package and its peer dependency in the app:

```bash
npm install @tavojs/ui @tavojs/core
npm install --save-dev @tavojs/cli
```

`@tavojs/cli` installs the framework-level `tavo` command. Tavo UI's theme
commands remain available through the separate `tavo-ui` executable installed
by `@tavojs/ui`.

Run commands with `npx`:

```bash
npx tavo-ui <command> [options]
```

If no command is provided, `tavo-ui` runs `generate`.

## Commands

| Command | Purpose | Writes files |
| --- | --- | --- |
| `init` | Create a starter `tavo-ui.config.json`. | Yes |
| `generate` | Build theme CSS from a config. | Yes |
| `check` | Validate theme config and contrast warnings. | No |
| `validate-css` | Report unsupported `--tui-*` variables in application stylesheets. | No |
| `audit` | Emit structured audit JSON for CI or tooling. | No |
| `tokens` | Print generated tokens as JSON, CSS, or Figma-style JSON. | No |
| `preview` | Create a static HTML preview of the generated theme. | Yes |

## Options

| Option | Commands | Default | Description |
| --- | --- | --- | --- |
| `--config`, `-c` | All commands | `tavo-ui.config.json` | Path to the theme config. |
| `--out`, `-o` | `generate`, `preview` | `src/theme/generated/default-theme.css` | Output path for generated CSS or preview HTML. Generated themes must use the `.css` extension. |
| `--mode` | `tokens` | `all` | Token mode: `light`, `dark`, or `all`. |
| `--format` | `tokens` | `json` | Token format: `json`, `css`, or `figma`. |

`validate-css` accepts one or more CSS files or directories as positional arguments. It scans `src` when no path is provided and supports `.css`, `.scss`, `.sass`, and `.less` files.

Unknown commands and options exit with an error.

## Init

Create a starter config:

```bash
npx tavo-ui init --config tavo-ui.config.json
```

The generated config includes:

- `$schema` pointing at `./node_modules/@tavojs/ui/schema.json`
- `defaultTheme: "dark"`
- a `#7C3AED` light primary and `#A78BFA` dark primary
- monochromatic palette generation with fixed shades
- an 8px scale unit

`init` will not overwrite an existing config. If the target file already exists, the command exits with an error.

## Generate

Generate theme CSS:

```bash
npx tavo-ui generate --config tavo-ui.config.json --out src/theme/generated/theme.css
```

Then import the generated theme once in the app:

```tsx
import "./theme/generated/theme.css";
import { Button, Page, Section } from "@tavojs/ui";
```

The generated CSS contains Tavo UI variables such as `--tui-color-bg`, `--tui-color-primary-bg`, `--tui-radius-control`, `--tui-size-md`, and `--tui-font-family-text`.

## Validate Application CSS

Check all supported stylesheet files under `src`:

```bash
npx tavo-ui validate-css --config tavo-ui.config.json src
```

You can pass individual files or multiple paths. The command ignores comments and reports every unsupported `--tui-*` variable with its source location and the available variables in the same token group:

```text
Unknown Tavo UI token: --tui-space-8
  at src/styles.css:12:18
Available spacing tokens:
  --tui-space-1
  --tui-space-2
  --tui-space-3
  --tui-space-4
  --tui-space-5
  --tui-space-6
```

Tokens declared under `tokens.light` or `tokens.dark` in the selected config are treated as supported. The command exits with status 1 when it finds an unknown token, making it suitable for CI.

## Automatic Generation During Dev And Build

Projects can regenerate theme CSS automatically when `tavo dev` or `tavo build` from `@tavojs/cli` runs by adding the Tavo UI plugin to `tavo.config.ts`:

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

With the plugin enabled, Tavo project source automatically receives the theme CSS generated from the project config during dev and production builds. No app-level theme import is needed. Without the plugin, importing `@tavojs/ui/theme.css` falls back to the default theme shipped with the package.

The integration is a Tavo plugin descriptor with lazy server and build phases. Its manifest
declares the named Vite contribution that generates and watches theme CSS, plus the
`unsafeHeadHtml` permission required to inject that CSS into the server-rendered document head.
Installing `tavoUi()` enables that declared permission; use `tavo inspect plugins` to review its
owner, contribution, and reason.

Plugin options:

| Option | Default | Description |
| --- | --- | --- |
| `config` | `tavo-ui.config.json` | Theme config path, relative to the project root unless absolute. |
| `out` | `false` | Optional extra file path if the project also wants a physical generated CSS copy. |
| `watch` | `true` | Regenerate when the config changes during dev. |
| `silent` | `false` | Suppress generation logs and warning logs. |
| `required` | `true` | Throw when the config file is missing. |
| `inject` | `true` | Automatically attach generated theme CSS to project source modules. |

## Check

Validate config health and contrast warnings:

```bash
npx tavo-ui check --config tavo-ui.config.json
```

When the config passes without warnings, the command prints:

```text
Theme config passed checks.
```

When warnings exist, they are written to stderr and the command prints the warning count.

## Audit

Emit structured JSON for CI, project scripts, or custom tooling:

```bash
npx tavo-ui audit --config tavo-ui.config.json
```

Example shape:

```json
{
  "passed": true,
  "warningCount": 0,
  "warnings": []
}
```

Warnings are still written to stderr so local runs remain readable.

## Tokens

Print generated token data as JSON:

```bash
npx tavo-ui tokens --config tavo-ui.config.json
```

Print only light tokens:

```bash
npx tavo-ui tokens --config tavo-ui.config.json --mode light
```

Print CSS variables:

```bash
npx tavo-ui tokens --config tavo-ui.config.json --format css
```

Print light-mode CSS variables only:

```bash
npx tavo-ui tokens --config tavo-ui.config.json --format css --mode light
```

Mode-specific CSS includes the selected color ramps and semantic variables together with the shared sizing, spacing, radius, typography, motion, and breakpoint variables needed to use that mode independently.

Print Figma-style token JSON:

```bash
npx tavo-ui tokens --config tavo-ui.config.json --format figma
```

For `--format json`, `--mode all` prints the full resolved mode objects. For `--format css`, `--mode all` prints the same full CSS text generated by `generate`. For `--format figma`, values are grouped by mode and include a basic token type of `color`, `typography`, or `dimension`.

## Preview

Generate a static preview HTML file:

```bash
npx tavo-ui preview --config tavo-ui.config.json --out theme-preview.html
```

The preview includes:

- generated theme CSS
- core surface swatches
- a primary action sample
- tables for color, scale, and interaction tokens

Open the generated HTML file in a browser to inspect the theme without starting the demo app.

## Recommended Project Scripts

For app projects using Tavo UI, add scripts like:

```json
{
  "scripts": {
    "ui:init": "tavo-ui init --config tavo-ui.config.json",
    "ui:theme": "tavo-ui generate --config tavo-ui.config.json --out src/theme/tavo.css",
    "ui:check": "tavo-ui check --config tavo-ui.config.json",
    "ui:check-css": "tavo-ui validate-css --config tavo-ui.config.json src",
    "ui:audit": "tavo-ui audit --config tavo-ui.config.json",
    "ui:preview": "tavo-ui preview --config tavo-ui.config.json --out theme-preview.html"
  }
}
```

These scripts are only needed when a project wants a physical CSS file. In that case, import the generated theme in the app entry:

```tsx
import "./theme/tavo.css";
```

For plugin-managed projects, no theme import is needed. For projects without the plugin, keep the package theme import instead:

```tsx
import "@tavojs/ui/theme.css";
```

## CI Usage

Use `check` for readable logs:

```bash
npx tavo-ui check --config tavo-ui.config.json
```

Use `audit` when CI needs JSON output:

```bash
npx tavo-ui audit --config tavo-ui.config.json
```

If `accessibility.failOnViolation` is enabled in the config, theme contrast violations are treated as errors by the theme builder.

## Related Files

- `tavo-ui.config.json`: project theme config
- `schema.json`: published config schema at `@tavojs/ui/schema.json`
- `docs/theming.md`: theme configuration reference
- `docs/tokens.md`: generated token reference
