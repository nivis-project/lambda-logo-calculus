import type { ParamValues } from '../params/types.js';
import type { SampledPoint, ShapeTemplate } from './types.js';

const TAU = Math.PI * 2;

export function radiusAt(template: ShapeTemplate, theta: number, params: ParamValues): number {
  return template.radius(theta, params);
}

export function sampleCurve(
  template: ShapeTemplate,
  params: ParamValues,
  count: number,
): readonly SampledPoint[] {
  if (count < 3) {
    throw new Error(`sampleCurve needs at least 3 samples, was asked for ${String(count)}`);
  }

  const peak = template.maxRadius(params);
  const out: SampledPoint[] = [];
  for (let k = 0; k < count; k++) {
    const theta = (k / count) * TAU;
    const r = radiusAt(template, theta, params) / peak;
    out.push({ x: r * Math.cos(theta), y: r * Math.sin(theta), theta });
  }
  return out;
}
