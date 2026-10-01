import { describe, expect, it } from 'vitest';
import {
  allContours,
  boundsOfScene,
  countNodes,
  groupNode,
  pathNode,
  placeScene,
  textNode,
  type Scene,
  type SceneNode,
  type TextNode,
  type Vec2,
} from '@trefoil/core';
import {
  BUILT_IN_EXPORTERS,
  CLEAR_SPACE_FRACTION,
  SHEET_PAGE,
  brandSheetExporter,
  cleanScene,
  clearSpaceFrame,
  clearSpaceOf,
  composeSheet,
  createExporterRegistry,
  type SheetInput,
} from '../src/index.js';

function blob(x: number, y: number, width: number, height: number): Scene {
  const contour: Vec2[] = [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height],
  ];
  return {
    viewBox: [0, 0, 1000, 1000],
    root: groupNode([pathNode([contour], { fill: '#000', opacity: 1 })]),
  };
}

const COLORS = ['hsl(210 70% 50%)', 'hsl(240 70% 50%)', '#ff8800'];

function input(over: Partial<SheetInput> = {}): SheetInput {
  return {
    title: 'Trefoil Type',
    mark: blob(10, 10, 60, 60),
    side: blob(0, 0, 300, 70),
    stacked: blob(0, 0, 120, 160),
    colors: COLORS,
    ink: '#111111',
    paper: '#ffffff',
    ...over,
  };
}

function textsOf(node: SceneNode): readonly TextNode[] {
  if (node.kind === 'text') return [node];
  if (node.kind === 'path') return [];
  return node.children.flatMap(textsOf);
}

describe('text in a scene', () => {
  const scene: Scene = {
    viewBox: [0, 0, 100, 100],
    root: groupNode([
      pathNode([[[0, 0], [10, 0], [10, 10]]], { fill: '#000', opacity: 1 }),
      textNode([5, 90], 'Palette', 12, '#333'),
    ]),
  };

  it('is a node like any other', () => {
    expect(textNode([1, 2], 'x', 10, '#000')).toEqual({
      kind: 'text',
      at: [1, 2],
      text: 'x',
      size: 10,
      fill: '#000',
    });
    expect(countNodes(scene.root)).toBe(3);
  });

  it('does not move the bounds', () => {
    expect(boundsOfScene(scene)).toEqual({ x0: 0, y0: 0, x1: 10, y1: 10, width: 10, height: 10 });
    expect(allContours(scene.root)).toHaveLength(1);
  });

  it('survives cleaning unchanged', () => {
    const cleaned = cleanScene(scene);
    expect(textsOf(cleaned.root)).toEqual([scene.root.children[1]]);
  });
});

describe('composing one scene into another', () => {
  it('places it at a position and a scale', () => {
    const scene = blob(0, 0, 10, 10);
    const placed = placeScene(scene, [100, 50], 3);
    expect(placed.transform).toEqual({ translate: [100, 50], scale: [3, 3] });

    const around: Scene = { viewBox: [0, 0, 500, 500], root: groupNode([placed]) };
    expect(boundsOfScene(around)).toMatchObject({ x0: 100, y0: 50, width: 30, height: 30 });
  });

  it('leaves the scene it was given alone', () => {
    const scene = blob(0, 0, 10, 10);
    const copy = structuredClone(scene);
    placeScene(scene, [100, 50], 3);
    expect(scene).toEqual(copy);
  });
});

describe('clear space', () => {
  it('is a fraction of the mark drawn height', () => {
    expect(clearSpaceOf(blob(0, 0, 40, 80))).toBeCloseTo(80 * CLEAR_SPACE_FRACTION, 9);
    expect(clearSpaceOf(blob(0, 0, 40, 160))).toBeCloseTo(160 * CLEAR_SPACE_FRACTION, 9);
  });

  it('ignores a viewBox far larger than the geometry', () => {
    const small = blob(0, 0, 40, 80);
    const wide: Scene = { ...small, viewBox: [0, 0, 100000, 100000] };
    expect(clearSpaceOf(wide)).toBe(clearSpaceOf(small));
  });

  it('is nothing when there is nothing drawn', () => {
    expect(clearSpaceOf({ viewBox: [0, 0, 10, 10], root: groupNode([]) })).toBe(0);
  });

  it('draws a frame whose inner edge is the outline and whose outer edge is it grown', () => {
    const at = { x0: 100, y0: 200, x1: 140, y1: 280, width: 40, height: 80 };
    const frame = clearSpaceFrame(at, 10, '#111');
    expect(frame).toHaveLength(4);

    const points = frame.flatMap((node) => allContours(node).flat());
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    expect(Math.min(...xs)).toBe(90);
    expect(Math.max(...xs)).toBe(150);
    expect(Math.min(...ys)).toBe(190);
    expect(Math.max(...ys)).toBe(290);

    for (const node of frame) {
      for (const point of allContours(node).flat()) {
        const insideX = point[0] > at.x0 && point[0] < at.x1;
        const insideY = point[1] > at.y0 && point[1] < at.y1;
        expect(insideX && insideY).toBe(false);
      }
    }
  });
});

