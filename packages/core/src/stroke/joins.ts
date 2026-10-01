import type { ParamDef, ParamValues } from '../params/types.js';
import { createRegistry, type Registered, type Registry } from '../registry/registry.js';
import type { Polyline, Vec2 } from '../stage/types.js';
import { maxRadius, radiusAt } from '../template/sample.js';
import type { ShapeTemplate } from '../template/types.js';
import type { Contour } from './stroker.js';

const DEG = Math.PI / 180;

export const CORNER_THRESHOLD_DEGREES = 50;

export interface Corner {
  readonly point: Vec2;
  readonly bisector: Vec2;
  readonly turn: number;
}

export interface JoinBuildContext {
  readonly shapeBuilt: boolean;
  readonly template: ShapeTemplate;
  readonly templateParams: ParamValues;
  readonly rotation: number;
  readonly params: ParamValues;
}

export interface Join extends Registered {
  build(corner: Corner, context: JoinBuildContext): readonly Contour[];
}

export function turnBetween(a: Vec2, b: Vec2, c: Vec2): number {
  const a1 = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const a2 = Math.atan2(c[1] - b[1], c[0] - b[0]);
  const d = Math.abs(a2 - a1);
  return d > Math.PI ? Math.PI * 2 - d : d;
}

export function findCorners(
  run: Polyline,
  thresholdDegrees = CORNER_THRESHOLD_DEGREES,
  widthFactor = 1,
): readonly Corner[] {
  const corners: Corner[] = [];
  for (let j = 1; j < run.length - 1; j++) {
    const before = run[j - 1];
    const here = run[j];
    const after = run[j + 1];
    if (before === undefined || here === undefined || after === undefined) continue;

    const amount = turnBetween(before, here, after);
    if (amount <= thresholdDegrees * DEG) continue;

    const v1: Vec2 = [before[0] - here[0], before[1] - here[1]];
    const v2: Vec2 = [after[0] - here[0], after[1] - here[1]];
    const l1 = Math.hypot(v1[0], v1[1]) || 1;
    const l2 = Math.hypot(v2[0], v2[1]) || 1;
    let bx = v1[0] / l1 + v2[0] / l2;
    const by = v1[1] / l1 + v2[1] / l2;
    bx *= widthFactor;
    const bl = Math.hypot(bx, by) || 1;

    corners.push({ point: here, bisector: [bx / bl, by / bl], turn: amount });
  }
  return corners;
}

const LOOP_PARAMS: readonly ParamDef[] = [
  {
    id: 'radius',
    label: 'Loop radius',
    kind: 'number',
    min: 0,
    max: 40,
    step: 0.5,
    default: 11,
    lockable: true,
    group: 'Joins',
  },
  {
    id: 'samples',
    label: 'Loop samples',
    kind: 'int',
    min: 12,
    max: 256,
    default: 72,
    lockable: true,
    group: 'Joins',
    advanced: true,
  },
  {
    id: 'radiusFloor',
    label: 'Loop radius floor',
    kind: 'number',
    min: 0.05,
    max: 1,
    step: 0.01,
    default: 0.35,
    lockable: true,
    group: 'Joins',
    advanced: true,
  },
];

export const loopJoin: Join = {
  id: 'loop',
  version: 1,
  label: 'Loop of the shape',
  params: LOOP_PARAMS,
  build(corner, context) {
    const radius = typeof context.params['radius'] === 'number' ? context.params['radius'] : 11;
    const steps = typeof context.params['samples'] === 'number' ? context.params['samples'] : 72;
    const floor =
      typeof context.params['radiusFloor'] === 'number' ? context.params['radiusFloor'] : 0.35;

    const cx = corner.point[0] + corner.bisector[0] * radius * 0.9;
    const cy = corner.point[1] + corner.bisector[1] * radius * 0.9;
    const peak = maxRadius(context.template, context.templateParams);

    const ring: Vec2[] = [];
    for (let k = 0; k < steps; k++) {
      const t = (k / steps) * Math.PI * 2;
      const rho = context.shapeBuilt
        ? Math.max(
            floor,
            radiusAt(context.template, t - context.rotation, context.templateParams) / peak,
          )
        : 1;
      ring.push([cx + radius * rho * Math.cos(t), cy + radius * rho * Math.sin(t)]);
    }
    const first = ring[0];
    if (first !== undefined) ring.push(first);
    return [ring];
  },
};

export const BUILT_IN_JOINS: readonly Join[] = [loopJoin];

export function createJoinRegistry(): Registry<Join> {
  const registry = createRegistry<Join>('join');
  for (const join of BUILT_IN_JOINS) registry.register(join);
  return registry;
}
