import { describe, expect, it } from 'vitest';
import { groupNode, pathNode, type Contour, type Scene } from '@trefoil/core';
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

describe('rounding happens where the viewer looks', () => {
  const ring: Contour = [
    [0.123456, 0.987654],
    [-0.654321, 0.111111],
    [0.5, -0.5],
  ];

  function pathOf(scale: number): string {
    const scaled: Scene = {
      viewBox: [0, 0, 100, 100],
      root: groupNode([pathNode([ring], { fill: '#000', opacity: 1 })], {
        scale: [scale, scale],
      }),
    };
    const match = / d="([^"]+)"/.exec(sceneToSvg(scaled));
    if (match?.[1] === undefined) throw new Error('no path was rendered');
    return match[1];
  }

  it('leaves a path at scale 1 exactly as it was', () => {
    expect(pathOf(1)).toBe('M0.12 0.99L-0.65 0.11L0.50 -0.50Z');
  });

  it('leaves a mirrored path alone, because a mirror is not a magnifier', () => {
    const mirrored: Scene = {
      viewBox: [0, 0, 100, 100],
      root: groupNode([pathNode([ring], { fill: '#000', opacity: 1 })], { scale: [1, -1] }),
    };
    expect(sceneToSvg(mirrored)).toContain('M0.12 0.99');
  });

  it('buys back the decimals a scale costs', () => {
    expect(pathOf(400)).toBe('M0.12346 0.98765L-0.65432 0.11111L0.50000 -0.50000Z');
    expect(pathOf(10)).toBe('M0.123 0.988L-0.654 0.111L0.500 -0.500Z');
  });

  it('keeps the error in root space inside the bound it has at scale 1', () => {
    const bound = 0.5 * 10 ** -2;

    for (const scale of [1, 7, 120, 950]) {
      const numbers = [...pathOf(scale).matchAll(/-?\d+\.\d+/g)].map((m) => Number(m[0]));
      const wanted = ring.flat();

      for (const [index, value] of numbers.entries()) {
        const want = wanted[index];
        if (want === undefined) throw new Error('a coordinate went missing');
        expect(Math.abs(value - want) * scale).toBeLessThanOrEqual(bound + 1e-12);
      }
    }
  });
});