describe('the sheet', () => {
  const sheet = composeSheet(input());

  it('names every section', () => {
    const headings = textsOf(sheet.root).map((node) => node.text);
    expect(headings).toContain('Trefoil Type');
    expect(headings).toContain('Mark');
    expect(headings).toContain('Clear space');
    expect(headings).toContain('Lockup, beside');
    expect(headings).toContain('Lockup, stacked');
    expect(headings).toContain('Palette');
  });

  it('shows one labelled swatch per colour', () => {
    const labels = textsOf(sheet.root).map((node) => node.text);
    for (const color of COLORS) expect(labels).toContain(color);
    expect(labels.filter((label) => COLORS.includes(label))).toHaveLength(COLORS.length);
  });

  it('keeps every piece of geometry on the page', () => {
    const bounds = boundsOfScene(sheet);
    if (bounds === null) throw new Error('an empty sheet');
    expect(bounds.x0).toBeGreaterThanOrEqual(0);
    expect(bounds.y0).toBeGreaterThanOrEqual(0);
    expect(bounds.x1).toBeLessThanOrEqual(SHEET_PAGE.width);
    expect(bounds.y1).toBeLessThanOrEqual(SHEET_PAGE.height);
    expect(sheet.viewBox).toEqual([0, 0, SHEET_PAGE.width, SHEET_PAGE.height]);
  });

  it('keeps the text on the page too', () => {
    for (const node of textsOf(sheet.root)) {
      expect(node.at[0]).toBeGreaterThanOrEqual(0);
      expect(node.at[1]).toBeGreaterThanOrEqual(0);
      expect(node.at[0]).toBeLessThanOrEqual(SHEET_PAGE.width);
      expect(node.at[1]).toBeLessThanOrEqual(SHEET_PAGE.height);
    }
  });

  it('holds all three drawings', () => {
    const plain = composeSheet(input({ colors: [] }));
    const contours = allContours(plain.root).length;
    const without = allContours(composeSheet(input({ colors: [], mark: blob(0, 0, 0, 0) })).root).length;
    expect(contours).toBeGreaterThan(without);
  });

  it('gives a taller mark a wider clear space', () => {
    const short = clearSpaceOf(blob(0, 0, 40, 40));
    const tall = clearSpaceOf(blob(0, 0, 40, 80));
    expect(tall).toBeCloseTo(short * 2, 9);
  });
});

describe('the brand sheet exporter', () => {
  it('is registered alongside the others', () => {
    const registry = createExporterRegistry([...BUILT_IN_EXPORTERS]);
    expect(registry.list().map((exporter) => exporter.id)).toContain('brand-sheet');
  });

  it('writes the whole sheet', async () => {
    const result = await brandSheetExporter.run({
      scene: blob(0, 0, 10, 10),
      values: {},
      name: 'Trefoil Type',
      sheet: input(),
    } as never);

    const written = new TextDecoder().decode(result.bytes);
    expect(result.fileName).toBe('trefoil-type.sheet.svg');
    expect(written).toContain('<text');
    expect(written).toContain('Clear space');
    expect(written).toContain('hsl(210 70% 50%)');
  });

  it('falls back to the scene it was given when no sheet is handed over', async () => {
    const result = await brandSheetExporter.run({
      scene: blob(0, 0, 10, 10),
      values: {},
      name: 'Plain',
    });
    expect(new TextDecoder().decode(result.bytes)).toContain('Mark');
  });
});
