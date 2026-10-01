import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  BUILT_IN_ENDINGS,
  CORNER_THRESHOLD_DEGREES,
  MIN_WIDTH_FACTOR,
  PROTOTYPE_PROFILE,
  SUPPORT_ENTRIES,
  UNIFORM_WIDTH,
  createEndingRegistry,
  createJoinRegistry,
  findCorners,
  flareProfile,
  loopJoin,
  roundPen,
  shapePen,
  strokeRing,
  strokeRun,
  supportAt,
  taperProfile,
  turnBetween,
  type Contour,
  type EndContext,
  type EndingBuildContext,
  type Polyline,
  type ShapeTemplate,
  type Vec2,
} from '../src/index.js';

const DEG = Math.PI / 180;

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

const VERTICAL: Polyline = Array.from({ length: 21 }, (_, i) => [0, i * 4] as Vec2);

function endContext(overrides: Partial<EndingBuildContext> = {}): EndingBuildContext {
  return {
    shapeBuilt: false,
    template: trefoil,
    templateParams: { A: 3 },
    rotation: 24 * DEG,
    copyIndex: 0,
    params: {},
    ...overrides,
  };
}

function end(overrides: Partial<EndContext> = {}): EndContext {
  return {
    point: [0, 0],
    outward: [0, -1],
    halfWidth: 5,
    curved: false,
    leftOffset: [-5, 0],
    rightOffset: [5, 0],
    ...overrides,
  };
}

function isClosed(contour: Contour): boolean {
  const first = contour[0];
  const last = contour[contour.length - 1];
  if (first === undefined || last === undefined) return false;
  return first[0] === last[0] && first[1] === last[1];
}

function allFinite(contour: Contour): boolean {
  return contour.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
}

function area(contour: Contour): number {
  let sum = 0;
  for (let i = 0; i < contour.length - 1; i++) {
    const a = contour[i];
    const b = contour[i + 1];
    if (a === undefined || b === undefined) continue;
    sum += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(sum) / 2;
}

describe('the pen', () => {
  it('fills a round pen with half the stroke width', () => {
    const pen = roundPen(10);
    expect(pen.support).toHaveLength(SUPPORT_ENTRIES);
    expect([...pen.support].every((v) => v === 5)).toBe(true);
  });

  it('builds a shape pen that varies with direction and never goes negative', () => {
    const pen = shapePen(trefoil, { A: 3 }, 6.5, 24 * DEG);
    const values = [...pen.support];
    expect(new Set(values).size).toBeGreaterThan(1);
    expect(values.every((v) => v >= 0)).toBe(true);
  });

  it('wraps the direction lookup', () => {
    const pen = shapePen(trefoil, { A: 3 }, 6.5, 0);
    expect(supportAt(pen, 361 * DEG)).toBe(supportAt(pen, 1 * DEG));
    expect(supportAt(pen, -1 * DEG)).toBe(supportAt(pen, 359 * DEG));
    expect(supportAt(pen, 0)).toBe(pen.support[0]);
  });

  it('returns a table entry for any angle', () => {
    const pen = shapePen(trefoil, { A: 3 }, 6.5, 0);
    const values = new Set([...pen.support]);
    fc.assert(
      fc.property(fc.double({ min: -1000, max: 1000, noNaN: true }), (angle) =>
        values.has(supportAt(pen, angle)),
      ),
    );
  });
});

describe('the stroker', () => {
  it('turns a vertical run into a rectangle under a round pen', () => {
    const result = strokeRun(VERTICAL, roundPen(10));
    expect(result).toBeDefined();
    const xs = result?.contours[0]?.map(([x]) => x) ?? [];
    expect(Math.min(...xs)).toBeCloseTo(-5, 9);
    expect(Math.max(...xs)).toBeCloseTo(5, 9);
    const ys = result?.contours[0]?.map(([, y]) => y) ?? [];
    expect(Math.min(...ys)).toBeCloseTo(0, 9);
    expect(Math.max(...ys)).toBeCloseTo(80, 9);
  });

  it('gives a closed ring two contours, keeping the counter open', () => {
    const ring: Polyline = Array.from({ length: 64 }, (_, i) => {
      const t = (i / 64) * Math.PI * 2;
      return [30 * Math.cos(t), 30 * Math.sin(t)] as Vec2;
    });
    const result = strokeRing(ring, roundPen(10));
    expect(result?.contours).toHaveLength(2);
    const areas = (result?.contours ?? []).map(area).sort((a, b) => a - b);
    const [inner, outer] = areas;
    expect(inner).toBeGreaterThan(0);
    expect(outer).toBeGreaterThan(inner ?? 0);
    expect(outer).toBeCloseTo(Math.PI * 35 * 35, -2);
    expect(inner).toBeCloseTo(Math.PI * 25 * 25, -2);
  });

  it('produces nothing for a degenerate run', () => {
    expect(strokeRun([[0, 0]], roundPen(10))).toBeUndefined();
    expect(strokeRun([], roundPen(10))).toBeUndefined();
    expect(strokeRing([[0, 0]], roundPen(10))).toBeUndefined();
  });

  it('closes every outline and keeps every coordinate finite', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(
            fc.double({ min: -100, max: 100, noNaN: true }),
            fc.double({ min: -100, max: 100, noNaN: true }),
          ),
          { minLength: 2, maxLength: 40 },
        ),
        fc.boolean(),
        (points, useShape) => {
          const pen = useShape ? shapePen(trefoil, { A: 3 }, 6.5, 0) : roundPen(10);
          const result = strokeRun(points, pen);
          if (result === undefined) return false;
          return result.contours.every((c) => isClosed(c) && allFinite(c));
        },
      ),
    );
  });

  it('leaves the outline unchanged under a uniform profile', () => {
    const plain = strokeRun(VERTICAL, roundPen(10));
    const uniform = strokeRun(VERTICAL, roundPen(10), UNIFORM_WIDTH);
    expect(uniform?.contours[0]).toEqual(plain?.contours[0]);
  });
});

