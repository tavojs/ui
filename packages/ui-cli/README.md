# @tavojs/ui-cli

CLI for Tavo UI web projects.

For web projects, use the explicit `web` command group documented in the [Tavo UI CLI guide](https://tavojs.dev/docs/ui/cli):

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
and inspecting Tavo applications.

React Native commands and packages are not part of the Tavo UI 1.0 public
release.
