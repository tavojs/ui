export type ThemeMode = "light" | "dark" | "system";
export type ResolvedThemeMode = "light" | "dark";
export type ThemeMethod = "analogous" | "monochromatic" | "glass";
export type ThemeShade = "light" | "dark";
export type ThemeDensity = "compact" | "comfortable" | "spacious";
export type ThemePreset =
  "minimal" | "glass" | "enterprise" | "editorial" | "dense" | "mobile" | "monochrome";

export type ThemeColorPair = {
  primary: string;
  secondary?: string;
};

export type ThemeColorConfig = {
  light: ThemeColorPair;
  dark?: Partial<ThemeColorPair>;
  method?: ThemeMethod;
  fixShade?: boolean;
};

export type ThemeSemanticConfig = {
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
};

export type ThemeModeSemanticConfig = ThemeSemanticConfig & {
  light?: ThemeSemanticConfig;
  dark?: ThemeSemanticConfig;
};

export type ThemeScaleConfig = {
  unit?: number;
  controlHeight?: number;
  spacing?: number;
  radius?: number;
  shadow?: number;
  border?: number;
  density?: ThemeDensity;
  focus?: number;
  motion?: number;
  opacity?: number;
  blur?: number;
  glassAlpha?: number;
  controlRadius?: number;
  surfaceRadius?: number;
};

export type ThemeTypographyConfig = {
  fontFamily?: string;
  textFontFamily?: string;
  headingFontFamily?: string;
  bodySize?: number;
  captionSize?: number;
  labelSize?: number;
  headingScale?: number;
};

export type ThemeInteractionConfig = {
  hoverLift?: number;
  hoverShadow?: number;
  activeScale?: number;
  focusAlpha?: number;
  disabledOpacity?: number;
  transition?: number;
};

export type ThemeViewportStrategy = "fixed" | "fluid" | "stepped";

export type ThemeViewportConfig = {
  strategy?: ThemeViewportStrategy;
  rootMin?: number;
  rootMax?: number;
  minWidth?: number;
  maxWidth?: number;
};

export type ThemeBreakpointsConfig = {
  sm?: number;
  md?: number;
  lg?: number;
};

export type ThemeOutputConfig = {
  selector?: string;
  darkSelector?: string;
  includeMediaQuery?: boolean;
};

export type ThemeAccessibilityConfig = {
  contrast?: "AA" | "AAA";
  failOnViolation?: boolean;
};

export type ThemeTokenOverrides = Partial<Record<ResolvedThemeMode, Record<string, string>>>;

export type TavoUiThemeConfig = {
  $schema?: string;
  preset?: ThemePreset;
  defaultTheme?: ThemeMode;
  color: ThemeColorConfig;
  scale?: ThemeScaleConfig;
  typography?: ThemeTypographyConfig;
  interaction?: ThemeInteractionConfig;
  viewport?: ThemeViewportConfig;
  breakpoints?: ThemeBreakpointsConfig;
  semantic?: ThemeModeSemanticConfig;
  output?: ThemeOutputConfig;
  accessibility?: ThemeAccessibilityConfig;
  tokens?: ThemeTokenOverrides;
};

export type ThemeRamp = Record<number, string>;

export type ThemeResolvedColorSet = {
  primary: ThemeRamp;
  secondary: ThemeRamp;
  neutral: ThemeRamp;
  semantic: Required<ThemeSemanticConfig>;
  tokens: Record<string, string>;
};

export type ThemeTokenBuildResult = {
  modes: Record<ResolvedThemeMode, ThemeResolvedColorSet>;
  config: TavoUiThemeConfig;
  warnings: string[];
  staticTokens: Record<string, string>;
  breakpoints: Required<ThemeBreakpointsConfig>;
};

export type ThemeRuntimeState = {
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
};
