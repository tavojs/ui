# Theme Engine Architecture

The public API is intentionally small:

- `buildThemeTokens`
- `resolveThemeConfig`
- `resolveThemeBreakpoints`
- all public types and color utilities exported from `src/index.ts`

Keep those exports stable unless a breaking release is intentional.

## Module Layout

- `src/theme/build.ts`: public orchestration for building a full theme result.
- `src/theme/types.ts`: public TypeScript contracts.
- `src/theme/color.ts`: public color utility functions and ramp generation.
- `src/theme/defaults.ts`: internal defaults for semantic colors and breakpoints.
- `src/theme/presets.ts`: preset definitions and preset merge logic.
- `src/theme/breakpoints.ts`: breakpoint defaulting.
- `src/theme/validation.ts`: config validation and developer-facing error messages.
- `src/theme/mode-tokens.ts`: light/dark color ramps, semantic colors, surface tokens, and product alias tokens.
- `src/theme/static-tokens.ts`: mode-independent sizing, spacing, radius, typography, motion, interaction, blur, and breakpoint tokens.
- `src/theme/accessibility.ts`: contrast warning collection.

## Adding A Preset

1. Add the preset name to `ThemePreset` in `src/theme/types.ts`.
2. Add the preset config to `PRESETS` in `src/theme/presets.ts`.
3. Update the preset validation error text in `src/theme/presets.ts` and `src/theme/validation.ts`.
4. Add or update tests that prove explicit config values still override preset defaults.
5. Document the preset in `README.md`.

## Adding A Token

Add color-mode-specific tokens in `src/theme/mode-tokens.ts`.

Add mode-independent tokens in `src/theme/static-tokens.ts`.

If the token affects contrast-sensitive text/background pairs, add it to `src/theme/accessibility.ts`.

If the token is part of monochrome or glass structural behavior, update the strict token handling in `src/theme/mode-tokens.ts`.

## Compatibility Notes

Tests import from `dist/index.js`, so `npm test` verifies the published entrypoint rather than only source files. Run it after source changes to refresh `dist` and confirm the public API still works.
