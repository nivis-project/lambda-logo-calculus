import { describe, expect, it } from 'vitest';
import {
  DRAFT_QUALITY,
  FULL_QUALITY,
  GRID,
  buildScene,
  computeNesting,
  createGlyphCache,
  createGlyphSetRegistry,
  createPaletteRegistry,
  createStageRegistry,
  createTemplateRegistry,
  loopJoin,
  prototypeModulation,
  resolveParams,
  roundEnding,
  type GlyphCache,
  type SampleQuality,
  type Scene,
} from '@trefoil/core';
import { builtInShapeTemplates, latinGlyphSet } from '@trefoil/templates';

export const BUDGET_MS = 16;
export const RELEASE_MS = 50;
export const CACHED_MS = 1;

const DEG = Math.PI / 180;
const TEXT = 'Hamburgefonstiv 0123';
const COPIES = 12;

const templates = createTemplateRegistry();
for (const template of builtInShapeTemplates) templates.register(template);
const glyphSets = createGlyphSetRegistry();
glyphSets.register(latinGlyphSet);

const template = templates.get('trefoil');
const glyphs = glyphSets.get('latin-basic');
const stages = createStageRegistry();
const palette = createPaletteRegistry().get('analogous');

function build(
  amplitude: number,
  alpha: number,
  quality: SampleQuality,
  cache?: GlyphCache,
): Scene {
  const { values } = resolveParams(template.params, { A: amplitude });
  const rotation = 24 * DEG;

  return buildScene({
    text: TEXT,
    glyphs,
    metrics: GRID,
    template,
    templateParams: values,
    rotation,
    nesting: computeNesting({ template, params: values, rotation, copies: COPIES, fit: 0, quality }),
    modulation: prototypeModulation({ amplitude, fit: 0, metrics: GRID }),
    stages,
    ending: roundEnding,
    join: loopJoin,
    palette,
    alpha,
    shapePen: true,
    quality,
    ...(cache === undefined ? {} : { cache }),
  });
}

function medianOf(run: (index: number) => void, times: number): number {
  for (let i = 0; i < 5; i++) run(i);
  const measured: number[] = [];
  for (let i = 0; i < times; i++) {
    const started = performance.now();
    run(i);
    measured.push(performance.now() - started);
  }
  measured.sort((a, b) => a - b);
  return measured[Math.floor(measured.length / 2)] ?? Number.POSITIVE_INFINITY;
}

describe('the render budget', () => {
  it('uses the wordmark and copy count the rule names', () => {
    expect(Array.from(TEXT)).toHaveLength(20);
    expect(COPIES).toBe(12);
    expect(BUDGET_MS).toBe(16);
  });

  it('rebuilds under the budget at draft quality while a parameter moves', { timeout: 120_000 }, () => {
    const median = medianOf((index) => {
      build(3 + index * 0.017, 0.22, DRAFT_QUALITY);
    }, 30);

    console.log(`draft median ${median.toFixed(2)} ms`);
    expect(median, `draft median was ${median.toFixed(2)} ms`).toBeLessThan(BUDGET_MS);
  });

  it('rebuilds at full quality fast enough not to feel on release', { timeout: 120_000 }, () => {
    const median = medianOf((index) => {
      build(3 + index * 0.017, 0.22, FULL_QUALITY);
    }, 15);

    console.log(`full median ${median.toFixed(2)} ms`);
    expect(median, `full median was ${median.toFixed(2)} ms`).toBeLessThan(RELEASE_MS);
  });

  it('rebuilds a colour change from the cache in under a millisecond', { timeout: 120_000 }, () => {
    const cache = createGlyphCache();
    build(3, 0.22, FULL_QUALITY, cache);

    const before = cache.misses;
    const median = medianOf((index) => {
      build(3, 0.1 + index * 0.001, FULL_QUALITY, cache);
    }, 20);

    expect(cache.misses).toBe(before);
    console.log(`cached median ${median.toFixed(3)} ms`);
    expect(median, `cached median was ${median.toFixed(3)} ms`).toBeLessThan(CACHED_MS);
  });

  it('misses the cache when a parameter moves, and hits it when nothing geometric does', () => {
    const cache = createGlyphCache();
    build(3, 0.22, FULL_QUALITY, cache);
    const afterFirst = cache.misses;
    expect(afterFirst).toBeGreaterThan(0);

    build(3, 0.9, FULL_QUALITY, cache);
    expect(cache.misses).toBe(afterFirst);

    build(4, 0.22, FULL_QUALITY, cache);
    expect(cache.misses).toBeGreaterThan(afterFirst);
  });

  it('draws the same geometry whether it came from the cache or not', () => {
    const cache = createGlyphCache();
    const first = JSON.stringify(build(3, 0.22, FULL_QUALITY, cache));
    const second = JSON.stringify(build(3, 0.22, FULL_QUALITY, cache));
    expect(second).toBe(first);
    expect(JSON.stringify(build(3, 0.22, FULL_QUALITY))).toBe(first);
  });

  it('draws the same scene with no quality given as at full quality', () => {
    const { values } = resolveParams(template.params, { A: 3 });
    const rotation = 24 * DEG;
    const common = {
      text: 'Hamburg',
      glyphs,
      metrics: GRID,
      template,
      templateParams: values,
      rotation,
      nesting: computeNesting({ template, params: values, rotation, copies: 3, fit: 0 }),
      modulation: prototypeModulation({ amplitude: 3, fit: 0, metrics: GRID }),
      stages,
      ending: roundEnding,
      join: loopJoin,
      palette,
      alpha: 0.22,
      shapePen: true,
    };

    expect(JSON.stringify(buildScene({ ...common, quality: FULL_QUALITY }))).toBe(
      JSON.stringify(buildScene(common)),
    );
  });

  it('is coarser at draft quality, which is the trade being made', () => {
    const { values } = resolveParams(template.params, { A: 3 });
    const rotation = 24 * DEG;
    const common = {
      text: 'o',
      glyphs,
      metrics: GRID,
      template,
      templateParams: values,
      rotation,
      nesting: computeNesting({ template, params: values, rotation, copies: 1, fit: 0 }),
      modulation: prototypeModulation({ amplitude: 3, fit: 0, metrics: GRID }),
      stages,
      ending: roundEnding,
      join: loopJoin,
      palette,
      alpha: 0.22,
      shapePen: true,
    };

    const full = JSON.stringify(buildScene({ ...common, quality: FULL_QUALITY }));
    const draft = JSON.stringify(buildScene({ ...common, quality: DRAFT_QUALITY }));
    expect(draft).not.toBe(full);
    expect(draft.length).toBeLessThan(full.length);
  });
});
