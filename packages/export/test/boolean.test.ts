import { describe, expect, it } from 'vitest';
import type { Vec2 } from '@trefoil/core';
import {
  BooleanEngineError,
  DEFAULT_FIT_TOLERANCE,
  SNAP_STEPS,
  createBooleanEngineRegistry,
  polygonClippingEngine,
  signedArea,
  usableRing,
  type BooleanEngine,
  type Polygon,
  type Ring,
} from '../src/index.js';

const OUTER: Ring = [
  [0, 0],
  [30, 0],
  [30, 30],
  [0, 30],
];

const COUNTER: Ring = [
  [10, 10],
  [20, 10],
  [20, 20],
  [10, 20],
];

const APART: Ring = [
  [100, 0],
  [110, 0],
  [110, 10],
  [100, 10],
];

function inside(point: Vec2, ring: Ring): boolean {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (a === undefined || b === undefined) continue;
    const crosses = a[1] > point[1] !== b[1] > point[1];
    if (crosses && point[0] < ((b[0] - a[0]) * (point[1] - a[1])) / (b[1] - a[1]) + a[0]) {
      hit = !hit;
    }
  }
  return hit;
}

function insidePolygons(point: Vec2, polygons: readonly Polygon[]): boolean {
  return polygons.some((polygon) => {
    const [outer, ...holes] = polygon;
    if (outer === undefined || !inside(point, outer)) return false;
    return !holes.some((hole) => inside(point, hole));
  });
}

function evenOddFill(point: Vec2, rings: readonly Ring[]): boolean {
  return rings.filter((ring) => inside(point, ring)).length % 2 === 1;
}

describe('the engine registry', () => {
  it('holds the polygon-clipping engine', () => {
    const registry = createBooleanEngineRegistry();
    expect(registry.get('polygon-clipping')).toBe(polygonClippingEngine);
    expect(registry.list().map((engine) => engine.id)).toContain('polygon-clipping');
  });

  it('takes a second engine, which the same calling code uses', () => {
    const counting: BooleanEngine = {
      id: 'counting',
      version: 1,
      label: 'Counting',
      params: [],
      evenOdd: () => [],
      union: () => [],
      difference: () => [],
    };

    const registry = createBooleanEngineRegistry();
    registry.register(counting);

    const used = (engine: BooleanEngine): number => engine.evenOdd([OUTER, COUNTER]).length;
    expect(used(registry.get('polygon-clipping'))).toBe(1);
    expect(used(registry.get('counting'))).toBe(0);
  });
});

describe('the even-odd combine', () => {
  it('turns a counter into a hole inside its outer ring', () => {
    const polygons = polygonClippingEngine.evenOdd([OUTER, COUNTER]);
    expect(polygons).toHaveLength(1);

    const [polygon] = polygons;
    expect(polygon).toHaveLength(2);
    const [outer, hole] = polygon ?? [];
    if (outer === undefined || hole === undefined) throw new Error('no hole');

    expect(Math.abs(signedArea(outer))).toBeCloseTo(900, 6);
    expect(Math.abs(signedArea(hole))).toBeCloseTo(100, 6);
    for (const point of hole) expect(inside(point, outer)).toBe(true);
  });

  it('holds exactly the points the even-odd rule fills', () => {
    const rings = [OUTER, COUNTER, APART];
    const polygons = polygonClippingEngine.evenOdd(rings);

    for (let x = -5; x <= 115; x += 2.5) {
      for (let y = -5; y <= 35; y += 2.5) {
        const point: Vec2 = [x, y];
        expect(insidePolygons(point, polygons), `${x},${y}`).toBe(evenOddFill(point, rings));
      }
    }
  });

  it('keeps separate contours separate', () => {
    expect(polygonClippingEngine.evenOdd([OUTER, APART])).toHaveLength(2);
  });

  it('returns well formed rings', () => {
    for (const polygon of polygonClippingEngine.evenOdd([OUTER, COUNTER, APART])) {
      for (const ring of polygon) {
        expect(ring.length).toBeGreaterThanOrEqual(4);
        expect(ring[0]).toEqual(ring[ring.length - 1]);
        for (const [x, y] of ring) {
          expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
        }
      }
    }
  });
});

describe('degenerate input', () => {
  it('drops a ring that cannot enclose anything', () => {
    expect(usableRing([[0, 0], [1, 1]])).toBeNull();
    expect(usableRing([[0, 0], [1, 0], [2, 0]])).toBeNull();
    expect(usableRing([[0, 0], [0, 0], [0, 0], [0, 0]])).toBeNull();
    expect(usableRing([[0, 0], [1, 0], [Number.NaN, 1]])).toBeNull();
  });

  it('closes a ring that was left open', () => {
    const closed = usableRing(OUTER);
    expect(closed).not.toBeNull();
    expect(closed?.[0]).toEqual(closed?.[closed.length - 1]);
  });

  it('combines the real contour alongside a degenerate one', () => {
    const polygons = polygonClippingEngine.evenOdd([[[0, 0], [1, 1]], OUTER]);
    expect(polygons).toHaveLength(1);
  });

  it('returns nothing when there is nothing to combine', () => {
    expect(polygonClippingEngine.evenOdd([])).toEqual([]);
    expect(polygonClippingEngine.evenOdd([[[0, 0], [1, 1]]])).toEqual([]);
    expect(polygonClippingEngine.union([])).toEqual([]);
    expect(polygonClippingEngine.difference([], [[OUTER]])).toEqual([]);
  });
});

describe('union and difference', () => {
  it('unites overlapping polygons into one', () => {
    const overlapping: Ring = [
      [15, 15],
      [45, 15],
      [45, 45],
      [15, 45],
    ];
    const united = polygonClippingEngine.union([[OUTER], [overlapping]]);
    expect(united).toHaveLength(1);
  });

  it('cuts one polygon out of another', () => {
    const cut = polygonClippingEngine.difference([[OUTER]], [[COUNTER]]);
    expect(cut).toHaveLength(1);
    expect(cut[0]).toHaveLength(2);
  });

  it('returns what it was given when there is nothing to cut', () => {
    expect(polygonClippingEngine.difference([[OUTER]], [])).toHaveLength(1);
  });
});

describe('snapping', () => {
  it('snaps far below anything downstream can see', () => {
    const [finest] = SNAP_STEPS;
    if (finest === undefined) throw new Error('no snapping steps');
    expect(finest).toBeLessThanOrEqual(DEFAULT_FIT_TOLERANCE / 1000);
    expect([...SNAP_STEPS].sort((a, b) => a - b)).toEqual([...SNAP_STEPS]);
  });

  it('leaves a ring where it was, to within the finest step', () => {
    const polygons = polygonClippingEngine.evenOdd([OUTER]);
    const ring = polygons[0]?.[0] ?? [];
    for (const [x, y] of ring) {
      expect(OUTER.some(([ox, oy]) => Math.abs(ox - x) < 1e-3 && Math.abs(oy - y) < 1e-3)).toBe(true);
    }
  });

  it('names the engine and the reason when it cannot combine', () => {
    const error = new BooleanEngineError('polygon-clipping', 'the sweep line lost a segment');
    expect(error.name).toBe('BooleanEngineError');
    expect(error.message).toContain('polygon-clipping');
    expect(error.message).toContain('the sweep line lost a segment');
  });
});
