import { describe, expect, it } from 'vitest';
import { groupNode, pathNode, type Scene, type Vec2 } from '@trefoil/core';
import { cleanPass, cleanPathNode, cleanScene, polygonClippingEngine, type BooleanEngine } from '../src/index.js';

const OUTER: Vec2[] = [
  [0, 0],
  [30, 0],
  [30, 30],
  [0, 30],
];

const COUNTER: Vec2[] = [
  [10, 10],
  [20, 10],
  [20, 20],
  [10, 20],
];

function sceneOf(): Scene {
  return {
    viewBox: [0, 0, 100, 100],
    root: groupNode(
      [
        groupNode(
          [pathNode([OUTER, COUNTER], { fill: '#123456', opacity: 0.4, fillRule: 'evenodd' })],
          { translate: [5, 6], scale: [1, -1] },
          { character: 'o', index: 0 },
        ),
      ],
      { scale: [1, -1] },
    ),
  };
}

describe('cleaning a path node', () => {
  it('carries fitted curves and a non-zero fill rule', () => {
    const node = cleanPathNode(
      pathNode([OUTER, COUNTER], { fill: '#000', opacity: 1, fillRule: 'evenodd' }),
    );
    expect(node.style.fillRule).toBe('nonzero');
    expect(node.curves).toHaveLength(2);
    expect(node.curves?.[0]?.[0]?.kind).toBe('move');
  });

  it('keeps the polylines, so measuring is unchanged', () => {
    const before = pathNode([OUTER, COUNTER], { fill: '#000', opacity: 1 });
    expect(cleanPathNode(before).contours).toEqual(before.contours);
  });

  it('keeps the colour and the opacity', () => {
    const node = cleanPathNode(pathNode([OUTER], { fill: '#abcdef', opacity: 0.25 }));
    expect(node.style.fill).toBe('#abcdef');
    expect(node.style.opacity).toBe(0.25);
  });

  it('uses the engine it is given', () => {
    const empty: BooleanEngine = {
      id: 'empty',
      version: 1,
      label: 'Empty',
      params: [],
      evenOdd: () => [],
      union: () => [],
      difference: () => [],
    };
    expect(cleanPathNode(pathNode([OUTER], { fill: '#000', opacity: 1 }), { engine: empty }).curves)
      .toEqual([]);
  });

  it('uses the tolerance it is given', () => {
    const node = pathNode([OUTER, COUNTER], { fill: '#000', opacity: 1 });
    const loose = cleanPathNode(node, { tolerance: 5 }).curves ?? [];
    const tight = cleanPathNode(node, { tolerance: 0.01 }).curves ?? [];
    expect(loose.flat().length).toBeLessThanOrEqual(tight.flat().length);
  });
});

describe('cleaning a scene', () => {
  it('keeps every transform, every glyph marker and the viewBox', () => {
    const before = sceneOf();
    const after = cleanScene(before);

    expect(after.viewBox).toEqual(before.viewBox);
    expect(after.root.transform).toEqual(before.root.transform);

    const group = after.root.children[0];
    if (group?.kind !== 'group') throw new Error('expected a group');
    expect(group.transform).toEqual({ translate: [5, 6], scale: [1, -1] });
    expect(group.glyph).toEqual({ character: 'o', index: 0 });

    const path = group.children[0];
    if (path?.kind !== 'path') throw new Error('expected a path');
    expect(path.style.fill).toBe('#123456');
    expect(path.style.opacity).toBe(0.4);
    expect(path.style.fillRule).toBe('nonzero');
    expect(path.curves).toHaveLength(2);
  });

  it('leaves the scene it was given alone', () => {
    const before = sceneOf();
    const copy = structuredClone(before);
    cleanScene(before);
    expect(before).toEqual(copy);

    const group = before.root.children[0];
    if (group?.kind !== 'group') throw new Error('expected a group');
    const path = group.children[0];
    if (path?.kind !== 'path') throw new Error('expected a path');
    expect(path.style.fillRule).toBe('evenodd');
    expect(path.curves).toBeUndefined();
  });

  it('cleans a pass with the default engine when none is given', () => {
    expect(cleanPass([OUTER, COUNTER])).toEqual(polygonClippingEngine.evenOdd([OUTER, COUNTER]));
  });
});
