import { describe, expect, it } from 'vitest';
import {
  GRID,
  GlyphError,
  NOTDEF,
  createGlyphSetRegistry,
  glyphFor,
  latinGlyphSet,
  latinGlyphs,
  validateGlyph,
  type GlyphSet,
  type GlyphSkeleton,
} from '../src/index.js';
import { extractGlyphs } from '../../../scripts/extract-glyphs.mjs';

const stem: GlyphSkeleton = {
  advance: 14,
  parts: [
    {
      kind: 'stroke',
      segments: [
        { kind: 'point', x: 7, y: 0 },
        { kind: 'point', x: 7, y: 56 },
      ],
    },
  ],
};

function setOf(glyphs: Record<string, GlyphSkeleton>): GlyphSet {
  return { id: 'under-test', version: 1, label: 'Under test', params: [], metrics: GRID, glyphs };
}

describe('the grid', () => {
  it('holds the numbers the prototype uses', () => {
    expect(GRID).toEqual({
      strokeWidth: 10,
      xHeight: 56,
      capHeight: 86,
      descender: -28,
      sideBearing: 9,
      terminal: 8,
      dotRadius: 7,
      wordSpace: 28,
      lineHeight: 150,
    });
  });
});

describe('the alphabet', () => {
  it('holds 69 glyphs: the letters, the digits, six marks and a notdef', () => {
    const names = Object.keys(latinGlyphs);
    expect(names).toHaveLength(69);
    expect(names.filter((n) => /^[a-z]$/.test(n))).toHaveLength(26);
    expect(names.filter((n) => /^[A-Z]$/.test(n))).toHaveLength(26);
    expect(names.filter((n) => /^[0-9]$/.test(n))).toHaveLength(10);
    expect(names).toContain(NOTDEF);
  });

  it('is exactly what the extractor produces from the frozen prototype', () => {
    expect(JSON.parse(JSON.stringify(latinGlyphs))).toEqual(extractGlyphs());
  });

  it('keeps arcs as arcs, not as points somebody already sampled', () => {
    const n = latinGlyphs.n;
    const arcs = (n?.parts ?? [])
      .filter((part) => part.kind === 'stroke')
      .flatMap((part) => part.segments)
      .filter((segment) => segment.kind === 'arc');

    expect(arcs.length).toBeGreaterThan(0);
    expect(arcs[0]).toMatchObject({ kind: 'arc', cx: 24, cy: 34, rx: 19, ry: 22, a0: 180, a1: 0, skipFirst: false });
  });

  it('records where the prototype drops a shared point between two arcs', () => {
    for (const character of ['s', 'S', '3']) {
      const segments = (latinGlyphs[character]?.parts ?? [])
        .filter((part) => part.kind === 'stroke')
        .flatMap((part) => part.segments);
      expect(segments.filter((s) => s.kind === 'arc' && s.skipFirst), character).toHaveLength(1);
    }
  });

  it('holds the shapes the letters say they are', () => {
    expect(latinGlyphs.o?.parts).toEqual([
      { kind: 'bowl', cx: 24, cy: 28, rx: 24, ry: 28, cuts: [] },
    ]);
    expect(latinGlyphs.i?.parts.some((part) => part.kind === 'dot')).toBe(true);
    expect(latinGlyphs.c?.parts[0]).toMatchObject({ kind: 'bowl', cuts: [{ x0: 33 }] });
  });

  it('depends on no parameter and holds no function', () => {
    const text = JSON.stringify(latinGlyphs);
    expect(text).not.toMatch(/function|=>|rotation|amplitude/i);
    for (const glyph of Object.values(latinGlyphs)) {
      expect(typeof glyph.advance).toBe('number');
      for (const part of glyph.parts) expect(typeof part.kind).toBe('string');
    }
  });
});

