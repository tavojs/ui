# Web Release Flow

`@tavojs/ui` peers on the separately published `@tavojs/core` framework
runtime. Verify its published version with `npm view @tavojs/core version`.

From the monorepo root, run `npm ci` and `npm run release:check:web`. The web
check validates the release manifests, audits production dependencies, checks
the framework peer against npm, and verifies the generated exports, tests,
production build, packed consumer, and npm packlists.

Follow the [monorepo release guide](../../../RELEASE.md) for Changesets and
publication through GitHub Actions. After publication, verify the web version
on npm and build a clean consumer install of `@tavojs/ui`.
