import type { Vec2 } from '../stage/types.js';

export const ON_EDGE_EPSILON = 1e-9;

function side(a: Vec2, b: Vec2, p: Vec2): number {
  return (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
}

export function isOnSegment(a: Vec2, b: Vec2, p: Vec2, epsilon = ON_EDGE_EPSILON): boolean {
  const cross = side(a, b, p);
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (length === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]) <= epsilon;
  if (Math.abs(cross) / length > epsilon) return false;

  const dot = (p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1]);
  return dot >= -epsilon && dot <= length * length + epsilon;
}

export function pointInPolygon(
  point: Vec2,
  polygon: readonly Vec2[],
  epsilon = ON_EDGE_EPSILON,
): boolean {
  const n = polygon.length;
  if (n < 3) return false;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const a = polygon[j];
    const b = polygon[i];
    if (a === undefined || b === undefined) continue;
    if (isOnSegment(a, b, point, epsilon)) return true;
  }

  let inside = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const a = polygon[j];
    const b = polygon[i];
    if (a === undefined || b === undefined) continue;
    const crosses = b[1] > point[1] !== a[1] > point[1];
    if (!crosses) continue;
    const at = ((a[0] - b[0]) * (point[1] - b[1])) / (a[1] - b[1]) + b[0];
    if (point[0] < at) inside = !inside;
  }
  return inside;
}

export function polygonInPolygon(
  inner: readonly Vec2[],
  outer: readonly Vec2[],
  epsilon = ON_EDGE_EPSILON,
): boolean {
  return inner.every((point) => pointInPolygon(point, outer, epsilon));
}
