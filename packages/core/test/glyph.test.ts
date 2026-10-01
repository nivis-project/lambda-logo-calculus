import { describe, expect, it } from 'vitest';
import {
  GRID,
  GlyphError,
  NOTDEF,
  createGlyphSetRegistry,
  glyphFor,
  validateGlyph,
  type GlyphSet,
  type GlyphSkeleton,
} from '../src/index.js';

const line: GlyphSkeleton = {
  advance: 14,
  parts: [
    {
      kind: 'stroke',
      segments: [
        { kind: 'point', x: 7, y: 0 },
        { kind: 'point', x: 7, y: 86 },
      ],
    },
  ],
};

function withoutNotdef(
  glyphs: Readonly<Record<string, GlyphSkeleton>>,
): Record<string, GlyphSkeleton> {
  return Object.fromEntries(Object.entries(glyphs).filter(([ch]) => ch !== NOTDEF));
}

const box: GlyphSkeleton = {
  advance: 40,
  parts: [{ kind: 'bowl', cx: 20, cy: 28, rx: 20, ry: 28, cuts: [] }],
};

function setOf(glyphs: Record<string, GlyphSkeleton>): GlyphSet {
  return {
    id: 'test-set',
    version: 1,
    label: 'Test set',
    params: [],
    metrics: GRID,
    glyphs: { [NOTDEF]: box, ...glyphs },
  };
}

describe('the grid', () => {
  it('matches the prototype', () => {
    expect(GRID).toEqual({
      strokeWidth: 10,
      xHeight: 56,
      capHeight: 86,
      descender: -28,
      sideBearing: 9,
      trim: 8,
      dotRadius: 7,
      wordSpace: 28,
      lineHeight: 150,
    });
  });
});

describe('skeleton validation', () => {
  it('accepts a stroke, a bowl and a dot', () => {
    expect(() => {
      validateGlyph('l', line);
    }).not.toThrow();
    expect(() => {
      validateGlyph('o', box);
    }).not.toThrow();
    expect(() => {
      validateGlyph('.', { advance: 14, parts: [{ kind: 'dot', x: 7, y: 7, r: 7 }] });
    }).not.toThrow();
  });

  it('rejects an advance width that is not above zero', () => {
    expect(() => {
      validateGlyph('x', { ...line, advance: 0 });
    }).toThrow(/advance width 0 is not above zero/);
  });

  it('rejects a glyph with no parts', () => {
    expect(() => {
      validateGlyph('x', { advance: 10, parts: [] });
    }).toThrow(/has no parts/);
  });

  it('accepts a stroke that is a single arc, because an arc is two nodes', () => {
    expect(() => {
      validateGlyph('r', {
        advance: 36,
        parts: [
          { kind: 'stroke', segments: [{ kind: 'arc', cx: 24, cy: 34, rx: 19, ry: 22, a0: 180, a1: 60 }] },
        ],
      });
    }).not.toThrow();
  });

  it('rejects a stroke that yields fewer than two nodes', () => {
    expect(() => {
      validateGlyph('x', {
        advance: 10,
        parts: [{ kind: 'stroke', segments: [{ kind: 'point', x: 0, y: 0 }] }],
      });
    }).toThrow(/stroke 0 yields 1 node\(s\); a stroke needs at least 2/);
  });

  it('rejects a non-finite coordinate', () => {
    expect(() => {
      validateGlyph('x', {
        advance: 10,
        parts: [
          {
            kind: 'stroke',
            segments: [
              { kind: 'point', x: Number.NaN, y: 0 },
              { kind: 'point', x: 1, y: 1 },
            ],
          },
        ],
      });
    }).toThrow(/segment 0 has a non-finite coordinate/);
  });

  it('rejects a bowl with a non-positive radius, naming both radii', () => {
    expect(() => {
      validateGlyph('o', { advance: 40, parts: [{ ...box.parts[0], rx: -20 } as never] });
    }).toThrow(/bowl 0 has a non-positive radius \(-20, 28\)/);
  });

  it('rejects a dot with a non-positive radius', () => {
    expect(() => {
      validateGlyph('.', { advance: 14, parts: [{ kind: 'dot', x: 7, y: 7, r: 0 }] });
    }).toThrow(/dot 0 has a non-positive radius \(0\)/);
  });

  it('rejects an arc with a non-positive radius and one that spans nothing', () => {
    const arcGlyph = (rx: number, a0: number, a1: number): GlyphSkeleton => ({
      advance: 40,
      parts: [
        {
          kind: 'stroke',
          segments: [
            { kind: 'point', x: 0, y: 0 },
            { kind: 'arc', cx: 10, cy: 10, rx, ry: 5, a0, a1 },
          ],
        },
      ],
    });
    expect(() => {
      validateGlyph('c', arcGlyph(0, 0, 90));
    }).toThrow(/arc at segment 1 has a non-positive radius/);
    expect(() => {
      validateGlyph('c', arcGlyph(5, 90, 90));
    }).toThrow(/arc at segment 1 spans no angle/);
  });

  it('rejects a cut region with no positive extent', () => {
    expect(() => {
      validateGlyph('c', {
        advance: 40,
        parts: [
          { kind: 'bowl', cx: 20, cy: 28, rx: 20, ry: 28, cuts: [{ x0: 5, y0: 5, x1: 5, y1: 9 }] },
        ],
      });
    }).toThrow(/cut region 0 of bowl 0 is not a rectangle with positive extent/);
  });

  it('names the character on every rejection', () => {
    try {
      validateGlyph('q', { ...line, advance: -1 });
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(GlyphError);
      expect((error as GlyphError).character).toBe('q');
    }
  });
});

describe('the glyph set registry', () => {
  it('registers a valid set', () => {
    const r = createGlyphSetRegistry();
    r.register(setOf({ l: line }));
    expect(r.get('test-set').glyphs['l']).toBe(line);
  });

  it('rejects a set with a bowl of negative radius, naming the character', () => {
    const r = createGlyphSetRegistry();
    expect(() => {
      r.register(setOf({ o: { advance: 40, parts: [{ ...box.parts[0], rx: -5 } as never] } }));
    }).toThrow(/glyph "o".*non-positive radius/s);
  });

  it('rejects a set with a one-segment stroke, naming the character', () => {
    const r = createGlyphSetRegistry();
    expect(() => {
      r.register(
        setOf({
          i: { advance: 14, parts: [{ kind: 'stroke', segments: [{ kind: 'point', x: 0, y: 0 }] }] },
        }),
      );
    }).toThrow(/glyph "i".*at least 2/s);
  });

  it('rejects a set with no notdef glyph', () => {
    const r = createGlyphSetRegistry();
    const rest = withoutNotdef(setOf({ l: line }).glyphs);
    expect(() => {
      r.register({ ...setOf({}), glyphs: rest });
    }).toThrow(/defines no notdef glyph/);
  });
});

describe('the notdef fallback', () => {
  const set = setOf({ a: line });

  it('returns the notdef for a character the set does not have', () => {
    expect(glyphFor(set, 'ß')).toBe(box);
    expect(glyphFor(set, '☃')).toBe(box);
  });

  it('returns the real glyph for a character the set does have', () => {
    expect(glyphFor(set, 'a')).toBe(line);
    expect(glyphFor(set, 'a')).not.toBe(box);
  });

  it('throws only when the set itself has no notdef', () => {
    const rest = withoutNotdef(set.glyphs);
    expect(() => glyphFor({ ...set, glyphs: rest }, 'z')).toThrow(/defines no notdef glyph/);
  });
});
