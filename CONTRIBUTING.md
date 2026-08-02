# Contributing

Thanks for helping improve Tavo UI.

## Local setup

Install workspace dependencies from the repository root:

```bash
npm ci
```

`@tavojs/ui` peers on the published `@tavojs/core` runtime. The framework-level
`tavo` executable is published separately by `@tavojs/cli`.

## Checks

Run before opening a pull request:

```bash
npm run typecheck
npm test
npm run build
```

Before publishing package changes, also run:

```bash
npm run release:check
```

## Releases

This repository uses Changesets. Add a Changeset for user-visible package
changes:

```bash
npm run changeset
```

Publishing is handled by the manually dispatched `Publish` GitHub Actions
workflow through npm Trusted Publishing with GitHub OIDC. Contributors should
not publish packages from their local checkout.
