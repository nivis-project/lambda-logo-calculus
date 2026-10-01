import type { CurveCommand, CurveContour, Vec2 } from '@trefoil/core';

export const DEFAULT_FIT_TOLERANCE = 0.2;

const MAX_REPARAMETERISATIONS = 4;

function sub(a: Vec2, b: Vec2): Vec2 {
  return [a[0] - b[0], a[1] - b[1]];
}

function add(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

function scale(v: Vec2, k: number): Vec2 {
  return [v[0] * k, v[1] * k];
}

function dot(a: Vec2, b: Vec2): number {
  return a[0] * b[0] + a[1] * b[1];
}

function length(v: Vec2): number {
  return Math.hypot(v[0], v[1]);
}

function normalise(v: Vec2): Vec2 {
  const l = length(v);
  return l === 0 ? [0, 0] : [v[0] / l, v[1] / l];
}

type Cubic = readonly [Vec2, Vec2, Vec2, Vec2];

function pointOn(curve: Cubic, t: number): Vec2 {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [
    a * curve[0][0] + b * curve[1][0] + c * curve[2][0] + d * curve[3][0],
    a * curve[0][1] + b * curve[1][1] + c * curve[2][1] + d * curve[3][1],
  ];
}

function derivativeOn(curve: Cubic, t: number): Vec2 {
  const u = 1 - t;
  const a = scale(sub(curve[1], curve[0]), 3 * u * u);
  const b = scale(sub(curve[2], curve[1]), 6 * u * t);
  const c = scale(sub(curve[3], curve[2]), 3 * t * t);
  return add(add(a, b), c);
}

function secondDerivativeOn(curve: Cubic, t: number): Vec2 {
  const a = scale(add(sub(curve[2], scale(curve[1], 2)), curve[0]), 6 * (1 - t));
  const b = scale(add(sub(curve[3], scale(curve[2], 2)), curve[1]), 6 * t);
  return add(a, b);
}

function chordParameters(points: readonly Vec2[]): number[] {
  const u = [0];
  for (let i = 1; i < points.length; i++) {
    const here = points[i];
    const before = points[i - 1];
    if (here === undefined || before === undefined) continue;
    u.push((u[i - 1] ?? 0) + length(sub(here, before)));
  }
  const total = u[u.length - 1] ?? 0;
  return total === 0 ? u.map(() => 0) : u.map((value) => value / total);
}

function generateCurve(
  points: readonly Vec2[],
  parameters: readonly number[],
  leftTangent: Vec2,
  rightTangent: Vec2,
): Cubic {
  const first = points[0];
  const last = points[points.length - 1];
  if (first === undefined || last === undefined) throw new Error('no points to fit');

  let c00 = 0;
  let c01 = 0;
  let c11 = 0;
  let x0 = 0;
  let x1 = 0;

  for (const [index, point] of points.entries()) {
    const t = parameters[index] ?? 0;
    const u = 1 - t;
    const a0 = scale(leftTangent, 3 * u * u * t);
    const a1 = scale(rightTangent, 3 * u * t * t);

    c00 += dot(a0, a0);
    c01 += dot(a0, a1);
    c11 += dot(a1, a1);

    const base: Vec2 = [
      u * u * u * first[0] + 3 * u * u * t * first[0] + 3 * u * t * t * last[0] + t * t * t * last[0],
      u * u * u * first[1] + 3 * u * u * t * first[1] + 3 * u * t * t * last[1] + t * t * t * last[1],
    ];
    const diff = sub(point, base);
    x0 += dot(a0, diff);
    x1 += dot(a1, diff);
  }

  const determinant = c00 * c11 - c01 * c01;
  const chord = length(sub(last, first));

  let alphaLeft: number;
  let alphaRight: number;
  if (Math.abs(determinant) < 1e-12) {
    alphaLeft = chord / 3;
    alphaRight = chord / 3;
  } else {
    alphaLeft = (x0 * c11 - x1 * c01) / determinant;
    alphaRight = (c00 * x1 - c01 * x0) / determinant;
  }

  if (alphaLeft < 1e-6 || alphaRight < 1e-6) {
    alphaLeft = chord / 3;
    alphaRight = chord / 3;
  }

  alphaLeft = Math.min(alphaLeft, chord);
  alphaRight = Math.min(alphaRight, chord);

  return [
    first,
    add(first, scale(leftTangent, alphaLeft)),
    add(last, scale(rightTangent, alphaRight)),
    last,
  ];
}

const STRAY_SAMPLES = 24;
const STRAY_MARGIN = 0.9;

function distanceToPolyline(point: Vec2, points: readonly Vec2[]): number {
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (a === undefined || b === undefined) continue;
    const vx = b[0] - a[0];
    const vy = b[1] - a[1];
    const squared = vx * vx + vy * vy;
    const t =
      squared === 0
        ? 0
        : Math.min(1, Math.max(0, ((point[0] - a[0]) * vx + (point[1] - a[1]) * vy) / squared));
    best = Math.min(best, Math.hypot(point[0] - (a[0] + t * vx), point[1] - (a[1] + t * vy)));
  }
  return best;
}

function strayError(points: readonly Vec2[], curve: Cubic): number {
  let worst = 0;
  for (let i = 1; i < STRAY_SAMPLES; i++) {
    worst = Math.max(worst, distanceToPolyline(pointOn(curve, i / STRAY_SAMPLES), points));
  }
  return worst;
}

