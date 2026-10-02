import { createRegistry, type Registered, type Registry } from '../registry/registry.js';

export const BASE_HUE = 322;

export function wrapHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

export function hsl(hue: number, saturation: number, lightness: number): string {
  return `hsl(${String(wrapHue(hue))} ${String(saturation)}% ${String(lightness)}%)`;
}

export interface Palette extends Registered {
  colorAt(index: number, count: number): string;
}

function palette(id: string, label: string, colorAt: Palette['colorAt']): Palette {
  return { id, version: 1, label, params: [], colorAt };
}

const spread = (index: number, count: number): number => (count > 1 ? index / (count - 1) : 0);

export const monochrome = palette('Monochrome', 'Monochrome', (i, n) =>
  hsl(BASE_HUE, 62, 30 + spread(i, n) * 38),
);

export const analogous = palette('Analogous', 'Analogous', (i, n) =>
  hsl(BASE_HUE - 35 + spread(i, n) * 70, 70, 50),
);

export const complementary = palette('Complementary', 'Complementary', (i, n) =>
  hsl(i % 2 ? BASE_HUE + 180 : BASE_HUE, 70, 44 + spread(i, n) * 14),
);

export const triadic = palette('Triadic', 'Triadic', (i) => hsl(BASE_HUE + (i % 3) * 120, 68, 50));

export const warm = palette('Warm', 'Warm', (i, n) => hsl(345 + spread(i, n) * 65, 78, 52));

export const cool = palette('Cool', 'Cool', (i, n) => hsl(170 + spread(i, n) * 100, 62, 48));

export const builtInPalettes: readonly Palette[] = [
  monochrome,
  analogous,
  complementary,
  triadic,
  warm,
  cool,
];

export function createPaletteRegistry(): Registry<Palette> {
  const registry = createRegistry<Palette>('palette');
  for (const item of builtInPalettes) registry.register(item);
  return registry;
}

// The transparency slider is remapped three different ways. Milestone 02
// recorded all three; none of them is the slider's own value.
export function letterOpacity(alpha: number): number {
  return Math.min(1, 0.25 + alpha * 1.25);
}

export function ornamentOpacity(alpha: number): number {
  return Math.min(1, 0.45 + alpha * 1.2);
}

export function markOpacity(alpha: number): number {
  return Math.min(0.9, 0.05 + alpha * 1.5);
}
