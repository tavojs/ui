# Responsive `sx`

Tavo.js UI `sx` is mobile-first. Breakpoint keys set styles from that width upward, matching the responsive model used by common UI systems.

Default breakpoints:

- `base`: all viewport widths
- `sm`: `480px` and wider
- `md`: `768px` and wider
- `lg`: `1024px` and wider

`base` is the default style. Higher breakpoint keys override it when their media query matches.

## Visibility Examples

Visible below `480px`, hidden at `480px` and wider:

```tsx
<Flex sx={{ sm: { display: "none" } }} />
```

This emits only an `sm` media query:

```css
@media (min-width: 480px) {
  .tsx_hash {
    display: none;
  }
}
```

Because there is no `base` display rule, the component keeps its default display below `480px`. For `Flex`, that default is `display: flex`.

Hidden below `480px`, visible at `480px` and wider:

```tsx
<Flex sx={{ base: { display: "none" }, sm: { display: "flex" } }} />
```

Hidden below `1024px`, visible at `1024px` and wider:

```tsx
<Flex sx={{ base: { display: "none" }, lg: { display: "flex" } }} />
```

## Interaction Selectors

Use `&` to target the generated `sx` class for pseudo classes, pseudo elements, child selectors, and state selectors:

```tsx
<Button
  sx={{
    backgroundColor: "var(--tui-color-primary)",
    "&:hover": {
      backgroundColor: "var(--tui-color-primary-hover)"
    },
    "&:active, &:focus-visible": {
      transform: "translateY(1px)"
    },
    "&[data-state='open']": {
      opacity: 1
    }
  }}
/>
```

Nested selectors also work inside breakpoint blocks:

```tsx
<Button
  sx={{
    backgroundColor: "var(--tui-color-primary)",
    md: {
      "&:hover": {
        backgroundColor: "var(--tui-color-secondary)"
      }
    }
  }}
/>
```

## Cascade Contract

Generated `sx` rules are registered through the Tavo.js style registry and wrapped in `@layer tavo-ui.overrides`. Static component CSS is wrapped in `@layer tavo-ui.components`, so `sx` can override component defaults without `!important`.

The `sx` prop is handled only by Tavo.js UI components that explicitly support it. Raw DOM, custom, or imported SVG components do not process Tavo.js UI `sx` unless they are wrapped by a Tavo.js UI component such as `Icon`.
