import { describe, expect, it } from 'vitest';
import {
  ParamResolveError,
  isNumericParam,
  randomizeParams,
  resolveParams,
  seededRandom,
  type ParamDef,
} from '../src/index.js';

const DEFS: readonly ParamDef[] = [
  { id: 'A', label: 'A/B ratio', kind: 'number', min: 1, max: 20, step: 0.1, default: 3, lockable: true, randomize: { min: 1.2, max: 8 } },
  { id: 'n', label: 'Copies', kind: 'int', min: 1, max: 12, step: 1, default: 6, lockable: true, randomize: { min: 2, max: 10 } },
  { id: 'rot', label: 'Rotation', kind: 'angle', min: 0, max: 180, step: 1, default: 24, lockable: true, randomize: { min: 5, max: 120 } },
  { id: 'pal', label: 'Palette', kind: 'enum', options: ['Monochrome', 'Analogous', 'Cool'], default: 'Analogous', lockable: true },
  { id: 'grid', label: 'Grid', kind: 'bool', default: false, lockable: false },
  { id: 'ink', label: 'Ink', kind: 'color', default: '#111111', lockable: false, randomize: false },
  { id: 'fixed', label: 'Fixed', kind: 'number', min: 0, max: 1, default: 0.5, lockable: false, randomize: false },
];

describe('a parameter declaration', () => {
  it('covers all six kinds, and each carries a default', () => {
    expect(new Set(DEFS.map((def) => def.kind)).size).toBe(6);
    for (const def of DEFS) expect(def).toHaveProperty('default');
  });

  it('knows which kinds are numeric', () => {
    expect(DEFS.filter(isNumericParam).map((def) => def.id)).toEqual(['A', 'n', 'rot', 'fixed']);
  });
});

describe('resolving values', () => {
  it('uses the defaults when nothing is given', () => {
    const { values, clamped } = resolveParams(DEFS, {});
    expect(values).toEqual({ A: 3, n: 6, rot: 24, pal: 'Analogous', grid: false, ink: '#111111', fixed: 0.5 });
    expect(clamped).toEqual([]);
  });

  it('passes an in-range value through untouched', () => {
    const { values, clamped } = resolveParams(DEFS, { A: 5 });
    expect(values.A).toBe(5);
    expect(clamped).toEqual([]);
  });

  it('reports what it clamped, with both numbers', () => {
    const below = resolveParams(DEFS, { A: -4 });
    expect(below.values.A).toBe(1);
    expect(below.clamped).toEqual([{ paramId: 'A', given: -4, used: 1, limit: 'minimum' }]);

    const above = resolveParams(DEFS, { n: 99 });
    expect(above.values.n).toBe(12);
    expect(above.clamped[0]).toMatchObject({ paramId: 'n', given: 99, used: 12, limit: 'maximum' });
  });

  it('snaps to the step, and rounds an integer', () => {
    expect(resolveParams(DEFS, { A: 3.04 }).values.A).toBeCloseTo(3, 9);
    expect(resolveParams(DEFS, { n: 6.4 }).values.n).toBe(6);
  });

  it('refuses a value of the wrong kind, naming the parameter', () => {
    expect(() => resolveParams(DEFS, { A: 'three' })).toThrow(ParamResolveError);
    expect(() => resolveParams(DEFS, { A: 'three' })).toThrow(/"A"/);
    expect(() => resolveParams(DEFS, { A: Number.NaN })).toThrow(/finite/);
    expect(() => resolveParams(DEFS, { grid: 1 })).toThrow(/boolean/);
    expect(() => resolveParams(DEFS, { pal: 7 })).toThrow(/"pal"/);
    expect(() => resolveParams(DEFS, { ink: 3 })).toThrow(/colour/);
  });

  it('refuses an option that is not in the list, and says what the options are', () => {
    expect(() => resolveParams(DEFS, { pal: 'Lilac' })).toThrow(/Monochrome, Analogous, Cool/);
  });

  it('refuses a value for a parameter nobody declared', () => {
    expect(() => resolveParams(DEFS, { nope: 1 })).toThrow(/"nope"/);
    expect(() => resolveParams(DEFS, { nope: 1 })).toThrow(/not declared|no parameter/);
  });
});

describe('the seeded source', () => {
  it('gives the same sequence for the same seed', () => {
    const a = seededRandom('trefoil');
    const b = seededRandom('trefoil');
    const take = (r: ReturnType<typeof seededRandom>): number[] => Array.from({ length: 8 }, () => r.next());
    expect(take(a)).toEqual(take(b));
  });

  it('gives a different sequence for a different seed', () => {
    const a = Array.from({ length: 8 }, () => seededRandom('one').next());
    const b = Array.from({ length: 8 }, () => seededRandom('two').next());
    expect(a).not.toEqual(b);
  });

  it('stays between zero and one', () => {
    const r = seededRandom('range');
    for (let i = 0; i < 500; i++) {
      const value = r.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('picks from a list and refuses an empty one', () => {
    const r = seededRandom('pick');
    expect(['a', 'b', 'c']).toContain(r.pick(['a', 'b', 'c']));
    expect(() => r.pick([])).toThrow(/empty/);
    expect(r.int(3, 3)).toBe(3);
  });
});

describe('randomize', () => {
  it('gives the same result for the same seed', () => {
    const once = randomizeParams(DEFS, {}, new Set(), 'seed-1');
    const twice = randomizeParams(DEFS, {}, new Set(), 'seed-1');
    expect(once).toEqual(twice);
  });

  it('gives a different result for a different seed', () => {
    const a = randomizeParams(DEFS, {}, new Set(), 'seed-1');
    const b = randomizeParams(DEFS, {}, new Set(), 'seed-2');
    expect(a).not.toEqual(b);
  });

  it('leaves a locked parameter alone', () => {
    for (const seed of ['a', 'b', 'c', 'd']) {
      const result = randomizeParams(DEFS, { A: 7 }, new Set(['A']), seed);
      expect(result.A).toBe(7);
    }
  });

  it('leaves a parameter that is not randomisable alone', () => {
    for (const seed of ['a', 'b', 'c', 'd']) {
      const result = randomizeParams(DEFS, { fixed: 0.3, ink: '#abcdef' }, new Set(), seed);
      expect(result.fixed).toBe(0.3);
      expect(result.ink).toBe('#abcdef');
    }
  });

  it('stays inside each randomize range, over many seeds', () => {
    for (let i = 0; i < 200; i++) {
      const result = randomizeParams(DEFS, {}, new Set(), `seed-${String(i)}`);
      expect(result.A).toBeGreaterThanOrEqual(1.2);
      expect(result.A).toBeLessThanOrEqual(8);
      expect(result.n).toBeGreaterThanOrEqual(2);
      expect(result.n).toBeLessThanOrEqual(10);
      expect(result.rot).toBeGreaterThanOrEqual(5);
      expect(result.rot).toBeLessThanOrEqual(120);
      expect(['Monochrome', 'Analogous', 'Cool']).toContain(result.pal);
    }
  });

  it('moves what it is allowed to move', () => {
    const seeds = Array.from({ length: 20 }, (_unused, i) => `s${String(i)}`);
    const amplitudes = new Set(seeds.map((seed) => randomizeParams(DEFS, {}, new Set(), seed).A));
    expect(amplitudes.size).toBeGreaterThan(5);
  });
});
