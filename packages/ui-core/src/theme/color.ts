import type { ThemeMethod, ThemeRamp, ThemeShade } from "@/theme/types";

const SHADE_LIGHTNESS: Record<number, number> = {
  50: 95,
  100: 90,
  200: 80,
  300: 70,
  400: 60,
  500: 50,
  600: 45,
  700: 35,
  800: 20,
  900: 8,
  950: 5
};
const SHADE_ENTRIES = Object.entries(SHADE_LIGHTNESS).map(
  ([shade, lightness]) => [Number(shade), lightness] as const
);

type HslColor = {
  h: number;
  s: number;
  l: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeHex(value: string): string {
  const trimmed = value.trim();
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) {
    throw new Error(`Invalid hex color ${JSON.stringify(value)}`);
  }

  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return trimmed.toLowerCase();
}

export function hexToHsl(value: string): HslColor {
  const hex = normalizeHex(value);
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  if (delta !== 0) {
    switch (max) {
      case r:
        h = 60 * (((g - b) / delta) % 6);
        break;
      case g:
        h = 60 * ((b - r) / delta + 2);
        break;
      default:
        h = 60 * ((r - g) / delta + 4);
        break;
    }
  }

  return {
    h: h < 0 ? h + 360 : h,
    s: s * 100,
    l: l * 100
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const normalizedHue = ((h % 360) + 360) % 360;
  const normalizedS = clamp(s, 0, 100) / 100;
  const normalizedL = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * normalizedL - 1)) * normalizedS;
  const x = c * (1 - Math.abs(((normalizedHue / 60) % 2) - 1));
  const m = normalizedL - c / 2;

  let rgb: [number, number, number] = [0, 0, 0];

  if (normalizedHue < 60) {
    rgb = [c, x, 0];
  } else if (normalizedHue < 120) {
    rgb = [x, c, 0];
  } else if (normalizedHue < 180) {
    rgb = [0, c, x];
  } else if (normalizedHue < 240) {
    rgb = [0, x, c];
  } else if (normalizedHue < 300) {
    rgb = [x, 0, c];
  } else {
    rgb = [c, 0, x];
  }

  return `#${rgb
    .map((channel) =>
      Math.round((channel + m) * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}

function getNearestShade(lightness: number): number {
  return SHADE_ENTRIES.reduce((closest, [shade, targetLightness]) => {
    const distance = Math.abs(targetLightness - lightness);
    const currentDistance = Math.abs(SHADE_LIGHTNESS[closest] - lightness);
    return distance < currentDistance ? shade : closest;
  }, 500);
}

function generateAnalogousRamp(color: string): ThemeRamp {
  const hsl = hexToHsl(color);
  const nearestShade = getNearestShade(hsl.l);
  const ramp: ThemeRamp = {} as ThemeRamp;

  const normalizedColor = normalizeHex(color);
  for (const [shade, lightness] of SHADE_ENTRIES) {
    ramp[shade] = shade === nearestShade ? normalizedColor : hslToHex(hsl.h, hsl.s, lightness);
  }

  return ramp;
}

function generateFixedRamp(color: string): ThemeRamp {
  const hsl = hexToHsl(color);
  const ramp: ThemeRamp = {} as ThemeRamp;

  for (const [shade, lightness] of SHADE_ENTRIES) {
    if (shade === 500) {
      ramp[shade] = normalizeHex(color);
      continue;
    }

    const nextLightness =
      shade < 500
        ? hsl.l + (100 - hsl.l) * ((lightness - SHADE_LIGHTNESS[500]) / 50)
        : hsl.l * (lightness / SHADE_LIGHTNESS[500]);
    ramp[shade] = hslToHex(hsl.h, hsl.s, clamp(nextLightness, 0, 100));
  }

  return ramp;
}

export function generateNeutralRamp(color: string, method: ThemeMethod): ThemeRamp {
  let source = hexToHsl(color);
  if (method === "monochromatic") {
    source = hexToHsl(source.l < 50 ? "#000000" : "#ffffff");
  }
  const ramp: ThemeRamp = {} as ThemeRamp;

  for (const [shade, lightness] of SHADE_ENTRIES) {
    const shadeLightness = method === "monochromatic" && shade === 50 ? 99 : lightness;
    const saturation = (lightness / 100) * 10;
    ramp[shade] = hslToHex(source.h, saturation, shadeLightness);
  }

  return ramp;
}

export function generateColorRamp(
  color: string,
  method: ThemeMethod,
  fixShade: boolean
): ThemeRamp {
  const ramp = fixShade ? generateFixedRamp(color) : generateAnalogousRamp(color);

  if (method === "monochromatic") {
    ramp[50] = "#ffffff";
    ramp[950] = "#000000";
  }

  return ramp;
}

export function inferShade(color: string): ThemeShade {
  return hexToHsl(color).l >= 60 ? "light" : "dark";
}

export function relativeLuminance(color: string): number {
  const hex = normalizeHex(color);
  const channels = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map((part) => {
    const value = Number.parseInt(part, 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function readContrastColor(background: string): string {
  const dark = "#000000";
  const light = "#ffffff";
  const luminance = relativeLuminance(background);
  const darkContrast = (luminance + 0.05) / 0.05;
  const lightContrast = 1.05 / (luminance + 0.05);
  return darkContrast >= lightContrast ? dark : light;
}

export function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const light = Math.max(foregroundLuminance, backgroundLuminance);
  const dark = Math.min(foregroundLuminance, backgroundLuminance);
  return (light + 0.05) / (dark + 0.05);
}
