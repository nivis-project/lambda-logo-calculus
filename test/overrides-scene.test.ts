import { describe, expect, it } from 'vitest';
import {
  GRID,
  buildScene,
  computeNesting,
  createGlyphSetRegistry,
  createPaletteRegistry,
  createStageRegistry,
  createTemplateRegistry,
  loopJoin,
  prototypeModulation,
  resolveParams,
  roundEnding,
  slabEnding,
  type GlyphPatches,
  type GroupNode,
  type Scene,
  type SceneNode,
  type SpacingPair,
} from '@trefoil/core';
import { builtInShapeTemplates, latinGlyphSet } from '@trefoil/templates';

const DEG = Math.PI / 180;
const TEXT = 'Tofu';

interface Options {
  readonly patches?: GlyphPatches;
  readonly pairs?: readonly SpacingPair[];
  readonly amplitude?: number;
  readonly text?: string;
}

function sceneWith(options: Options = {}): Scene {
  const templates = createTemplateRegistry();
  for (const template of builtInShapeTemplates) templates.register(template);

  const glyphSets = createGlyphSetRegistry();
  glyphSets.register(latinGlyphSet);

  const template = templates.get('trefoil');
  const amplitude = options.amplitude ?? 3;
  const { values } = resolveParams(template.params, { A: amplitude });
  const rotation = 24 * DEG;

  return buildScene({
    text: options.text ?? TEXT,
    glyphs: glyphSets.get('latin-basic'),
    metrics: GRID,
    template,
    templateParams: values,
    rotation,
    nesting: computeNesting({ template, params: values, rotation, copies: 2, fit: 0 }),
    modulation: prototypeModulation({ amplitude, fit: 0, metrics: GRID }),
    stages: createStageRegistry(),
    ending: roundEnding,
    join: loopJoin,
    palette: createPaletteRegistry().get('analogous'),
    alpha: 0.22,
    shapePen: true,
    patches: options.patches ?? {},
    pairs: options.pairs ?? [],
    endingFor: (id) => (id === 'slab' ? slabEnding : undefined),
  });
}

function glyphGroups(scene: Scene): readonly GroupNode[] {
  return scene.root.children.filter(
    (node): node is GroupNode => node.kind === 'group' && node.glyph !== undefined,
  );
}

function groupFor(scene: Scene, character: string): GroupNode {
  const found = glyphGroups(scene).find((group) => group.glyph?.character === character);
  if (found === undefined) throw new Error(`no group for "${character}"`);
  return found;
}

function translationOf(group: GroupNode): readonly [number, number] {
  return group.transform?.translate ?? [0, 0];
}

function pathsOf(node: SceneNode): readonly string[] {
  if (node.kind === 'path') {
    return [node.contours.map((c) => c.map(([x, y]) => `${x.toFixed(4)},${y.toFixed(4)}`).join(' ')).join('|')];
  }
  return node.children.flatMap(pathsOf);
}

describe('a patch in the scene', () => {
  it('carries the character and the index on every glyph group', () => {
    const marked = glyphGroups(sceneWith()).map((group) => [
      group.glyph?.character,
      group.glyph?.index,
    ]);
    expect(marked).toEqual([
      ['T', 0],
      ['o', 1],
      ['f', 2],
      ['u', 3],
    ]);
  });

  it('gives two of the same character the same character and different indices', () => {
    const scene = sceneWith({ text: 'Toot' });
    const repeated = glyphGroups(scene).filter((group) => group.glyph?.character === 'o');
    expect(repeated).toHaveLength(2);
    expect(repeated.map((group) => group.glyph?.index)).toEqual([1, 2]);

    const indices = glyphGroups(scene).map((group) => group.glyph?.index);
    expect(new Set(indices).size).toBe(indices.length);
  });

  it('renders identically when the patch is empty', () => {
    expect(pathsOf(sceneWith({ patches: { T: {} } }).root)).toEqual(pathsOf(sceneWith().root));
  });

  it('moves only its own glyph', () => {
    const plain = sceneWith();
    const moved = sceneWith({ patches: { T: { offset: [12, 0] } } });

    expect(pathsOf(groupFor(moved, 'T'))).not.toEqual(pathsOf(groupFor(plain, 'T')));
    for (const character of ['o', 'f', 'u']) {
      expect(pathsOf(groupFor(moved, character))).toEqual(pathsOf(groupFor(plain, character)));
      expect(translationOf(groupFor(moved, character))).toEqual(
        translationOf(groupFor(plain, character)),
      );
    }
  });

  it('still applies after a template parameter changes', () => {
    const plain = sceneWith({ amplitude: 9 });
    const moved = sceneWith({ amplitude: 9, patches: { T: { offset: [12, 0] } } });
    expect(pathsOf(groupFor(moved, 'T'))).not.toEqual(pathsOf(groupFor(plain, 'T')));
    expect(pathsOf(groupFor(moved, 'o'))).toEqual(pathsOf(groupFor(plain, 'o')));
  });

  it('scales about the glyph centre without moving the glyph after it', () => {
    const plain = sceneWith();
    const scaled = sceneWith({ patches: { T: { scale: 1.4 } } });
    expect(translationOf(groupFor(scaled, 'o'))).toEqual(translationOf(groupFor(plain, 'o')));
    expect(pathsOf(groupFor(scaled, 'T'))).not.toEqual(pathsOf(groupFor(plain, 'T')));
  });

  it('moves every glyph after an overridden advance by the difference', () => {
    const plain = sceneWith();
    const base = translationOf(groupFor(plain, 'o'))[0] - translationOf(groupFor(plain, 'T'))[0];
    const wider = sceneWith({ patches: { T: { advance: base + 25 } } });

    for (const character of ['o', 'f', 'u']) {
      expect(translationOf(groupFor(wider, character))[0]).toBeCloseTo(
        translationOf(groupFor(plain, character))[0] + 25,
        9,
      );
    }
    expect(translationOf(groupFor(wider, 'T'))).toEqual(translationOf(groupFor(plain, 'T')));
  });

  it('applies a spacing pair in its own order only', () => {
    const plain = sceneWith();
    const spaced = sceneWith({ pairs: [{ before: 'T', after: 'o', extra: 18 }] });
    const unused = sceneWith({ pairs: [{ before: 'o', after: 'T', extra: 18 }] });

    expect(translationOf(groupFor(spaced, 'o'))[0]).toBeCloseTo(
      translationOf(groupFor(plain, 'o'))[0] + 18,
      9,
    );
    expect(translationOf(groupFor(unused, 'o'))).toEqual(translationOf(groupFor(plain, 'o')));
  });

  it('applies an ending override to one glyph only', () => {
    const plain = sceneWith();
    const slabbed = sceneWith({ patches: { T: { endingId: 'slab' } } });

    expect(pathsOf(groupFor(slabbed, 'T'))).not.toEqual(pathsOf(groupFor(plain, 'T')));
    for (const character of ['o', 'f', 'u']) {
      expect(pathsOf(groupFor(slabbed, character))).toEqual(pathsOf(groupFor(plain, character)));
    }
  });
});
