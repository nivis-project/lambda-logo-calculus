import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  computeNesting,
  createPerfectFitMemo,
  fitForCurve,
  isOnSegment,
  parametricFit,
  perfectFit,
  pointInPolygon,
  polygonInPolygon,
  validateCurve,
  type ShapeTemplate,
  type Vec2,
} from '../src/index.js';

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;

const SQUARE: readonly Vec2[] = [
  [0, 0],
  [10, 0],
  [10, 10],
  [0, 10],
];

const NOTCHED: readonly Vec2[] = [
  [0, 0],
  [10, 0],
  [10, 10],
  [5, 3],
  [0, 10],
];

const trefoil: ShapeTemplate = {
  id: 'trefoil',
  version: 1,
  label: 'Trefoil',
  kind: 'polar',
  symmetry: 3,
  params: [
    { id: 'A', label: 'Amplitude', kind: 'number', min: 1, max: 20, default: 3, lockable: true },
  ],
  safety: {
    minAmplitude: { paramId: 'A', value: 1.15 },
    minPerfectFit: 0.02,
    maxEffectiveScale: 1.5,
    maxCopyScale: 1.6,
  },
  radius: (theta, params) => (params['A'] as number) + Math.cos(3 * theta),
  maxRadius: (params) => (params['A'] as number) + 1,
};

const spiral: ShapeTemplate = {
  id: 'spiral',
  version: 1,
  label: 'Doubling back',
  kind: 'parametric',
  params: [],
  safety: { minPerfectFit: 0.02, maxEffectiveScale: 1.5, maxCopyScale: 1.6 },
  point: (t) => {
    const angle = t * TAU;
    const wobble = 1 + 0.6 * Math.sin(5 * angle);
    return [wobble * Math.cos(angle + 0.9 * Math.sin(4 * angle)), wobble * Math.sin(angle + 0.9 * Math.sin(4 * angle))];
  },
};

const negative: ShapeTemplate = {
  ...trefoil,
  id: 'negative',
  radius: (theta) => Math.cos(3 * theta),
  maxRadius: () => 1,
};

describe('point in polygon', () => {
  it('finds a point inside a convex polygon', () => {
    expect(pointInPolygon([5, 5], SQUARE)).toBe(true);
  });

  it('finds a point outside a convex polygon', () => {
    expect(pointInPolygon([11, 11], SQUARE)).toBe(false);
    expect(pointInPolygon([-1, 5], SQUARE)).toBe(false);
  });

  it('treats a point on an edge as inside, stably', () => {
    expect(pointInPolygon([5, 0], SQUARE)).toBe(true);
    expect(pointInPolygon([0, 5], SQUARE)).toBe(true);
    expect(pointInPolygon([10, 7], SQUARE)).toBe(true);
  });

  it('treats a point on a vertex as inside', () => {
    for (const vertex of SQUARE) {
      expect(pointInPolygon(vertex, SQUARE), JSON.stringify(vertex)).toBe(true);
    }
  });

  it('excludes a point in a concave notch', () => {
    expect(pointInPolygon([5, 8], NOTCHED)).toBe(false);
    expect(pointInPolygon([5, 1], NOTCHED)).toBe(true);
  });

  it('refuses a degenerate polygon', () => {
    expect(pointInPolygon([0, 0], [])).toBe(false);
    expect(
      pointInPolygon(
        [0, 0],
        [
          [0, 0],
          [1, 1],
        ],
      ),
    ).toBe(false);
  });

  it('recognises a point on a segment and rejects one beside it', () => {
    expect(isOnSegment([0, 0], [10, 0], [5, 0])).toBe(true);
    expect(isOnSegment([0, 0], [10, 0], [5, 0.5])).toBe(false);
    expect(isOnSegment([0, 0], [10, 0], [15, 0])).toBe(false);
    expect(isOnSegment([2, 2], [2, 2], [2, 2])).toBe(true);
  });
});

describe('polygon containment', () => {
  const inner: readonly Vec2[] = [
    [3, 3],
    [7, 3],
    [7, 7],
    [3, 7],
  ];

  it('accepts a polygon wholly inside', () => {
    expect(polygonInPolygon(inner, SQUARE)).toBe(true);
  });

  it('rejects one wholly outside', () => {
    expect(polygonInPolygon(inner.map(([x, y]) => [x + 40, y] as Vec2), SQUARE)).toBe(false);
  });

  it('rejects one that only partly overlaps', () => {
    expect(polygonInPolygon(inner.map(([x, y]) => [x + 6, y] as Vec2), SQUARE)).toBe(false);
  });
});

describe('curve validation', () => {
  it('reports the trefoil as closed, non-negative and star-shaped', () => {
    const result = validateCurve(trefoil, { A: 3 });
    expect(result).toMatchObject({ closed: true, nonNegative: true, starShaped: true });
    expect(result.findings).toEqual([]);
  });

  it('reports a negative radius, naming an angle', () => {
    const result = validateCurve(negative, {});
    expect(result.nonNegative).toBe(false);
    expect(result.findings.join(' ')).toMatch(/the radius is .* at .* degrees/);
  });

  it('reports a curve that doubles back as not star-shaped', () => {
    const result = validateCurve(spiral, {});
    expect(result.starShaped).toBe(false);
    expect(result.findings.join(' ')).toMatch(/doubles back/);
  });

  it('reports a curve that cannot be sampled', () => {
    const broken: ShapeTemplate = { ...trefoil, id: 'broken', maxRadius: () => 0 };
    const result = validateCurve(broken, { A: 3 });
    expect(result.closed).toBe(false);
    expect(result.findings.join(' ')).toMatch(/could not be sampled/);
  });
});

