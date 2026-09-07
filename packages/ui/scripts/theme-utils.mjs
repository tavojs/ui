import { buildThemeTokens, resolveThemeBreakpoints, resolveThemeViewport } from "@tavojs/ui-core";

const DEFAULT_OUTPUT = {
  selector: ":root",
  darkSelector: ':root[data-tavo-theme="dark"]',
  includeMediaQuery: true
};

function resolveOutput(config) {
  return {
    ...DEFAULT_OUTPUT,
    ...(config.output ?? {})
  };
}

function variableName(token) {
  return `--tui-${token}`;
}

function pushVariable(css, token, value) {
  css.push(`\t${variableName(token)}: ${value};\n`);
}

function pushRamp(css, name, ramp) {
  for (const [shade, value] of Object.entries(ramp)) {
    pushVariable(css, `${name}-${shade}`, value);
  }
}

function pushTokens(css, tokens) {
  for (const [token, value] of Object.entries(tokens)) {
    pushVariable(css, token, value);
  }
}

function rootFontSize(config) {
  const { strategy, rootMin, rootMax, minWidth, maxWidth } = resolveThemeViewport(config);

  if (strategy !== "fluid" || rootMin === rootMax) {
    const size = strategy === "stepped" ? rootMin : rootMax;
    return `${(size / 16).toFixed(4)}rem`;
  }

  const slope = (rootMax - rootMin) / (maxWidth - minWidth);
  const viewportFactor = slope * 100;
  const intercept = rootMin - slope * minWidth;

  return `clamp(${(rootMin / 16).toFixed(4)}rem, calc(${(intercept / 16).toFixed(4)}rem + ${viewportFactor.toFixed(4)}vw), ${(rootMax / 16).toFixed(4)}rem)`;
}

function steppedRootFontCss(config, breakpoints, selector) {
  const { strategy, rootMin, rootMax, minWidth, maxWidth } = resolveThemeViewport(config);
  if (strategy !== "stepped" || rootMin === rootMax) {
    return "";
  }

  const widths = [...new Set([...Object.values(breakpoints), maxWidth])]
    .filter((width) => width > minWidth && width <= maxWidth)
    .sort((left, right) => left - right);
  const fontSizeAt = (width) => {
    const progress = (width - minWidth) / (maxWidth - minWidth);
    return rootMin + (rootMax - rootMin) * progress;
  };

  return widths
    .map(
      (width) =>
        `@media (min-width: ${width}px) {\n\t${selector} {\n\t\tfont-size: ${(fontSizeAt(width) / 16).toFixed(4)}rem;\n\t}\n}\n`
    )
    .join("\n");
}

function modeBody(mode, staticTokenMap) {
  const css = [];
  pushRamp(css, "primary", mode.primary);
  pushRamp(css, "secondary", mode.secondary);
  pushRamp(css, "neutral", mode.neutral);
  pushTokens(css, mode.tokens);
  if (staticTokenMap) {
    pushTokens(css, staticTokenMap);
  }
  return css.join("");
}

function globalResetCss() {
  const scrollbarColor = variableName("color-border-strong");

  return `*,\n*::before,\n*::after {\n\tbox-sizing: border-box;\n}\n\n* {\n\tscrollbar-color: var(${scrollbarColor}) transparent;\n\tscrollbar-width: thin;\n}\n\n*::-webkit-scrollbar {\n\twidth: 0.7rem;\n\theight: 0.7rem;\n}\n\n*::-webkit-scrollbar-track,\n*::-webkit-scrollbar-corner {\n\tbackground: transparent;\n}\n\n*::-webkit-scrollbar-thumb {\n\tborder: 0.18rem solid transparent;\n\tborder-radius: 999px;\n\tbackground: var(${scrollbarColor});\n\tbackground-clip: padding-box;\n}\n\nbody {\n\tmargin: 0;\n\tpadding: 0;\n\tbackground: var(${variableName("color-app-bg")});\n}\n`;
}

export function buildThemeCss(config) {
  const result = buildThemeTokens(config);
  const output = resolveOutput(result.config);
  const light = result.modes.light;
  const dark = result.modes.dark;
  const defaultTheme = result.config.defaultTheme ?? "system";
  const defaultResolvedMode = defaultTheme === "dark" ? "dark" : "light";
  const defaultMode = defaultResolvedMode === "dark" ? dark : light;
  const lightBody = `\tcolor-scheme: light;\n${modeBody(light)}`;
  const darkBody = `\tcolor-scheme: dark;\n${modeBody(dark)}`;
  const chunks = [`${output.selector} {\n\tcolor-scheme: ${defaultResolvedMode};\n\tfont-size: ${rootFontSize(result.config)};\n`];

  chunks.push(modeBody(defaultMode, result.staticTokens));
  chunks.push("}\n\n");
  const steppedRootCss = steppedRootFontCss(result.config, result.breakpoints, output.selector);
  if (steppedRootCss) {
    chunks.push(steppedRootCss, "\n");
  }

  if (defaultResolvedMode === "dark") {
    chunks.push(`${output.selector}[data-tavo-theme="light"] {\n${lightBody}}\n\n`);
  }

  if (output.includeMediaQuery !== false && defaultTheme === "system") {
    chunks.push(`@media (prefers-color-scheme: dark) {\n\t${output.selector}:not([data-tavo-theme]) {\n${darkBody}\t}\n}\n\n`);
  }
  chunks.push(`${output.darkSelector} {\n${darkBody}}\n`);
  chunks.push("\n\n", globalResetCss());
  return chunks.join("");
}

export function buildBreakpointScss(config) {
  const breakpoints = resolveThemeBreakpoints(buildThemeTokens(config).config);
  return `@use "sass:map";

$tui-breakpoints: (
  sm: ${breakpoints.sm}px,
  md: ${breakpoints.md}px,
  lg: ${breakpoints.lg}px
) !default;

@mixin tui-screen($name) {
  @media (min-width: map.get($tui-breakpoints, $name)) {
    @content;
  }
}
`;
}

export function buildBreakpointTs(config) {
  const breakpoints = resolveThemeBreakpoints(buildThemeTokens(config).config);
  return `export const breakpoints = {
  sm: ${breakpoints.sm},
  md: ${breakpoints.md},
  lg: ${breakpoints.lg}
} as const;
`;
}
