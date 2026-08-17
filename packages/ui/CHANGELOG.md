# Changelog

## 1.0.4

### Patch Changes

- 5569f6a: Route internal component links through the active Tavo.js router while preserving native anchor attributes, custom link components, disabled behavior, and user event handlers across menus, navigation, pagination, and toggles. Require `@tavojs/core@^1.0.3` for the corresponding router link contract.

## 1.0.3

### Patch Changes

- b7268c2: Add `showArrow` to Collapsible and DropdownMenu, add centered Collapsible triggers that are unaffected by arrow width, and prevent an open Collapsible from rotating arrows owned by nested Collapsibles.

## 1.0.2

### Patch Changes

- ebe34c0: Add controlled month and year selectors directly in the Calendar's top heading, with previous and next month navigation.

## 1.0.1

### Patch Changes

- 232234a: Adopt Tavo.js branding across package metadata, documentation, generated assets, and user-facing messages.
- Updated dependencies [232234a]
  - @tavojs/ui-core@1.0.1
  - @tavojs/ui-cli@1.0.1

All notable changes to `@tavojs/ui` are documented here.

## 1.0.0

### Major Changes

- Publish the first stable Tavo.js UI web release. The 1.0 release includes the
  platform-neutral theme engine, web component library, and web CLI. The React
  Native workspace remains private and is not part of this release.
- Add public npm metadata, an MIT license, public package access configuration,
  and release checks for packed consumers and registry prerequisites.

### Minor Changes

- 53d0dc4: Publish typed Tavo.js UI token metadata and add a `validate-css` command that reports unsupported `--tui-*` variables with source locations and grouped alternatives.
- bd2755e: Make minimal theme generation more predictable with monotonic anchored color ramps, a hue-shifted derived secondary, a single `scale.unit` dimensional seed, override-aware semantic aliases, strict opacity validation, and complete mode-specific CSS token output.
- Remove the non-reactive web `useTheme` alias, stop re-exporting core-only theme result types from the web theme entry point, internalize package-maintenance accessibility metadata audits, and remove the Carousel and LiveRegion components.
- 9f50ade: Remove the theme size and custom CSS-variable prefix configuration, make `as` the only polymorphic root prop, narrow component metadata statuses, and generate physical themes as CSS.
- 4cd191b: Allow layout sizing and spacing props to use mobile-first `base`, `sm`, `md`, and `lg` responsive values while preserving scalar values.

### Patch Changes

- bd2755e: Compress generated component and theme CSS so SSR style payloads and the aggregate stylesheet stay compact without changing CSS semantics.
- 4cd191b: Update the web CLI init command to generate the dark monochromatic purple theme defaults.
- 4cd191b: Migrate the Tavo.js UI theme integration to stable Plugin API v1 with a declarative manifest and lazy server and build phases.
- Updated dependencies [53d0dc4]
- Updated dependencies [bd2755e]
- Updated dependencies
- Updated dependencies [9f50ade]
  - @tavojs/ui-cli@1.0.0
  - @tavojs/ui-core@1.0.0

## 0.1.0

- Initial Tavo.js UI package with colocated TSX components and SCSS modules.
- Added theme generation, runtime theme helpers, CLI commands, demo templates, metadata, grouped exports, and CSS-only package output.
