# Polymorphic `as`

Many Tavo.js UI primitives accept an `as` prop that changes the rendered root element or component while keeping the component's Tavo.js styling, `className`, `style`, `sx`, `aria-*`, `data-*`, event handlers, and children.

Use `as` when the visual primitive is right but the HTML semantics or integration point should be different.

```tsx
import { Box, Button, Card, Text } from "@tavojs/ui";

<Box as="main" maxWidth="lg" paddingInline="lg" center fullWidth>
  <Text as="h1" variant="h1">Dashboard</Text>
</Box>

<Card as="article" title="Release notes">
  <Text>Version details and migration notes.</Text>
</Card>

<Text as="label" htmlFor="email">
  Email
</Text>

<Button as="a" href="/settings">
  Settings
</Button>
```

## When To Use `as`

Use `as` for semantic HTML, routing adapters, custom framework components, and small accessibility refinements.

```tsx
<Box as="section" aria-labelledby="billing-title">
  <Text as="h2" id="billing-title" variant="h2">
    Billing
  </Text>
</Box>
```

Use a custom component when your app owns navigation or behavior but still wants Tavo.js UI styling.

```tsx
function RouterLink({ to, children, ...props }) {
  return <a href={to} {...props}>{children}</a>;
}

<Button as={RouterLink} to="/settings">
  Settings
</Button>
```

Custom components receive the computed `className`, `style`, children, and remaining public props. They should forward those props to their own root element.

## When Not To Use `as`

Do not use `as` to casually replace semantic structures that the component owns. Form inputs, table parts, dialog structure, menu content, and generated navigation markup carry accessibility behavior that depends on their native elements or internal composition.

Prefer the dedicated component when one exists:

```tsx
// Prefer this for a text field.
<TextInput id="email" />

// Avoid changing a visual primitive into an input shell.
<Box as="input" id="email" />
```

## Accessibility

Changing the root element changes its native semantics. Tavo.js UI keeps the styling and public props, but your app is responsible for any semantics introduced by the new element.

- If you render a non-button as an interactive control, add the right `role`, keyboard handling, and `tabIndex`.
- If you render a button-like component as a native `button`, provide `type="button"` when the component does not already do so.
- If you render as a landmark such as `main`, `nav`, or `aside`, add labels when the page has multiple matching landmarks.
- Keep heading order meaningful when using `Text as="h1"` through `Text as="h6"`.

```tsx
<Chip as="button" type="button" onClick={toggleFilter}>
  Active
</Chip>

<Box as="nav" aria-label="Account">
  ...
</Box>
```

## Supported Components

`as` is supported on single-root primitives where changing the root does not break owned structure:

`Alert`, `AppBar`, `Chip`, `Box`, `Button`, `Card`, `Chip`, `Divider`, `Flex`, `Button`, `Inline`, `Kbd`, `Card`, `Section`, `Skeleton`, `Spinner`, `Stack`, `StatusDot`, `Box`, `Text`, `Toggle`, `Toolbar`, and `VisuallyHidden`.
