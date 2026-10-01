import { describe, expect, it } from 'vitest';
import {
  DRAFT_QUALITY,
  FULL_QUALITY,
  GRID,
  NOTDEF,
  buildScene,
  computeNesting,
  createGlyphCache,
  createPaletteRegistry,
  createStageRegistry,
  loopJoin,
  roundEnding,
  slabEnding,
  type GlyphSet,
  type GlyphSkeleton,
  type GroupNode,
  type Scene,
  type SceneInput,
  type ShapeTemplate,
} from '../src/index.js';

const TEMPLATE: ShapeTemplate = {
  id: 'blob',
  version: 1,
  label: 'Blob',
  params: [],
  kind: 'polar',
  symmetry: 3,
  safety: { minPerfectFit: 0.05, maxEffectiveScale: 4, maxCopyScale: 4 },
  radius: (theta) => 1 + 0.25 * Math.cos(3 * theta),
  maxRadius: () => 1.25,
};

function glyph(advance: number): GlyphSkeleton {
  return {
    advance,
    parts: [
      {
        kind: 'stroke',
        segments: [
          { kind: 'point', x: 4, y: 0 },
          { kind: 'point', x: 4, y: 56 },
          { kind: 'point', x: 30, y: 56 },
        ],
      },
      { kind: 'dot', x: 20, y: 20, r: 6 },
    ],
  };
}

const SET: GlyphSet = {
  id: 'tiny',
  version: 1,
  label: 'Tiny',
  params: [],
  metrics: GRID,
  glyphs: { [NOTDEF]: glyph(40), a: glyph(48), b: glyph(44), i: glyph(16) },
};

function input(over: Partial<SceneInput> = {}): SceneInput {
  const nesting = computeNesting({
    template: TEMPLATE,
    params: {},
    rotation: 0.4,
    copies: 3,
    fit: 0,
    ...(over.quality === undefined ? {} : { quality: over.quality }),
  });

  return {
    text: 'ab ia',
    glyphs: SET,
    metrics: GRID,
    template: TEMPLATE,
    templateParams: {},
    rotation: 0.4,
    nesting,
    modulation: { widthFactor: 1, xHeight: 56 },
    stages: createStageRegistry(),
    ending: roundEnding,
    join: loopJoin,
    palette: createPaletteRegistry().get('analogous'),
    alpha: 0.22,
    shapePen: true,
    ...over,
  };
}

function glyphGroups(scene: Scene): readonly GroupNode[] {
  return scene.root.children.filter(
    (node): node is GroupNode => node.kind === 'group' && node.glyph !== undefined,
  );
}

describe('building a scene', () => {
  it('draws one group per non-space character, marked and in order', () => {
    const scene = buildScene(input());
    expect(glyphGroups(scene).map((group) => group.glyph?.character).join('')).toBe('abia');
    expect(glyphGroups(scene).map((group) => group.glyph?.index)).toEqual([0, 1, 3, 4]);
  });

  it('draws one pass per copy, in the palette colours', () => {
    const scene = buildScene(input());
    const first = glyphGroups(scene)[0];
    expect(first?.children).toHaveLength(3);
    const fills = new Set(
      (first?.children ?? []).map((pass) => (pass.kind === 'path' ? pass.style.fill : '')),
    );
    expect(fills.size).toBe(3);
  });

  it('gives the scene a viewBox wide enough for the text', () => {
    const scene = buildScene(input());
    expect(scene.viewBox[2]).toBeGreaterThan(150);
    expect(scene.viewBox[3]).toBe(
      GRID.capHeight + GRID.strokeWidth - (GRID.descender - GRID.strokeWidth),
    );
  });

  it('uses a round pen when it is told not to use the shape', () => {
    const shaped = JSON.stringify(buildScene(input()));
    const round = JSON.stringify(buildScene(input({ shapePen: false })));
    expect(round).not.toBe(shaped);
  });

  it('draws without a join when none is given', () => {
    expect(() => buildScene(input({ join: undefined }))).not.toThrow();
  });

  it('falls back to notdef for a character the set does not hold', () => {
    const scene = buildScene(input({ text: 'z' }));
    expect(glyphGroups(scene)).toHaveLength(1);
  });

  it('is identical at full quality and with no quality given', () => {
    expect(JSON.stringify(buildScene(input({ quality: FULL_QUALITY })))).toBe(
      JSON.stringify(buildScene(input())),
    );
  });

  it('is coarser at draft quality', () => {
    const draft = JSON.stringify(buildScene(input({ quality: DRAFT_QUALITY })));
    const full = JSON.stringify(buildScene(input({ quality: FULL_QUALITY })));
    expect(draft).not.toBe(full);
    expect(draft.length).toBeLessThan(full.length);
  });
});

