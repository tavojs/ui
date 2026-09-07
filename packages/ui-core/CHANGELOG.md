# @tavojs/ui-core

## 1.0.2

### Patch Changes

- 7df43a3: Add fixed, fluid, and stepped root-font viewport strategies, default new themes
  to a fixed 16px root, preserve fluid behavior for existing explicit viewport
  configs, and enable component backdrop filters only when a glass theme provides
  the shared filter token.

## 1.0.1

### Patch Changes

- 232234a: Adopt Tavo.js branding across package metadata, documentation, generated assets, and user-facing messages.

## 1.0.0

### Major Changes

- Publish the first stable Tavo.js UI web release. The 1.0 release includes the
  platform-neutral theme engine, web component library, and web CLI. The React
  Native workspace remains private and is not part of this release.

### Minor Changes

- bd2755e: Make minimal theme generation more predictable with monotonic anchored color ramps, a hue-shifted derived secondary, a single `scale.unit` dimensional seed, override-aware semantic aliases, strict opacity validation, and complete mode-specific CSS token output.
- 9f50ade: Remove the theme size and custom CSS-variable prefix configuration, make `as` the only polymorphic root prop, narrow component metadata statuses, and generate physical themes as CSS.
