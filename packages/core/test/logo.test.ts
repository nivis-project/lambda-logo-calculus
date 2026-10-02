import { describe, expect, it } from 'vitest';
import {
  DEFAULT_STAGE_LIST,
  GRID,
  OPTICAL_ENLARGEMENT,
  buildLogo,
  computeNesting,
  createEndingRegistry,
  createPaletteRegistry,
  createStageRegistry,
  latinGlyphSet,
  markBounds,
  markContours,
  modulate,
  trefoil,
  type GroupNode,
  type LogoInput,
  type SceneNode,
} from '../src/index.js';

const DEG = Math.PI / 180;

function input(over: Partial<LogoInput> = {}): LogoInput {
  const A = 3;
  const fit = 0;
  const params = { A };
  const rotation = 24 * DEG;
  const { widthFactor, xHeight } = modulate(A, fit, GRID, true);

  return {
    text: 'Trefoil',
    available: 1000,
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
    mark: { on: true, distance: 0, height: 0, size: 1 },
    ...over,
  };
}

function markGroup(node: SceneNode): GroupNode | null {
  if (node.kind !== 'group') return null;
  const first = node.children[0];
  if (first?.kind !== 'group') return null;
  return first.transform?.scale === undefined ? null : first;
}

describe('the mark', () => {
  it('is measured by the geometry it draws', () => {
    const contours = markContours(input());
    expect(contours).toHaveLength(6);

    const bounds = markBounds(input());
    if (bounds === null) throw new Error('an unmeasurable mark');

    const points = contours.flat();
    expect(bounds.x0).toBe(Math.min(...points.map(([x]) => x)));
    expect(bounds.y1).toBe(Math.max(...points.map(([, y]) => y)));
  });

  it('does not fill its own bounding circle, which is why it is measured', () => {
    const bounds = markBounds(input());
    if (bounds === null) throw new Error('an unmeasurable mark');
    // The largest copy is a unit circle's worth of radius, so a bounding circle
    // would be 2 across. A trefoil is not.
    expect(bounds.width).toBeLessThan(2);
    expect(bounds.height).toBeLessThan(2);
  });

  it('is not symmetric about its centre once the copies are rotated', () => {
    const bounds = markBounds(input({ rotation: 40 * DEG }));
    if (bounds === null) throw new Error('an unmeasurable mark');
    expect(Math.abs(bounds.x0 + bounds.x1)).toBeGreaterThan(1e-6);
  });
});

describe('a logo beside the words', () => {
  const logo = buildLogo(input());

  it('places the mark and keeps the text clear of it', () => {
    expect(logo.placement).toBe('side');

    const mark = markGroup(logo.scene.root);
    expect(mark).not.toBeNull();

    const letters = logo.scene.root.children.slice(1);
    const firstLetter = letters[0];
    if (firstLetter?.kind !== 'group') throw new Error('expected a glyph group');

    const markRight = (mark?.transform?.translate?.[0] ?? 0) + (markBounds(input())?.width ?? 0) * (mark?.transform?.scale?.[0] ?? 1);
    expect(firstLetter.transform?.translate?.[0] ?? 0).toBeGreaterThan(markRight);
  });

  it('sizes the mark to the cap height, enlarged 6 percent', () => {
    const mark = markGroup(logo.scene.root);
    const drawn = markBounds(input());
    const scale = mark?.transform?.scale?.[0] ?? 0;
    expect((drawn?.height ?? 0) * scale).toBeCloseTo(GRID.capHeight * OPTICAL_ENLARGEMENT, 6);
  });

  it('centres the mark on the text block', () => {
    const mark = markGroup(logo.scene.root);
    const drawn = markBounds(input());
    const scale = mark?.transform?.scale?.[0] ?? 0;
    const centre =
      (mark?.transform?.translate?.[1] ?? 0) + ((drawn?.y0 ?? 0) + (drawn?.y1 ?? 0)) / 2 * scale;

    // One line: the block runs from the cap line to the baseline, so its middle
    // sits half a cap height above the baseline, and the baseline is at 0.
    expect(centre).toBeCloseTo(-GRID.capHeight / 2, 6);
  });

  it('draws one contour per copy, in the palette, at the mark opacity', () => {
    const mark = markGroup(logo.scene.root);
    expect(mark?.children).toHaveLength(6);

    const fills = new Set(
      (mark?.children ?? []).map((pass) => (pass.kind === 'path' ? pass.style.fill : '')),
    );
    expect(fills.size).toBe(6);

    const first = mark?.children[0];
    if (first?.kind !== 'path') throw new Error('expected a path');
    expect(first.style.opacity).toBeCloseTo(0.38, 9);
  });

  it('opens its viewBox wide enough for the mark', () => {
    expect(logo.scene.viewBox[0]).toBeLessThanOrEqual(0);
    expect(logo.scene.viewBox[1]).toBeLessThanOrEqual(-GRID.capHeight);
  });
});

describe('a logo with the mark above the words', () => {
  const logo = buildLogo(input({ text: 'Trefoilandmore', available: 260 }));

  it('stacks when a side lockup would break a word', () => {
    expect(logo.placement).toBe('stacked');
  });

  it('reserves nothing beside the text', () => {
    const letters = logo.scene.root.children.slice(1);
    const firstLetter = letters[0];
    if (firstLetter?.kind !== 'group') throw new Error('expected a glyph group');
    expect(firstLetter.transform?.translate?.[0] ?? 0).toBeCloseTo(GRID.sideBearing, 6);
  });

  it('puts the mark above the first line', () => {
    const mark = markGroup(logo.scene.root);
    const letters = logo.scene.root.children.slice(1);
    const firstLetter = letters[0];
    if (firstLetter?.kind !== 'group') throw new Error('expected a glyph group');

    const drawn = markBounds(input());
    const scale = mark?.transform?.scale?.[0] ?? 0;
    const markBottom = (mark?.transform?.translate?.[1] ?? 0) + (drawn?.y1 ?? 0) * scale;
    const capLine = (firstLetter.transform?.translate?.[1] ?? 0) - GRID.capHeight;

    expect(markBottom).toBeLessThanOrEqual(capLine + 1e-6);
  });
});

describe('a logo with no mark', () => {
  const logo = buildLogo(input({ mark: { on: false, distance: 0, height: 0, size: 1 } }));

  it('holds only letters, and reserves nothing', () => {
    expect(logo.placement).toBe('none');
    const first = logo.scene.root.children[0];
    if (first?.kind !== 'group') throw new Error('expected a glyph group');
    expect(first.transform?.translate?.[0] ?? 0).toBeCloseTo(GRID.sideBearing, 6);
  });
});

describe('the lines come from the lockup', () => {
  it('wraps to what the reservation left, not to the whole width', () => {
    const wide = buildLogo(input({ text: 'Trefoil Type 26', available: 1000 }));
    const narrow = buildLogo(input({ text: 'Trefoil Type 26', available: 420 }));

    expect(wide.lines).toHaveLength(1);
    expect(narrow.lines.length).toBeGreaterThan(1);
    expect(narrow.lines.join(' ')).toBe('Trefoil Type 26');
  });
});
