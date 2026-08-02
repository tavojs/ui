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

Configure npm Trusted Publishing for all three packages with GitHub Actions as
the provider, organization `tavojs`, repository `ui`, workflow
`.github/workflows/release.yml`, and environment `npm`. The workflow uses
GitHub OIDC and does not use an `NPM_TOKEN` secret.

Create the protected `npm` environment in the GitHub repository and use the
Node.js and npm versions declared by the workflow.

## Verify the release candidate

```bash
npm ci
npm run release:check
```

Inspect the package dry-runs and confirm that every package includes its
README, license, changelog, declarations, and runtime files. No package may
contain `file:`, `workspace:`, absolute paths, demo output, or test output.

## Publish

Commit and merge the Changeset into `main`, then manually dispatch the
`Publish` workflow. When unreleased Changesets exist, Changesets opens or
updates its version pull request. Review and merge that pull request, wait for
CI, and dispatch `Publish` again. The second run publishes through npm Trusted
Publishing, records provenance, and creates the GitHub releases.

The dependency order is UI Core, UI CLI, then UI. Do not run `npm publish` or
`npm run release` from a local checkout, and never use
`TAVO_UI_SKIP_REGISTRY_CHECK=1` while preparing a release.

## Verify

```bash
npm view @tavojs/ui-core version
npm view @tavojs/ui-cli version
npm view @tavojs/ui version
```

Confirm that the workflow created the package tags and GitHub releases.
