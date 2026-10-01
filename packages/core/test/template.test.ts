import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  computeNesting,
  createPerfectFitMemo,
  createTemplateRegistry,
  effectiveScale,
  maxRadius,
  perfectFit,
  radiusAt,
  sampleCurve,
  type ParamValues,
  type ShapeTemplate,
} from '../src/index.js';

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;

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

const ellipse: ShapeTemplate = {
  id: 'ellipse',
  version: 1,
  label: 'Ellipse',
  kind: 'parametric',
  params: [],
  safety: { minPerfectFit: 0.02, maxEffectiveScale: 1.5, maxCopyScale: 1.6 },
  point: (t) => [2 * Math.cos(t * TAU), Math.sin(t * TAU)],
};

const A3: ParamValues = { A: 3 };

describe('the template registry', () => {
  it('accepts a polar and a parametric template', () => {
    const r = createTemplateRegistry();
    r.register(trefoil);
    r.register(ellipse);
    expect(r.list().map((t) => t.id)).toEqual(['ellipse', 'trefoil']);
  });

  it('rejects a polar template with no radius function, naming it', () => {
    const r = createTemplateRegistry();
    const broken: ShapeTemplate = { ...trefoil, radius: undefined };
    expect(() => {
      r.register(broken);
    }).toThrow(/module "trefoil" declares kind "polar" but provides no radius function/);
  });

  it('rejects a parametric template with no point function, naming it', () => {
    const r = createTemplateRegistry();
    const broken: ShapeTemplate = { ...ellipse, point: undefined };
    expect(() => {
      r.register(broken);
    }).toThrow(/module "ellipse" declares kind "parametric" but provides no point function/);
  });

  it('rejects a non-integer symmetry', () => {
    const r = createTemplateRegistry();
    expect(() => {
      r.register({ ...trefoil, symmetry: 2.5 });
    }).toThrow(/non-integer symmetry/);
  });
});

describe('the trefoil curve', () => {
  it('matches A + cos(3 theta) at known angles', () => {
    expect(radiusAt(trefoil, 0, A3)).toBeCloseTo(4, 12);
    expect(radiusAt(trefoil, Math.PI / 3, A3)).toBeCloseTo(2, 12);
    expect(radiusAt(trefoil, (2 * Math.PI) / 3, A3)).toBeCloseTo(4, 12);
  });

  it('repeats every 120 degrees, for any theta and any amplitude', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -10, max: 10, noNaN: true }),
        fc.double({ min: 1, max: 20, noNaN: true }),
        (theta, a) =>
          Math.abs(radiusAt(trefoil, theta, { A: a }) - radiusAt(trefoil, theta + TAU / 3, { A: a })) <
          1e-9,
      ),
    );
  });

  it('reports its maximum radius as A + 1', () => {
    expect(maxRadius(trefoil, A3)).toBeCloseTo(4, 12);
  });

  it('finds a maximum radius by sampling when a template declares none', () => {
    expect(maxRadius(ellipse, {})).toBeCloseTo(2, 6);
  });
});

describe('sampling a curve', () => {
  it('returns the requested count, normalised to radius 1', () => {
    const points = sampleCurve(trefoil, A3, 144);
    expect(points).toHaveLength(144);
    const radii = points.map((p) => Math.hypot(p.x, p.y));
    expect(Math.max(...radii)).toBeCloseTo(1, 10);
    expect(radii.every((r) => r <= 1 + 1e-12)).toBe(true);
  });

  it('is deterministic', () => {
    expect(sampleCurve(trefoil, A3, 64)).toEqual(sampleCurve(trefoil, A3, 64));
  });

  it('samples a parametric template too', () => {
    const points = sampleCurve(ellipse, {}, 64);
    expect(points).toHaveLength(64);
    expect(Math.max(...points.map((p) => Math.hypot(p.x, p.y)))).toBeCloseTo(1, 4);
  });

  it('refuses fewer than three samples', () => {
    expect(() => sampleCurve(trefoil, A3, 2)).toThrow(/at least 3 samples/);
    expect(() => sampleCurve(trefoil, A3, 4.5)).toThrow(/at least 3 samples/);
  });

  it('refuses a curve with no extent', () => {
    const flat: ShapeTemplate = { ...trefoil, id: 'flat', maxRadius: () => 0 };
    expect(() => sampleCurve(flat, A3, 16)).toThrow(/maximum radius of 0/);
  });

  it('keeps every sample finite and within the unit disc', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1.15, max: 20, noNaN: true }),
        fc.integer({ min: 3, max: 400 }),
        (a, count) =>
          sampleCurve(trefoil, { A: a }, count).every(
            (p) => Number.isFinite(p.x) && Number.isFinite(p.y) && Math.hypot(p.x, p.y) <= 1 + 1e-12,
          ),
      ),
    );
  });
});

