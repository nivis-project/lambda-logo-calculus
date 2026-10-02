import { describe, expect, it } from 'vitest';
import {
  BASE_HUE,
  GRID,
  OPTICAL_ENLARGEMENT,
  advanceOf,
  boundsOf,
  builtInPalettes,
  createPaletteRegistry,
  hsl,
  latinGlyphSet,
  layoutLockup,
  letterOpacity,
  markOpacity,
  ornamentOpacity,
  widthOf,
  wrapHue,
  wrapText,
  type Bounds,
  type LayoutMetrics,
  type MarkSettings,
} from '../src/index.js';

const layout: LayoutMetrics = { set: latinGlyphSet, metrics: GRID, widthFactor: 1 };

describe('the palettes', () => {
  it('registers six, all on the base hue of 322', () => {
    expect(builtInPalettes).toHaveLength(6);
    expect(BASE_HUE).toBe(322);
    const registry = createPaletteRegistry();
    expect(registry.list().map((p) => p.id).sort()).toEqual([
      'Analogous', 'Complementary', 'Cool', 'Monochrome', 'Triadic', 'Warm',
    ]);
  });

  it('matches the formulas milestone 02 recorded', () => {
    const at = (id: string, i: number, n: number): string =>
      createPaletteRegistry().get(id).colorAt(i, n);

    expect(at('Monochrome', 0, 1)).toBe(hsl(322, 62, 30));
    expect(at('Monochrome', 1, 2)).toBe(hsl(322, 62, 68));
    expect(at('Analogous', 0, 1)).toBe(hsl(287, 70, 50));
    expect(at('Analogous', 1, 2)).toBe(hsl(357, 70, 50));
    expect(at('Complementary', 1, 2)).toBe(hsl(322 + 180, 70, 58));
    expect(at('Triadic', 2, 6)).toBe(hsl(322 + 240, 68, 50));
    expect(at('Warm', 0, 1)).toBe(hsl(345, 78, 52));
    expect(at('Cool', 1, 2)).toBe(hsl(270, 62, 48));
  });

  it('wraps a hue into a full turn', () => {
    expect(wrapHue(-38)).toBe(322);
    expect(wrapHue(502)).toBe(142);
    expect(hsl(502, 70, 50)).toBe('hsl(142 70% 50%)');
  });

  it('remaps the opacity three different ways', () => {
    expect(letterOpacity(0.22)).toBeCloseTo(0.525, 9);
    expect(ornamentOpacity(0.22)).toBeCloseTo(0.714, 9);
    expect(markOpacity(0.22)).toBeCloseTo(0.38, 9);
    expect(letterOpacity(0.22)).not.toBeCloseTo(ornamentOpacity(0.22), 3);
    expect(letterOpacity(0.6)).toBe(1);
    expect(markOpacity(0.6)).toBe(0.9);
  });
});

describe('advances and wrapping', () => {
  it('advances a space by the word space, unscaled', () => {
    expect(advanceOf(' ', layout)).toBe(GRID.wordSpace);
    expect(advanceOf(' ', { ...layout, widthFactor: 2 })).toBe(GRID.wordSpace);
  });

  it('advances a letter by its own advance plus two side bearings', () => {
    expect(advanceOf('o', layout)).toBe(48 + 2 * GRID.sideBearing);
    expect(advanceOf('o', { ...layout, widthFactor: 2 })).toBe(96 + 2 * GRID.sideBearing);
  });

  it('measures a string as the sum of its advances', () => {
    expect(widthOf('oo', layout)).toBe(2 * advanceOf('o', layout));
  });

  it('keeps a line that fits', () => {
    const result = wrapText('oo oo', 10_000, layout);
    expect(result.lines).toEqual(['oo oo']);
    expect(result.brokeMidWord).toBe(false);
  });

  it('wraps by words', () => {
    const width = widthOf('oo', layout) + 1;
    expect(wrapText('oo oo', width, layout).lines).toEqual(['oo', 'oo']);
  });

  it('breaks a word too wide and reports the break', () => {
    const result = wrapText('oooooo', advanceOf('o', layout) * 2, layout);
    expect(result.brokeMidWord).toBe(true);
    expect(result.lines.length).toBeGreaterThan(1);
  });
});

describe('the lockup', () => {
  const mark: Bounds = { x0: -1, y0: -1, x1: 1, y1: 1, width: 2, height: 2 };
  const settings: MarkSettings = { on: true, distance: 0, height: 0, size: 1 };

  function lockup(over: Partial<Parameters<typeof layoutLockup>[0]> = {}) {
    return layoutLockup({
      text: 'Trefoil',
      available: 2000,
      mark,
      settings,
      layout,
      metrics: GRID,
      ...over,
    });
  }

  it('does nothing when the mark is off', () => {
    const result = lockup({ settings: { ...settings, on: false } });
    expect(result.placement).toBe('none');
    expect(result.reserved).toBe(0);
  });

  it('sizes the mark to the cap height for one line, enlarged 6 percent', () => {
    const result = lockup();
    expect(result.placement).toBe('side');
    expect(result.markScale).toBeCloseTo((GRID.capHeight * OPTICAL_ENLARGEMENT) / mark.height, 9);
  });

  it('sizes to two lines and no more, however many there are', () => {
    const narrow = widthOf('Trefoil', layout) + 60;
    const two = lockup({ text: 'Trefoil Trefoil', available: narrow });
    const three = lockup({ text: 'Trefoil Trefoil Trefoil', available: narrow });
    expect(two.lines.length).toBeGreaterThan(1);
    expect(three.markScale).toBeCloseTo(two.markScale, 9);
  });

  it('is limited to 30 percent of the available width', () => {
    const wide: Bounds = { x0: 0, y0: 0, x1: 100, y1: 1, width: 100, height: 1 };
    const result = lockup({ mark: wide, available: 1000 });
    expect(result.markScale * wide.width).toBeLessThanOrEqual(1000 * 0.3 + 1e-9);
  });

  it('opens the gap with the distance control', () => {
    const near = lockup({ settings: { ...settings, distance: -1 } });
    const far = lockup({ settings: { ...settings, distance: 1 } });
    expect(far.gap).toBeGreaterThan(near.gap);
  });

  it('stacks the mark above when a side lockup would break a word', () => {
    const result = lockup({ text: 'Trefoilandmore', available: 200 });
    expect(result.placement).toBe('stacked');
    expect(result.reserved).toBe(0);
  });

  it('gives the same answer twice', () => {
    expect(JSON.stringify(lockup())).toBe(JSON.stringify(lockup()));
  });
});

describe('measuring what is drawn', () => {
  it('reports nothing for nothing', () => {
    expect(boundsOf([])).toBeNull();
  });

  it('reports the extent of the points, not a bounding circle', () => {
    expect(boundsOf([[0, 0], [10, 4]])).toEqual({ x0: 0, y0: 0, x1: 10, y1: 4, width: 10, height: 4 });
  });
});
