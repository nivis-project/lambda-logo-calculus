import type { ParamValues } from '../params/types.js';
import type { Polyline, WorkingSkeleton } from '../stage/types.js';
import { sampleCurve } from '../template/sample.js';
import type { ShapeTemplate, Vec2 } from '../template/types.js';
import type { Contour, EndContext, Ending, EndingBuildContext } from './endings.js';
import { normalise, resample, splitRuns, type Run } from './geometry.js';
import { supportAt, type Pen } from './pen.js';

export const JOIN_RADIUS = 11;
export const JOIN_SAMPLES = 72;
export const JOIN_FLOOR = 0.35;

export interface OutlineOptions {
  readonly pen: Pen;
  readonly ending: Ending;
  readonly shapeBuilt: boolean;
  readonly template: ShapeTemplate;
  readonly templateParams: ParamValues;
  readonly rotation: number;
  readonly copyIndex: number;
  readonly nibSize: number;
  readonly amplitude: number;
  readonly joins: boolean;
  readonly curvesOn: boolean;
}

export interface GlyphOutline {
  readonly contours: readonly Contour[];
  readonly stamps: readonly { readonly at: Vec2; readonly size: number }[];
}

function widthProfile(points: Polyline, run: Run, options: OutlineOptions): number[] {
  const profile = options.ending.profile;
  const factors = new Array<number>(points.length).fill(1);
  if (profile === undefined) return factors;

  const along: number[] = [0];
  for (let j = 1; j < points.length; j++) {
    const a = points[j - 1];
    const b = points[j];
    if (a === undefined || b === undefined) continue;
    along.push((along[j - 1] ?? 0) + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = along[along.length - 1] ?? 0;

  const taperLength = Math.min(
    total * 0.45,
    options.shapeBuilt ? 10 + 30 / options.amplitude : 22,
  );
  const flareLength = Math.min(total * 0.4, 16);
  const flareAmount = options.shapeBuilt
    ? Math.min(1, 0.15 + 0.9 / options.amplitude)
    : 0.4;

  for (let j = 0; j < points.length; j++) {
    const distances: readonly (readonly [boolean, number])[] = [
      [run.freeStart, along[j] ?? 0],
      [run.freeEnd, total - (along[j] ?? 0)],
    ];

    for (const [free, distance] of distances) {
      if (!free) continue;
      if (profile === 'taper') {
        factors[j] =
          (factors[j] ?? 1) * Math.pow(Math.max(0.12, Math.min(1, distance / taperLength)), 0.8);
      } else if (distance < flareLength) {
        factors[j] = (factors[j] ?? 1) * (1 + flareAmount * Math.pow(1 - distance / flareLength, 2));
      }
    }
  }

  return factors;
}

function sidesOf(
  points: Polyline,
  factors: readonly number[],
  pen: Pen,
  closed: boolean,
): { readonly left: Vec2[]; readonly right: Vec2[] } {
  const n = points.length;
  const left: Vec2[] = [];
  const right: Vec2[] = [];

  for (let j = 0; j < n; j++) {
    const here = points[j];
    const before = closed ? points[(j - 1 + n) % n] : points[Math.max(j - 1, 0)];
    const after = closed ? points[(j + 1) % n] : points[Math.min(j + 1, n - 1)];
    if (here === undefined || before === undefined || after === undefined) continue;

    const [tx, ty] = [after[0] - before[0], after[1] - before[1]];
    const length = Math.hypot(tx, ty) || 1;
    const nx = -ty / length;
    const ny = tx / length;
    const angle = Math.atan2(ny, nx);
    const weight = factors[j] ?? 1;

    const outer = supportAt(pen, angle) * weight;
    const inner = supportAt(pen, angle + Math.PI) * weight;
    left.push([here[0] + nx * outer, here[1] + ny * outer]);
    right.push([here[0] - nx * inner, here[1] - ny * inner]);
  }

  return { left, right };
}

function endContextFor(
  points: Polyline,
  sides: { readonly left: Vec2[]; readonly right: Vec2[] },
  index: number,
  neighbour: number,
  run: Run,
  copyIndex: number,
): EndContext | null {
  const at = points[index];
  const other = points[neighbour];
  const left = sides.left[index];
  const right = sides.right[index];
  if (at === undefined || other === undefined || left === undefined || right === undefined) {
    return null;
  }

  const halfWidth = Math.max(
    Math.hypot(left[0] - at[0], left[1] - at[1]),
    Math.hypot(right[0] - at[0], right[1] - at[1]),
    1,
  );

  return {
    at,
    outward: normalise(at[0] - other[0], at[1] - other[1]),
    halfWidth,
    index,
    left,
    right,
    curved: run.curved,
    ...(copyIndex === -1 ? {} : {}),
  };
}

function strokeRun(run: Run, options: OutlineOptions): {
  readonly contour: Contour;
  readonly extras: readonly Contour[];
} {
  const points =
    options.ending.profile === undefined ? run.points : resample(run.points, 3);
  const factors = widthProfile(points, run, options);
  const sides = sidesOf(points, factors, options.pen, false);

  const buildContext: EndingBuildContext = {
    shapeBuilt: options.shapeBuilt,
    template: options.template,
    templateParams: options.templateParams,
    rotation: options.rotation,
    copyIndex: options.copyIndex,
    nibSize: options.nibSize,
  };

  const extras: Contour[] = [];
  const ends: readonly (readonly [boolean, number, number])[] = [
    [run.freeStart, 0, 1],
    [run.freeEnd, points.length - 1, points.length - 2],
  ];

  for (const [free, index, neighbour] of ends) {
    if (!free) continue;
    const end = endContextFor(points, sides, index, neighbour, run, options.copyIndex);
    if (end === null) continue;

    const cut = options.ending.cut?.(end, buildContext);
    if (cut !== undefined) {
      sides.left[index] = cut.left;
      sides.right[index] = cut.right;
    }

    extras.push(...options.ending.build(end, buildContext));
  }

  return { contour: [...sides.left, ...[...sides.right].reverse()], extras };
}

function strokeRing(ring: Polyline, options: OutlineOptions): readonly Contour[] {
  const factors = new Array<number>(ring.length).fill(1);
  const sides = sidesOf(ring, factors, options.pen, true);
  return [sides.left, [...sides.right].reverse()];
}

function loopAt(bisectorPoint: Vec2, options: OutlineOptions): Contour {
  const peak = options.template.maxRadius(options.templateParams);
  const out: Vec2[] = [];

  for (let k = 0; k < JOIN_SAMPLES; k++) {
    const t = (k / JOIN_SAMPLES) * Math.PI * 2;
    const factor = options.curvesOn
      ? Math.max(
          JOIN_FLOOR,
          options.template.radius(t - options.rotation, options.templateParams) / peak,
        )
      : 1;
    const radius = JOIN_RADIUS * factor;
    out.push([bisectorPoint[0] + radius * Math.cos(t), bisectorPoint[1] + radius * Math.sin(t)]);
  }

  return out;
}

export function outlineSkeleton(
  skeleton: WorkingSkeleton,
  options: OutlineOptions,
): GlyphOutline {
  const contours: Contour[] = [];
  const stamps: { at: Vec2; size: number }[] = [];

  for (const stroke of skeleton.runs) {
    const runs = splitRuns(stroke);
    for (const [index, run] of runs.entries()) {
      const { contour, extras } = strokeRun(run, options);
      if (contour.length >= 3) contours.push(contour);
      contours.push(...extras.filter((extra) => extra.length >= 3));

      const first = run.points[0];
      const last = run.points[run.points.length - 1];
      if (index > 0 && first !== undefined) stamps.push({ at: first, size: options.nibSize });
      if (index < runs.length - 1 && last !== undefined) {
        stamps.push({ at: last, size: options.nibSize });
      }
    }
  }

  for (const ring of skeleton.rings) contours.push(...strokeRing(ring, options));

  if (options.joins) {
    for (const corner of skeleton.corners) {
      const at: Vec2 = [
        corner.at[0] + corner.bisector[0] * JOIN_RADIUS * 0.9,
        corner.at[1] + corner.bisector[1] * JOIN_RADIUS * 0.9,
      ];
      contours.push(...strokeRing(loopAt(at, options), options));
    }
  }

  for (const dot of skeleton.dots) {
    stamps.push({ at: [dot.x, dot.y], size: options.nibSize * 1.35 });
  }

  return { contours, stamps };
}

export function stampContour(
  at: Vec2,
  size: number,
  options: Pick<OutlineOptions, 'template' | 'templateParams' | 'rotation' | 'shapeBuilt'>,
  strokeWidth: number,
): Contour {
  if (!options.shapeBuilt) {
    const radius = strokeWidth / 2;
    const out: Vec2[] = [];
    for (let k = 0; k < 48; k++) {
      const t = (k / 48) * Math.PI * 2;
      out.push([at[0] + radius * Math.cos(t), at[1] + radius * Math.sin(t)]);
    }
    return out;
  }

  const cos = Math.cos(options.rotation);
  const sin = Math.sin(options.rotation);
  return sampleCurve(options.template, options.templateParams, 64).map(({ x, y }): Vec2 => [
    at[0] + (x * cos - y * sin) * size,
    at[1] + (x * sin + y * cos) * size,
  ]);
}
