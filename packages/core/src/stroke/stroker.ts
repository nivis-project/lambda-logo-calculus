import type { Polyline, Vec2 } from '../stage/types.js';
import { supportAt, type Pen } from './pen.js';

export type Contour = readonly Vec2[];

export interface StrokeResult {
  readonly contours: readonly Contour[];
  readonly left: Contour;
  readonly right: Contour;
}

export interface WidthProfile {
  readonly factors: readonly number[];
}

export const UNIFORM_WIDTH: WidthProfile = { factors: [] };

function factorAt(profile: WidthProfile, index: number): number {
  return profile.factors[index] ?? 1;
}

function close(points: readonly Vec2[]): Vec2[] {
  if (points.length === 0) return [];
  const first = points[0];
  const last = points[points.length - 1];
  if (first === undefined || last === undefined) return [...points];
  if (first[0] === last[0] && first[1] === last[1]) return [...points];
  return [...points, first];
}

export function strokeRun(
  run: Polyline,
  pen: Pen,
  profile: WidthProfile = UNIFORM_WIDTH,
): StrokeResult | undefined {
  const n = run.length;
  if (n < 2) return undefined;

  const left: Vec2[] = [];
  const right: Vec2[] = [];

  for (let j = 0; j < n; j++) {
    const here = run[j];
    const before = run[Math.max(j - 1, 0)];
    const after = run[Math.min(j + 1, n - 1)];
    if (here === undefined || before === undefined || after === undefined) continue;

    const tx = after[0] - before[0];
    const ty = after[1] - before[1];
    const length = Math.hypot(tx, ty) || 1;
    const nx = -ty / length;
    const ny = tx / length;
    const angle = Math.atan2(ny, nx);
    const weight = factorAt(profile, j);

    const h1 = supportAt(pen, angle) * weight;
    const h2 = supportAt(pen, angle + Math.PI) * weight;

    left.push([here[0] + nx * h1, here[1] + ny * h1]);
    right.push([here[0] - nx * h2, here[1] - ny * h2]);
  }

  const outline = close([...left, ...[...right].reverse()]);
  return { contours: [outline], left, right };
}

export function strokeRing(ring: Polyline, pen: Pen): StrokeResult | undefined {
  const n = ring.length;
  if (n < 3) return undefined;

  const left: Vec2[] = [];
  const right: Vec2[] = [];

  for (let j = 0; j < n; j++) {
    const here = ring[j];
    const before = ring[(j - 1 + n) % n];
    const after = ring[(j + 1) % n];
    if (here === undefined || before === undefined || after === undefined) continue;

    const tx = after[0] - before[0];
    const ty = after[1] - before[1];
    const length = Math.hypot(tx, ty) || 1;
    const nx = -ty / length;
    const ny = tx / length;
    const angle = Math.atan2(ny, nx);

    const h1 = supportAt(pen, angle);
    const h2 = supportAt(pen, angle + Math.PI);

    left.push([here[0] + nx * h1, here[1] + ny * h1]);
    right.push([here[0] - nx * h2, here[1] - ny * h2]);
  }

  return {
    contours: [close(left), close([...right].reverse())],
    left,
    right,
  };
}
