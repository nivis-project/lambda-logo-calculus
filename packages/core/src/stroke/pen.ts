import type { ParamValues } from '../params/types.js';
import { sampleCurve } from '../template/sample.js';
import type { ShapeTemplate, Vec2 } from '../template/types.js';

export const SUPPORT_ENTRIES = 360;
export const NIB_SIZE = 6.5;
export const PEN_SAMPLES = 144;

const DEG = Math.PI / 180;

export interface Pen {
  readonly support: Float32Array;
}

export function supportAt(pen: Pen, angleRadians: number): number {
  const index =
    ((Math.round(angleRadians / DEG) % SUPPORT_ENTRIES) + SUPPORT_ENTRIES) % SUPPORT_ENTRIES;
  return pen.support[index] ?? 0;
}

export function roundPen(strokeWidth: number): Pen {
  return { support: new Float32Array(SUPPORT_ENTRIES).fill(strokeWidth / 2) };
}

export function shapePen(
  template: ShapeTemplate,
  params: ParamValues,
  scale: number,
  rotation: number,
  samples = PEN_SAMPLES,
): Pen {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  const points: Vec2[] = sampleCurve(template, params, samples).map(({ x, y }) => [
    (x * cos - y * sin) * scale,
    (x * sin + y * cos) * scale,
  ]);

  const support = new Float32Array(SUPPORT_ENTRIES);
  for (let d = 0; d < SUPPORT_ENTRIES; d++) {
    const dx = Math.cos(d * DEG);
    const dy = Math.sin(d * DEG);
    let best = 0;
    for (const [x, y] of points) {
      const projection = x * dx + y * dy;
      if (projection > best) best = projection;
    }
    support[d] = best;
  }

  return { support };
}
