# Web 1.0 Release Flow

This release includes exactly `@tavojs/ui-core`, `@tavojs/ui-cli`, and
`@tavojs/ui`.

1. Verify the published framework packages with `npm view @tavojs/core version`
   and `npm view @tavojs/cli version`. Core is the UI runtime peer; CLI is the
   separate package that installs the framework-level `tavo` command.
2. From the repository root, install the locked dependencies with `npm ci`.
3. Confirm that the three public package manifests and changelogs say `1.0.0`
   and that the repository contains only the three public workspaces.
4. Run `npm run release:check:web` in the private source repository and
   `npm run release:check` in the exported public repository.
5. Inspect the three dry-run package manifests and confirm no local paths,
   development output, or React Native package is included.
6. Sync the Changeset to the public repository and merge it into `main`.
7. Manually dispatch the public repository's `Publish` workflow. Merge the
   Changesets version pull request it creates, then dispatch the workflow again
   to publish through npm Trusted Publishing with GitHub OIDC.
8. Verify the registry:
   `npm view @tavojs/ui-core@1.0.0 version`,
   `npm view @tavojs/ui-cli@1.0.0 version`, and
   `npm view @tavojs/ui@1.0.0 version`.
9. Test a clean consumer install of `@tavojs/ui@1.0.0`.
10. Confirm the workflow-created package tags and GitHub releases.

`npm run release:check:web` checks UI Core and the web CLI, then runs the web
package's manifest guard, production dependency audit, registry peer preflight,
generated exports, type checking, tests, production build, packed consumer
smoke test, and package dry-runs.

Do not publish from a local checkout and do not use
`TAVO_UI_SKIP_REGISTRY_CHECK=1` while preparing the release. It is only a
local-development escape hatch for registry outages.
