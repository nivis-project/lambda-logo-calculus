import { describe, expect, it } from 'vitest';
import {
  RENDER_SVG_PACKAGE_VERSION,
  TEXT_FONT,
  contourToPathData,
  createSvgRenderer,
  pathData,
  transformToAttribute,
  viewBoxForEm,
} from '../src/index.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const handBuiltScene = {
  viewBox: [0, -38, 200, 162] as const,
  root: {
    kind: 'group' as const,
    transform: { translate: [9, 0] as const },
    children: [
      {
        kind: 'path' as const,
        contours: [
          [
            [0, 0],
            [10, 0],
            [10, 10],
          ] as const,
        ],
        style: { fill: 'hsl(322 70% 50%)', opacity: 0.5, fillRule: 'evenodd' as const },
      },
      {
        kind: 'group' as const,
        children: [
          {
            kind: 'path' as const,
            contours: [
              [
                [20, 0],
                [30, 0],
                [30, 10],
              ] as const,
            ],
            style: { fill: '#112233', opacity: 1 },
          },
        ],
      },
    ],
  },
};

function host(): Element {
  const element = document.createElement('div');
  document.body.append(element);
  return element;
}

describe('render-svg package', () => {
  it('declares its version', () => {
    expect(RENDER_SVG_PACKAGE_VERSION).toBe(0);
  });

  it('scales a one by one em box to font units', () => {
    expect(viewBoxForEm(1, 1)).toBe('0 0 1000 1000');
  });
});

describe('path data', () => {
  it('writes a closed path from a contour', () => {
    expect(
      contourToPathData([
        [0, 0],
        [10, 0],
      ]),
    ).toBe('M0.000 0.000L10.000 0.000Z');
  });

  it('writes nothing for an empty contour', () => {
    expect(contourToPathData([])).toBe('');
  });

  it('concatenates every contour of a node', () => {
    const data = pathData({
      kind: 'path',
      contours: [
        [
          [0, 0],
          [1, 0],
        ],
        [
          [2, 0],
          [3, 0],
        ],
      ],
      style: { fill: 'red', opacity: 1 },
    });
    expect(data.match(/M/g)).toHaveLength(2);
  });
});

describe('transforms', () => {
  it('writes translate, rotate and scale in order', () => {
    expect(transformToAttribute({ translate: [1, 2], rotate: 30, scale: [2, 3] })).toBe(
      'translate(1 2) rotate(30) scale(2 3)',
    );
  });

  it('writes nothing for an empty transform', () => {
    expect(transformToAttribute({})).toBe('');
  });
});

