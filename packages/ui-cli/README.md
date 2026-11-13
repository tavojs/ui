# @tavojs/ui-cli

CLI for Tavo.js UI web and React Native projects.

## Web

Use the `web` command group. [Tavo.js UI CLI guide](https://tavojs.dev/docs/ui/cli)

```bash
npx tavo-ui web generate
npx tavo-ui web check
npx tavo-ui web audit
```

Installing `@tavojs/ui` also installs the CLI.

```bash
npm install @tavojs/ui
```

`tavo-ui web ...` forwards to `@tavojs/ui/cli`.

## React Native

Install the native package and add the CLI as a development dependency.

```bash
npm install @tavojs/ui-react-native
npm install -D @tavojs/ui-cli
npx tavo-ui native generate
```

`tavo-ui native generate` forwards to `@tavojs/ui-react-native/cli`. It reads your app's theme config and generates a JavaScript module with its TypeScript declaration.

This package is intentionally separate from `@tavojs/cli`, which installs the
framework-level `tavo` command for creating, developing, building, previewing,
and inspecting Tavo.js applications.

## Project policies

See the public repository guidance for [contributing](https://github.com/tavojs/ui/blob/main/CONTRIBUTING.md), [security reporting](https://github.com/tavojs/ui/blob/main/SECURITY.md), the [MIT License](https://github.com/tavojs/ui/blob/main/LICENSE), and the [trademark policy](https://github.com/tavojs/ui/blob/main/TRADEMARKS.md).
