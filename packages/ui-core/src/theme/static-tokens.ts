import { resolveThemeBreakpoints } from "@/theme/breakpoints";
import type { TavoUiThemeConfig, ThemeBreakpointsConfig } from "@/theme/types";

export function buildStaticTokens(
  config: TavoUiThemeConfig,
  breakpoints: Required<ThemeBreakpointsConfig> = resolveThemeBreakpoints(config)
): Record<string, string> {
  const unit = config.scale?.unit;
  const density = config.scale?.density ?? "comfortable";
  const densityFactor = density === "compact" ? 0.86 : density === "spacious" ? 1.16 : 1;
  const explicitControlHeight = config.scale?.controlHeight;
  const controlHeight =
    explicitControlHeight ?? (unit !== undefined ? unit * 5 : 40 * densityFactor);
  const spacing = config.scale?.spacing ?? unit ?? controlHeight * 0.2;
  const radius = config.scale?.radius ?? unit ?? 8;
  const controlRadius = config.scale?.controlRadius ?? radius;
  const surfaceRadius = config.scale?.surfaceRadius ?? radius * 1.4;
  const border = config.scale?.border ?? 1;
  const focus = config.scale?.focus ?? (unit !== undefined ? unit * 0.375 : 3);
  const motion = config.scale?.motion ?? 1;
  const opacity = config.scale?.opacity ?? 0.58;
  const glassAlpha = config.scale?.glassAlpha ?? 0.62;
  const hoverLift = config.interaction?.hoverLift ?? 1;
  const hoverShadow = config.interaction?.hoverShadow ?? 1;
  const activeScale = config.interaction?.activeScale ?? 0.98;
  const focusAlpha = config.interaction?.focusAlpha ?? 0.28;
  const disabledOpacity = config.interaction?.disabledOpacity ?? opacity;
  const transition = config.interaction?.transition ?? motion;
  const blur = config.scale?.blur ?? (unit !== undefined ? unit * 2.75 : 22);
  const bodySize = config.typography?.bodySize ?? (unit !== undefined ? unit * 2 : 16);
  const captionSize = config.typography?.captionSize ?? (unit !== undefined ? unit * 1.625 : 13);
  const labelSize = config.typography?.labelSize ?? (unit !== undefined ? unit * 1.75 : 14);
  const headingScale = config.typography?.headingScale ?? 1.24;
  const fontFamily =
    config.typography?.fontFamily ??
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const textFontFamily = config.typography?.textFontFamily ?? fontFamily;
  const headingFontFamily = config.typography?.headingFontFamily ?? fontFamily;
  const toRem = (value: number) => `${(value / 16).toFixed(3)}rem`;

  return {
    "size-xs": toRem(controlHeight * 0.66),
    "size-sm": toRem(controlHeight * 0.82),
    "size-md": toRem(controlHeight),
    "size-lg": toRem(controlHeight * 1.16),
    "size-xl": toRem(controlHeight * 1.32),
    "space-1": toRem(spacing),
    "space-2": toRem(spacing * 1.5),
    "space-3": toRem(spacing * 2.1),
    "space-4": toRem(spacing * 2.8),
    "space-5": toRem(spacing * 3.75),
    "space-6": toRem(spacing * 5),
    "radius-sm": toRem(radius * 0.6),
    "radius-md": toRem(radius),
    "radius-lg": toRem(radius * 1.4),
    "radius-control": toRem(controlRadius),
    "radius-surface": toRem(surfaceRadius),
    "border-width": `${border}px`,
    "border-width-strong": `${border * 2}px`,
    "focus-width": `${focus}px`,
    "focus-offset": `${Math.max(1, focus - 1)}px`,
    "motion-fast": `${Math.round(120 * motion)}ms`,
    "motion-base": `${Math.round(180 * motion)}ms`,
    "motion-slow": `${Math.round(260 * motion)}ms`,
    "motion-ease": "cubic-bezier(0.2, 0, 0, 1)",
    "opacity-disabled": `${opacity}`,
    "opacity-muted": `${Math.min(1, opacity + 0.14)}`,
    "glass-chrome-alpha": `${Math.round(glassAlpha * 100)}%`,
    "interaction-hover-lift": `${hoverLift}px`,
    "interaction-hover-shadow-opacity": `${hoverShadow}`,
    "interaction-active-scale": `${activeScale}`,
    "interaction-focus-alpha": `${focusAlpha}`,
    "interaction-disabled-opacity": `${disabledOpacity}`,
    "interaction-transition-fast": `${Math.round(120 * transition)}ms`,
    "interaction-transition-base": `${Math.round(180 * transition)}ms`,
    "blur-surface": `${blur}px`,
    "breakpoint-sm": `${breakpoints.sm}px`,
    "breakpoint-md": `${breakpoints.md}px`,
    "breakpoint-lg": `${breakpoints.lg}px`,
    "font-size-body": toRem(bodySize),
    "font-size-caption": toRem(captionSize),
    "font-size-label": toRem(labelSize),
    "font-size-h1": `clamp(${toRem(bodySize * headingScale ** 3)}, 2rem + 2vw, ${toRem(
      bodySize * headingScale ** 5
    )})`,
    "font-size-h2": `clamp(${toRem(bodySize * headingScale ** 2)}, 1.65rem + 1vw, ${toRem(
      bodySize * headingScale ** 4
    )})`,
    "font-size-h3": `clamp(${toRem(bodySize * headingScale)}, 1.2rem + 0.6vw, ${toRem(
      bodySize * headingScale ** 3
    )})`,
    "font-family": textFontFamily,
    "font-family-text": textFontFamily,
    "font-family-heading": headingFontFamily
  };
}
