import type { ParamDef } from '../params/types.js';
import { maxRadius, radiusAt } from '../template/sample.js';
import type { BowlPrimitive, CutRegion } from '../glyph/types.js';
import type { Polyline, SkeletonStage, StageContext, Vec2, WorkingSkeleton } from './types.js';

const TAU = Math.PI * 2;

export const BOWLS_PARAMS: readonly ParamDef[] = [
  {
    id: 'inset',
    label: 'Bowl inset',
    kind: 'number',
    min: 0,
    max: 20,
    step: 0.5,
    default: 5,
    lockable: true,
    group: 'Bowls',
    advanced: true,
  },
  {
    id: 'radiusFloor',
    label: 'Bowl radius floor',
    kind: 'number',
    min: 0.05,
    max: 1,
    step: 0.01,
    default: 0.35,
    lockable: true,
    group: 'Bowls',
    advanced: true,
  },
  {
    id: 'samples',
    label: 'Bowl samples',
    kind: 'int',
    min: 24,
    max: 512,
    default: 144,
    lockable: true,
    group: 'Bowls',
    advanced: true,
  },
];

function num(context: StageContext, id: string, fallback: number): number {
  const value = context.params[id];
  return typeof value === 'number' ? value : fallback;
}

function guardedParams(context: StageContext): typeof context.templateParams {
  const guard = context.template.safety.minAmplitude;
  if (guard === undefined) return context.templateParams;
  const given = context.templateParams[guard.paramId];
  return typeof given === 'number' && given < guard.value
    ? { ...context.templateParams, [guard.paramId]: guard.value }
    : context.templateParams;
}

export function shapeRho(context: StageContext, theta: number, scaled: boolean): number {
  if (!scaled) return 1;
  const params = guardedParams(context);
  const floor = num(context, 'radiusFloor', 0.35);
  const angle = theta - context.rotation - Math.PI / 2;
  const r = radiusAt(context.template, angle, params) / maxRadius(context.template, params);
  return Math.max(floor, r);
}

function inside(point: Vec2, cut: CutRegion): boolean {
  return point[0] >= cut.x0 && point[0] <= cut.x1 && point[1] >= cut.y0 && point[1] <= cut.y1;
}

export function buildBowl(
  bowl: BowlPrimitive,
  context: StageContext,
  scaled: boolean,
): { readonly rings: Polyline[]; readonly runs: Polyline[] } {
  const count = Math.round(num(context, 'samples', 144));
  const inset = num(context, 'inset', 5);

  const unit: Vec2[] = [];
  for (let k = 0; k < count; k++) {
    const theta = (k / count) * TAU;
    const r = shapeRho(context, theta, scaled);
    unit.push([r * Math.cos(theta), r * Math.sin(theta)]);
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
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const hx = (x1 - x0) / 2 || 1;
  const hy = (y1 - y0) / 2 || 1;

  const ring: Vec2[] = unit.map(([x, y]) => [
    bowl.cx + ((x - mx) / hx) * (bowl.rx - inset),
    bowl.cy + ((y - my) / hy) * (bowl.ry - inset),
  ]);

  const keep = ring.map((point) => !bowl.cuts.some((cut) => inside(point, cut)));
  if (keep.every(Boolean)) {
    return { rings: [ring], runs: [] };
  }

  const start = keep.indexOf(false);
  const runs: Polyline[] = [];
  let current: Vec2[] = [];
  for (let k = 1; k <= ring.length; k++) {
    const i = (start + k) % ring.length;
    if (keep[i] === true) {
      const point = ring[i];
      if (point !== undefined) current.push(point);
    } else {
      if (current.length > 1) runs.push(current);
      current = [];
    }
  }
  if (current.length > 1) runs.push(current);
  return { rings: [], runs };
}

function build(scaled: boolean): SkeletonStage['apply'] {
  return (skeleton: WorkingSkeleton, context: StageContext): WorkingSkeleton => {
    const rings = [...skeleton.rings];
    const runs = [...skeleton.runs];
    const dots = [...skeleton.dots];
    const remaining = [];

    for (const part of skeleton.parts) {
      if (part.kind === 'bowl') {
        const built = buildBowl(part, context, scaled);
        rings.push(...built.rings);
        runs.push(...built.runs);
      } else if (part.kind === 'dot') {
        dots.push({ x: part.x, y: part.y, r: part.r });
      } else {
        remaining.push(part);
      }
    }

    return { ...skeleton, parts: remaining, rings, runs, dots };
  };
}

export const bowlsStage: SkeletonStage = {
  id: 'bowls',
  version: 1,
  label: 'Bowls',
  params: BOWLS_PARAMS,
  apply: build(true),
  applyDisabled: build(false),
};
