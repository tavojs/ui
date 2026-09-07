import { buildThemeTokens, resolveThemeViewport } from "@tavojs/ui-core";
import type {
  ResolvedThemeMode,
  TavoUiThemeConfig,
  ThemeOutputConfig,
  ThemeResolvedColorSet
} from "@tavojs/ui-core";

export type ThemeBuildResult = {
  cssText: string;
  modes: Record<ResolvedThemeMode, ThemeResolvedColorSet>;
  staticTokens: Record<string, string>;
  config: TavoUiThemeConfig;
  warnings: string[];
};

type ThemeCssStyle = "expanded" | "compressed";

type CssRule = {
  selectors: string[];
  declarations: Array<[property: string, value: string]>;
};

const DEFAULT_OUTPUT: Required<ThemeOutputConfig> = {
  selector: ":root",
  darkSelector: ':root[data-tavo-theme="dark"]',
  includeMediaQuery: true
};

function resolveOutput(config: TavoUiThemeConfig): Required<ThemeOutputConfig> {
  return {
    ...DEFAULT_OUTPUT,
    ...config.output
  };
}

function variableName(token: string | number): string {
  return `--tui-${token}`;
}

function serializeDeclaration(property: string, value: string, style: ThemeCssStyle): string {
  return style === "compressed"
    ? `${property}:${property.startsWith("--") ? " " : ""}${value};`
    : `\t${property}: ${value};\n`;
}

function pushVariable(
  css: string[],
  token: string,
  value: string,
  style: ThemeCssStyle
): void {
  css.push(serializeDeclaration(variableName(token), value, style));
}

function pushRamp(
  css: string[],
  name: string,
  ramp: Record<number, string>,
  style: ThemeCssStyle
): void {
  for (const [shade, value] of Object.entries(ramp)) {
    pushVariable(css, `${name}-${shade}`, value, style);
  }
}

function pushTokens(
  css: string[],
  tokens: Record<string, string>,
  style: ThemeCssStyle
): void {
  for (const [token, value] of Object.entries(tokens)) {
    pushVariable(css, token, value, style);
  }
}

