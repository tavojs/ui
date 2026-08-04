# @tavojs/ui-cli

CLI for Tavo.js UI web projects.

For web projects, use the explicit `web` command group documented in the [Tavo.js UI CLI guide](https://tavojs.dev/docs/ui/cli):

```bash
npx tavo-ui web generate
npx tavo-ui web check
npx tavo-ui web audit
```

Install it directly, or install `@tavojs/ui`, which depends on it:

```bash
npm install -D @tavojs/ui-cli
npm install @tavojs/ui
```

`tavo-ui web ...` forwards to `@tavojs/ui/cli`.

This package is intentionally separate from `@tavojs/cli`, which installs the
framework-level `tavo` command for creating, developing, building, previewing,
and inspecting Tavo.js applications.

React Native commands and packages are not part of the Tavo.js UI 1.0 public
release.

## Project policies

See the public repository guidance for [contributing](https://github.com/tavojs/ui/blob/main/CONTRIBUTING.md), [security reporting](https://github.com/tavojs/ui/blob/main/SECURITY.md), the [MIT License](https://github.com/tavojs/ui/blob/main/LICENSE), and the [trademark policy](https://github.com/tavojs/ui/blob/main/TRADEMARKS.md).