describe('route selection', () => {
  it('sends a star-shaped polar curve down the polar route, unchanged', () => {
    const routed = fitForCurve(trefoil, { A: 3 }, 24 * DEG);
    expect(routed.route).toBe('polar');
    expect(routed.value).toBe(perfectFit(trefoil, { A: 3 }, 24 * DEG));
    expect(routed.reason).toBeUndefined();
  });

  it('sends a curve that doubles back down the parametric route, with a reason', () => {
    const routed = fitForCurve(spiral, {}, 24 * DEG);
    expect(routed.route).toBe('parametric');
    expect(routed.reason).toMatch(/doubles back/);
  });

  it('carries the route and reason alongside the safety warnings', () => {
    const polar = computeNesting({
      template: trefoil,
      params: { A: 3 },
      rotation: 24 * DEG,
      copies: 6,
      fit: 0,
    });
    expect(polar.route).toBe('polar');
    expect(polar.routeReason).toBeUndefined();

    const parametric = computeNesting({
      template: spiral,
      params: {},
      rotation: 24 * DEG,
      copies: 6,
      fit: 0,
    });
    expect(parametric.route).toBe('parametric');
    expect(parametric.routeReason).toBeDefined();
    expect(Array.isArray(parametric.warnings)).toBe(true);
  });
});

describe('parametric nesting', () => {
  it('needs no shrinking at a rotation of zero', () => {
    expect(parametricFit(spiral, {}, 0)).toBe(1);
    expect(parametricFit(spiral, {}, TAU)).toBe(1);
  });

  it('fits at the scale it returns and not above it', () => {
    const rotation = 37 * DEG;
    const found = parametricFit(spiral, {}, rotation);
    expect(found).toBeGreaterThan(0);
    expect(found).toBeLessThanOrEqual(1);

    const outline = Array.from({ length: 180 }, (_, i) => {
      const [x, y] = spiral.point?.(i / 180, {}) ?? [0, 0];
      return [x, y] as Vec2;
    });
    const peak = Math.max(...outline.map(([x, y]) => Math.hypot(x, y)));
    const unit = outline.map(([x, y]) => [x / peak, y / peak] as Vec2);

    const place = (scale: number): Vec2[] => {
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      return unit.map(([x, y]) => [(x * cos - y * sin) * scale, (x * sin + y * cos) * scale]);
    };

    expect(polygonInPolygon(place(found), unit, 1e-6)).toBe(true);
    expect(polygonInPolygon(place(found + 0.05), unit, 1e-6)).toBe(false);
  });

  it('terminates and stays between 0 and 1, for any rotation', () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: TAU, noNaN: true }), (rotation) => {
        const value = parametricFit(spiral, {}, rotation, 90, 16);
        return Number.isFinite(value) && value >= 0 && value <= 1;
      }),
      { numRuns: 30 },
    );
  });

  it('returns 1 for a curve with too few points to form a polygon', () => {
    const tiny: ShapeTemplate = {
      ...spiral,
      id: 'tiny',
      point: () => [1, 0],
    };
    expect(parametricFit(tiny, {}, 1, 3, 4)).toBe(1);
  });
});

describe('the memo covers both routes', () => {
  function counting(base: ShapeTemplate): { template: ShapeTemplate; calls: () => number } {
    let calls = 0;
    const wrapped: ShapeTemplate =
      base.kind === 'polar'
        ? {
            ...base,
            id: `${base.id}-counted`,
            radius: (theta, params) => {
              calls++;
              return base.radius?.(theta, params) ?? 0;
            },
          }
        : {
            ...base,
            id: `${base.id}-counted`,
            point: (t, params) => {
              calls++;
              return base.point?.(t, params) ?? [0, 0];
            },
          };
    return { template: wrapped, calls: () => calls };
  }

  it('does not resample a polar result', () => {
    const { template, calls } = counting(trefoil);
    const memo = createPerfectFitMemo();
    const first = memo.get(template, { A: 3 }, 24 * DEG);
    const after = calls();
    expect(memo.get(template, { A: 3 }, 24 * DEG)).toBe(first);
    expect(calls()).toBe(after);
  });

  it('does not resample a parametric result', () => {
    const { template, calls } = counting(spiral);
    const memo = createPerfectFitMemo();
    const first = memo.getRouted(template, {}, 31 * DEG);
    const after = calls();
    const second = memo.getRouted(template, {}, 31 * DEG);
    expect(second).toBe(first);
    expect(second.route).toBe('parametric');
    expect(calls()).toBe(after);
  });

  it('reports the route through the memo', () => {
    const memo = createPerfectFitMemo();
    expect(memo.getRouted(trefoil, { A: 3 }, 24 * DEG).route).toBe('polar');
    expect(memo.getRouted(spiral, {}, 24 * DEG).route).toBe('parametric');
  });
});