function rootFontSize(config: TavoUiThemeConfig): string {
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

function steppedRootFontCss(
  config: TavoUiThemeConfig,
  breakpoints: Record<"sm" | "md" | "lg", number>,
  selector: string,
  style: ThemeCssStyle
): string {
  const { strategy, rootMin, rootMax, minWidth, maxWidth } = resolveThemeViewport(config);
  if (strategy !== "stepped" || rootMin === rootMax) {
    return "";
  }

  const widths = [...new Set([...Object.values(breakpoints), maxWidth])]
    .filter((width) => width > minWidth && width <= maxWidth)
    .sort((left, right) => left - right);
  const fontSizeAt = (width: number) => {
    const progress = (width - minWidth) / (maxWidth - minWidth);
    return rootMin + (rootMax - rootMin) * progress;
  };

  if (style === "compressed") {
    return widths
      .map(
        (width) =>
          `@media(min-width:${width}px){${selector}{font-size:${(fontSizeAt(width) / 16).toFixed(4)}rem;}}`
      )
      .join("");
  }

  return widths
    .map(
      (width) =>
        `@media (min-width: ${width}px) {\n\t${selector} {\n\t\tfont-size: ${(fontSizeAt(width) / 16).toFixed(4)}rem;\n\t}\n}\n`
    )
    .join("\n");
}

function modeBody(
  mode: ThemeResolvedColorSet,
  style: ThemeCssStyle,
  includeStatic?: Record<string, string>
): string {
  const css: string[] = [];
  pushRamp(css, "primary", mode.primary, style);
  pushRamp(css, "secondary", mode.secondary, style);
  pushRamp(css, "neutral", mode.neutral, style);
  pushTokens(css, mode.tokens, style);
  if (includeStatic) {
    pushTokens(css, includeStatic, style);
  }
  return css.join("");
}

function serializeRule(rule: CssRule, style: ThemeCssStyle): string {
  const selectors = rule.selectors.join(style === "compressed" ? "," : ",\n");
  const declarations = rule.declarations
    .map(([property, value]) => serializeDeclaration(property, value, style))
    .join("");

  return style === "compressed"
    ? `${selectors}{${declarations}}`
    : `${selectors} {\n${declarations}}\n`;
}

function globalResetCss(style: ThemeCssStyle): string {
  const scrollbarColor = variableName("color-border-strong");
  const rules: CssRule[] = [
    {
      selectors: ["*", "*::before", "*::after"],
      declarations: [["box-sizing", "border-box"]]
    },
    {
      selectors: ["*"],
      declarations: [
        ["scrollbar-color", `var(${scrollbarColor}) transparent`],
        ["scrollbar-width", "thin"]
      ]
    },
    {
      selectors: ["*::-webkit-scrollbar"],
      declarations: [
        ["width", "0.7rem"],
        ["height", "0.7rem"]
      ]
    },
    {
      selectors: ["*::-webkit-scrollbar-track", "*::-webkit-scrollbar-corner"],
      declarations: [["background", "transparent"]]
    },
    {
      selectors: ["*::-webkit-scrollbar-thumb"],
      declarations: [
        ["border", "0.18rem solid transparent"],
        ["border-radius", "999px"],
        ["background", `var(${scrollbarColor})`],
        ["background-clip", "padding-box"]
      ]
    },
    {
      selectors: ["body"],
      declarations: [
        ["margin", "0"],
        ["padding", "0"],
        ["background", `var(${variableName("color-app-bg")})`]
      ]
    }
  ];

  return rules
    .map((rule) => serializeRule(rule, style))
    .join(style === "compressed" ? "" : "\n");
}

function buildThemeWithStyle(
  config: TavoUiThemeConfig,
  style: ThemeCssStyle
): ThemeBuildResult {
  const result = buildThemeTokens(config);
  const output = resolveOutput(result.config);
  const defaultTheme = result.config.defaultTheme ?? "system";
  const defaultResolvedMode = defaultTheme === "dark" ? "dark" : "light";
  const light = result.modes.light;
  const dark = result.modes.dark;

  const lightBody = `${serializeDeclaration(
    "color-scheme",
    "light",
    style
  )}${modeBody(light, style)}`;
  const darkBody = `${serializeDeclaration(
    "color-scheme",
    "dark",
    style
  )}${modeBody(dark, style)}`;
  const defaultMode = defaultResolvedMode === "dark" ? dark : light;
  const defaultBody = `${serializeDeclaration(
    "color-scheme",
    defaultResolvedMode,
    style
  )}${serializeDeclaration(
    "font-size",
    rootFontSize(result.config),
    style
  )}${modeBody(defaultMode, style, result.staticTokens)}`;
  const lightSelector = `${output.selector}[data-tavo-theme="light"]`;
  const cssSections: string[] = [];
  const steppedRootCss = steppedRootFontCss(
    result.config,
    result.breakpoints,
    output.selector,
    style
  );

  if (style === "compressed") {
    cssSections.push(`${output.selector}{${defaultBody}}`);
    if (steppedRootCss) {
      cssSections.push(steppedRootCss);
    }

    if (defaultResolvedMode === "dark") {
      cssSections.push(`${lightSelector}{${lightBody}}`);
    }

    if (output.includeMediaQuery && defaultTheme === "system") {
      cssSections.push(
        `@media(prefers-color-scheme: dark){${output.selector}:not([data-tavo-theme]){${darkBody}}}`
      );
    }
    cssSections.push(`${output.darkSelector}{${darkBody}}`);
    cssSections.push(globalResetCss(style));
  } else {
    cssSections.push(`${output.selector} {\n${defaultBody}`, "}\n\n");
    if (steppedRootCss) {
      cssSections.push(steppedRootCss, "\n");
    }

    if (defaultResolvedMode === "dark") {
      cssSections.push(`${lightSelector} {\n${lightBody}}\n\n`);
    }

    if (output.includeMediaQuery && defaultTheme === "system") {
      cssSections.push(
        `@media (prefers-color-scheme: dark) {\n\t${output.selector}:not([data-tavo-theme]) {\n${darkBody}\t}\n}\n\n`
      );
    }
    cssSections.push(`${output.darkSelector} {\n${darkBody}}\n`);
    cssSections.push("\n\n", globalResetCss(style));
  }

  return {
    cssText: cssSections.join(""),
    modes: result.modes,
    staticTokens: result.staticTokens,
    config: result.config,
    warnings: result.warnings
  };
}

export function buildTheme(config: TavoUiThemeConfig): ThemeBuildResult {
  return buildThemeWithStyle(config, "expanded");
}

export function buildCompressedTheme(config: TavoUiThemeConfig): ThemeBuildResult {
  return buildThemeWithStyle(config, "compressed");
}
