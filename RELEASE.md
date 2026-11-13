# Tavo.js UI Public Release

The public npm packages are `@tavojs/ui-core`, `@tavojs/ui-cli`,
`@tavojs/ui`, and `@tavojs/ui-react-native`.

## Verify the release candidate

```bash
npm ci
npm run release:check
```

Check the package dry-runs for the README, license, changelog, declarations,
and runtime files. The packlists should exclude local dependencies, test
output, and demo build output.

## First React Native publication through OIDC

The first native package version is `1.0.0`, and the shared CLI adds native
theme generation in `1.1.0`. The pending web Changeset also releases
`@tavojs/ui@1.0.6`.

1. Merge the public sync pull request and dispatch `Publish` on `main`.
   Review and merge the Changesets version pull request, then wait for CI.
2. If the native package name is new to npm, a maintainer with publish access
   and 2FA publishes a minimal `@tavojs/ui-react-native@0.0.0` package from a
   temporary directory with `npm publish --access public --tag bootstrap`.
   This creates the package settings before the workflow publishes the
   actual `1.0.0` artifact.
   [Changesets first-release guidance](https://github.com/changesets/changesets/blob/main/site/guide/versioning-and-publishing.md#trusted-publishing)
3. In the native package's npm settings, add a GitHub Actions Trusted
   Publisher with owner `tavojs`, repository `ui`, workflow `release.yml`,
   and environment `npm`. Enable direct `npm publish`. Configure it when
   ready to publish because new trust expires after two days without a
   successful publish.
   [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)
4. Dispatch `Publish` again on `main` and verify the npm release and
   provenance for `@tavojs/ui-react-native@1.0.0`.

## Publish through GitHub Actions

Merge the Changesets into `main`, then manually dispatch `Publish`. The
workflow opens or updates a version pull request. Review and merge it, wait
for CI, then dispatch `Publish` again. The workflow publishes through npm
Trusted Publishing with GitHub OIDC, records provenance, and creates GitHub
releases for the packages it publishes.

## Verify

```bash
npm view @tavojs/ui-react-native@1.0.0 version
npm view @tavojs/ui-cli@1.1.0 version
npm view @tavojs/ui@1.0.6 version
```

In a React Native or Expo app, install `@tavojs/ui-react-native` and render a
component inside `TavoThemeProvider`. Follow the native README to install the
shared CLI and run `npx tavo-ui native generate`. Confirm the workflow-created
tags and GitHub releases for the Changesets-published versions.

## Rollback

If a published version has a serious issue, deprecate that version with a
clear message and release a fix through a new Changeset.
