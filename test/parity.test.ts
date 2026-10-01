import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  GRID,
  DEFAULT_STAGE_LIST,
  computeNesting,
  createStageRegistry,
  effectiveScale,
  flatEnding,
  glyphFor,
  outlineSkeleton,
  perfectFit,
  prototypeModulation,
  roundPen,
  runStages,
} from '@trefoil/core';
import { latinGlyphSet, trefoil } from '@trefoil/templates';
import { comparePoints, describe as describeDifference, parsePathData } from './parity/compare.js';

const DEG = Math.PI / 180;

export const TOLERANCE = 0.02;
export const ROUNDING_FLOOR = Math.hypot(0.005, 0.005);

interface Applied {
  readonly A: number;
  readonly n: number;
  readonly rot: number;
  readonly fit: number;
  readonly text: string;
}

interface Record_ {
  readonly requested: Applied;
  readonly applied: Applied;
  readonly perfectFit: string;
  readonly effectiveScale: string;
  readonly widthFactor: string;
  readonly xHeight: string;
  readonly paths: readonly string[];
}

const recording = JSON.parse(
  readFileSync(new URL('./parity/prototype-output.json', import.meta.url), 'utf8'),
) as { readonly records: readonly Record_[] };

function numberIn(text: string): number {
  return Number(/-?[\d.]+/.exec(text)?.[0] ?? 'NaN');
}

function coreContours(applied: Applied) {
  const rotation = applied.rot * DEG;
  const params = { A: applied.A };
  const nesting = computeNesting({
    template: trefoil,
    params,
    rotation,
    copies: applied.n,
    fit: applied.fit,
  });

  const skeleton = runStages(
    glyphFor(latinGlyphSet, applied.text),
    DEFAULT_STAGE_LIST,
    createStageRegistry(),
    {
      template: trefoil,
      templateParams: params,
      rotation,
      nesting,
      metrics: GRID,
      modulation: prototypeModulation({ amplitude: applied.A, fit: applied.fit, metrics: GRID }),
    },
  );

  return nesting.scales.flatMap((_scale, copy) =>
    outlineSkeleton(skeleton, {
      pen: roundPen(GRID.strokeWidth),
      ending: flatEnding,
      shapeBuilt: false,
      template: trefoil,
      templateParams: params,
      rotation: rotation * copy,
      copyIndex: copy,
    }).contours,
  );
}

describe('the recording', () => {
  it('covers a spread of settings, not one', () => {
    expect(recording.records.length).toBeGreaterThanOrEqual(13);
    const amplitudes = new Set(recording.records.map((r) => r.applied.A));
    const rotations = new Set(recording.records.map((r) => r.applied.rot));
    const texts = new Set(recording.records.map((r) => r.applied.text));
    expect(amplitudes.size).toBeGreaterThan(2);
    expect(rotations.size).toBeGreaterThan(3);
    expect(texts.size).toBeGreaterThan(3);
  });

  it('records what the sliders actually took, not what was asked for', () => {
    for (const record of recording.records) {
      expect(record.applied, JSON.stringify(record.requested)).toEqual(record.requested);
    }
  });
});

describe('the nesting mathematics', () => {
  it('agrees with the prototype to the precision it reports', () => {
    for (const { applied, ...prototype } of recording.records) {
      const label = JSON.stringify(applied);
      const rotation = applied.rot * DEG;
      const guarded = Math.max(applied.A, 1.15);

      const mine = perfectFit(trefoil, { A: guarded }, rotation);
      expect(Math.abs(mine - numberIn(prototype.perfectFit)), `perfectFit ${label}`).toBeLessThan(
        0.0005,
      );

      const myEffective = Math.min(effectiveScale(Math.max(mine, 0.02), applied.fit), 1.5);
      expect(
        Math.abs(myEffective - numberIn(prototype.effectiveScale)),
        `effectiveScale ${label}`,
      ).toBeLessThan(0.0005);

      const modulation = prototypeModulation({
        amplitude: guarded,
        fit: applied.fit,
        metrics: GRID,
      });
      expect(
        Math.abs(modulation.widthFactor - numberIn(prototype.widthFactor)),
        `width factor ${label}`,
      ).toBeLessThan(0.005);
      expect(
        Math.abs(modulation.xHeight - numberIn(prototype.xHeight)),
        `x-height ${label}`,
      ).toBeLessThan(0.5);
    }
  });
});

describe('the stroked outlines', () => {
  it('match the prototype within the tolerance across every recorded setting', () => {
    let worst = 0;
    let worstAt = '';

    for (const record of recording.records) {
      const label = JSON.stringify(record.applied);
      const theirs = record.paths.flatMap(parsePathData);
      const mine = coreContours(record.applied);

      expect(
        theirs.length,
        `${label}: prototype produced ${theirs.length} contours, core produced ${mine.length}`,
      ).toBe(mine.length);

      for (let i = 0; i < mine.length; i++) {
        const difference = comparePoints(theirs[i] ?? [], mine[i] ?? [], TOLERANCE);
        expect(
          difference.matched,
          `${label} contour ${i}: ${describeDifference(difference, TOLERANCE)}`,
        ).toBe(true);
        if (difference.largest > worst) {
          worst = difference.largest;
          worstAt = `${label} contour ${i}`;
        }
      }
    }

    expect(worst, `worst difference ${worst} at ${worstAt}`).toBeLessThanOrEqual(TOLERANCE);
    expect(
      worst,
      `the worst difference ${worst.toFixed(6)} should sit at the prototype's own rounding floor of ${ROUNDING_FLOOR.toFixed(6)}, at ${worstAt}`,
    ).toBeLessThanOrEqual(ROUNDING_FLOOR);
  });

  it('fails on an error of one font unit', () => {
    const first = recording.records[0];
    expect(first).toBeDefined();
    if (first === undefined) return;

    const theirs = first.paths.flatMap(parsePathData)[0] ?? [];
    const mine = coreContours(first.applied)[0] ?? [];
    const nudged = mine.map(([x, y], i) => (i === 3 ? [x + 1, y] : [x, y]) as const);

    const clean = comparePoints(theirs, mine, TOLERANCE);
    const broken = comparePoints(theirs, nudged, TOLERANCE);

    expect(clean.matched).toBe(true);
    expect(broken.matched).toBe(false);
    expect(describeDifference(broken, TOLERANCE)).toMatch(/above the tolerance of 0.02/);
  });
});
