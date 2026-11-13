# Tavo.js UI

Public npm workspace monorepo for Tavo.js UI and React Native:

- `@tavojs/ui-core`
- `@tavojs/ui-cli`
- `@tavojs/ui`
- [`@tavojs/ui-react-native`](packages/ui-react-native/README.md)

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

React Native apps can install `@tavojs/ui-cli` as a development dependency and
run `npx tavo-ui native generate` with CLI 1.1 or later.

## Release flow

This repository uses Changesets and publishes through the manually dispatched
GitHub Actions `Publish` workflow:

```bash
npm run changeset
npm run release:check
```

Follow the [release guide](RELEASE.md) for the first React Native publication.
For version updates, merge the Changeset into `main` and run the `Publish` workflow.
The first run creates or updates the Changesets version pull request. After
that pull request is merged, run the workflow again to publish through npm
Trusted Publishing with GitHub OIDC and create the GitHub releases. No
`NPM_TOKEN` repository secret is used.

All four packages are MIT licensed and include their own `LICENSE` files.
Package metadata and documentation link to [tavojs.dev](https://tavojs.dev).

## Project policies

Read the guidance for [contributing](https://github.com/tavojs/ui/blob/main/CONTRIBUTING.md), [security reporting](https://github.com/tavojs/ui/blob/main/SECURITY.md), the [MIT License](https://github.com/tavojs/ui/blob/main/LICENSE), and the [trademark policy](https://github.com/tavojs/ui/blob/main/TRADEMARKS.md).
