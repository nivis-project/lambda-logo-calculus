import { describe, expect, it } from 'vitest';
import {
  DEFAULT_STAGE_LIST,
  GRID,
  buildScene,
  computeNesting,
  createEndingRegistry,
  createPaletteRegistry,
  createStageRegistry,
  latinGlyphSet,
  modulate,
  trefoil,
  type GuideRule,
  type SceneInput,
} from '../src/index.js';

const DEG = Math.PI / 180;

function input(over: Partial<SceneInput> = {}): SceneInput {
  const A = 3;
  const fit = 0;
  const params = { A };
  const rotation = 24 * DEG;
  const { widthFactor, xHeight } = modulate(A, fit, GRID, true);

  return {
    lines: ['ab'],
    glyphs: latinGlyphSet,
    metrics: GRID,
    template: trefoil,
    templateParams: params,
    rotation,
    nesting: computeNesting({ template: trefoil, params, rotation, copies: 6, fit }),
    widthFactor,
    xHeight,
    stages: createStageRegistry(),
    stageList: DEFAULT_STAGE_LIST,
    ending: createEndingRegistry().get('round'),
    palette: createPaletteRegistry().get('Analogous'),
    alpha: 0.22,
    shapePen: true,
    joins: true,
    curvesOn: true,
    originX: 0,
    originY: 0,
    ...over,
  };
}

function rules(scene: { readonly guides?: readonly { kind: string }[] }): readonly GuideRule[] {
  return (scene.guides ?? []).filter((guide): guide is GuideRule => guide.kind === 'rule');
}

describe('a scene without guides', () => {
  it('carries none, so nothing has to be stripped out later', () => {
    expect(buildScene(input()).guides).toBeUndefined();
  });

  it('holds the same artwork as one with guides', () => {
    const plain = buildScene(input());
    const marked = buildScene(input({ guides: true }));
    expect(JSON.stringify(marked.root)).toBe(JSON.stringify(plain.root));
  });
});

describe('the guides describe the grid each line sits on', () => {
  const scene = buildScene(input({ lines: ['ab', 'cd'], guides: true }));

  it('gives every line four rules about its own baseline', () => {
    expect(rules(scene)).toHaveLength(8);

    const second = rules(scene).slice(4);
    for (const [index, rule] of second.entries()) {
      const first = rules(scene)[index];
      if (first === undefined) throw new Error('a rule went missing');
      expect(rule.y - first.y).toBeCloseTo(GRID.lineHeight, 9);
    }
  });

  it('labels only the first line, because the labels repeat', () => {
    expect(rules(scene).slice(0, 4).map((rule) => rule.label)).toEqual([
      'baseline',
      'x-height',
      'cap',
      'descender',
    ]);
    expect(rules(scene).slice(4).every((rule) => rule.label === undefined)).toBe(true);
  });

  it('draws the baseline solid and the rest dashed', () => {
    expect(rules(scene).map((rule) => rule.dashed)).toEqual([
      false, true, true, true, false, true, true, true,
    ]);
  });

  it('spans the scene it belongs to', () => {
    for (const rule of rules(scene)) {
      expect(rule.x0).toBe(0);
      expect(rule.x1).toBe(scene.viewBox[2]);
    }
  });
});

describe('a box around what each character takes', () => {
  it('boxes a drawn character and not a space', () => {
    const scene = buildScene(input({ lines: ['a b'], guides: true }));
    const boxes = (scene.guides ?? []).filter((guide) => guide.kind === 'box');
    expect(boxes).toHaveLength(2);

    const [first, second] = boxes;
    if (first?.kind !== 'box' || second?.kind !== 'box') throw new Error('expected two boxes');

    expect(first.x).toBe(0);
    expect(second.x).toBeGreaterThan(first.x + first.width);
    expect(first.height).toBeCloseTo(GRID.capHeight - GRID.descender, 9);
  });
});

describe('the x-height rule follows the modulated x-height', () => {
  it('moves with the fit size while the other three stay put', () => {
    const open = modulate(3, 0, GRID, true);
    const tight = modulate(3, -0.8, GRID, true);
    expect(open.xHeight).not.toBeCloseTo(tight.xHeight, 6);

    const a = rules(buildScene(input({ guides: true, xHeight: open.xHeight })));
    const b = rules(buildScene(input({ guides: true, xHeight: tight.xHeight })));

    expect(a[1]?.y).not.toBeCloseTo(b[1]?.y ?? 0, 6);
    expect(a[0]?.y).toBeCloseTo(b[0]?.y ?? 0, 9);
    expect(a[2]?.y).toBeCloseTo(b[2]?.y ?? 0, 9);
    expect(a[3]?.y).toBeCloseTo(b[3]?.y ?? 0, 9);
  });
});
