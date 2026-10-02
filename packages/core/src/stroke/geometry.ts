import type { Polyline } from '../stage/types.js';
import type { Vec2 } from '../template/types.js';

export const SPLIT_TURN = 25;
export const CORNER_TURN = 50;
export const CURVED_TURN = 20;

const DEG = Math.PI / 180;

export function dedupe(points: Polyline): Vec2[] {
  const out: Vec2[] = [];
  for (const point of points) {
    const last = out[out.length - 1];
    if (last !== undefined && Math.hypot(point[0] - last[0], point[1] - last[1]) <= 1e-6) continue;
    out.push([point[0], point[1]]);
  }
  return out;
}

export function turnBetween(a: Vec2, b: Vec2, c: Vec2): number {
  const first = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const second = Math.atan2(c[1] - b[1], c[0] - b[0]);
  const difference = Math.abs(second - first);
  return difference > Math.PI ? 2 * Math.PI - difference : difference;
}

export function totalTurn(run: Polyline): number {
  let total = 0;
  for (let j = 1; j < run.length - 1; j++) {
    const a = run[j - 1];
    const b = run[j];
    const c = run[j + 1];
    if (a === undefined || b === undefined || c === undefined) continue;
    total += turnBetween(a, b, c);
  }
  return total;
}

export function isCurved(run: Polyline): boolean {
  return totalTurn(run) > CURVED_TURN * DEG;
}

export interface Run {
  readonly points: Polyline;
  readonly freeStart: boolean;
  readonly freeEnd: boolean;
  readonly curved: boolean;
}

export function splitRuns(points: Polyline): readonly Run[] {
  if (points.length < 2) return [];

  const pieces: Vec2[][] = [];
  const first = points[0];
  if (first === undefined) return [];
  let current: Vec2[] = [[first[0], first[1]]];

  for (let j = 1; j < points.length - 1; j++) {
    const a = points[j - 1];
    const b = points[j];
    const c = points[j + 1];
    if (a === undefined || b === undefined || c === undefined) continue;
    current.push([b[0], b[1]]);
    if (turnBetween(a, b, c) > SPLIT_TURN * DEG) {
      pieces.push(current);
      current = [[b[0], b[1]]];
    }
  }

  const last = points[points.length - 1];
  if (last !== undefined) current.push([last[0], last[1]]);
  pieces.push(current);

  const kept = pieces.filter((piece) => piece.length > 1);
  return kept.map((piece, index) => ({
    points: piece,
    freeStart: index === 0,
    freeEnd: index === kept.length - 1,
    curved: isCurved(piece),
  }));
}

export function normalise(x: number, y: number): Vec2 {
  const length = Math.hypot(x, y) || 1;
  return [x / length, y / length];
}

export function cross(a: Vec2, b: Vec2): number {
  return a[0] * b[1] - a[1] * b[0];
}

export function resample(points: Polyline, step: number): Vec2[] {
  const first = points[0];
  if (first === undefined) return [];

  const out: Vec2[] = [[first[0], first[1]]];
  for (let j = 1; j < points.length; j++) {
    const a = points[j - 1];
    const b = points[j];
    if (a === undefined || b === undefined) continue;
    const pieces = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let q = 1; q <= pieces; q++) {
      out.push([a[0] + ((b[0] - a[0]) * q) / pieces, a[1] + ((b[1] - a[1]) * q) / pieces]);
    }
  }
  return out;
}
