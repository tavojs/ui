# @tavojs/ui-cli

## 1.0.0

### Major Changes

- Publish the first stable Tavo UI web release. The 1.0 release includes the
  platform-neutral theme engine, web component library, and web CLI. The React
  Native workspace remains private and is not part of this release.
- Make the public `tavo-ui` coordinator web-only and reject unavailable native
  commands with a clear error.

### Minor Changes

- 53d0dc4: Publish typed Tavo UI token metadata and add a `validate-css` command that reports unsupported `--tui-*` variables with source locations and grouped alternatives.

### Patch Changes

- Require the stable `@tavojs/ui@^1.0.0` peer range.
