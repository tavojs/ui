# Tavo.js UI Monorepo

This repository contains the public Tavo.js UI packages:

- `packages/ui-core` publishes `@tavojs/ui-core`
- `packages/ui-cli` publishes `@tavojs/ui-cli`
- `packages/ui` publishes `@tavojs/ui`
- `packages/ui-react-native` publishes `@tavojs/ui-react-native`

`@tavojs/ui-core` owns platform-neutral theme configuration, validation, and
token generation. `@tavojs/ui-cli` owns the `tavo-ui` executable and delegates
to the installed platform package's CLI export. `@tavojs/ui` owns web
components, theme generation, docs, plugin integration, and demo assets.
`@tavojs/ui-react-native` owns native components, the native theme runtime and
generator, and the Expo example.

The framework-level `tavo` command is published separately by `@tavojs/cli`.

## Releases

Validate package changes locally and add a Changeset:

```bash
npm run release:check
npm run changeset
```

Follow [RELEASE.md](RELEASE.md) for first-package setup and publication
through the GitHub Actions `Publish` workflow.

Publishable packages must include MIT license files and must not contain
`file:`, `workspace:`, or machine-local dependency paths.
