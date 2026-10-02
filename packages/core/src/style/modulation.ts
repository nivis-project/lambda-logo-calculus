import type { GridMetrics } from '../glyph/types.js';

export const X_HEIGHT_HEADROOM = 16;
export const X_HEIGHT_REACH = 0.22;

export interface Modulated {
  readonly widthFactor: number;
  readonly xHeight: number;
}

// The two couplings milestone 02 found: the amplitude quietly sets the letter
// width, and the fit size quietly sets the x-height. Named here so they cannot
// be added to without somebody writing them down.
export function modulate(
  amplitude: number,
  fit: number,
  metrics: GridMetrics,
  proportions: boolean,
): Modulated {
  if (!proportions) return { widthFactor: 1, xHeight: metrics.xHeight };

  return {
    widthFactor: 0.78 + 0.5 * (1 - Math.exp(-(amplitude - 1) / 4)),
    xHeight: Math.min(
      metrics.capHeight - X_HEIGHT_HEADROOM,
      metrics.xHeight * (1 + X_HEIGHT_REACH * fit),
    ),
  };
}