describe('perfectFit', () => {
  it('is 1 at rotation 0', () => {
    expect(perfectFit(trefoil, A3, 0)).toBeCloseTo(1, 12);
  });

  it('is 1 at a full symmetry step of 120 degrees', () => {
    expect(perfectFit(trefoil, A3, 120 * DEG)).toBeCloseTo(1, 6);
  });

  it('lies strictly between 0 and 1 at the prototype default of 24 degrees', () => {
    const value = perfectFit(trefoil, A3, 24 * DEG);
    expect(value).toBeGreaterThan(0);
    expect(value).toBeLessThan(1);
  });

  it('matches the prototype for its default settings', () => {
    const prototype = (() => {
      const R = (t: number, a: number): number => a + Math.cos(3 * t);
      let m = Number.POSITIVE_INFINITY;
      for (let k = 0; k < 720; k++) {
        const t = (k / 720) * TAU;
        const num = R(t, 3);
        const den = R(t - 24 * DEG, 3);
        if (den <= 1e-9) continue;
        m = Math.min(m, num / den);
      }
      return Number.isFinite(m) ? Math.max(m, 0) : 1;
    })();
    expect(perfectFit(trefoil, A3, 24 * DEG)).toBe(prototype);
  });

  it('never returns below zero', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1.15, max: 20, noNaN: true }),
        fc.double({ min: 0, max: TAU, noNaN: true }),
        (a, phi) => perfectFit(trefoil, { A: a }, phi) >= 0,
      ),
    );
  });

  it('returns 1 when no angle yields a finite ratio', () => {
    const empty: ShapeTemplate = { ...trefoil, id: 'empty', radius: () => 0 };
    expect(perfectFit(empty, A3, 1)).toBe(1);
  });
});

describe('effectiveScale', () => {
  it('equals perfectFit at fit size 0', () => {
    const fitted = perfectFit(trefoil, A3, 24 * DEG);
    expect(effectiveScale(fitted, 0)).toBe(fitted);
  });

  it('grows above perfectFit as fit size rises', () => {
    const fitted = perfectFit(trefoil, A3, 24 * DEG);
    expect(effectiveScale(fitted, 0.1)).toBeGreaterThan(fitted);
  });
});

