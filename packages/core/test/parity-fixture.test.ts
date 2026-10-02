import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const parityDir = join(here, '..', '..', '..', 'test', 'parity');

interface Asked {
  readonly A: number;
  readonly n: number;
  readonly rot: number;
  readonly fit: number;
  readonly alpha: number;
  readonly pal: string;
  readonly end: string;
}

interface Pass {
  readonly fill: string | null;
  readonly opacity: string | null;
  readonly paths: readonly string[];
  readonly uses: readonly string[];
}

interface Recording {
  readonly asked: Asked;
  readonly actual: Asked;
  readonly viewBox: string;
  readonly glyphs: readonly { readonly transform: string; readonly passes: readonly Pass[] }[];
}

interface Manifest {
  readonly recordedFrom: string;
  readonly containerWidth: number;
  readonly text: string;
  readonly rounding: {
    readonly decimals: number;
    readonly perAxis: number;
    readonly asDistance: number;
    readonly tolerance: number;
  };
  readonly recordings: readonly { readonly file: string; readonly asked: Asked; readonly actual: Asked }[];
}

function readJson(name: string): unknown {
  return JSON.parse(readFileSync(join(parityDir, name), 'utf8'));
}

const manifest = readJson('index.json') as Manifest;
const readRecording = (name: string): Recording => readJson(name) as Recording;

describe('the parity fixture', () => {
  it('was recorded from the frozen prototype at a stated width', () => {
    expect(manifest.recordedFrom).toBe('reference/trefoil-type.html');
    expect(manifest.containerWidth).toBeGreaterThan(0);
    expect(manifest.text.length).toBeGreaterThan(0);
  });

  it('has a file for every recording, and no stray files', () => {
    const named = new Set(manifest.recordings.map((entry) => entry.file));
    const present = new Set(readdirSync(parityDir).filter((name) => name !== 'index.json'));
    expect([...named].sort()).toEqual([...present].sort());
  });
});

describe('what the controls actually took', () => {
  it('matches what they were asked for, in every recording', () => {
    for (const entry of manifest.recordings) {
      for (const key of Object.keys(entry.asked) as (keyof Asked)[]) {
        expect(
          entry.actual[key],
          `${entry.file}: ${key} was asked for ${String(entry.asked[key])} and took ${String(entry.actual[key])}. A snapped control must never be compared against an unsnapped expectation.`,
        ).toBe(entry.asked[key]);
      }
    }
  });

  it('is recorded per file as well as in the manifest, and the two agree', () => {
    for (const entry of manifest.recordings) {
      const recording = readRecording(entry.file);
      expect(recording.asked, entry.file).toEqual(entry.asked);
      expect(recording.actual, entry.file).toEqual(entry.actual);
    }
  });
});

describe('the breadth of the matrix', () => {
  const distinct = (key: keyof Asked): number =>
    new Set(manifest.recordings.map((entry) => entry.actual[key])).size;

  it('cannot shrink to one easy case', () => {
    expect(manifest.recordings.length).toBeGreaterThanOrEqual(20);
    expect(distinct('A'), 'amplitudes').toBeGreaterThanOrEqual(4);
    expect(distinct('rot'), 'rotations').toBeGreaterThanOrEqual(5);
    expect(distinct('fit'), 'fit sizes').toBeGreaterThanOrEqual(5);
    expect(distinct('n'), 'copy counts').toBeGreaterThanOrEqual(4);
    expect(distinct('end'), 'endings').toBeGreaterThanOrEqual(9);
    expect(distinct('pal'), 'palettes').toBeGreaterThanOrEqual(6);
  });

  it('covers the rotations where the fit is known in advance', () => {
    const rotations = new Set(manifest.recordings.map((entry) => entry.actual.rot));
    expect(rotations.has(0), 'no rotation, where the fit must be 1').toBe(true);
    expect(rotations.has(120), 'a third of a turn, where the fit must be 1').toBe(true);
  });

  it('exercises every structural kind of glyph', () => {
    for (const [character, what] of [
      ['b', 'a bowl with a stem'],
      ['o', 'a bowl'],
      ['n', 'an arc'],
      ['g', 'a descender'],
      ['i', 'a dot'],
      ['v', 'a diagonal'],
      ['T', 'a horizontal arm'],
      ['3', 'a digit'],
    ] as const) {
      expect(manifest.text.includes(character), `${what} is missing from the recorded text`).toBe(true);
    }
  });
});

describe('the recorded geometry', () => {
  it('holds a drawing for every setting, with no empty pass and no NaN', () => {
    for (const entry of manifest.recordings) {
      const recording = readRecording(entry.file);
      expect(recording.glyphs.length, `${entry.file}: no glyphs`).toBe(manifest.text.length);
      expect(recording.viewBox, `${entry.file}: no viewBox`).toMatch(/^[-\d. ]+$/);

      for (const glyph of recording.glyphs) {
        expect(glyph.passes.length, `${entry.file}: a glyph with no passes`).toBe(entry.actual.n);

        for (const pass of glyph.passes) {
          expect(pass.fill, `${entry.file}: a pass with no fill`).toMatch(/^hsl\(/);
          expect(pass.paths.length + pass.uses.length, `${entry.file}: a pass that drew nothing`).toBeGreaterThan(0);

          for (const d of pass.paths) {
            expect(d, `${entry.file}: a path holding NaN`).not.toMatch(/NaN|Infinity/);
            expect(d, `${entry.file}: a path that does not start with a move`).toMatch(/^M/);
          }
        }
      }
    }
  });
});

describe('the tolerance', () => {
  it('is derived from the rounding rather than chosen', () => {
    const { decimals, perAxis, asDistance, tolerance } = manifest.rounding;

    expect(decimals).toBe(2);
    expect(perAxis).toBeCloseTo(0.5 * 10 ** -decimals, 12);
    expect(asDistance).toBeCloseTo(Math.SQRT2 * perAxis, 12);
    expect(tolerance).toBe(0.02);
  });

  it('sits above the floor no implementation could beat', () => {
    expect(manifest.rounding.tolerance).toBeGreaterThan(manifest.rounding.asDistance);
    expect(manifest.rounding.tolerance / manifest.rounding.asDistance).toBeLessThan(4);
  });
});
