import { describe, expect, it } from 'vitest';
import {
  DEFAULT_STAGE_LIST,
  GRID,
  allContours,
  buildScene,
  computeNesting,
  countNodes,
  createPaletteRegistry,
  createStageRegistry,
  groupNode,
  latinGlyphSet,
  pathNode,
  roundEnding,
  trefoil,
  type Scene,
  type SceneInput,
} from '../src/index.js';

const DEG = Math.PI / 180;

function input(over: Partial<SceneInput> = {}): SceneInput {
  const params = { A: 3 };
  const rotation = 24 * DEG;
  return {
    lines: ['no'],
    glyphs: latinGlyphSet,
    metrics: GRID,
    template: trefoil,
    templateParams: params,
    rotation,
    nesting: computeNesting({ template: trefoil, params, rotation, copies: 3, fit: 0 }),
    widthFactor: 1,
    xHeight: GRID.xHeight,
    stages: createStageRegistry(),
    stageList: DEFAULT_STAGE_LIST,
    ending: roundEnding,
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

describe('a scene', () => {
  it('is plain data that round-trips through JSON', () => {
    const scene = buildScene(input());
    expect(JSON.parse(JSON.stringify(scene)) as Scene).toEqual(scene);
  });

  it('holds no function and no handle to the pipeline', () => {
    const scene = buildScene(input());
    const walk = (value: unknown): void => {
      expect(typeof value).not.toBe('function');
      if (Array.isArray(value)) value.forEach(walk);
      else if (value !== null && typeof value === 'object') Object.values(value).forEach(walk);
    };
    walk(scene);
  });

  it('holds no mask, clip path or filter', () => {
    const text = JSON.stringify(buildScene(input()));
    expect(text).not.toMatch(/mask|clipPath|clip-path|filter/i);
  });

  it('draws a counter as a contour with the even-odd rule', () => {
    const scene = buildScene(input({ lines: ['o'] }));
    const group = scene.root.children[0];
    if (group?.kind !== 'group') throw new Error('expected a glyph group');
    const pass = group.children[0];
    if (pass?.kind !== 'path') throw new Error('expected a pass');
    expect(pass.style.fillRule).toBe('evenodd');
    expect(pass.contours.length).toBeGreaterThan(1);
  });

  it('gives one group per glyph and one pass per copy', () => {
    const scene = buildScene(input({ lines: ['no'] }));
    expect(scene.root.children).toHaveLength(2);
    for (const group of scene.root.children) {
      if (group.kind !== 'group') throw new Error('expected a group');
      expect(group.children).toHaveLength(3);
      expect(group.transform?.scale).toEqual([1, -1]);
    }
  });

  it('skips a space but still advances past it', () => {
    const withSpace = buildScene(input({ lines: ['n o'] }));
    expect(withSpace.root.children).toHaveLength(2);

    const second = withSpace.root.children[1];
    const tight = buildScene(input({ lines: ['no'] })).root.children[1];
    if (second?.kind !== 'group' || tight?.kind !== 'group') throw new Error('expected groups');
    expect(second.transform?.translate?.[0]).toBeGreaterThan(tight.transform?.translate?.[0] ?? 0);
  });

  it('colours each pass from the palette', () => {
    const scene = buildScene(input());
    const group = scene.root.children[0];
    if (group?.kind !== 'group') throw new Error('expected a group');
    const fills = group.children.map((pass) => (pass.kind === 'path' ? pass.style.fill : ''));
    expect(new Set(fills).size).toBe(3);
  });

  it('puts a second line a line height below the first', () => {
    const scene = buildScene(input({ lines: ['n', 'n'] }));
    const [first, second] = scene.root.children;
    if (first?.kind !== 'group' || second?.kind !== 'group') throw new Error('expected groups');
    expect((second.transform?.translate?.[1] ?? 0) - (first.transform?.translate?.[1] ?? 0)).toBe(
      GRID.lineHeight,
    );
  });

  it('counts its nodes and collects its contours', () => {
    const scene = buildScene(input());
    expect(countNodes(scene.root)).toBeGreaterThan(3);
    expect(allContours(scene.root).length).toBeGreaterThan(0);
  });
});

describe('scene nodes', () => {
  it('leave the transform off when there is none', () => {
    expect(groupNode([])).toEqual({ kind: 'group', children: [] });
    expect(groupNode([], { rotate: 10 }).transform).toEqual({ rotate: 10 });
  });

  it('carry their style', () => {
    const node = pathNode([[[0, 0], [1, 0], [1, 1]]], { fill: '#000', opacity: 0.5 });
    expect(node.kind).toBe('path');
    expect(node.style.opacity).toBe(0.5);
  });
});