describe('computeNesting', () => {
  const base = { template: trefoil, rotation: 24 * DEG, copies: 6, fit: 0 };

  it('leaves copy 0 unscaled', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1.15, max: 20, noNaN: true }),
        fc.double({ min: 0, max: 0.2, noNaN: true }),
        (a, fit) => computeNesting({ ...base, params: { A: a }, fit }).scales[0] === 1,
      ),
    );
  });

  it('produces no warning for the prototype defaults', () => {
    expect(computeNesting({ ...base, params: A3 }).warnings).toEqual([]);
  });

  it('raises the amplitude to its minimum and says so', () => {
    const { warnings } = computeNesting({ ...base, params: { A: 0.5 } });
    expect(warnings).toContainEqual({ limit: 'A minimum', given: 0.5, used: 1.15 });
  });

  it('caps the copy scale and says so', () => {
    const { scales, warnings } = computeNesting({ ...base, params: A3, fit: 0.9, copies: 10 });
    expect(Math.max(...scales)).toBeLessThanOrEqual(1.6);
    expect(warnings.some((w) => w.limit === 'copy scale maximum')).toBe(true);
  });

  it('caps the effective scale and says so', () => {
    const { effectiveScale: scale, warnings } = computeNesting({
      ...base,
      params: A3,
      fit: 0.9,
    });
    expect(scale).toBeLessThanOrEqual(1.5);
    expect(warnings.some((w) => w.limit === 'effective scale maximum')).toBe(true);
  });

  it('raises a tiny perfectFit to its minimum and says so', () => {
    const tiny: ShapeTemplate = {
      ...trefoil,
      id: 'tiny',
      radius: (theta) => 1 + 0.999 * Math.cos(3 * theta),
      maxRadius: () => 1.999,
    };
    const { perfectFit: fitted, warnings } = computeNesting({
      ...base,
      template: tiny,
      params: {},
      rotation: 60 * DEG,
    });
    expect(fitted).toBeGreaterThanOrEqual(0.02);
    expect(warnings.some((w) => w.limit === 'perfectFit minimum')).toBe(true);
  });

  it('keeps every copy inside its parent when no limit is reached', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1.5, max: 20, noNaN: true }),
        fc.double({ min: 5 * DEG, max: 115 * DEG, noNaN: true }),
        (a, rotation) => {
          const result = computeNesting({ ...base, params: { A: a }, rotation, fit: 0 });
          if (result.warnings.length > 0) return true;
          const { scales } = result;
          for (let i = 1; i < scales.length; i++) {
            if ((scales[i] ?? 0) > (scales[i - 1] ?? 0) + 1e-12) return false;
          }
          return true;
        },
      ),
    );
  });

  it('reads every limit from the template rather than from the computation', () => {
    const loose: ShapeTemplate = {
      ...trefoil,
      id: 'loose',
      safety: { minPerfectFit: 1e-9, maxEffectiveScale: 1e9, maxCopyScale: 1e12 },
    };
    const strict = computeNesting({ ...base, params: A3, fit: 0.9 });
    const relaxed = computeNesting({ ...base, template: loose, params: A3, fit: 0.9 });
    expect(strict.warnings.length).toBeGreaterThan(0);
    expect(relaxed.warnings).toEqual([]);
    expect(relaxed.effectiveScale).toBeGreaterThan(strict.effectiveScale);
  });
});

describe('the perfectFit memo', () => {
  function counting(): { template: ShapeTemplate; calls: () => number } {
    let calls = 0;
    return {
      template: {
        ...trefoil,
        id: 'counting',
        radius: (theta, params) => {
          calls++;
          return (params['A'] as number) + Math.cos(3 * theta);
        },
      },
      calls: () => calls,
    };
  }

  it('returns an identical result and samples only once', () => {
    const { template, calls } = counting();
    const memo = createPerfectFitMemo();
    const first = memo.get(template, A3, 24 * DEG);
    const after = calls();
    const second = memo.get(template, A3, 24 * DEG);
    expect(second).toBe(first);
    expect(calls()).toBe(after);
  });

  it('agrees with a freshly computed value', () => {
    const memo = createPerfectFitMemo();
    expect(memo.get(trefoil, A3, 24 * DEG)).toBe(perfectFit(trefoil, A3, 24 * DEG));
  });

  it('recomputes when a parameter changes', () => {
    const memo = createPerfectFitMemo();
    const three = memo.get(trefoil, { A: 3 }, 24 * DEG);
    const seven = memo.get(trefoil, { A: 7 }, 24 * DEG);
    expect(seven).not.toBe(three);
    expect(seven).toBe(perfectFit(trefoil, { A: 7 }, 24 * DEG));
  });

  it('recomputes when the rotation changes', () => {
    const memo = createPerfectFitMemo();
    expect(memo.get(trefoil, A3, 24 * DEG)).not.toBe(memo.get(trefoil, A3, 30 * DEG));
  });

  it('stays bounded however long a slider is dragged', () => {
    const memo = createPerfectFitMemo(16);
    for (let i = 0; i < 500; i++) {
      memo.get(trefoil, { A: 1.2 + i / 1000 }, 24 * DEG);
    }
    expect(memo.size).toBeLessThanOrEqual(16);
  });

  it('can be cleared', () => {
    const memo = createPerfectFitMemo();
    memo.get(trefoil, A3, 0);
    memo.clear();
    expect(memo.size).toBe(0);
  });
});
