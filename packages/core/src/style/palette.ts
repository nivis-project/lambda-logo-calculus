import type { ParamValues } from '../params/types.js';
import { createRegistry, type Registered, type Registry } from '../registry/registry.js';

export const BASE_HUE = 322;

export interface Palette extends Registered {
  colorAt(index: number, count: number, params: ParamValues): string;
}

export function wrapHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

export function hsl(hue: number, saturation: number, lightness: number): string {
  return `hsl(${wrapHue(hue)} ${saturation}% ${lightness}%)`;
}

function spread(index: number, count: number): number {
  return count > 1 ? index / (count - 1) : 0;
}

function palette(
  id: string,
  label: string,
  colorAt: (index: number, count: number) => string,
): Palette {
  return { id, version: 1, label, params: [], colorAt: (index, count) => colorAt(index, count) };
}

export const monochrome = palette('monochrome', 'Monochrome', (i, n) =>
  hsl(BASE_HUE, 62, 30 + spread(i, n) * 38),
);

export const analogous = palette('analogous', 'Analogous', (i, n) =>
  hsl(BASE_HUE - 35 + spread(i, n) * 70, 70, 50),
);

export const complementary = palette('complementary', 'Complementary', (i, n) =>
  hsl(i % 2 ? BASE_HUE + 180 : BASE_HUE, 70, 44 + spread(i, n) * 14),
);

export const triadic = palette('triadic', 'Triadic', (i) => hsl(BASE_HUE + (i % 3) * 120, 68, 50));

export const warm = palette('warm', 'Warm', (i, n) => hsl(345 + spread(i, n) * 65, 78, 52));

export const cool = palette('cool', 'Cool', (i, n) => hsl(170 + spread(i, n) * 100, 62, 48));

export const BUILT_IN_PALETTES: readonly Palette[] = [
  monochrome,
  analogous,
  complementary,
  triadic,
  warm,
  cool,
];

export function createPaletteRegistry(): Registry<Palette> {
  const registry = createRegistry<Palette>('palette');
  for (const p of BUILT_IN_PALETTES) registry.register(p);
  return registry;
}

export function passOpacity(alpha: number): number {
  return Math.min(1, 0.25 + alpha * 1.25);
}

export type Rgb = readonly [number, number, number];

function hueToChannel(p: number, q: number, t: number): number {
  const shifted = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
  if (shifted < 1 / 6) return p + (q - p) * 6 * shifted;
  if (shifted < 1 / 2) return q;
  if (shifted < 2 / 3) return p + (q - p) * (2 / 3 - shifted) * 6;
  return p;
}

export function rgbOf(color: string): Rgb {
  const hex = /^#([0-9a-f]{6})$/i.exec(color.trim());
  if (hex?.[1] !== undefined) {
    const value = Number.parseInt(hex[1], 16);
    return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
  }

  const parts = /^hsl\(\s*([-\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)$/i.exec(color.trim());
  if (parts === null) return [0, 0, 0];

  const hue = wrapHue(Number(parts[1])) / 360;
  const saturation = Number(parts[2]) / 100;
  const lightness = Number(parts[3]) / 100;

  if (saturation === 0) return [lightness, lightness, lightness];

  const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;
  return [
    hueToChannel(p, q, hue + 1 / 3),
    hueToChannel(p, q, hue),
    hueToChannel(p, q, hue - 1 / 3),
  ];
}