describe('the width profile', () => {
  const free = { freeStart: true, freeEnd: false, ...PROTOTYPE_PROFILE };
  const bound = { freeStart: false, freeEnd: false, ...PROTOTYPE_PROFILE };

  it('narrows a tapered free end', () => {
    const profile = taperProfile(VERTICAL, free);
    expect(profile.factors[0]).toBeLessThan(profile.factors[10] ?? 1);
  });

  it('leaves an end that is not free alone', () => {
    const profile = taperProfile(VERTICAL, bound);
    expect(profile.factors.every((f) => f === 1)).toBe(true);
  });

  it('widens a flared free end', () => {
    const profile = flareProfile(VERTICAL, free);
    expect(profile.factors[0]).toBeGreaterThan(profile.factors[10] ?? 1);
  });

  it('never lets the width factor reach zero', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 200, noNaN: true }),
        fc.boolean(),
        fc.boolean(),
        (taperLength, freeStart, freeEnd) => {
          const profile = taperProfile(VERTICAL, {
            freeStart,
            freeEnd,
            ...PROTOTYPE_PROFILE,
            taperLength,
          });
          return profile.factors.every((f) => f >= MIN_WIDTH_FACTOR && f > 0);
        },
      ),
    );
  });

  it('is unprofiled for a run of no length', () => {
    const zero: Polyline = [
      [0, 0],
      [0, 0],
    ];
    expect(taperProfile(zero, free).factors.every((f) => f === 1)).toBe(true);
    expect(flareProfile(zero, free).factors.every((f) => f === 1)).toBe(true);
  });
});

