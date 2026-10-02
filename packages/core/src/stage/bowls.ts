import type { ParamDef } from '../params/types.js';
import { resolveParams } from '../params/resolve.js';
import type { BowlPrimitive, CutRegion, GlyphSkeleton } from '../glyph/types.js';
import { radiusAt } from '../template/sample.js';
import type { Vec2 } from '../template/types.js';
import type { Polyline, SkeletonStage, StageContext, WorkingSkeleton } from './types.js';

const TAU = Math.PI * 2;
const QUARTER_TURN = Math.PI / 2;

export const BOWLS_PARAMS: readonly ParamDef[] = [
  {
    id: 'inset',
    label: 'Bowl inset',
    kind: 'number',
    min: 0,
    max: 20,
    step: 0.5,
    default: 5,
    lockable: false,
    randomize: false,
    advanced: true,
    group: 'Bowls',
  },
  {
    id: 'minFactor',
    label: 'Smallest radius',
    kind: 'number',
    min: 0.05,
    max: 1,
    step: 0.05,
    default: 0.35,
    lockable: false,
    randomize: false,
    advanced: true,
    group: 'Bowls',
  },
  {
    id: 'samples',
    label: 'Bowl samples',
    kind: 'int',
    min: 24,
    max: 720,
    step: 1,
    default: 144,
    lockable: false,
    randomize: false,
    advanced: true,
    group: 'Bowls',
  },
];

function inside(point: Vec2, cut: CutRegion): boolean {
  return point[0] >= cut.x0 && point[0] <= cut.x1 && point[1] >= cut.y0 && point[1] <= cut.y1;
}

function ringFor(
  bowl: BowlPrimitive,
  context: StageContext,
  trace: boolean,
  settings: { readonly inset: number; readonly minFactor: number; readonly samples: number },
): Vec2[] {
  const peak = context.template.maxRadius(context.templateParams);

  const unit: Vec2[] = [];
  for (let k = 0; k < settings.samples; k++) {
    const theta = (k / settings.samples) * TAU;
    const rho = trace
      ? Math.max(
          settings.minFactor,
          radiusAt(context.template, theta - context.rotation - QUARTER_TURN, context.templateParams) /
            peak,
        )
      : 1;
    unit.push([rho * Math.cos(theta), rho * Math.sin(theta)]);
  }

  let x0 = Number.POSITIVE_INFINITY;
  let x1 = Number.NEGATIVE_INFINITY;
  let y0 = Number.POSITIVE_INFINITY;
  let y1 = Number.NEGATIVE_INFINITY;
  for (const [x, y] of unit) {
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }

  const midX = (x0 + x1) / 2;
  const midY = (y0 + y1) / 2;
  const halfX = (x1 - x0) / 2 || 1;
  const halfY = (y1 - y0) / 2 || 1;

  return unit.map(([x, y]): Vec2 => [
    bowl.cx + ((x - midX) / halfX) * (bowl.rx - settings.inset),
    bowl.cy + ((y - midY) / halfY) * (bowl.ry - settings.inset),
  ]);
}

export function cutRing(ring: readonly Vec2[], cuts: readonly CutRegion[]): {
  readonly closed: Polyline | null;
  readonly runs: readonly Polyline[];
} {
  const keep = ring.map((point) => !cuts.some((cut) => inside(point, cut)));
  if (keep.every(Boolean)) return { closed: ring, runs: [] };

  const start = keep.indexOf(false);
  const runs: Vec2[][] = [];
  let current: Vec2[] = [];

  for (let k = 1; k <= ring.length; k++) {
    const i = (start + k) % ring.length;
    const point = ring[i];
    if (keep[i] === true && point !== undefined) current.push(point);
    else {
      if (current.length > 1) runs.push(current);
      current = [];
    }
  }
  if (current.length > 1) runs.push(current);

  return { closed: null, runs };
}

function build(
  working: WorkingSkeleton,
  glyph: GlyphSkeleton,
  context: StageContext,
  trace: boolean,
): WorkingSkeleton {
  const { values } = resolveParams(BOWLS_PARAMS, context.params);
  const settings = {
    inset: typeof values.inset === 'number' ? values.inset : 5,
    minFactor: typeof values.minFactor === 'number' ? values.minFactor : 0.35,
    samples: typeof values.samples === 'number' ? values.samples : 144,
  };

  const runs = [...working.runs];
  const rings = [...working.rings];

  for (const part of glyph.parts) {
    if (part.kind !== 'bowl') continue;
    const ring = ringFor(part, context, trace, settings);
    const cut = cutRing(ring, part.cuts);
    if (cut.closed !== null) rings.push(cut.closed);
    else runs.push(...cut.runs);
  }

  return { ...working, runs, rings };
}

export const bowlsStage: SkeletonStage = {
  id: 'bowls',
  version: 1,
  label: 'Bowls',
  params: BOWLS_PARAMS,

  apply(working, glyph, context) {
    return build(working, glyph, context, true);
  },

  applyDisabled(working, glyph, context) {
    return build(working, glyph, context, false);
  },
};
