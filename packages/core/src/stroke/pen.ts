import type { ParamValues } from '../params/types.js';
import { sampleCurve } from '../template/sample.js';
import type { ShapeTemplate } from '../template/types.js';

export const SUPPORT_ENTRIES = 360;
const TAU = Math.PI * 2;

export interface Pen {
  readonly support: Float32Array;
}

export function supportAt(pen: Pen, angleRadians: number): number {
  const entries = pen.support.length;
  const index = ((Math.round((angleRadians / TAU) * entries) % entries) + entries) % entries;
  return pen.support[index] ?? 0;
}

export function roundPen(strokeWidth: number, entries = SUPPORT_ENTRIES): Pen {
  return { support: new Float32Array(entries).fill(strokeWidth / 2) };
}

export function shapePen(
  template: ShapeTemplate,
  params: ParamValues,
  scale: number,
  rotation: number,
  samples = 144,
  entries = SUPPORT_ENTRIES,
): Pen {
  const points = sampleCurve(template, params, samples).map(({ x, y }) => {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    return [(x * cos - y * sin) * scale, (x * sin + y * cos) * scale] as const;
  });

  const support = new Float32Array(entries);
  for (let d = 0; d < entries; d++) {
    const cos = Math.cos((d / entries) * TAU);
    const sin = Math.sin((d / entries) * TAU);
    let best = 0;
    for (const [x, y] of points) {
      const projection = x * cos + y * sin;
      if (projection > best) best = projection;
    }
    support[d] = best;
  }
  return { support };
}
