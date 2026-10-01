import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  computeNesting,
  createTemplateRegistry,
  isNumericParam,
  maxRadius,
  radiusAt,
  resolveParams,
  sampleCurve,
  symmetryOf,
  type ParamValues,
  type ShapeTemplate,
} from '@trefoil/core';
import {
  builtInShapeTemplates,
  rose,
  roundedPolygon,
  superellipse,
  supershape,
  trefoil,
} from '../src/index.js';

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

function defaults(template: ShapeTemplate): ParamValues {
  return resolveParams(template.params, {}).values;
}

function numericRanges(template: ShapeTemplate): fc.Arbitrary<ParamValues> {
  const entries = template.params.filter(isNumericParam);
  return fc
    .tuple(
      ...entries.map((p) =>
        p.kind === 'int'
          ? fc.integer({ min: Math.ceil(p.min), max: Math.floor(p.max) })
          : fc.double({ min: p.min, max: p.max, noNaN: true }),
      ),
    )
    .map((values) => Object.fromEntries(entries.map((p, i) => [p.id, values[i] as number])));
}

describe('the built-in template set', () => {
  it('ships five templates, each with its own parameters and safety limits', () => {
    expect(builtInShapeTemplates.map((t) => t.id).sort()).toEqual([
      'rose',
      'rounded-polygon',
      'superellipse',
      'supershape',
      'trefoil',
    ]);

    for (const template of builtInShapeTemplates) {
      expect(template.params.length, template.id).toBeGreaterThan(0);
      expect(template.safety.minPerfectFit, template.id).toBeGreaterThan(0);
      expect(template.safety.maxCopyScale, template.id).toBeGreaterThan(1);
    }
  });

  it('registers every one of them', () => {
    const registry = createTemplateRegistry();
    for (const template of builtInShapeTemplates) {
      expect(() => {
        registry.register(template);
      }, template.id).not.toThrow();
    }
    expect(registry.list()).toHaveLength(5);
  });

  it('samples cleanly at its defaults', () => {
    for (const template of builtInShapeTemplates) {
      const points = sampleCurve(template, defaults(template), 144);
      expect(points, template.id).toHaveLength(144);
      for (const { x, y } of points) {
        expect(Number.isFinite(x) && Number.isFinite(y), template.id).toBe(true);
        expect(Math.hypot(x, y), template.id).toBeLessThanOrEqual(1 + 1e-9);
      }
      expect(Math.max(...points.map((p) => Math.hypot(p.x, p.y))), template.id).toBeCloseTo(1, 3);
    }
  });

  it('produces no safety warning at its defaults', () => {
    for (const template of builtInShapeTemplates) {
      const { warnings } = computeNesting({
        template,
        params: defaults(template),
        rotation: 24 * DEG,
        copies: 6,
        fit: 0,
      });
      expect(warnings, template.id).toEqual([]);
    }
  });

  it('keeps every sample finite for random parameters in range', () => {
    for (const template of builtInShapeTemplates) {
      fc.assert(
        fc.property(numericRanges(template), (params) => {
          const peak = maxRadius(template, params);
          if (!(peak > 0)) return true;
          return sampleCurve(template, params, 72).every(
            ({ x, y }) => Number.isFinite(x) && Number.isFinite(y) && Math.hypot(x, y) <= 1 + 1e-6,
          );
        }),
        { numRuns: 60 },
      );
    }
  });
});

describe('declared symmetry', () => {
  it('holds for every template that declares one', () => {
    for (const template of builtInShapeTemplates) {
      fc.assert(
        fc.property(numericRanges(template), fc.double({ min: 0, max: TAU, noNaN: true }), (params, theta) => {
          const symmetry = symmetryOf(template, params);
          if (symmetry === undefined || symmetry < 1) return true;
          const here = radiusAt(template, theta, params);
          const there = radiusAt(template, theta + TAU / symmetry, params);
          if (!Number.isFinite(here) || !Number.isFinite(there)) return true;
          return Math.abs(here - there) < 1e-6 * Math.max(1, Math.abs(here));
        }),
        { numRuns: 80 },
      );
    }
  });

  it('reads a fixed symmetry and a computed one the same way', () => {
    expect(symmetryOf(trefoil, { A: 3 })).toBe(3);
    expect(symmetryOf(rose, { A: 3, k: 7 })).toBe(7);
    expect(symmetryOf(roundedPolygon, { sides: 8, corner: 0.3, star: 0 })).toBe(8);
    expect(symmetryOf(superellipse, defaults(superellipse))).toBeUndefined();
  });

  it('refuses a template declaring both forms', () => {
    const registry = createTemplateRegistry();
    expect(() => {
      registry.register({ ...trefoil, id: 'both', symmetry: 3, symmetryFor: () => 3 });
    }).toThrow(/both a fixed symmetry and a symmetryFor function/);
  });
});

