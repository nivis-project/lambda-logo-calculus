import type { ParamValues } from '../params/types.js';
import type { Vec2 } from '../stage/types.js';
import { polygonInPolygon } from './geometry.js';
import { sampleCurve } from './sample.js';
import type { ShapeTemplate } from './types.js';

export const SEARCH_STEPS = 24;
export const PARAMETRIC_SAMPLES = 180;

function outlineOf(
  template: ShapeTemplate,
  params: ParamValues,
  samples: number,
): readonly Vec2[] {
  return sampleCurve(template, params, samples).map(({ x, y }) => [x, y] as Vec2);
}

function signedArea(polygon: readonly Vec2[]): number {
  let sum = 0;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    if (a === undefined || b === undefined) continue;
    sum += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(sum) / 2;
}

function transformed(outline: readonly Vec2[], scale: number, rotation: number): readonly Vec2[] {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return outline.map(([x, y]) => [
    (x * cos - y * sin) * scale,
    (x * sin + y * cos) * scale,
  ]);
}

export function parametricFit(
  template: ShapeTemplate,
  params: ParamValues,
  rotation: number,
  samples = PARAMETRIC_SAMPLES,
  steps = SEARCH_STEPS,
): number {
  const normalised = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  if (normalised < 1e-12) return 1;

  const parent = outlineOf(template, params, samples);
  if (parent.length < 3 || signedArea(parent) <= 1e-12) return 1;

  if (polygonInPolygon(transformed(parent, 1, rotation), parent, 1e-6)) return 1;

  let low = 0;
  let high = 1;
  for (let i = 0; i < steps; i++) {
    const mid = (low + high) / 2;
    if (polygonInPolygon(transformed(parent, mid, rotation), parent, 1e-6)) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return low;
}
