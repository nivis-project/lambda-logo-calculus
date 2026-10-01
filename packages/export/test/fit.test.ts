import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { curveToPathData, isWellFormedContour, type CurveContour, type Vec2 } from '@trefoil/core';
import { DEFAULT_FIT_TOLERANCE, fitPolygon, fitRing } from '../src/index.js';

function cubicPoints(a: Vec2, b: Vec2, c: Vec2, d: Vec2, steps: number): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    out.push([
      u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
      u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
    ]);
  }
  return out;
}

export function flatten(contour: CurveContour): Vec2[] {
  const out: Vec2[] = [];
  let cursor: Vec2 = [0, 0];
  for (const command of contour) {
    if (command.kind === 'move' || command.kind === 'line') {
      cursor = command.to;
      out.push(cursor);
    } else if (command.kind === 'cubic') {
      out.push(...cubicPoints(cursor, command.c1, command.c2, command.to, 64));
      cursor = command.to;
    }
  }
  return out;
}

function toSegment(p: Vec2, a: Vec2, b: Vec2): number {
  const vx = b[0] - a[0];
  const vy = b[1] - a[1];
  const squared = vx * vx + vy * vy;
  if (squared === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = Math.min(1, Math.max(0, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / squared));
  return Math.hypot(p[0] - (a[0] + t * vx), p[1] - (a[1] + t * vy));
}

export function worstDeviation(ring: readonly Vec2[], contour: CurveContour): number {
  const flat = flatten(contour);
  let worst = 0;
  for (const point of ring) {
    let best = Number.POSITIVE_INFINITY;
    for (let i = 0; i + 1 < flat.length; i++) {
      const a = flat[i];
      const b = flat[i + 1];
      if (a === undefined || b === undefined) continue;
      best = Math.min(best, toSegment(point, a, b));
    }
    worst = Math.max(worst, best);
  }
  return worst;
}

function circle(count: number, radius = 50): Vec2[] {
  return Array.from({ length: count }, (_, i): Vec2 => {
    const angle = (2 * Math.PI * i) / count;
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
  });
}

function wobble(count: number): Vec2[] {
  return Array.from({ length: count }, (_, i): Vec2 => {
    const angle = (2 * Math.PI * i) / count;
    const radius = 40 + 9 * Math.sin(5 * angle) + 3 * Math.cos(11 * angle);
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
  });
}

function segmentCount(contour: CurveContour): number {
  return contour.filter((command) => command.kind === 'cubic' || command.kind === 'line').length;
}

describe('fitting a ring', () => {
  it('keeps every input point inside the tolerance', () => {
    for (const ring of [circle(64), circle(256), wobble(180)]) {
      for (const tolerance of [0.05, 0.2, 1]) {
        const fitted = fitRing(ring, tolerance);
        expect(worstDeviation(ring, fitted)).toBeLessThanOrEqual(tolerance * 1.001);
      }
    }
  });

  it('uses far fewer segments than the ring has points', () => {
    const ring = circle(256);
    expect(segmentCount(fitRing(ring, 0.2))).toBeLessThan(ring.length / 8);
  });

  it('never deviates more and never emits fewer segments when the tolerance tightens', () => {
    const ring = wobble(180);
    let previousError = Number.POSITIVE_INFINITY;
    let previousSegments = 0;

    for (const tolerance of [2, 1, 0.5, 0.2, 0.1]) {
      const fitted = fitRing(ring, tolerance);
      const error = worstDeviation(ring, fitted);
      const segments = segmentCount(fitted);
      expect(error).toBeLessThanOrEqual(previousError + 1e-9);
      expect(segments).toBeGreaterThanOrEqual(previousSegments);
      previousError = error;
      previousSegments = segments;
    }
  });

  it('opens with a move, closes with a close, and returns to where it began', () => {
    for (const ring of [circle(5), circle(64), wobble(90)]) {
      const fitted = fitRing(ring);
      expect(isWellFormedContour(fitted)).toBe(true);
      expect(fitted[0]).toEqual({ kind: 'move', to: ring[0] });
      expect(fitted[fitted.length - 1]).toEqual({ kind: 'close' });
      expect(curveToPathData(fitted).endsWith('Z')).toBe(true);
    }
  });

  it('holds no NaN and no infinity, for any ring', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(fc.double({ min: -200, max: 200, noNaN: true }), fc.double({ min: -200, max: 200, noNaN: true })),
          { minLength: 3, maxLength: 60 },
        ),
        (points) => {
          const fitted = fitRing(points, 0.2);
          for (const command of fitted) {
            if (command.kind === 'close') continue;
            const coordinates =
              command.kind === 'cubic'
                ? [...command.c1, ...command.c2, ...command.to]
                : [...command.to];
            for (const value of coordinates) expect(Number.isFinite(value)).toBe(true);
          }
        },
      ),
      { numRuns: 200 },
    );
  });
});

describe('the tolerance', () => {
  it('is a named constant chosen so the fit is smaller than the polyline', () => {
    expect(DEFAULT_FIT_TOLERANCE).toBe(0.2);
  });

  it('is used when none is given', () => {
    const ring = wobble(180);
    expect(fitRing(ring)).toEqual(fitRing(ring, DEFAULT_FIT_TOLERANCE));
    expect(fitRing(ring)).not.toEqual(fitRing(ring, 0.01));
  });

  it('is overridden when one is given', () => {
    const ring = wobble(180);
    expect(segmentCount(fitRing(ring, 2))).toBeLessThan(segmentCount(fitRing(ring, 0.05)));
  });
});

describe('a ring too short to carry a curve', () => {
  it('comes back as lines', () => {
    const fitted = fitRing([
      [0, 0],
      [10, 0],
      [5, 9],
    ]);
    expect(fitted).toEqual([
      { kind: 'move', to: [0, 0] },
      { kind: 'line', to: [10, 0] },
      { kind: 'line', to: [5, 9] },
      { kind: 'close' },
    ]);
  });

  it('drops the repeated closing point before counting', () => {
    const fitted = fitRing([
      [0, 0],
      [10, 0],
      [5, 9],
      [0, 0],
    ]);
    expect(fitted.filter((command) => command.kind === 'cubic')).toHaveLength(0);
  });

  it('returns nothing for an empty ring', () => {
    expect(fitRing([])).toEqual([]);
  });
});

describe('fitting a polygon', () => {
  it('fits every ring it holds', () => {
    const fitted = fitPolygon([circle(64, 50), circle(32, 20)]);
    expect(fitted).toHaveLength(2);
    for (const contour of fitted) expect(isWellFormedContour(contour)).toBe(true);
  });

  it('drops a ring that fits to nothing', () => {
    expect(fitPolygon([[], circle(32)])).toHaveLength(1);
  });
});