describe('the endings', () => {
  it('registers exactly the nine named endings', () => {
    expect(createEndingRegistry().list().map((e) => e.id)).toEqual([
      'angled',
      'ball',
      'flared',
      'flat',
      'hairline',
      'round',
      'slab',
      'tapered',
      'wedge',
    ]);
    expect(BUILT_IN_ENDINGS).toHaveLength(9);
  });

  it('returns geometry, never markup', () => {
    for (const ending of BUILT_IN_ENDINGS) {
      for (const shapeBuilt of [false, true]) {
        const result = ending.build(end({ curved: true }), endContext({ shapeBuilt }));
        for (const contour of result) {
          for (const point of contour) {
            expect(typeof point[0]).toBe('number');
            expect(typeof point[1]).toBe('number');
          }
        }
      }
    }
  });

  it('is deterministic', () => {
    for (const ending of BUILT_IN_ENDINGS) {
      expect(ending.build(end({ curved: true }), endContext())).toEqual(
        ending.build(end({ curved: true }), endContext()),
      );
    }
  });

  it('adds nothing for a flat end', () => {
    expect(BUILT_IN_ENDINGS.find((e) => e.id === 'flat')?.build(end(), endContext())).toEqual([]);
  });

  it('turns the angled cut with the copy rotation when shape-built', () => {
    const angled = BUILT_IN_ENDINGS.find((e) => e.id === 'angled');
    const plain = angled?.build(end(), endContext({ shapeBuilt: false }));
    const first = angled?.build(end(), endContext({ shapeBuilt: true, copyIndex: 0 }));
    const second = angled?.build(end(), endContext({ shapeBuilt: true, copyIndex: 3 }));
    expect(first).not.toEqual(plain);
    expect(second).not.toEqual(first);
  });

  it('lays a serif flat on a vertical stem and upright on a horizontal arm', () => {
    const slab = BUILT_IN_ENDINGS.find((e) => e.id === 'slab');
    const vertical = slab?.build(end({ outward: [0, -1] }), endContext())[0] ?? [];
    const horizontal = slab?.build(end({ outward: [1, 0] }), endContext())[0] ?? [];

    const span = (c: Contour): readonly [number, number] => {
      const xs = c.map(([x]) => x);
      const ys = c.map(([, y]) => y);
      return [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
    };

    const [vw, vh] = span(vertical);
    const [hw, hh] = span(horizontal);
    expect(vw).toBeGreaterThan(vh);
    expect(hh).toBeGreaterThan(hw);
  });

  it('puts a ball only on a curved end', () => {
    const ball = BUILT_IN_ENDINGS.find((e) => e.id === 'ball');
    expect(ball?.build(end({ curved: false }), endContext())).toEqual([]);
    expect(ball?.build(end({ curved: true }), endContext()).length).toBe(1);
  });

  it('differs between plain and shape-built form for every ending that draws', () => {
    for (const ending of BUILT_IN_ENDINGS) {
      const plain = ending.build(end({ curved: true }), endContext({ shapeBuilt: false }));
      const shaped = ending.build(end({ curved: true }), endContext({ shapeBuilt: true }));
      if (plain.length === 0 && shaped.length === 0) continue;
      expect(plain, ending.id).not.toEqual(shaped);
    }
  });
});

describe('the joins', () => {
  const sharp: Polyline = [
    [0, 0],
    [0, 50],
    [40, 50],
  ];
  const shallow: Polyline = [
    [0, 0],
    [0, 50],
    [4, 100],
  ];

  it('finds a sharp corner and ignores a shallow one', () => {
    expect(findCorners(sharp)).toHaveLength(1);
    expect(findCorners(shallow)).toHaveLength(0);
    expect(CORNER_THRESHOLD_DEGREES).toBe(50);
  });

  it('measures the turn between three points', () => {
    expect(turnBetween([0, 0], [1, 0], [2, 0])).toBeCloseTo(0, 12);
    expect(turnBetween([0, 0], [1, 0], [1, 1])).toBeCloseTo(Math.PI / 2, 12);
  });

  it('registers the looped join', () => {
    expect(createJoinRegistry().list().map((j) => j.id)).toEqual(['loop']);
  });

  it('makes a plain circle when the shape is not used and a varying ring when it is', () => {
    const corner = findCorners(sharp)[0];
    expect(corner).toBeDefined();
    if (corner === undefined) return;

    const context = {
      template: trefoil,
      templateParams: { A: 3 },
      rotation: 24 * DEG,
      params: { radius: 11, samples: 72, radiusFloor: 0.35 },
    };
    const plain = loopJoin.build(corner, { ...context, shapeBuilt: false })[0] ?? [];
    const shaped = loopJoin.build(corner, { ...context, shapeBuilt: true })[0] ?? [];

    const radii = (c: Contour, cx: number, cy: number): number[] =>
      c.map(([x, y]) => Math.hypot(x - cx, y - cy));

    const cx = corner.point[0] + corner.bisector[0] * 11 * 0.9;
    const cy = corner.point[1] + corner.bisector[1] * 11 * 0.9;

    for (const r of radii(plain, cx, cy)) expect(r).toBeCloseTo(11, 9);
    const varied = radii(shaped, cx, cy);
    expect(Math.min(...varied)).toBeGreaterThanOrEqual(11 * 0.35 - 1e-9);
    expect(Math.max(...varied)).toBeGreaterThan(Math.min(...varied));
  });

  it('closes every loop with an area above zero and no NaN', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1.15, max: 20, noNaN: true }),
        fc.double({ min: 0, max: 360, noNaN: true }),
        (a, rot) => {
          const corner = findCorners(sharp)[0];
          if (corner === undefined) return false;
          const ring =
            loopJoin.build(corner, {
              shapeBuilt: true,
              template: trefoil,
              templateParams: { A: a },
              rotation: rot * DEG,
              params: { radius: 11, samples: 72, radiusFloor: 0.35 },
            })[0] ?? [];
          return isClosed(ring) && allFinite(ring) && area(ring) > 0;
        },
      ),
    );
  });
});
