# AGENTS.md

Guidance for coding agents working in the public Tavo.js UI repository.

## Repository Shape

This npm workspace contains four public packages:

- `packages/ui-core` publishes `@tavojs/ui-core`
- `packages/ui-cli` publishes `@tavojs/ui-cli`
- `packages/ui` publishes `@tavojs/ui`
- `packages/ui-react-native` publishes `@tavojs/ui-react-native`

The root package is private only to prevent publishing the workspace coordinator.

## Package Boundaries

- `@tavojs/ui-core` is platform-neutral theme/config/token logic. Do not add React, React Native, DOM, Vite, CSS-module, or Tavo.js runtime dependencies here.
- `@tavojs/ui` owns web/Tavo.js components, CSS modules, internal web CLI behavior, plugin integration, docs, and demo.
- `@tavojs/ui-react-native` owns the React Native components, theme runtime,
  native theme generator, and Expo example. It shares theme logic with the
  web package through `@tavojs/ui-core`.
- `@tavojs/ui-cli` owns the public `tavo-ui` binary and forwards to the
  installed platform package's `/cli` export.
- `@tavojs/cli` is the separate framework CLI and publishes the `tavo` binary.

## Common Checks

Run from the repository root:

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run release:check
```

Follow [RELEASE.md](RELEASE.md) for first-package setup and publication
through the GitHub Actions `Publish` workflow.

## Public Repo Hygiene

- Keep root and package licenses MIT.
- Do not commit `node_modules`, package-local `dist`, `demo-dist`, test output, or nested `.git` folders.
- Do not add `file:`, `workspace:`, absolute local paths, or machine-specific paths to publishable package manifests.
- Keep public package names, exports, bins, peer dependencies, and publish configs stable unless intentionally changing the package API.
- `@tavojs/ui-cli` is the only package that should publish a public CLI bin.
