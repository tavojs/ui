# AGENTS.md

Guidance for coding agents working in the public Tavo UI repository.

## Repository Shape

This npm workspace contains three public web packages:

- `packages/ui-core` publishes `@tavojs/ui-core`
- `packages/ui-cli` publishes `@tavojs/ui-cli`
- `packages/ui` publishes `@tavojs/ui`

The root package is private only to prevent publishing the workspace coordinator.

## Package Boundaries

- `@tavojs/ui-core` is platform-neutral theme/config/token logic. Do not add React, React Native, DOM, Vite, CSS-module, or Tavo runtime dependencies here.
- `@tavojs/ui` owns web/Tavo components, CSS modules, internal web CLI behavior, plugin integration, docs, and demo.
- `@tavojs/ui-cli` owns the public `tavo-ui` binary and forwards to `@tavojs/ui/cli`.
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

## Public Repo Hygiene

- Keep root and package licenses MIT.
- Do not commit `node_modules`, package-local `dist`, `demo-dist`, test output, or nested `.git` folders.
- Do not add `file:`, `workspace:`, absolute local paths, or machine-specific paths to publishable package manifests.
- Keep public package names, exports, bins, peer dependencies, and publish configs stable unless intentionally changing the package API.
- `@tavojs/ui-cli` is the only package that should publish a public CLI bin.