describe('validating a glyph', () => {
  it('accepts every glyph in the shipped alphabet', () => {
    for (const [character, glyph] of Object.entries(latinGlyphs)) {
      expect(() => { validateGlyph(character, glyph); }).not.toThrow();
    }
  });

  it('refuses an advance that is not a positive finite number', () => {
    expect(() => { validateGlyph('x', { ...stem, advance: 0 }); }).toThrow(GlyphError);
    expect(() => { validateGlyph('x', { ...stem, advance: -4 }); }).toThrow(/"x"/);
    expect(() => { validateGlyph('x', { ...stem, advance: Number.NaN }); }).toThrow(/advance/);
  });

  it('refuses a glyph with no parts', () => {
    expect(() => { validateGlyph('x', { advance: 10, parts: [] }); }).toThrow(/no parts/);
  });

  it('refuses a part of an unknown kind', () => {
    const odd = { advance: 10, parts: [{ kind: 'spiral' }] } as unknown as GlyphSkeleton;
    expect(() => { validateGlyph('x', odd); }).toThrow(/unknown kind/);
  });

  it('refuses a stroke of a single point, and accepts one of a single arc', () => {
    expect(() => {
      validateGlyph('x', { advance: 10, parts: [{ kind: 'stroke', segments: [{ kind: 'point', x: 0, y: 0 }] }] });
    }).toThrow(/single point/);
    expect(() => {
      validateGlyph('x', { advance: 10, parts: [{ kind: 'stroke', segments: [] }] });
    }).toThrow(/no segments/);
    expect(() => {
      validateGlyph('x', {
        advance: 10,
        parts: [{ kind: 'stroke', segments: [{ kind: 'arc', cx: 0, cy: 0, rx: 5, ry: 5, a0: 0, a1: 180, skipFirst: false }] }],
      });
    }).not.toThrow();
  });

  it('refuses a coordinate that is not finite', () => {
    expect(() => {
      validateGlyph('x', {
        advance: 10,
        parts: [{ kind: 'stroke', segments: [{ kind: 'point', x: 0, y: 0 }, { kind: 'point', x: Number.NaN, y: 1 }] }],
      });
    }).toThrow(/not finite/);
  });

  it('refuses a radius that is not positive', () => {
    expect(() => {
      validateGlyph('x', { advance: 10, parts: [{ kind: 'bowl', cx: 0, cy: 0, rx: 0, ry: 5, cuts: [] }] });
    }).toThrow(/not positive/);
    expect(() => {
      validateGlyph('x', { advance: 10, parts: [{ kind: 'dot', x: 0, y: 0, r: -1 }] });
    }).toThrow(/not positive/);
    expect(() => {
      validateGlyph('x', {
        advance: 10,
        parts: [{ kind: 'stroke', segments: [{ kind: 'arc', cx: 0, cy: 0, rx: -1, ry: 5, a0: 0, a1: 90, skipFirst: false }, { kind: 'point', x: 1, y: 1 }] }],
      });
    }).toThrow(/not positive/);
  });
});

describe('a glyph set', () => {
  it('ships the latin set, registered and valid', () => {
    const registry = createGlyphSetRegistry();
    expect(registry.get('latin-basic')).toBe(latinGlyphSet);
    expect(latinGlyphSet.metrics).toBe(GRID);
  });

  it('refuses a set with no notdef', () => {
    const registry = createGlyphSetRegistry();
    expect(() => { registry.register(setOf({ a: stem })); }).toThrow(/no notdef/);
  });

  it('refuses a set holding a malformed glyph, naming the character', () => {
    const registry = createGlyphSetRegistry();
    expect(() => {
      registry.register(setOf({ [NOTDEF]: stem, q: { ...stem, advance: -1 } }));
    }).toThrow(/"q"/);
  });

  it('falls back to notdef for a character nobody drew', () => {
    expect(glyphFor(latinGlyphSet, 'o')).toBe(latinGlyphs.o);
    expect(glyphFor(latinGlyphSet, '☃')).toBe(latinGlyphs[NOTDEF]);
    expect(() => glyphFor(latinGlyphSet, '☃')).not.toThrow();
  });

  it('says so when even the notdef is missing', () => {
    const broken = setOf({ a: stem });
    expect(() => glyphFor(broken, 'z')).toThrow(/no notdef/);
  });
});
