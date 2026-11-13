# @tavojs/ui-react-native

React Native components and theme runtime for Tavo.js UI.

This package uses `@tavojs/ui-core` for platform-neutral theme configuration and token generation, then adapts those tokens into React Native-friendly styles.

## Installation

From your React Native or Expo app, run

```bash
npm install @tavojs/ui-react-native
```

Wrap your app with `TavoThemeProvider` to use the built-in mobile theme.

```tsx
import { Button, Stack, TavoThemeProvider, Text } from "@tavojs/ui-react-native";

export function Example() {
  return (
    <TavoThemeProvider>
      <Stack gap="md" padding="md">
        <Text variant="h2">Native Tavo.js UI</Text>
        <Button>Continue</Button>
      </Stack>
    </TavoThemeProvider>
  );
}
```

## Generated config

To customize the theme, add a `tavo-ui.config.json` file at your app root.

```json
{
  "preset": "mobile",
  "defaultTheme": "system",
  "color": {
    "light": { "primary": "#006ecf" }
  }
}
```

Install `@tavojs/ui-cli` as a development dependency, then generate the native config module from your app root.

```bash
npm install -D @tavojs/ui-cli@^1.1.0
npx tavo-ui native generate
```

The command reads `tavo-ui.config.json` by default, validates it with `@tavojs/ui-core`, and writes `tavo-ui.generated.js` and a matching TypeScript declaration in your app. Import the generated module and pass it to the provider.

```tsx
import themeConfig from "./tavo-ui.generated.js";

<TavoThemeProvider config={themeConfig}>{children}</TavoThemeProvider>;
```

Use `--config <path>` to read a different config file or `--out <path.js>` to choose the output path.

To run generation through npm, add this script to your app's `package.json`.

```json
{
  "scripts": {
    "tavo:generate": "tavo-ui native generate"
  }
}
```

Run `npm run tavo:generate` whenever `tavo-ui.config.json` changes.

## Component imports

Components are available from the package root and from per-component subpaths.

```tsx
import { Button } from "@tavojs/ui-react-native";
import { Button as ButtonOnly } from "@tavojs/ui-react-native/button";
```

Component subpaths require Metro package exports. React Native 0.79 and later
enable them by default. On older Metro versions that support exports, set
`resolver.unstable_enablePackageExports` to `true` in `metro.config.js`.
[Metro package exports](https://metrobundler.dev/docs/package-exports/)

## Component scope

Every web component name has a native export. Native interaction and layout use React Native primitives, so some props differ from their web equivalents. The [Component Parity guide](docs/component-parity.md) describes native integration and accessibility.

`FileTrigger` accepts an app-provided `picker` function. Connect your native document picker and receive the selected files through `onFilesChange`.

See the [Expo example](examples/expo/README.md) for a complete app that uses a generated theme config.
