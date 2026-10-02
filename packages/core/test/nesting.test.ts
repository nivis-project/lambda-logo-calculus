import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  AMPLITUDE_FLOOR,
  COPY_SCALE_CEILING,
  EFFECTIVE_SCALE_CEILING,
  PERFECT_FIT_FLOOR,
  PERFECT_FIT_SAMPLES,
  computeNesting,
  createTemplateRegistry,
  effectiveScale,
  perfectFit,
  sampleCurve,
  trefoil,
} from '../src/index.js';

const DEG = Math.PI / 180;
const parityDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'test', 'parity');

describe('the trefoil as a registered template', () => {
  it('is in the registry with its amplitude declared', () => {
    const registry = createTemplateRegistry();
    expect(registry.get('trefoil')).toBe(trefoil);
    expect(trefoil.params.map((def) => def.id)).toEqual(['A']);
    expect(trefoil.symmetry).toBe(3);
  });

  it('has a maximum of A + 1 and a minimum of A - 1', () => {
    for (const A of [1.15, 2, 3, 8, 20]) {
      expect(trefoil.maxRadius({ A })).toBeCloseTo(A + 1, 12);
      expect(trefoil.radius(0, { A })).toBeCloseTo(A + 1, 12);
      expect(trefoil.radius(Math.PI / 3, { A })).toBeCloseTo(A - 1, 12);
    }
  });

  it('repeats every third of a turn', () => {
    for (const theta of [0, 0.3, 1.1, 2.7]) {
      expect(trefoil.radius(theta, { A: 3 })).toBeCloseTo(
        trefoil.radius(theta + (2 * Math.PI) / 3, { A: 3 }),
        12,
      );
    }
  });

  it('samples into points on the unit circle at its peak', () => {
    const points = sampleCurve(trefoil, { A: 3 }, 144);
    expect(points).toHaveLength(144);
    const radii = points.map(({ x, y }) => Math.hypot(x, y));
    expect(Math.max(...radii)).toBeCloseTo(1, 9);
    expect(Math.min(...radii)).toBeCloseTo(2 / 4, 9);
    expect(() => sampleCurve(trefoil, { A: 3 }, 2)).toThrow(/at least 3/);
  });
});

describe('the fit', () => {
  it('is 1 at no rotation, because the copy is the curve', () => {
    expect(perfectFit(trefoil, { A: 3 }, 0)).toBeCloseTo(1, 9);
  });

  it('is 1 at a third of a turn, because the curve has three-fold symmetry', () => {
    expect(perfectFit(trefoil, { A: 3 }, 120 * DEG)).toBeCloseTo(1, 9);
    expect(perfectFit(trefoil, { A: 7 }, 240 * DEG)).toBeCloseTo(1, 9);
  });

  it('samples 720 points', () => {
    expect(PERFECT_FIT_SAMPLES).toBe(720);
  });

  it('is between 0 and 1 and never NaN, for any amplitude and rotation', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 20, noNaN: true }),
        fc.double({ min: 0, max: 180, noNaN: true }),
        (A, rot) => {
          const fit = perfectFit(trefoil, { A }, rot * DEG);
          expect(Number.isFinite(fit)).toBe(true);
          expect(fit).toBeGreaterThanOrEqual(0);
          expect(fit).toBeLessThanOrEqual(1 + 1e-9);
        },
      ),
      { numRuns: 300 },
    );
  });

  it('returns 1 when no sample is usable', () => {
    const flat = { ...trefoil, radius: () => 0, maxRadius: () => 1 };
    expect(perfectFit(flat, {}, 1)).toBe(1);
  });
});

describe('the scale', () => {
  it('equals the fit when the fit size is zero', () => {
    for (const fitted of [0.2, 0.5, 0.662, 1]) {
      expect(effectiveScale(fitted, 0)).toBeCloseTo(fitted, 12);
    }
  });

  it('shrinks faster below zero and more slowly above it', () => {
    expect(effectiveScale(0.5, -0.2)).toBeLessThan(effectiveScale(0.5, 0));
    expect(effectiveScale(0.5, 0.2)).toBeGreaterThan(effectiveScale(0.5, 0));
  });
});

