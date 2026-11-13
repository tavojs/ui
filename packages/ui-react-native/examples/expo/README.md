# Expo Example

Small playground for trying `@tavojs/ui-react-native` components in Expo. Copy this example to a working directory and run

```bash
npm install
npm run tavo:generate
npm run start -- --clear
```

`npm run tavo:generate` creates `tavo-ui.generated.js` in the example directory. `App.tsx` imports it and passes it to `TavoThemeProvider`.

The example exercises theming, form helpers, radio and segmented controls, toggle groups, and buttons.

When running from a monorepo checkout, install the root dependencies and build the workspaces first so Metro can load the local native and theme packages.

The Expo runtime dependencies are pinned to the SDK 53 versions (`react@19.0.0` and `react-native@0.79.6`). Keep them aligned with the installed Expo SDK to avoid Hermes/HMR startup errors.
