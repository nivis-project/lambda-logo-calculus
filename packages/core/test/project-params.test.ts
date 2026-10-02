import { describe, expect, it } from 'vitest';
import {
  MARK_PARAMS,
  NESTING_PARAMS,
  appearanceParams,
  createEndingRegistry,
  createPaletteRegistry,
  isNumericParam,
  randomizeParams,
  resolveParams,
  trefoil,
  type ParamDef,
} from '../src/index.js';

const palettes = createPaletteRegistry().list().map((entry) => entry.id);
const endings = createEndingRegistry().list().map((entry) => entry.id);

const ALL: readonly ParamDef[] = [
  ...trefoil.params,
  ...NESTING_PARAMS,
  ...appearanceParams(palettes, endings),
  ...MARK_PARAMS,
];

describe('the parameters the studio shows', () => {
  it('names each one once', () => {
    expect(new Set(ALL.map((def) => def.id)).size).toBe(ALL.length);
  });

  it('defaults to the settings the prototype opens with', () => {
    const { values, clamped } = resolveParams(ALL, {});
    expect(clamped).toHaveLength(0);
    expect(values.copies).toBe(6);
    expect(values.rotation).toBe(24);
    expect(values.alpha).toBeCloseTo(0.22, 9);
    expect(values.paletteId).toBe('Analogous');
    expect(values.endingId).toBe('round');
    expect(values.markSize).toBe(1);
  });

  it('offers only palettes and endings that are registered', () => {
    const appearance = appearanceParams(palettes, endings);
    const palette = appearance.find((def) => def.id === 'paletteId');
    const ending = appearance.find((def) => def.id === 'endingId');

    expect(palette?.kind === 'enum' ? palette.options : []).toEqual(palettes);
    expect(ending?.kind === 'enum' ? ending.options : []).toEqual(endings);
  });

  it('keeps every default inside its own range', () => {
    for (const def of ALL) {
      if (!isNumericParam(def)) continue;
      expect(def.default).toBeGreaterThanOrEqual(def.min);
      expect(def.default).toBeLessThanOrEqual(def.max);
    }
  });

  it('leaves the mark controls out of randomize, so a variant keeps its lockup', () => {
    const start = resolveParams(ALL, {}).values;
    const next = randomizeParams(ALL, start, new Set(), 'a-seed');

    for (const def of MARK_PARAMS) expect(next[def.id]).toEqual(start[def.id]);
    expect(next.rotation).not.toEqual(start.rotation);
  });

  it('gives the same variant back for the same seed', () => {
    const start = resolveParams(ALL, {}).values;
    expect(randomizeParams(ALL, start, new Set(), 'again')).toEqual(
      randomizeParams(ALL, start, new Set(), 'again'),
    );
  });
});