describe('the safety limits', () => {
  it('reports nothing when nothing is bound', () => {
    const result = computeNesting({ template: trefoil, params: { A: 3 }, rotation: 24 * DEG, copies: 6, fit: 0 });
    expect(result.warnings).toEqual([]);
    expect(result.scales).toHaveLength(6);
    expect(result.scales[0]).toBeCloseTo(1, 12);
  });

  it('reports the amplitude floor, and uses it everywhere', () => {
    const result = computeNesting({ template: trefoil, params: { A: 1 }, rotation: 24 * DEG, copies: 3, fit: 0 });
    expect(result.warnings[0]).toEqual({ limit: 'amplitude floor', given: 1, used: AMPLITUDE_FLOOR });
    expect(trefoil.radius(0, { A: 1 })).toBe(trefoil.radius(0, { A: AMPLITUDE_FLOOR }));
    expect(result.perfectFit).toBeCloseTo(perfectFit(trefoil, { A: AMPLITUDE_FLOOR }, 24 * DEG), 12);
  });

  it('moving the amplitude below the floor changes nothing', () => {
    const at = (A: number): string =>
      JSON.stringify(computeNesting({ template: trefoil, params: { A }, rotation: 24 * DEG, copies: 4, fit: 0 }).scales);
    expect(at(1)).toBe(at(1.1));
    expect(at(1)).not.toBe(at(1.3));
  });

  it('reports the perfect fit floor', () => {
    const cusped = { ...trefoil, radius: (t: number) => 1 + Math.cos(3 * t), maxRadius: () => 2 };
    const result = computeNesting({ template: cusped, params: {}, rotation: 60 * DEG, copies: 2, fit: 0 });
    const held = result.warnings.find((w) => w.limit === 'perfect fit floor');
    expect(held?.used).toBe(PERFECT_FIT_FLOOR);
    expect(held?.given).toBeLessThan(PERFECT_FIT_FLOOR);
  });

  it('reports the effective scale ceiling and the copy scale ceiling', () => {
    const result = computeNesting({ template: trefoil, params: { A: 3 }, rotation: 24 * DEG, copies: 4, fit: 1 });
    expect(result.effectiveScale).toBeLessThanOrEqual(EFFECTIVE_SCALE_CEILING);
    expect(Math.max(...result.scales)).toBeLessThanOrEqual(COPY_SCALE_CEILING);
    expect(result.warnings.some((w) => w.limit === 'copy scale ceiling')).toBe(true);
  });
});

describe('against the prototype', () => {
  interface Entry {
    readonly file: string;
    readonly actual: { readonly A: number; readonly n: number; readonly rot: number; readonly fit: number };
    readonly readouts: { readonly perfectFit: string; readonly effectiveScale: string; readonly smallestCopy: string };
  }
  const manifest = JSON.parse(readFileSync(join(parityDir, 'index.json'), 'utf8')) as {
    readonly recordings: readonly Entry[];
  };

  it('agrees with every recorded fit and scale, to the three decimals it shows', () => {
    expect(readdirSync(parityDir).length).toBeGreaterThan(1);

    for (const entry of manifest.recordings) {
      const { A, n, rot, fit } = entry.actual;
      const result = computeNesting({
        template: trefoil,
        params: { A },
        rotation: rot * DEG,
        copies: n,
        fit,
      });

      expect(result.perfectFit.toFixed(3), `${entry.file}: perfectFit`).toBe(entry.readouts.perfectFit);
      expect(result.effectiveScale.toFixed(3), `${entry.file}: effectiveScale`).toBe(
        entry.readouts.effectiveScale,
      );
      expect(`${(result.scales[n - 1] ?? 0).toFixed(3)}×`, `${entry.file}: smallest copy`).toBe(
        entry.readouts.smallestCopy,
      );
    }
  });
});
