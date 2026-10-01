import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  GRID,
  NOTDEF,
  createGlyphSetRegistry,
  glyphFor,
  validateGlyphs,
  type GlyphSkeleton,
  type SkeletonPrimitive,
} from '@trefoil/core';
import { latinGlyphSet, latinGlyphs } from '../src/index.js';

const LOWER = 'abcdefghijklmnopqrstuvwxyz'.split('');
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const DIGITS = '0123456789'.split('');
const PUNCTUATION = ['.', ',', '!', '?', '-', "'"];

function coordinates(part: SkeletonPrimitive): number[] {
  if (part.kind === 'stroke') {
    return part.segments.flatMap((s) =>
      s.kind === 'point' ? [s.x, s.y] : [s.cx, s.cy, s.rx, s.ry, s.a0, s.a1],
    );
  }
  if (part.kind === 'bowl') {
    return [part.cx, part.cy, part.rx, part.ry, ...part.cuts.flatMap((c) => [c.x0, c.y0, c.x1, c.y1])];
  }
  return [part.x, part.y, part.r];
}

describe('the built-in latin glyph set', () => {
  it('covers the prototype alphabet and nothing is missing', () => {
    for (const ch of [...LOWER, ...UPPER, ...DIGITS, ...PUNCTUATION, NOTDEF]) {
      expect(latinGlyphs[ch], `missing ${ch === NOTDEF ? 'notdef' : ch}`).toBeDefined();
    }
  });

  it('has exactly 69 glyphs', () => {
    expect(Object.keys(latinGlyphs)).toHaveLength(26 + 26 + 10 + 6 + 1);
  });

  it('every glyph validates', () => {
    expect(() => {
      validateGlyphs(latinGlyphs);
    }).not.toThrow();
  });

  it('registers cleanly', () => {
    const r = createGlyphSetRegistry();
    expect(() => {
      r.register(latinGlyphSet);
    }).not.toThrow();
    expect(r.get('latin-basic').metrics).toBe(GRID);
  });
});

describe('glyphs match the prototype', () => {
  it('o is one bowl at 24, 28 with radii 24 and 28, width 48', () => {
    const o = latinGlyphs['o'] as GlyphSkeleton;
    expect(o.advance).toBe(48);
    expect(o.parts).toEqual([{ kind: 'bowl', cx: 24, cy: 28, rx: 24, ry: 28, cuts: [] }]);
  });

  it('O is one bowl at 32, 43 with radii 32 and 43, width 64', () => {
    const upper = latinGlyphs['O'] as GlyphSkeleton;
    expect(upper.advance).toBe(64);
    expect(upper.parts).toEqual([{ kind: 'bowl', cx: 32, cy: 43, rx: 32, ry: 43, cuts: [] }]);
  });

  it('p runs from the x-height down to the descender', () => {
    const p = latinGlyphs['p'] as GlyphSkeleton;
    const stroke = p.parts.find((part) => part.kind === 'stroke');
    expect(stroke).toBeDefined();
    const ys =
      stroke?.kind === 'stroke'
        ? stroke.segments.filter((s) => s.kind === 'point').map((s) => s.y)
        : [];
    expect(ys).toEqual([GRID.xHeight, GRID.descender]);
  });

  it('c has exactly one cut region', () => {
    const c = latinGlyphs['c'] as GlyphSkeleton;
    const bowl = c.parts[0];
    expect(bowl?.kind).toBe('bowl');
    expect(bowl?.kind === 'bowl' ? bowl.cuts : []).toEqual([{ x0: 33, y0: 17, x1: 60, y1: 40 }]);
  });

  it('a full stop is a single dot', () => {
    expect(latinGlyphs['.']).toEqual({ advance: 14, parts: [{ kind: 'dot', x: 7, y: 7, r: 7 }] });
  });

  it('a question mark carries an arc-bearing stroke and a dot', () => {
    const q = latinGlyphs['?'] as GlyphSkeleton;
    expect(q.parts.some((p) => p.kind === 'dot')).toBe(true);
    const stroke = q.parts.find((p) => p.kind === 'stroke');
    expect(stroke?.kind === 'stroke' && stroke.segments.some((s) => s.kind === 'arc')).toBe(true);
  });

  it('the notdef is a bowl', () => {
    const notdef = latinGlyphs[NOTDEF] as GlyphSkeleton;
    expect(notdef.advance).toBe(40);
    expect(notdef.parts[0]?.kind).toBe('bowl');
  });

  it('stores arcs declaratively, with no point list', () => {
    const s = latinGlyphs['s'] as GlyphSkeleton;
    const stroke = s.parts[0];
    expect(stroke?.kind).toBe('stroke');
    if (stroke?.kind !== 'stroke') return;
    expect(stroke.segments.every((seg) => seg.kind === 'arc')).toBe(true);
    for (const seg of stroke.segments) {
      expect(Object.keys(seg).sort()).toEqual(['a0', 'a1', 'cx', 'cy', 'kind', 'rx', 'ry']);
    }
  });
});

