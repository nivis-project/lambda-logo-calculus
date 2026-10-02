import type { Contour } from '../stroke/endings.js';
import type { Vec2 } from '../template/types.js';

export interface Bounds {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
  readonly width: number;
  readonly height: number;
}

export function boundsOf(points: readonly Vec2[]): Bounds | null {
  if (points.length === 0) return null;

  let x0 = Number.POSITIVE_INFINITY;
  let y0 = Number.POSITIVE_INFINITY;
  let x1 = Number.NEGATIVE_INFINITY;
  let y1 = Number.NEGATIVE_INFINITY;

  for (const [x, y] of points) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }

  return { x0, y0, x1, y1, width: x1 - x0, height: y1 - y0 };
}

export function boundsOfContours(contours: readonly Contour[]): Bounds | null {
  return boundsOf(contours.flat());
}
