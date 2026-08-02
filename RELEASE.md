# Tavo UI Public Release

## Release scope

Publish exactly these packages:

- `@tavojs/ui-core`
- `@tavojs/ui-cli`
- `@tavojs/ui`

## Prerequisites

Verify the published framework runtime and CLI:

```bash
npm view @tavojs/core version
npm view @tavojs/cli version
```

Confirm npm authentication and `@tavojs` organization publish access. Use the
Node.js and npm versions declared in the root `package.json`.

## Verify the release candidate

```bash
npm ci
npm run release:check
```

Inspect the package dry-runs and confirm that every package includes its
README, license, changelog, declarations, and runtime files. No package may
contain `file:`, `workspace:`, absolute paths, demo output, or test output.

## Publish

Commit the versioned manifests, lockfile, changelogs, and consumed Changesets,
then publish through the guarded command:

```bash
npm run release
```

The dependency order is UI Core, UI CLI, then UI. Never use `--force`,
`--ignore-scripts`, or `TAVO_UI_SKIP_REGISTRY_CHECK=1` while publishing.

## Verify

```bash
npm view @tavojs/ui-core version
npm view @tavojs/ui-cli version
npm view @tavojs/ui version
```

Push the release commit and Changesets tags, then create the GitHub releases.
