import { describe, expect, it } from 'vitest';
import { groupNode, pathNode, type Scene } from '@trefoil/core';
import {
  RENDER_SVG_PACKAGE_VERSION,
  contourToPathData,
  pathData,
  sceneToSvg,
  transformToAttribute,
} from '../src/index.js';

const scene: Scene = {
  viewBox: [0, -86, 200, 114],
  root: groupNode([
    groupNode(
      [
        pathNode([[[0, 0], [10, 0], [10, 10]], [[2, 2], [4, 2], [4, 4]]], {
          fill: 'hsl(287 70% 50%)',
          opacity: 0.53,
          fillRule: 'evenodd',
        }),
      ],
      { translate: [9, 0], scale: [1, -1] },
    ),
  ]),
};

describe('rendering a scene', () => {
  it('has a version', () => {
    expect(RENDER_SVG_PACKAGE_VERSION).toBe(0);
  });

  it('writes a contour as a closed path', () => {
    expect(contourToPathData([[0, 0], [10, 0], [10, 10]])).toBe('M0.00 0.00L10.00 0.00L10.00 10.00Z');
    expect(contourToPathData([])).toBe('');
  });

  it('writes every contour of a path into one d', () => {
    const node = scene.root.children[0];
    if (node?.kind !== 'group') throw new Error('expected a group');
    const path = node.children[0];
    if (path?.kind !== 'path') throw new Error('expected a path');
    expect(pathData(path).match(/Z/g)).toHaveLength(2);
  });

  it('writes a transform in the order it was given', () => {
    expect(transformToAttribute({ translate: [9, 0], scale: [1, -1] })).toBe(
      'translate(9 0) scale(1 -1)',
    );
    expect(transformToAttribute({ rotate: 24 })).toBe('rotate(24)');
    expect(transformToAttribute({})).toBe('');
  });

  it('gives the same output for the same scene, every time', () => {
    expect(sceneToSvg(scene)).toBe(sceneToSvg(scene));
  });

  it('takes its ids from where a node sits, not from the scene', () => {
    const svg = sceneToSvg(scene);
    expect(svg).toContain('id="root"');
    expect(svg).toContain('id="root-0"');
    expect(svg).toContain('id="root-0-0"');
    expect(JSON.stringify(scene)).not.toContain('id');
  });

  it('carries the viewBox, the fill, the opacity and the fill rule', () => {
    const svg = sceneToSvg(scene);
    expect(svg).toContain('viewBox="0.00 -86.00 200.00 114.00"');
    expect(svg).toContain('fill="hsl(287 70% 50%)"');
    expect(svg).toContain('opacity="0.53"');
    expect(svg).toContain('fill-rule="evenodd"');
  });

  it('writes no mask, clip path or filter', () => {
    expect(sceneToSvg(scene)).not.toMatch(/<mask|clipPath|clip-path|<filter/);
  });

  it('leaves the scene alone', () => {
    const before = JSON.stringify(scene);
    sceneToSvg(scene);
    expect(JSON.stringify(scene)).toBe(before);
  });
});

describe('opacity on a group', () => {
  it('composites the children first, then makes the result transparent', () => {
    const pass: Scene = {
      viewBox: [0, 0, 100, 100],
      root: groupNode([
        groupNode(
          [
            pathNode([[[0, 0], [10, 0], [10, 10]]], { fill: '#000', opacity: 1 }),
            pathNode([[[5, 5], [15, 5], [15, 15]]], { fill: '#000', opacity: 1 }),
          ],
          undefined,
          { opacity: 0.53 },
        ),
      ]),
    };

    const svg = sceneToSvg(pass);
    expect(svg).toContain('<g id="root-0" opacity="0.53">');
    // The paths carry none, so their overlap does not blend twice.
    expect(svg.match(/<path[^>]*opacity=/g)).toBeNull();
  });

  it('writes a group fill when there is one, and nothing when there is not', () => {
    const filled = groupNode([], undefined, { fill: 'hsl(1 2% 3%)' });
    expect(sceneToSvg({ viewBox: [0, 0, 1, 1], root: groupNode([filled]) })).toContain(
      'fill="hsl(1 2% 3%)"',
    );
    expect(sceneToSvg(scene)).not.toMatch(/<g[^>]*fill=/);
  });
});
