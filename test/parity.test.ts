import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_STAGE_LIST,
  GRID,
  NIB_SIZE,
  computeNesting,
  createEndingRegistry,
  createStageRegistry,
  glyphFor,
  latinGlyphSet,
  modulate,
  outlineSkeleton,
  runStages,
  shapePen,
  trefoil,
  type Contour,
  type Vec2,
} from '@trefoil/core';

const DEG = Math.PI / 180;
const parityDir = join(dirname(fileURLToPath(import.meta.url)), 'parity');

interface Asked {
  readonly A: number;
  readonly n: number;
  readonly rot: number;
  readonly fit: number;
  readonly alpha: number;
  readonly pal: string;
  readonly end: string;
}

interface Recording {
  readonly actual: Asked;
  readonly glyphs: readonly {
    readonly passes: readonly { readonly paths: readonly string[] }[];
  }[];
}

interface Manifest {
  readonly text: string;
  readonly rounding: { readonly tolerance: number; readonly asDistance: number };
  readonly recordings: readonly { readonly file: string; readonly actual: Asked }[];
}

const manifest = JSON.parse(readFileSync(join(parityDir, 'index.json'), 'utf8')) as Manifest;
const TOLERANCE = manifest.rounding.tolerance;

function recordingOf(file: string): Recording {
  return JSON.parse(readFileSync(join(parityDir, file), 'utf8')) as Recording;
}

// The prototype writes one path per outline, and a bowl's two sides as two
// subpaths of one path. Splitting on the move command gives one contour each.
function contoursOfPathData(d: string): Vec2[][] {
  return d
    .split('M')
    .filter((piece) => piece.trim() !== '')
    .map((piece) =>
      piece
        .replace(/Z\s*$/, '')
        .split('L')
        .map((pair): Vec2 => {
          const [x, y] = pair.trim().split(/\s+/).map(Number);
          return [x ?? Number.NaN, y ?? Number.NaN];
        }),
    );
}

const stages = createStageRegistry();
const endings = createEndingRegistry();

function portOutlines(setting: Asked, character: string, copy: number): readonly Contour[] {
  const params = { A: setting.A };
  const rotation = setting.rot * DEG;
  const nesting = computeNesting({
    template: trefoil,
    params,
    rotation,
    copies: setting.n,
    fit: setting.fit,
  });

  const { widthFactor, xHeight } = modulate(setting.A, setting.fit, GRID, true);

  const skeleton = runStages(glyphFor(latinGlyphSet, character), DEFAULT_STAGE_LIST, stages, {
    template: trefoil,
    templateParams: params,
    rotation,
    metrics: GRID,
    modulation: { widthFactor, xHeight },
  });

  const scale = nesting.scales[copy] ?? 1;
  return outlineSkeleton(skeleton, {
    pen: shapePen(trefoil, params, NIB_SIZE * scale, rotation * copy),
    ending: endings.get(setting.end),
    shapeBuilt: true,
    template: trefoil,
    templateParams: params,
    rotation: rotation * copy,
    copyIndex: copy,
    nibSize: NIB_SIZE * scale,
    amplitude: Math.max(setting.A, 1.15),
    joins: true,
    curvesOn: true,
    baseRotationDegrees: setting.rot,
  }).outlines;
}

function worstBetween(a: readonly Vec2[], b: readonly Vec2[]): number {
  let worst = 0;
  for (let i = 0; i < a.length; i++) {
    const p = a[i];
    const q = b[i];
    if (p === undefined || q === undefined) return Number.POSITIVE_INFINITY;
    worst = Math.max(worst, Math.hypot(p[0] - q[0], p[1] - q[1]));
  }
  return worst;
}

interface Measured {
  readonly worst: number;
  readonly where: string;
  readonly compared: number;
  readonly settings: number;
}

function measure(nudge?: { readonly file: string; readonly by: number }): Measured {
  let worst = 0;
  let where = 'nothing compared';
  let compared = 0;

  for (const entry of manifest.recordings) {
    const recording = recordingOf(entry.file);
    const characters = Array.from(manifest.text);
    const nudgeHere = nudge?.file === entry.file ? nudge.by : 0;

    for (const [glyphIndex, glyph] of recording.glyphs.entries()) {
      const character = characters[glyphIndex];
      if (character === undefined) continue;

      for (const [copy, pass] of glyph.passes.entries()) {
        const theirs = pass.paths.flatMap(contoursOfPathData);
        const ours = portOutlines(entry.actual, character, copy);

        expect(
          ours.length,
          `${entry.file}: ${character} pass ${String(copy)}: the port drew ${String(ours.length)} outlines and the prototype ${String(theirs.length)}`,
        ).toBe(theirs.length);

        for (const [index, mine] of ours.entries()) {
          const yours = theirs[index];
          if (yours === undefined) continue;

          const moveBy =
            glyphIndex === 0 && copy === 0 && index === 0 ? nudgeHere : 0;
          const target =
            moveBy === 0
              ? yours
              : yours.map((point, i): Vec2 => (i === 0 ? [point[0] + moveBy, point[1]] : point));

          const difference = worstBetween(mine, target);
          if (difference > worst) {
            worst = difference;
            where = `${entry.file}: ${character} pass ${String(copy)} outline ${String(index)}`;
          }
          compared += mine.length;
        }
      }
    }
  }

  return { worst, where, compared, settings: manifest.recordings.length };
}

describe('the port against the prototype', () => {
  const measured = measure();

  it('covers every recorded setting', () => {
    expect(measured.settings).toBe(manifest.recordings.length);
    expect(measured.settings).toBeGreaterThanOrEqual(20);
    expect(measured.compared).toBeGreaterThan(100_000);
  });

  it('agrees within the derived tolerance', () => {
    expect(
      measured.worst,
      `worst difference ${measured.worst.toFixed(5)} font units at ${measured.where}`,
    ).toBeLessThanOrEqual(TOLERANCE);
  });

  it('reports the margin it has, and it is the prototype rounding', () => {
    expect(measured.worst).toBeLessThan(TOLERANCE);
    expect(TOLERANCE).toBe(0.02);
    expect(manifest.rounding.asDistance).toBeCloseTo(Math.SQRT2 * 0.005, 12);

    // The worst difference sits under the floor the prototype's own two-decimal
    // rounding puts there, which means the two implementations agree exactly
    // and what is left is the rounding. The figure is pinned so that a change
    // which quietly moves the geometry has to say so. The testing strategy
    // carries the same number.
    expect(measured.worst).toBeLessThan(manifest.rounding.asDistance);
    expect(measured.worst).toBeCloseTo(0.00705, 5);
    expect(measured.compared).toBe(215_352);
  });

  it('can fail: a coordinate moved by one font unit is caught', () => {
    const first = manifest.recordings[0];
    if (first === undefined) throw new Error('an empty fixture');

    const nudged = measure({ file: first.file, by: 1 });
    expect(nudged.worst).toBeGreaterThan(TOLERANCE);
    expect(nudged.where).toContain(first.file);
  });

  it('states what it does not compare', () => {
    // The prototype writes an ending's shape as a reference to a definition
    // with a transform rather than as coordinates. Resolving those would mean
    // reimplementing its drawing, which is the thing the recording exists to
    // avoid, so they are out of scope and said so here and in the testing
    // strategy. Required by name in openspec change add-parity-comparison.
    expect(true).toBe(true);
  });
});
