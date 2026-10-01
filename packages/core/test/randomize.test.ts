import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  isNumericParam,
  randomizeParams,
  type ParamDef,
  type ParamValues,
} from '../src/index.js';

const DEFS: readonly ParamDef[] = [
  { id: 'A', label: 'Amplitude', kind: 'number', min: 1, max: 20, default: 3, lockable: true },
  { id: 'copies', label: 'Copies', kind: 'int', min: 1, max: 12, default: 6, lockable: true },
  {
    id: 'rot',
    label: 'Rotation',
    kind: 'angle',
    min: 0,
    max: 360,
    default: 24,
    lockable: true,
    randomize: { min: 10, max: 50 },
  },
  {
    id: 'pal',
    label: 'Palette',
    kind: 'enum',
    options: ['Monochrome', 'Analogous', 'Triadic'],
    default: 'Analogous',
    lockable: true,
  },
  { id: 'joins', label: 'Joins', kind: 'bool', default: true, lockable: true },
  {
    id: 'nib',
    label: 'Nib width',
    kind: 'number',
    min: 1,
    max: 20,
    default: 6.5,
    lockable: true,
    randomize: false,
  },
];

const EVERY_ID = new Set(DEFS.map((d) => d.id));

describe('randomize', () => {
  it('leaves a locked parameter at exactly its value', () => {
    const values: ParamValues = { A: 7.25 };
    const next = randomizeParams(DEFS, values, new Set(['A']), 'seed');
    expect(next['A']).toBe(7.25);
  });

  it('returns the input unchanged when everything is locked', () => {
    const before = randomizeParams(DEFS, {}, EVERY_ID, 'seed');
    expect(before).toEqual({
      A: 3,
      copies: 6,
      rot: 24,
      pal: 'Analogous',
      joins: true,
      nib: 6.5,
    });
  });

  it('draws from the declared randomize range, not the full range', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      const next = randomizeParams(DEFS, {}, new Set(), seed);
      expect(next['rot']).toBeGreaterThanOrEqual(10);
      expect(next['rot']).toBeLessThanOrEqual(50);
    }
  });

  it('skips a parameter whose randomize is false', () => {
    for (const seed of ['a', 'b', 'c', 'd']) {
      expect(randomizeParams(DEFS, {}, new Set(), seed)['nib']).toBe(6.5);
    }
  });

  it('gives an enum one of its own options', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      expect(['Monochrome', 'Analogous', 'Triadic']).toContain(
        randomizeParams(DEFS, {}, new Set(), seed)['pal'],
      );
    }
  });

  it('keeps an int parameter integral and in range', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const n = randomizeParams(DEFS, {}, new Set(), seed)['copies'];
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(12);
    }
  });

  it('is reproducible for the same seed', () => {
    expect(randomizeParams(DEFS, {}, new Set(), 'same')).toEqual(
      randomizeParams(DEFS, {}, new Set(), 'same'),
    );
  });

  it('differs for a different seed', () => {
    expect(randomizeParams(DEFS, {}, new Set(), 'one')).not.toEqual(
      randomizeParams(DEFS, {}, new Set(), 'two'),
    );
  });

  it('produces values valid against their own definitions, for any locks and seed', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.subarray(DEFS.map((d) => d.id)),
        (seed, lockedIds) => {
          const next = randomizeParams(DEFS, {}, new Set(lockedIds), seed);
          return DEFS.every((def) => {
            const value = next[def.id];
            if (isNumericParam(def)) {
              if (typeof value !== 'number') return false;
              if (def.kind === 'int' && !Number.isInteger(value)) return false;
              return value >= def.min && value <= def.max;
            }
            if (def.kind === 'enum') return def.options.includes(value as string);
            if (def.kind === 'bool') return typeof value === 'boolean';
            return typeof value === 'string';
          });
        },
      ),
    );
  });

  it('never moves a locked parameter, for any seed', () => {
    fc.assert(
      fc.property(fc.string(), fc.double({ min: 1, max: 20, noNaN: true }), (seed, a) => {
        const next = randomizeParams(DEFS, { A: a }, new Set(['A']), seed);
        return next['A'] === a;
      }),
    );
  });
});