describe('the glyph cache', () => {
  it('hits on a colour change and misses on a geometry change', () => {
    const cache = createGlyphCache();
    buildScene(input({ cache }));
    const after = cache.misses;
    expect(after).toBeGreaterThan(0);

    buildScene(input({ cache, alpha: 0.9 }));
    expect(cache.misses).toBe(after);

    buildScene(input({ cache, rotation: 0.9 }));
    expect(cache.misses).toBeGreaterThan(after);
  });

  it('draws the same geometry cached or not', () => {
    const cache = createGlyphCache();
    const first = JSON.stringify(buildScene(input({ cache })));
    expect(JSON.stringify(buildScene(input({ cache })))).toBe(first);
    expect(JSON.stringify(buildScene(input()))).toBe(first);
  });

  it('keys a patched glyph apart from an unpatched one', () => {
    const cache = createGlyphCache();
    buildScene(input({ cache }));
    const after = cache.misses;
    buildScene(input({ cache, patches: { a: { offset: [5, 0] } } }));
    expect(cache.misses).toBeGreaterThan(after);
  });
});

describe('per-glyph overrides in the scene', () => {
  it('moves a patched glyph and leaves the rest', () => {
    const plain = buildScene(input());
    const moved = buildScene(input({ patches: { a: { offset: [7, 0] } } }));
    expect(JSON.stringify(glyphGroups(moved)[1])).toBe(JSON.stringify(glyphGroups(plain)[1]));
    expect(JSON.stringify(glyphGroups(moved)[0])).not.toBe(JSON.stringify(glyphGroups(plain)[0]));
  });

  it('uses an overriding ending for one glyph only', () => {
    const plain = buildScene(input());
    const slabbed = buildScene(
      input({
        patches: { a: { endingId: 'slab' } },
        endingFor: (id) => (id === 'slab' ? slabEnding : undefined),
      }),
    );
    expect(JSON.stringify(glyphGroups(slabbed)[0])).not.toBe(JSON.stringify(glyphGroups(plain)[0]));
    expect(JSON.stringify(glyphGroups(slabbed)[1])).toBe(JSON.stringify(glyphGroups(plain)[1]));
  });

  it('falls back to the given ending when the override names nothing', () => {
    const plain = buildScene(input());
    const unknown = buildScene(input({ patches: { a: { endingId: 'nope' } } }));
    expect(JSON.stringify(unknown)).toBe(JSON.stringify(plain));
  });

  it('widens the gap a spacing pair names', () => {
    const plain = buildScene(input());
    const spaced = buildScene(input({ pairs: [{ before: 'a', after: 'b', extra: 20 }] }));
    expect(spaced.viewBox[2]).toBeCloseTo(plain.viewBox[2] + 20, 9);
  });
});

describe('per-glyph modulation', () => {
  it('asks for the values of each glyph in turn', () => {
    const asked: number[] = [];
    buildScene(
      input({
        modulationFor: (charIndex, charCount) => {
          asked.push(charIndex);
          return { widthFactor: 1 + charIndex * 0.05, xHeight: 56 - charCount };
        },
      }),
    );
    expect(asked.length).toBeGreaterThanOrEqual(4);
    expect(new Set(asked)).toEqual(new Set([0, 1, 2, 3]));
  });

  it('passes stage parameters through', () => {
    const plain = JSON.stringify(buildScene(input()));
    const bent = JSON.stringify(
      buildScene(
        input({
          modulationFor: () => ({
            widthFactor: 1,
            xHeight: 56,
            stageParams: { bend: { factor: 0.6 } },
          }),
        }),
      ),
    );
    expect(bent).not.toBe(plain);
  });
});
