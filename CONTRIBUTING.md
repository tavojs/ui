# Contributing to Tavo.js UI

Thank you for helping improve Tavo.js UI and Tavo.js UI Core.

## Local setup

Install workspace dependencies from the repository root:

```bash
npm install
```

`@tavojs/ui` peers on the published `@tavojs/core` runtime. The framework-level
`tavo` executable comes from the separate `@tavojs/cli` package;
`@tavojs/ui-cli` owns only the UI-specific `tavo-ui` executable.

## Development conventions

- Keep `@tavojs/ui-core` platform-neutral. It must not depend on React, DOM
  APIs, Vite, CSS modules, or the Tavo.js runtime.
- Keep web components in `@tavojs/ui`, with colocated TSX and
  `*.module.scss` files. Use theme tokens and the existing CSS layers instead
  of introducing unscoped global styles.
- Preserve semantic HTML, keyboard behavior, focus management, accessible
  names, and ARIA relationships. Add or update accessibility tests and
  metadata when component behavior changes.
- Treat `scripts/component-manifest.mjs` and the component documentation as
  generation inputs. Run the package generator after adding, removing, or
  renaming public components; do not hand-edit generated exports or metadata.
- Keep public package names, export paths, peer dependencies, and the
  `tavo-ui` binary stable unless the change intentionally updates the public
  API.
- Add tests, documentation, examples, and a Changeset when a user-visible
  package change requires them.

## Validation

Run the repository checks before opening a pull request:

```bash
npm run typecheck
npm test
npm run build
npm run smoke:consumer
npm run pack:dry
```

For a release-facing change, also run the non-publishing release validation:

```bash
npm run release:check
```

Use Changesets for user-visible changes:

```bash
npm run changeset
```

Publishing is handled by the manually dispatched `Publish` GitHub Actions
workflow. Contributors must not publish packages from a local checkout.

## License and copyright

Contributions are licensed under the [MIT License](LICENSE). Contributors
retain copyright in their contributions, and no copyright assignment is
required.

You must have the legal right to submit all code, documentation, styles,
design assets, tests, examples, metadata, and generated inputs in your
contribution. Do not submit incompatible copied work, confidential material,
secrets, credentials, or personal data.

The MIT License grants no trademark rights. The project
[trademark policy](TRADEMARKS.md) applies.

## Developer Certificate of Origin

Every contributed commit must be signed off to certify the
[Developer Certificate of Origin 1.1](https://developercertificate.org/). Add
the sign-off when committing:

```bash
git commit --signoff
```

The commit message will include a line in this form:

```text
Signed-off-by: Your Name <your.email@example.com>
```

Unsigned commits may need to be corrected before the contribution can be
merged.
