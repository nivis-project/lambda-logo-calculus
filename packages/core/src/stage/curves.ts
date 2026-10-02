import type { ParamDef } from '../params/types.js';
import { resolveParams } from '../params/resolve.js';
import type { ArcSegment, GlyphSkeleton, StrokeSegment } from '../glyph/types.js';
import { radiusAt } from '../template/sample.js';
import type { Vec2 } from '../template/types.js';
import type { Polyline, SkeletonStage, StageContext, WorkingSkeleton } from './types.js';

const DEG = Math.PI / 180;

export const CURVES_PARAMS: readonly ParamDef[] = [
  {
    id: 'minFactor',
    label: 'Smallest warp',
    kind: 'number',
    min: 0.1,
    max: 1,
    step: 0.05,
    default: 0.5,
    lockable: false,
    randomize: false,
    advanced: true,
    group: 'Curves',
  },
  {
    id: 'maxFactor',
    label: 'Largest warp',
    kind: 'number',
    min: 1,
    max: 3,
    step: 0.05,
    default: 1.5,
    lockable: false,
    randomize: false,
    advanced: true,
    group: 'Curves',
  },
  {
    id: 'degreesPerSample',
    label: 'Degrees per sample',
    kind: 'number',
    min: 1,
    max: 30,
    step: 1,
    default: 6,
    lockable: false,
    randomize: false,
    advanced: true,
    group: 'Curves',
  },
];

function curveAt(context: StageContext, theta: number): number {
  return radiusAt(context.template, theta - context.rotation, context.templateParams);
}

export function sampleArc(
  arc: ArcSegment,
  context: StageContext,
  warp: boolean,
  bounds: { readonly min: number; readonly max: number; readonly degreesPerSample: number },
): Vec2[] {
  const steps = Math.max(8, Math.ceil(Math.abs(arc.a1 - arc.a0) / bounds.degreesPerSample));
  const atStart = curveAt(context, arc.a0 * DEG);
  const atEnd = curveAt(context, arc.a1 * DEG);

  const points: Vec2[] = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const angle = (arc.a0 + (arc.a1 - arc.a0) * u) * DEG;
    let rho = 1;
    if (warp) {
      const blended = (1 - u) * atStart + u * atEnd;
      rho = Math.min(bounds.max, Math.max(bounds.min, curveAt(context, angle) / blended));
    }
    points.push([arc.cx + arc.rx * rho * Math.cos(angle), arc.cy + arc.ry * rho * Math.sin(angle)]);
  }
  return arc.skipFirst ? points.slice(1) : points;
}

function sampleStroke(
  segments: readonly StrokeSegment[],
  context: StageContext,
  warp: boolean,
  bounds: { readonly min: number; readonly max: number; readonly degreesPerSample: number },
): Polyline {
  const points: Vec2[] = [];
  for (const segment of segments) {
    if (segment.kind === 'point') points.push([segment.x, segment.y]);
    else points.push(...sampleArc(segment, context, warp, bounds));
  }
  return points;
}

function boundsFrom(context: StageContext): {
  readonly min: number;
  readonly max: number;
  readonly degreesPerSample: number;
} {
  const { values } = resolveParams(CURVES_PARAMS, context.params);
  return {
    min: typeof values.minFactor === 'number' ? values.minFactor : 0.5,
    max: typeof values.maxFactor === 'number' ? values.maxFactor : 1.5,
    degreesPerSample:
      typeof values.degreesPerSample === 'number' ? values.degreesPerSample : 6,
  };
}

function build(
  working: WorkingSkeleton,
  glyph: GlyphSkeleton,
  context: StageContext,
  warp: boolean,
): WorkingSkeleton {
  const bounds = boundsFrom(context);
  const runs = [...working.runs];
  const dots = [...working.dots];

  for (const part of glyph.parts) {
    if (part.kind === 'stroke') runs.push(sampleStroke(part.segments, context, warp, bounds));
    else if (part.kind === 'dot') dots.push({ x: part.x, y: part.y, r: part.r });
  }

  return { ...working, runs, dots };
}

export const curvesStage: SkeletonStage = {
  id: 'curves',
  version: 1,
  label: 'Curves',
  params: CURVES_PARAMS,

  apply(working, glyph, context) {
    return build(working, glyph, context, true);
  },

  applyDisabled(working, glyph, context) {
    return build(working, glyph, context, false);
  },
};
