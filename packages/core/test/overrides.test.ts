import { describe, expect, it } from 'vitest';
import {
  EMPTY_PATCH,
  GRID,
  NOTDEF,
  advanceWithPairs,
  applyPatch,
  emptyWorking,
  isEmptyPatch,
  widthOf,
  wrapText,
  type GlyphPatch,
  type GlyphSet,
  type GlyphSkeleton,
  type LayoutMetrics,
  type Polyline,
  type SpacingPair,
  type WorkingSkeleton,
} from '../src/index.js';

function skeletonOf(run: Polyline): WorkingSkeleton {
  return { ...emptyWorking(48, []), runs: [run], dots: [{ x: 10, y: 10, r: 4 }] };
}

const SQUARE: Polyline = [
  [0, 0],
  [20, 0],
  [20, 20],
  [0, 20],
];

describe('a patch', () => {
  it('holds only adjustments', () => {
    const patch: GlyphPatch = { offset: [1, 2], scale: 1.5, advance: 60, endingId: 'slab' };
    expect(Object.keys(patch).sort()).toEqual(['advance', 'endingId', 'offset', 'scale']);
    expect(JSON.stringify(patch)).not.toMatch(/skeleton|runs|rings|parts/i);
  });

  it('recognises an empty patch', () => {
    expect(isEmptyPatch(undefined)).toBe(true);
    expect(isEmptyPatch(EMPTY_PATCH)).toBe(true);
    expect(isEmptyPatch({ offset: [0, 0] })).toBe(false);
  });

  it('changes nothing when it is empty', () => {
    const skeleton = skeletonOf(SQUARE);
    expect(applyPatch(skeleton, EMPTY_PATCH)).toBe(skeleton);
    expect(applyPatch(skeleton, undefined)).toBe(skeleton);
  });
});

describe('the offset', () => {
  it('moves the geometry and the dots', () => {
    const moved = applyPatch(skeletonOf(SQUARE), { offset: [5, -3] });
    expect(moved.runs[0]).toEqual([
      [5, -3],
      [25, -3],
      [25, 17],
      [5, 17],
    ]);
    expect(moved.dots[0]).toEqual({ x: 15, y: 7, r: 4 });
  });

  it('leaves the input alone', () => {
    const skeleton = skeletonOf(SQUARE);
    const before = structuredClone(skeleton);
    applyPatch(skeleton, { offset: [5, 5] });
    expect(skeleton).toEqual(before);
  });
});

describe('the scale', () => {
  it('scales about the glyph centre, leaving the centre where it was', () => {
    const scaled = applyPatch(skeletonOf(SQUARE), { scale: 2 });
    const xs = (scaled.runs[0] ?? []).map(([x]) => x);
    const ys = (scaled.runs[0] ?? []).map(([, y]) => y);

    expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(10, 12);
    expect((Math.min(...ys) + Math.max(...ys)) / 2).toBeCloseTo(10, 12);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(40, 12);
  });

  it('scales the dots too', () => {
    expect(applyPatch(skeletonOf(SQUARE), { scale: 2 }).dots[0]?.r).toBe(8);
  });

  it('combines a scale and an offset', () => {
    const both = applyPatch(skeletonOf(SQUARE), { scale: 2, offset: [100, 0] });
    const xs = (both.runs[0] ?? []).map(([x]) => x);
    expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(110, 12);
  });

  it('falls back to the origin when there is nothing to centre on', () => {
    const empty: WorkingSkeleton = emptyWorking(48, []);
    expect(applyPatch(empty, { scale: 2 }).runs).toEqual([]);
  });

  it('centres on the dots when there are no runs', () => {
    const dotsOnly: WorkingSkeleton = {
      ...emptyWorking(14, []),
      dots: [{ x: 10, y: 10, r: 4 }],
    };
    const scaled = applyPatch(dotsOnly, { scale: 3 });
    expect(scaled.dots[0]).toEqual({ x: 10, y: 10, r: 12 });
  });
});

describe('advances and spacing pairs', () => {
  const characters = Array.from('Av vA');
  const pairs: readonly SpacingPair[] = [{ before: 'A', after: 'v', extra: 12 }];

  it('uses the base advance when there is no patch or pair', () => {
    expect(advanceWithPairs(characters, 3, 40, undefined, [])).toBe(40);
  });

  it('lets a patch override the advance', () => {
    expect(advanceWithPairs(characters, 3, 40, { advance: 60 }, [])).toBe(60);
  });

  it('applies a pair in its own order only', () => {
    expect(advanceWithPairs(characters, 0, 40, undefined, pairs)).toBe(52);
    expect(advanceWithPairs(characters, 3, 40, undefined, pairs)).toBe(40);
  });

  it('adds a pair on top of an overridden advance', () => {
    expect(advanceWithPairs(characters, 0, 40, { advance: 60 }, pairs)).toBe(72);
  });

  it('sums two pairs naming the same characters', () => {
    expect(
      advanceWithPairs(characters, 0, 40, undefined, [
        { before: 'A', after: 'v', extra: 5 },
        { before: 'A', after: 'v', extra: 7 },
      ]),
    ).toBe(52);
  });

  it('applies nothing at the end of the text', () => {
    expect(advanceWithPairs(characters, characters.length - 1, 40, undefined, pairs)).toBe(40);
  });
});

describe('wrapping with overrides', () => {
  const uniform: GlyphSkeleton = { advance: 40, parts: [] };
  const set: GlyphSet = {
    id: 'flat',
    version: 1,
    label: 'flat',
    params: [],
    metrics: GRID,
    glyphs: Object.fromEntries(
      [...Array.from('abcdefghij'), NOTDEF].map((ch) => [ch, uniform]),
    ),
  };

  function layout(overrides: Partial<LayoutMetrics> = {}): LayoutMetrics {
    return { set, metrics: GRID, widthFactor: 1, ...overrides };
  }

  it('measures a word by its plain advances when nothing is overridden', () => {
    expect(widthOf('abcd', layout())).toBe(4 * (40 + 2 * GRID.sideBearing));
  });

  it('counts a pair in the measured width', () => {
    const pairs: readonly SpacingPair[] = [{ before: 'a', after: 'b', extra: 30 }];
    expect(widthOf('abcd', layout({ pairs }))).toBe(4 * (40 + 2 * GRID.sideBearing) + 30);
  });

  it('breaks a line that a pair has widened past the available width', () => {
    const available = widthOf('abc def', layout());
    expect(wrapText('abc def', available, layout()).lines).toEqual(['abc def']);

    const pairs: readonly SpacingPair[] = [{ before: 'a', after: 'b', extra: 40 }];
    expect(wrapText('abc def', available, layout({ pairs })).lines).toEqual(['abc', 'def']);
  });

  it('breaks a line that an advance override has widened past the available width', () => {
    const available = widthOf('abc def', layout());
    const patches = { a: { advance: 120 } };
    expect(wrapText('abc def', available, layout({ patches })).lines).toEqual(['abc', 'def']);
  });
});
