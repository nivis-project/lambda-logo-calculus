import type { ParamDef } from '../params/types.js';
import { radiusAt } from '../template/sample.js';
import type { ArcSegment, StrokePrimitive } from '../glyph/types.js';
import type { Polyline, SkeletonStage, StageContext, Vec2, WorkingSkeleton } from './types.js';

const DEG = Math.PI / 180;

export const CURVES_PARAMS: readonly ParamDef[] = [
  {
    id: 'warpMin',
    label: 'Warp floor',
    kind: 'number',
    min: 0.1,
    max: 1,
    step: 0.01,
    default: 0.5,
    lockable: true,
    group: 'Curves',
    advanced: true,
  },
  {
    id: 'warpMax',
    label: 'Warp ceiling',
    kind: 'number',
    min: 1,
    max: 4,
    step: 0.01,
    default: 1.5,
    lockable: true,
    group: 'Curves',
    advanced: true,
  },
  {
    id: 'degreesPerSample',
    label: 'Arc sample spacing',
    kind: 'number',
    min: 1,
    max: 30,
    step: 1,
    default: 6,
    lockable: true,
    group: 'Curves',
    advanced: true,
  },
];

function num(context: StageContext, id: string, fallback: number): number {
  const value = context.params[id];
  return typeof value === 'number' ? value : fallback;
}

function guardRadius(context: StageContext, angle: number): number {
  const guard = context.template.safety.minAmplitude;
  if (guard === undefined) return radiusAt(context.template, angle, context.templateParams);

  const given = context.templateParams[guard.paramId];
  const params =
    typeof given === 'number' && given < guard.value
      ? { ...context.templateParams, [guard.paramId]: guard.value }
      : context.templateParams;
  return radiusAt(context.template, angle, params);
}

export function sampleArc(
  arc: ArcSegment,
  context: StageContext,
  warp: boolean,
): readonly Vec2[] {
  const spacing = num(context, 'degreesPerSample', 6);
  const steps = Math.max(8, Math.ceil(Math.abs(arc.a1 - arc.a0) / spacing));
  const lo = num(context, 'warpMin', 0.5);
  const hi = num(context, 'warpMax', 1.5);

  const r0 = guardRadius(context, arc.a0 * DEG - context.rotation);
  const r1 = guardRadius(context, arc.a1 * DEG - context.rotation);

  const out: Vec2[] = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const angle = (arc.a0 + (arc.a1 - arc.a0) * u) * DEG;
    let rho = 1;
    if (warp) {
      const reference = (1 - u) * r0 + u * r1;
      rho = reference === 0 ? 1 : Math.min(hi, Math.max(lo, guardRadius(context, angle - context.rotation) / reference));
    }
    out.push([arc.cx + arc.rx * rho * Math.cos(angle), arc.cy + arc.ry * rho * Math.sin(angle)]);
  }
  return out;
}

export function strokeToPolyline(
  stroke: StrokePrimitive,
  context: StageContext,
  warp: boolean,
): Polyline {
  const points: Vec2[] = [];
  for (const segment of stroke.segments) {
    const next =
      segment.kind === 'point'
        ? ([[segment.x, segment.y]] as Vec2[])
        : [...sampleArc(segment, context, warp)];
    for (const point of next) {
      const last = points[points.length - 1];
      if (last !== undefined && Math.hypot(point[0] - last[0], point[1] - last[1]) <= 1e-6) {
        continue;
      }
      points.push(point);
    }
  }
  return points;
}

function build(warp: boolean): SkeletonStage['apply'] {
  return (skeleton: WorkingSkeleton, context: StageContext): WorkingSkeleton => {
    const runs = [...skeleton.runs];
    const remaining = [];
    for (const part of skeleton.parts) {
      if (part.kind === 'stroke') {
        const line = strokeToPolyline(part, context, warp);
        if (line.length > 1) runs.push(line);
      } else {
        remaining.push(part);
      }
    }
    return { ...skeleton, parts: remaining, runs };
  };
}

export const curvesStage: SkeletonStage = {
  id: 'curves',
  version: 1,
  label: 'Curves',
  params: CURVES_PARAMS,
  apply: build(true),
  applyDisabled: build(false),
};
