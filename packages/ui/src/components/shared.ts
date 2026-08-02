import type { Child, Component, ElementDirective, ElementDirectiveInput } from "@tavojs/core";
import {
  requestClientStyleCleanup,
  retainClientStyle,
  style as registerStyle
} from "@/style-runtime";
import { breakpoints as generatedBreakpoints } from "@/theme/generated/breakpoints";

export type TavoEventHandler<TEvent = Event> = (event: TEvent) => void;
export type ValueChangeEvent<TElement extends HTMLInputElement | HTMLTextAreaElement> = Event & {
  currentTarget: TElement;
  target: TElement;
};
export type ValueChangeHandler<TElement extends HTMLInputElement | HTMLTextAreaElement> = (
  event: ValueChangeEvent<TElement>
) => void;
export type Breakpoint = "base" | "sm" | "md" | "lg";
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;
export type SxPrimitive = string | number | boolean | null | undefined;
export type SxStyleBlock = {
  [propertyOrSelector: string]: SxPrimitive | SxStyleBlock;
};
export type Sx = SxStyleBlock | Partial<Record<Breakpoint, SxStyleBlock>>;

export type BaseProps = {
  children?: Child;
  className?: string;
  sx?: Sx;
  id?: string;
  role?: string;
  style?: Record<string, unknown>;
  title?: string;
  tabIndex?: number;
  hidden?: boolean;
  disabled?: boolean;
  onClick?: TavoEventHandler<MouseEvent>;
  onChange?: TavoEventHandler<Event>;
  onInput?: TavoEventHandler<Event>;
  onKeyDown?: TavoEventHandler<KeyboardEvent>;
  onFocus?: TavoEventHandler<FocusEvent>;
  onBlur?: TavoEventHandler<FocusEvent>;
  [key: `aria-${string}`]: unknown;
  [key: `data-${string}`]: unknown;
  [key: string]: unknown;
};

export type PolymorphicAs = string | Component<Record<string, unknown>>;
export type PolymorphicProps = {
  as?: PolymorphicAs;
};

export type Tone = "primary" | "secondary" | "neutral" | "success" | "warning" | "danger" | "info";
export type Size = "sm" | "md" | "lg";
export type Spacing = "sm" | "md" | "lg";
export type Gap = "none" | Spacing;
export type FlexDirection = "row" | "column" | "row-reverse" | "column-reverse";
export type FlexAlign = "start" | "center" | "end" | "stretch";
export type FlexJustify = "start" | "center" | "end" | "between" | "around";
export type FlexLayoutProps = {
  direction?: ResponsiveValue<FlexDirection>;
  align?: ResponsiveValue<FlexAlign>;
  justify?: ResponsiveValue<FlexJustify>;
  gap?: ResponsiveValue<Gap | number | string>;
  sx?: Sx;
};

export function cx(...parts: Array<string | false | null | undefined>): string {
  let result = "";
  for (const part of parts) {
    if (part) {
      result += result ? ` ${part}` : part;
    }
  }
  return result;
}

export function cv<TValue extends string>(
  styles: Record<string, string>,
  prefix: string,
  value: TValue,
  defaultValue: TValue
): string | undefined {
  return value === defaultValue ? undefined : styles[`${prefix}-${value}`];
}

export function styleObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

export function boolAttr(value: boolean | undefined): "true" | "false" | undefined {
  return value === undefined ? undefined : value ? "true" : "false";
}

export function resolveAs(
  as: PolymorphicAs | undefined,
  defaultAs: PolymorphicAs
): PolymorphicAs {
  return as ?? defaultAs;
}

const responsiveKeys = ["base", "sm", "md", "lg"] as const;
const mediaBreakpoints = generatedBreakpoints as Record<Exclude<Breakpoint, "base">, number>;
const uiLayerPrelude = "@layer tavo-ui.theme,tavo-ui.components,tavo-ui.overrides;";
const responsiveStyleCache = new Map<string, { className: string; id: string; css: string }>();
const responsiveStyleCacheLimit = 256;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isResponsiveValue<T>(value: ResponsiveValue<T> | undefined): value is Partial<Record<Breakpoint, T>> {
  return isRecord(value) && responsiveKeys.some((key) => Object.prototype.hasOwnProperty.call(value, key));
}