describe('glyph invariants', () => {
  it('every advance width is finite and above zero', () => {
    for (const [ch, glyph] of Object.entries(latinGlyphs)) {
      expect(Number.isFinite(glyph.advance), ch).toBe(true);
      expect(glyph.advance, ch).toBeGreaterThan(0);
    }
  });

  it('every coordinate in every primitive is finite', () => {
    for (const [ch, glyph] of Object.entries(latinGlyphs)) {
      for (const part of glyph.parts) {
        for (const value of coordinates(part)) {
          expect(Number.isFinite(value), `${ch}: ${value}`).toBe(true);
        }
      }
    }
  });

  it('reading any glyph twice returns identical data', () => {
    fc.assert(
      fc.property(fc.constantFrom(...Object.keys(latinGlyphs)), (ch) => {
        return glyphFor(latinGlyphSet, ch) === glyphFor(latinGlyphSet, ch);
      }),
    );
  });

  it('an unknown character falls back to the notdef', () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        for (const ch of text) {
          const found = glyphFor(latinGlyphSet, ch);
          if (latinGlyphs[ch] === undefined && found !== latinGlyphs[NOTDEF]) return false;
        }
        return true;
      }),
    );
  });

  it('the letters that sit on the baseline declare a point at y zero', () => {
    const onBaseline = ['l', 'i', 'n', 'm', 'h', 'k', 'x', 'z', 'E', 'F', 'H', 'I', 'L', 'T'];
    for (const ch of onBaseline) {
      const glyph = latinGlyphs[ch] as GlyphSkeleton;
      const touches = glyph.parts.some(
        (part) =>
          part.kind === 'stroke' && part.segments.some((s) => s.kind === 'point' && s.y === 0),
      );
      expect(touches, `${ch} should touch the baseline`).toBe(true);
    }
  });

  it('only the glyphs that deliberately descend go below the baseline', () => {
    const descending = new Set(['g', 'j', 'p', 'q', 'y', ',', 'Q']);

    const arcLowest = (cy: number, ry: number, a0: number, a1: number): number => {
      const steps = 64;
      let lowest = Number.POSITIVE_INFINITY;
      for (let i = 0; i <= steps; i++) {
        const angle = ((a0 + ((a1 - a0) * i) / steps) * Math.PI) / 180;
        lowest = Math.min(lowest, cy + ry * Math.sin(angle));
      }
      return lowest;
    };

    for (const [ch, glyph] of Object.entries(latinGlyphs)) {
      const lowest = Math.min(
        ...glyph.parts.flatMap((part) => {
          if (part.kind === 'stroke') {
            return part.segments.map((s) =>
              s.kind === 'point' ? s.y : arcLowest(s.cy, s.ry, s.a0, s.a1),
            );
          }
          if (part.kind === 'bowl') return [part.cy - part.ry];
          return [part.y - part.r];
        }),
      );
      if (lowest < -0.5) {
        expect(descending.has(ch), `${ch} dips to ${lowest} but is not listed as descending`).toBe(
          true,
        );
      }
    }

    for (const ch of descending) {
      expect(latinGlyphs[ch], `${ch} should exist`).toBeDefined();
    }
  });
});