describe('the SVG renderer', () => {
  it('renders a scene built entirely by hand', () => {
    const element = host();
    const renderer = createSvgRenderer();
    renderer.mount(element);
    renderer.draw(handBuiltScene);

    const svg = element.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.namespaceURI).toBe(SVG_NS);
    expect(svg?.getAttribute('viewBox')).toBe('0 -38 200 162');
    expect(element.querySelectorAll('path')).toHaveLength(2);
    expect(element.querySelectorAll('g')).toHaveLength(2);
  });

  it('carries the style onto each path', () => {
    const element = host();
    const renderer = createSvgRenderer();
    renderer.mount(element);
    renderer.draw(handBuiltScene);

    const first = element.querySelectorAll('path')[0];
    expect(first?.getAttribute('fill')).toBe('hsl(322 70% 50%)');
    expect(first?.getAttribute('opacity')).toBe('0.5');
    expect(first?.getAttribute('fill-rule')).toBe('evenodd');

    const second = element.querySelectorAll('path')[1];
    expect(second?.getAttribute('fill')).toBe('#112233');
    expect(second?.hasAttribute('fill-rule')).toBe(false);
  });

  it('applies a group transform', () => {
    const element = host();
    const renderer = createSvgRenderer();
    renderer.mount(element);
    renderer.draw(handBuiltScene);
    expect(element.querySelector('g')?.getAttribute('transform')).toBe('translate(9 0)');
  });

  it('gives two renderer instances disjoint ids', () => {
    const a = host();
    const b = host();
    const first = createSvgRenderer();
    const second = createSvgRenderer();
    first.mount(a);
    second.mount(b);
    first.draw(handBuiltScene);
    second.draw(handBuiltScene);

    const ids = (root: Element): string[] =>
      Array.from(root.querySelectorAll('[id]'), (e) => e.getAttribute('id') ?? '');

    expect(first.idPrefix).not.toBe(second.idPrefix);
    expect(ids(a).some((id) => ids(b).includes(id))).toBe(false);
  });

  it('leaves no stale ids when it redraws', () => {
    const element = host();
    const renderer = createSvgRenderer();
    renderer.mount(element);
    renderer.draw(handBuiltScene);
    const before = element.innerHTML;
    renderer.draw(handBuiltScene);
    expect(element.querySelectorAll('svg')).toHaveLength(1);
    expect(element.innerHTML).toBe(before);
  });

  it('draws the same scene identically twice', () => {
    const element = host();
    const renderer = createSvgRenderer();
    renderer.mount(element);
    renderer.draw(handBuiltScene);
    const first = [...element.querySelectorAll('path')].map((p) => p.getAttribute('d'));
    renderer.draw(handBuiltScene);
    const second = [...element.querySelectorAll('path')].map((p) => p.getAttribute('d'));
    expect(second).toEqual(first);
  });

  it('refuses to draw before it is mounted', () => {
    expect(() => {
      createSvgRenderer().draw(handBuiltScene);
    }).toThrow(/has not been mounted/);
  });
});

describe('a path node carrying fitted curves', () => {
  const curved = {
    viewBox: [0, 0, 100, 100] as const,
    root: {
      kind: 'group' as const,
      children: [
        {
          kind: 'path' as const,
          contours: [
            [
              [0, 0],
              [10, 0],
              [10, 10],
            ] as const,
          ],
          curves: [
            [
              { kind: 'move' as const, to: [0, 0] as const },
              {
                kind: 'cubic' as const,
                c1: [3, 0] as const,
                c2: [10, 3] as const,
                to: [10, 10] as const,
              },
              { kind: 'close' as const },
            ],
          ],
          style: { fill: '#000', opacity: 1, fillRule: 'nonzero' as const },
        },
      ],
    },
  };

  it('draws the curves rather than the polylines', () => {
    expect(pathData(curved.root.children[0])).toBe('M0.000 0.000C3.000 0.000 10.000 3.000 10.000 10.000Z');
  });

  it('draws the polylines when there are no curves', () => {
    expect(pathData(handBuiltScene.root.children[0])).toBe(
      contourToPathData(handBuiltScene.root.children[0].contours[0]),
    );
  });

  it('puts the cubic in the rendered path data', () => {
    const element = host();
    const renderer = createSvgRenderer();
    renderer.mount(element);
    renderer.draw(curved);
    const drawn = element.querySelector('path')?.getAttribute('d') ?? '';
    expect(drawn).toContain('C');
    expect(element.querySelector('path')?.getAttribute('fill-rule')).toBe('nonzero');
  });
});

describe('text in a scene', () => {
  const withText = {
    viewBox: [0, 0, 200, 100] as const,
    root: {
      kind: 'group' as const,
      children: [{ kind: 'text' as const, at: [12, 40] as const, text: 'Palette', size: 18, fill: '#223344' }],
    },
  };

  it('draws it at its position, in its size and its fill', () => {
    const element = host();
    const renderer = createSvgRenderer();
    renderer.mount(element);
    renderer.draw(withText);

    const text = element.querySelector('text');
    expect(text?.getAttribute('x')).toBe('12');
    expect(text?.getAttribute('y')).toBe('40');
    expect(text?.getAttribute('font-size')).toBe('18');
    expect(text?.getAttribute('font-family')).toBe(TEXT_FONT);
    expect(text?.getAttribute('fill')).toBe('#223344');
    expect(text?.textContent).toBe('Palette');
  });
});