describe('the rose', () => {
  it('is the trefoil at three lobes', () => {
    for (const a of [1.15, 3, 7.5, 20]) {
      for (let k = 0; k < 64; k++) {
        const theta = (k / 64) * TAU;
        expect(radiusAt(rose, theta, { A: a, k: 3 })).toBeCloseTo(
          radiusAt(trefoil, theta, { A: a }),
          12,
        );
      }
    }
  });

  it('repeats its lobe count in a full turn', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1.15, max: 20, noNaN: true }),
        fc.integer({ min: 2, max: 12 }),
        fc.double({ min: 0, max: TAU, noNaN: true }),
        (a, k, theta) =>
          Math.abs(radiusAt(rose, theta, { A: a, k }) - radiusAt(rose, theta + TAU / k, { A: a, k })) <
          1e-9,
      ),
    );
  });

  it('declares its maximum radius in closed form', () => {
    expect(maxRadius(rose, { A: 4, k: 5 })).toBe(5);
  });
});

describe('the superellipse', () => {
  it('is a circle at equal radii and an exponent of two', () => {
    for (let k = 0; k < 32; k++) {
      expect(radiusAt(superellipse, (k / 32) * TAU, { a: 1, b: 1, n: 2 })).toBeCloseTo(1, 9);
    }
  });

  it('approaches a square at a high exponent', () => {
    const corner = radiusAt(superellipse, Math.PI / 4, { a: 1, b: 1, n: 12 });
    const edge = radiusAt(superellipse, 0, { a: 1, b: 1, n: 12 });
    expect(corner).toBeGreaterThan(edge * 1.3);
    expect(corner).toBeLessThan(Math.SQRT2 + 1e-9);
  });

  it('stretches with its width and height', () => {
    expect(radiusAt(superellipse, 0, { a: 2, b: 1, n: 2 })).toBeCloseTo(2, 9);
    expect(radiusAt(superellipse, Math.PI / 2, { a: 1, b: 3, n: 2 })).toBeCloseTo(3, 9);
  });

  it('raises a squareness below its limit and says so', () => {
    const { warnings } = computeNesting({
      template: superellipse,
      params: { a: 1, b: 1, n: 0.4 },
      rotation: 24 * DEG,
      copies: 6,
      fit: 0,
    });
    expect(warnings.some((w) => w.limit === 'n minimum')).toBe(true);
  });
});

describe('the supershape', () => {
  it('reduces to a circle at the parameters that make it one', () => {
    for (let k = 0; k < 32; k++) {
      expect(
        radiusAt(supershape, (k / 32) * TAU, { m: 0, n1: 1, n2: 1, n3: 1, a: 1, b: 1 }),
      ).toBeCloseTo(1, 9);
    }
  });

  it('finds its maximum radius by sampling and still fills the unit disc', () => {
    expect(Object.hasOwn(supershape, 'maxRadius')).toBe(false);
    const points = sampleCurve(supershape, defaults(supershape), 180);
    expect(Math.max(...points.map((p) => Math.hypot(p.x, p.y)))).toBeCloseTo(1, 2);
  });

  it('never returns a non-finite radius', () => {
    fc.assert(
      fc.property(numericRanges(supershape), fc.double({ min: 0, max: TAU, noNaN: true }), (params, theta) =>
        Number.isFinite(radiusAt(supershape, theta, params)),
      ),
      { numRuns: 200 },
    );
  });
});

describe('the rounded polygon', () => {
  it('takes its symmetry from its side count', () => {
    for (const sides of [3, 5, 8, 16]) {
      expect(symmetryOf(roundedPolygon, { sides, corner: 0.3, star: 0 })).toBe(sides);
    }
  });

  it('is convex at a star depth of zero and starred above it', () => {
    const params = { sides: 5, corner: 0, star: 0 };
    const wedge = TAU / 5;
    const atPoint = radiusAt(roundedPolygon, 0, params);
    const atEdge = radiusAt(roundedPolygon, wedge / 2, params);
    expect(atPoint).toBeGreaterThan(atEdge);

    const starred = { ...params, star: 0.6 };
    const starRatio =
      radiusAt(roundedPolygon, 0, starred) / radiusAt(roundedPolygon, wedge / 2, starred);
    const convexRatio = atPoint / atEdge;
    expect(starRatio).toBeGreaterThan(convexRatio);
  });

  it('rounds towards a circle as the corner radius rises', () => {
    const wedge = TAU / 5;
    const sharp = { sides: 5, corner: 0, star: 0 };
    const round = { sides: 5, corner: 1, star: 0 };
    const spread = (p: ParamValues): number =>
      radiusAt(roundedPolygon, 0, p) - radiusAt(roundedPolygon, wedge / 2, p);
    expect(Math.abs(spread(round))).toBeLessThan(Math.abs(spread(sharp)));
  });
});
