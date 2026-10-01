export type Point = readonly [number, number];

export interface Difference {
  readonly matched: boolean;
  readonly largest: number;
  readonly atIndex: number;
  readonly at?: Point;
  readonly reason?: string;
}

export function parsePathData(data: string): Point[][] {
  const contours: Point[][] = [];
  let current: Point[] = [];

  for (const match of data.matchAll(/([MLZ])\s*(-?[\d.]+)?\s*(-?[\d.]+)?/g)) {
    const [, command, first, second] = match;
    if (command === 'Z') {
      if (current.length > 0) contours.push(current);
      current = [];
      continue;
    }
    if (first === undefined || second === undefined) continue;
    if (command === 'M' && current.length > 0) {
      contours.push(current);
      current = [];
    }
    current.push([Number(first), Number(second)]);
  }
  if (current.length > 0) contours.push(current);
  return contours;
}

export function openContour(points: readonly Point[]): readonly Point[] {
  if (points.length < 2) return points;
  const first = points[0];
  const last = points[points.length - 1];
  if (first === undefined || last === undefined) return points;
  const closesByRepeat = Math.hypot(first[0] - last[0], first[1] - last[1]) < 1e-9;
  return closesByRepeat ? points.slice(0, -1) : points;
}

export function comparePoints(
  rawA: readonly Point[],
  rawB: readonly Point[],
  tolerance: number,
): Difference {
  const a = openContour(rawA);
  const b = openContour(rawB);
  if (a.length !== b.length) {
    return {
      matched: false,
      largest: Number.POSITIVE_INFINITY,
      atIndex: -1,
      reason: `point counts differ: ${a.length} against ${b.length}`,
    };
  }

  let largest = 0;
  let atIndex = -1;
  let at: Point | undefined;

  for (let i = 0; i < a.length; i++) {
    const p = a[i];
    const q = b[i];
    if (p === undefined || q === undefined) continue;
    const distance = Math.hypot(p[0] - q[0], p[1] - q[1]);
    if (distance > largest) {
      largest = distance;
      atIndex = i;
      at = p;
    }
  }

  return at === undefined
    ? { matched: largest <= tolerance, largest, atIndex }
    : { matched: largest <= tolerance, largest, atIndex, at };
}

export function describe(difference: Difference, tolerance: number): string {
  if (difference.reason !== undefined) return difference.reason;
  if (difference.matched) {
    return `largest difference ${difference.largest.toFixed(6)} font units, within the tolerance of ${tolerance}`;
  }
  const where =
    difference.at === undefined
      ? `index ${difference.atIndex}`
      : `index ${difference.atIndex} at (${difference.at[0].toFixed(3)}, ${difference.at[1].toFixed(3)})`;
  return `largest difference ${difference.largest.toFixed(6)} font units at ${where}, above the tolerance of ${tolerance}`;
}
