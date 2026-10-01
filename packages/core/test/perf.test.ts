import { describe, expect, it } from 'vitest';
import {
  DRAFT_QUALITY,
  FULL_QUALITY,
  QUALITIES,
  createCache,
  hashOf,
  roundPen,
  supportAt,
} from '../src/index.js';

describe('the sampling qualities', () => {
  it('are registered, and draft samples less finely everywhere', () => {
    expect(QUALITIES.map((quality) => quality.id)).toEqual(['full', 'draft']);
    for (const key of ['supportEntries', 'penSamples', 'ringSteps', 'joinSamples', 'fitSamples'] as const) {
      expect(DRAFT_QUALITY[key], key).toBeLessThan(FULL_QUALITY[key]);
    }
  });

  it('keeps the full numbers the pipeline was written at', () => {
    expect(FULL_QUALITY).toMatchObject({
      supportEntries: 360,
      penSamples: 144,
      ringSteps: 64,
      joinSamples: 72,
      fitSamples: 720,
    });
  });
});

describe('a pen at a given number of entries', () => {
  it('reads its support table by angle whatever its size', () => {
    for (const entries of [360, 120, 36]) {
      const pen = roundPen(10, entries);
      expect(pen.support).toHaveLength(entries);
      expect(supportAt(pen, 0)).toBe(5);
      expect(supportAt(pen, Math.PI)).toBe(5);
      expect(supportAt(pen, -Math.PI * 4)).toBe(5);
    }
  });
});

describe('the hash', () => {
  it('is the same for the same values in a different order', () => {
    expect(hashOf({ a: 1, b: [2, 3], c: 'x' })).toBe(hashOf({ c: 'x', b: [2, 3], a: 1 }));
  });

  it('changes when a value changes', () => {
    expect(hashOf({ a: 1 })).not.toBe(hashOf({ a: 1.0000001 }));
    expect(hashOf({ a: 1 })).not.toBe(hashOf({ b: 1 }));
    expect(hashOf([1, 2])).not.toBe(hashOf([2, 1]));
  });

  it('handles what a scene actually holds', () => {
    expect(hashOf({ patch: null, params: { A: 3 }, list: [{ id: 'bend', enabled: true }] })).toBe(
      hashOf({ list: [{ id: 'bend', enabled: true }], params: { A: 3 }, patch: undefined }),
    );
  });
});

describe('the cache', () => {
  it('holds what was put in it and counts hits and misses', () => {
    const cache = createCache<number>(3);
    expect(cache.get('a')).toBeUndefined();
    cache.set('a', 1);
    expect(cache.get('a')).toBe(1);
    expect(cache.hits).toBe(1);
    expect(cache.misses).toBe(1);
    expect(cache.size).toBe(1);
  });

  it('drops the least recently used when it is full', () => {
    const cache = createCache<number>(2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.get('a');
    cache.set('c', 3);
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('a')).toBe(1);
    expect(cache.capacity).toBe(2);
  });

  it('empties', () => {
    const cache = createCache<number>();
    cache.set('a', 1);
    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.hits).toBe(0);
  });
});
