# Tavo UI Monorepo

This repository contains the public Tavo UI web package family:

- `packages/ui-core` publishes `@tavojs/ui-core`
- `packages/ui-cli` publishes `@tavojs/ui-cli`
- `packages/ui` publishes `@tavojs/ui`

`@tavojs/ui-core` owns platform-neutral theme configuration, validation, and
token generation. `@tavojs/ui-cli` owns the `tavo-ui` executable and delegates
to the web package CLI export. `@tavojs/ui` owns web components, theme
generation, docs, plugin integration, and demo assets.

The framework-level `tavo` command is published separately by `@tavojs/cli`.

## Release order

Publish with Changesets from the root:

```bash
npm run release:check
npm run release
```

Dependency order is:

1. `@tavojs/ui-core`
2. `@tavojs/ui-cli`
3. `@tavojs/ui`

Publishable packages must include MIT license files and must not contain
`file:`, `workspace:`, or machine-local dependency paths.
