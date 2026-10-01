import type { ParamValues } from '../params/types.js';
import type { Point, SampledPoint, ShapeTemplate } from './types.js';

const TAU = Math.PI * 2;

export function radiusAt(template: ShapeTemplate, theta: number, params: ParamValues): number {
  if (template.radius === undefined) {
    throw new Error(`template "${template.id}" has no radius function`);
  }
  return template.radius(theta, params);
}

export function pointAt(template: ShapeTemplate, t: number, params: ParamValues): Point {
  if (template.point === undefined) {
    throw new Error(`template "${template.id}" has no point function`);
  }
  return template.point(t, params);
}

export function maxRadius(template: ShapeTemplate, params: ParamValues, samples = 720): number {
  if (template.maxRadius !== undefined) {
    return template.maxRadius(params);
  }
  let found = 0;
  for (let k = 0; k < samples; k++) {
    if (template.kind === 'polar') {
      found = Math.max(found, Math.abs(radiusAt(template, (k / samples) * TAU, params)));
    } else {
      const [x, y] = pointAt(template, k / samples, params);
      found = Math.max(found, Math.hypot(x, y));
    }
  }
  return found;
}

export function sampleCurve(
  template: ShapeTemplate,
  params: ParamValues,
  count: number,
): readonly SampledPoint[] {
  if (!Number.isInteger(count) || count < 3) {
    throw new Error(`sampleCurve needs at least 3 samples, was asked for ${count}`);
  }

  const scale = maxRadius(template, params);
  if (!(scale > 0)) {
    throw new Error(`template "${template.id}" has a maximum radius of ${scale}`);
  }

  const out: SampledPoint[] = [];
  for (let k = 0; k < count; k++) {
    if (template.kind === 'polar') {
      const theta = (k / count) * TAU;
      const r = radiusAt(template, theta, params) / scale;
      out.push({ x: r * Math.cos(theta), y: r * Math.sin(theta), theta });
    } else {
      const [px, py] = pointAt(template, k / count, params);
      const x = px / scale;
      const y = py / scale;
      out.push({ x, y, theta: Math.atan2(y, x) });
    }
  }
  return out;
}