export function responsiveVars<T>(
  value: ResponsiveValue<T> | undefined,
  variableName: string,
  mapValue: (value: T) => string | undefined
): Record<string, string> {
  if (value === undefined || !isResponsiveValue(value)) {
    return {};
  }

  const vars: Record<string, string> = {};
  for (const key of responsiveKeys) {
    const item = value[key];
    const nextValue = item === undefined ? undefined : mapValue(item as T);
    if (nextValue !== undefined) {
      vars[key === "base" ? variableName : `${variableName}-${key}`] = nextValue;
    }
  }
  return vars;
}

export function responsiveOrStaticVars<T>(
  value: ResponsiveValue<T> | undefined,
  variableName: string,
  mapValue: (value: T) => string | undefined
): Record<string, string> {
  if (value === undefined) {
    return {};
  }
  if (!isResponsiveValue(value)) {
    const mapped = mapValue(value);
    return mapped === undefined ? {} : { [variableName]: mapped };
  }
  return responsiveVars(value, variableName, mapValue);
}

export function responsiveClass<T extends string>(
  styles: Record<string, string>,
  prefix: string,
  value: ResponsiveValue<T> | undefined,
  defaultValue: T
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (isResponsiveValue(value)) {
    return undefined;
  }
  return cv(styles, prefix, value, defaultValue);
}

