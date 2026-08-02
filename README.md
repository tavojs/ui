# Tavo UI

Public npm workspace monorepo for the Tavo UI web packages:

- `@tavojs/ui-core`
- `@tavojs/ui-cli`
- `@tavojs/ui`

Install dependencies and run the common checks from the repository root:

```bash
npm ci
npm run typecheck
npm test
npm run build
```

## Framework packages

The framework runtime and CLI are published separately as `@tavojs/core` and
`@tavojs/cli`. Core is the UI runtime peer. The framework CLI installs the
`tavo` command.

`@tavojs/ui-cli` is a different package. It owns the UI-specific `tavo-ui`
command and is installed automatically by `@tavojs/ui`:

```bash
npm install @tavojs/ui @tavojs/core
npm install --save-dev @tavojs/cli
npx tavo-ui web generate
```

## Release flow

This repository uses Changesets:

```bash
npm run changeset
npm run version-packages
npm install
npm run release:check
npm run release
```

All three packages are MIT licensed and include their own `LICENSE` files.
Package metadata and documentation link to [tavojs.dev](https://tavojs.dev).