function worstError(
  points: readonly Vec2[],
  parameters: readonly number[],
  curve: Cubic,
): { readonly error: number; readonly index: number } {
  let error = 0;
  let index = Math.floor(points.length / 2);

  for (const [i, point] of points.entries()) {
    const distance = length(sub(pointOn(curve, parameters[i] ?? 0), point));
    if (distance > error) {
      error = distance;
      index = i;
    }
  }

  return { error, index };
}

function reparameterise(
  points: readonly Vec2[],
  parameters: readonly number[],
  curve: Cubic,
): number[] {
  return points.map((point, i) => {
    const t = parameters[i] ?? 0;
    const diff = sub(pointOn(curve, t), point);
    const d1 = derivativeOn(curve, t);
    const d2 = secondDerivativeOn(curve, t);
    const denominator = dot(d1, d1) + dot(diff, d2);
    if (Math.abs(denominator) < 1e-12) return t;
    return Math.min(1, Math.max(0, t - dot(diff, d1) / denominator));
  });
}

function fitSegment(
  points: readonly Vec2[],
  leftTangent: Vec2,
  rightTangent: Vec2,
  tolerance: number,
): { readonly curve: Cubic | null; readonly splitAt: number | null } {
  const first = points[0];
  const last = points[points.length - 1];
  if (first === undefined || last === undefined) throw new Error('no points to fit');

  if (points.length === 2) return { curve: null, splitAt: null };

  const accepted = (candidate: Cubic, error: number): boolean =>
    error <= tolerance && strayError(points, candidate) <= tolerance * STRAY_MARGIN;

  let parameters = chordParameters(points);
  let curve = generateCurve(points, parameters, leftTangent, rightTangent);
  let { error, index } = worstError(points, parameters, curve);
  if (accepted(curve, error)) return { curve, splitAt: null };

  if (error <= tolerance * 4) {
    for (let attempt = 0; attempt < MAX_REPARAMETERISATIONS; attempt++) {
      parameters = reparameterise(points, parameters, curve);
      const next = generateCurve(points, parameters, leftTangent, rightTangent);
      const measured = worstError(points, parameters, next);
      curve = next;
      error = measured.error;
      index = measured.index;
      if (accepted(curve, error)) return { curve, splitAt: null };
    }
  }

  const middle = Math.floor(points.length / 2);
  const splitAt = index > 0 && index < points.length - 1 ? index : middle;
  if (splitAt <= 0 || splitAt >= points.length - 1) return { curve, splitAt: null };
  return { curve, splitAt };
}

interface Pending {
  readonly points: readonly Vec2[];
  readonly leftTangent: Vec2;
  readonly rightTangent: Vec2;
}

function commandFor(curve: Cubic | null, to: Vec2): CurveCommand {
  return curve === null
    ? { kind: 'line', to }
    : { kind: 'cubic', c1: curve[1], c2: curve[2], to: curve[3] };
}

function fitCommands(
  points: readonly Vec2[],
  leftTangent: Vec2,
  rightTangent: Vec2,
  tolerance: number,
): CurveCommand[] {
  const commands: CurveCommand[] = [];
  const stack: Pending[] = [{ points, leftTangent, rightTangent }];

  while (stack.length > 0) {
    const pending = stack.pop();
    if (pending === undefined) break;

    const end = pending.points[pending.points.length - 1];
    if (end === undefined) continue;

    const { curve, splitAt } = fitSegment(
      pending.points,
      pending.leftTangent,
      pending.rightTangent,
      tolerance,
    );

    if (splitAt === null) {
      commands.push(commandFor(curve, end));
      continue;
    }

    const before = pending.points[splitAt - 1];
    const after = pending.points[splitAt + 1];
    if (before === undefined || after === undefined) {
      commands.push(commandFor(curve, end));
      continue;
    }

    const centre = normalise(sub(before, after));
    stack.push({
      points: pending.points.slice(splitAt),
      leftTangent: scale(centre, -1),
      rightTangent: pending.rightTangent,
    });
    stack.push({
      points: pending.points.slice(0, splitAt + 1),
      leftTangent: pending.leftTangent,
      rightTangent: centre,
    });
  }

  return commands;
}

function distinct(ring: readonly Vec2[]): Vec2[] {
  const points: Vec2[] = [];
  for (const [x, y] of ring) {
    const last = points[points.length - 1];
    if (last !== undefined && last[0] === x && last[1] === y) continue;
    points.push([x, y]);
  }
  const first = points[0];
  const last = points[points.length - 1];
  if (points.length > 1 && first !== undefined && last !== undefined && first[0] === last[0] && first[1] === last[1]) {
    points.pop();
  }
  return points;
}

export function fitRing(ring: readonly Vec2[], tolerance = DEFAULT_FIT_TOLERANCE): CurveContour {
  const points = distinct(ring);
  const first = points[0];
  if (first === undefined) return [];

  if (points.length < 4) {
    return [
      { kind: 'move', to: first },
      ...points.slice(1).map((to): CurveCommand => ({ kind: 'line', to })),
      { kind: 'close' },
    ];
  }

  const loop = [...points, first];
  const before = points[points.length - 1];
  const after = points[1];
  if (before === undefined || after === undefined) return [];

  const seam = normalise(sub(after, before));

  return [
    { kind: 'move', to: first },
    ...fitCommands(loop, seam, scale(seam, -1), tolerance),
    { kind: 'close' },
  ];
}

export function fitPolygon(
  polygon: readonly (readonly Vec2[])[],
  tolerance = DEFAULT_FIT_TOLERANCE,
): readonly CurveContour[] {
  return polygon.map((ring) => fitRing(ring, tolerance)).filter((contour) => contour.length > 0);
}