function toKebabCase(key: string): string {
  return key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function hashText(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function nestedSelector(parentSelector: string, selector: string): string {
  return selector
    .split(",")
    .map((part) => part.trim().replaceAll("&", parentSelector))
    .join(",");
}

function styleBlockToCss(style: SxStyleBlock, selector: string): string {
  const declarations: string[] = [];
  const nestedRules: string[] = [];

  for (const [key, value] of Object.entries(style)) {
    if (value === null || value === undefined || value === false) {
      continue;
    }

    if (isRecord(value)) {
      const nestedCss = key.startsWith("@")
        ? styleBlockToCss(value as SxStyleBlock, selector)
        : key.includes("&")
          ? styleBlockToCss(value as SxStyleBlock, nestedSelector(selector, key))
          : "";
      if (nestedCss) {
        nestedRules.push(key.startsWith("@") ? `${key}{${nestedCss}}` : nestedCss);
      }
      continue;
    }

    declarations.push(`${toKebabCase(key)}:${String(value)}`);
  }

  return `${declarations.length ? `${selector}{${declarations.join(";")}}` : ""}${nestedRules.join("")}`;
}

function wrapOverrideLayer(css: string): string {
  return `${uiLayerPrelude}@layer tavo-ui.overrides{${css}}`;
}

function isResponsiveStyle(value: Sx | undefined): value is Partial<Record<Breakpoint, SxStyleBlock>> {
  return isRecord(value) && responsiveKeys.some((key) => isRecord(value[key]));
}

function isBreakpointKey(key: string): key is Breakpoint {
  return responsiveKeys.includes(key as Breakpoint);
}

function sxBlocks(value: Sx): Partial<Record<Breakpoint, SxStyleBlock>> {
  if (!isResponsiveStyle(value)) {
    return { base: value as SxStyleBlock };
  }

  const blocks: Partial<Record<Breakpoint, SxStyleBlock>> = {};
  const baseBlock: SxStyleBlock = {};
  let hasBaseBlock = false;

  for (const [key, item] of Object.entries(value)) {
    if (isBreakpointKey(key) && isRecord(item)) {
      if (key === "base") {
        Object.assign(baseBlock, item);
        hasBaseBlock = true;
      } else {
        blocks[key] = item as SxStyleBlock;
      }
      continue;
    }

    baseBlock[key] = item as SxPrimitive | SxStyleBlock;
    hasBaseBlock = true;
  }

  if (hasBaseBlock) {
    blocks.base = baseBlock;
  }

  return blocks;
}

type ResponsiveStyleSheet = {
  className?: string;
  styleId?: string;
};

export function responsiveStyleSheet(value: Sx | undefined): ResponsiveStyleSheet {
  if (!value) {
    return {};
  }

  const blocks = sxBlocks(value);
  const seed = JSON.stringify(blocks);
  const cached = responsiveStyleCache.get(seed);
  if (cached) {
    responsiveStyleCache.delete(seed);
    responsiveStyleCache.set(seed, cached);
    registerStyle(cached.id, cached.css);
    return { className: cached.className, styleId: cached.id };
  }

  const cssParts: string[] = [];
  const hash = hashText(seed);
  const className = `tsx_${hash}`;
  const selector = `.${className}`;
  const baseCss = blocks.base ? styleBlockToCss(blocks.base, selector) : "";
  if (baseCss) {
    cssParts.push(baseCss);
  }
  for (const key of ["sm", "md", "lg"] as const) {
    const block = blocks[key];
    const css = block ? styleBlockToCss(block, selector) : "";
    if (css) {
      cssParts.push(`@media (min-width:${mediaBreakpoints[key]}px){${css}}`);
    }
  }

  if (cssParts.length === 0) {
    return {};
  }

  const id = `tavo-ui.sx.${hash}`;
  const css = wrapOverrideLayer(cssParts.join(""));
  if (responsiveStyleCache.size >= responsiveStyleCacheLimit) {
    const oldest = responsiveStyleCache.keys().next().value;
    if (oldest !== undefined) {
      const evicted = responsiveStyleCache.get(oldest);
      responsiveStyleCache.delete(oldest);
      if (evicted) {
        requestClientStyleCleanup(evicted.id);
      }
    }
  }
  responsiveStyleCache.set(seed, { className, id, css });
  registerStyle(id, css);

  return {
    className,
    styleId: id
  };
}

function mergeElementDirective(
  current: ElementDirectiveInput<HTMLElement>,
  next: ElementDirective<HTMLElement>
): ElementDirectiveInput<HTMLElement> {
  if (!current) {
    return next;
  }
  return Array.isArray(current) ? [...current, next] : [current, next];
}

export function sxClassName<TProps extends Record<string, unknown>>(
  props: TProps,
  className?: string,
  value?: Sx
): string {
  const sx = value ?? (props as TProps & { sx?: Sx }).sx;
  delete (props as TProps & { sx?: Sx }).sx;
  const responsiveStyle = responsiveStyleSheet(sx);
  if (responsiveStyle.styleId) {
    const target = props as TProps & { use?: ElementDirectiveInput<HTMLElement> };
    target.use = mergeElementDirective(
      target.use,
      () => retainClientStyle(responsiveStyle.styleId as string)
    );
  }
  return cx(className, responsiveStyle.className);
}

export const flexAlignValues: Record<FlexAlign, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch"
};

export const flexJustifyValues: Record<FlexJustify, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around"
};

export const flexGapValues: Record<Gap, string> = {
  none: "0",
  sm: "var(--tui-space-2)",
  md: "var(--tui-space-4)",
  lg: "var(--tui-space-6)"
};

export function flexGapValue(value: Gap | number | string): string {
  if (typeof value === "number") {
    return `${value}px`;
  }
  return flexGapValues[value as Gap] ?? value;
}

export function flexLayoutVars({
  direction,
  align,
  justify,
  gap
}: Pick<FlexLayoutProps, "direction" | "align" | "justify" | "gap">): Record<string, string> {
  return {
    ...responsiveOrStaticVars(direction, "--tui-flex-direction", (value) => value),
    ...responsiveOrStaticVars(align, "--tui-flex-align", (value) => flexAlignValues[value]),
    ...responsiveOrStaticVars(justify, "--tui-flex-justify", (value) => flexJustifyValues[value]),
    ...responsiveOrStaticVars(gap, "--tui-flex-gap", flexGapValue)
  };
}
