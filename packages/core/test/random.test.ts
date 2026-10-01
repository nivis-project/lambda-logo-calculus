import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { createSeededRandom } from '../src/index.js';

function draw(seed: string | number, times: number): number[] {
  const random = createSeededRandom(seed);
  return Array.from({ length: times }, () => random.next());
}

describe('the seeded random source', () => {
  it('gives the same sequence for the same seed', () => {
    expect(draw('trefoil', 32)).toEqual(draw('trefoil', 32));
  });

  it('gives a different sequence for a different seed', () => {
    expect(draw('trefoil', 32)).not.toEqual(draw('trefoi1', 32));
  });

  it('accepts a numeric seed as well as a string', () => {
    expect(draw(42, 8)).toEqual(draw(42, 8));
    expect(draw(42, 8)).not.toEqual(draw(43, 8));
  });

  it('does not collapse when seeded with zero or an empty string', () => {
    const fromZero = draw(0, 8);
    const fromEmpty = draw('', 8);
    expect(new Set(fromZero).size).toBeGreaterThan(1);
    expect(new Set(fromEmpty).size).toBeGreaterThan(1);
  });

  it('stays at or above 0 and below 1 across many draws from many seeds', () => {
    fc.assert(
      fc.property(fc.string(), fc.integer({ min: 1, max: 200 }), (seed, times) =>
        draw(seed, times).every((v) => v >= 0 && v < 1),
      ),
    );
  });

  it('keeps nextInRange inside its bounds', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.double({ min: -500, max: 500, noNaN: true }),
        fc.double({ min: 0, max: 500, noNaN: true }),
        (seed, min, width) => {
          const random = createSeededRandom(seed);
          const max = min + width;
          return Array.from({ length: 20 }, () => random.nextInRange(min, max)).every(
            (v) => v >= min && v <= max,
          );
        },
      ),
    );
  });

  it('keeps nextInt inside its bounds and integral', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.integer({ min: -100, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (seed, min, width) => {
          const random = createSeededRandom(seed);
          const max = min + width;
          return Array.from({ length: 20 }, () => random.nextInt(min, max)).every(
            (v) => Number.isInteger(v) && v >= min && v <= max,
          );
        },
      ),
    );
  });

  it('returns the low bound when nextInt is given an inverted range', () => {
    expect(createSeededRandom('x').nextInt(5, 2)).toBe(5);
  });

  it('picks only from the options it was given', () => {
    const options = ['a', 'b', 'c', 'd'] as const;
    const random = createSeededRandom('pick');
    for (let i = 0; i < 50; i++) {
      expect(options).toContain(random.pick(options));
    }
  });

  it('refuses to pick from nothing', () => {
    expect(() => createSeededRandom('x').pick([])).toThrow(/empty set of options/);
  });

  it('covers its whole option set given enough draws', () => {
    const options = ['a', 'b', 'c'] as const;
    const random = createSeededRandom('coverage');
    const seen = new Set(Array.from({ length: 300 }, () => random.pick(options)));
    expect(seen.size).toBe(options.length);
  });
});
