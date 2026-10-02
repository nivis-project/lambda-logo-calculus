import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  DEFAULT_STAGE_LIST,
  GRID,
  builtInStages,
  createStageRegistry,
  cutRing,
  latinGlyphs,
  remapHeight,
  runStages,
  trefoil,
  type GlyphSkeleton,
  type StageContext,
  type StageListEntry,
  type WorkingSkeleton,
} from '../src/index.js';

const DEG = Math.PI / 180;
const stages = createStageRegistry();

function context(over: Partial<Omit<StageContext, 'params'>> = {}): Omit<StageContext, 'params'> {
  return {
    template: trefoil,
    templateParams: { A: 3 },
    rotation: 24 * DEG,
    metrics: GRID,
    modulation: { widthFactor: 1, xHeight: GRID.xHeight },
    ...over,
  };
}

const stem: GlyphSkeleton = {
  advance: 14,
  parts: [{ kind: 'stroke', segments: [{ kind: 'point', x: 7, y: 0 }, { kind: 'point', x: 7, y: 56 }] }],
};

const bowl: GlyphSkeleton = {
  advance: 48,
  parts: [{ kind: 'bowl', cx: 24, cy: 28, rx: 24, ry: 28, cuts: [] }],
};

const dot: GlyphSkeleton = {
  advance: 14,
  parts: [{ kind: 'dot', x: 7, y: 72, r: 7 }],
};

function run(glyph: GlyphSkeleton, list = DEFAULT_STAGE_LIST, over = {}): WorkingSkeleton {
  return runStages(glyph, list, stages, context(over));
}

function letter(name: string): GlyphSkeleton {
  const found = latinGlyphs[name];
  if (found === undefined) throw new Error(`no glyph "${name}"`);
  return found;
}

const off = (ids: readonly string[]): readonly StageListEntry[] =>
  DEFAULT_STAGE_LIST.map((entry) => ({ ...entry, enabled: !ids.includes(entry.id) }));

describe('the working skeleton', () => {
  it('turns a stem into one run and no rings', () => {
    const working = run(stem);
    expect(working.runs).toHaveLength(1);
    expect(working.rings).toHaveLength(0);
    expect(working.advance).toBe(14);
  });

  it('turns an uncut bowl into one ring', () => {
    const working = run(bowl);
    expect(working.rings).toHaveLength(1);
    expect(working.runs).toHaveLength(0);
  });

  it('turns a cut bowl into open runs', () => {
    const working = run(letter('c'));
    expect(working.rings).toHaveLength(0);
    expect(working.runs.length).toBeGreaterThan(0);
  });

  it('keeps a dot, moved by the stages that move it', () => {
    const working = run(dot, DEFAULT_STAGE_LIST, {
      modulation: { widthFactor: 2, xHeight: GRID.xHeight },
    });
    expect(working.dots).toHaveLength(1);
    expect(working.dots[0]?.x).toBeCloseTo(14, 9);
    expect(working.dots[0]?.r).toBe(7);
  });

  it('samples an arc into many points, not one', () => {
    const working = run(letter('n'));
    expect(Math.max(...working.runs.map((r) => r.length))).toBeGreaterThan(10);
  });
});

describe('the stage registry', () => {
  it('holds the four stages', () => {
    expect(builtInStages.map((stage) => stage.id)).toEqual(['curves', 'bowls', 'bend', 'proportions']);
    for (const stage of builtInStages) expect(stages.get(stage.id)).toBe(stage);
  });

  it('runs the stages in the order the list gives, not a fixed one', () => {
    const forwards = run(letter('n'), DEFAULT_STAGE_LIST);
    const reversed = run(letter('n'), [...DEFAULT_STAGE_LIST].reverse());
    expect(JSON.stringify(reversed)).not.toBe(JSON.stringify(forwards));
  });

  it('gives the same output for the same input, every time', () => {
    const once = JSON.stringify(run(letter('g')));
    const twice = JSON.stringify(run(letter('g')));
    expect(twice).toBe(once);
  });
});

describe('the curves stage', () => {
  it('leaves an arc starting and ending where it joins its stem', () => {
    const warped = run(letter('n'), off([]));
    const plain = run(letter('n'), off(['curves']));

    const arcOf = (w: WorkingSkeleton): readonly (readonly [number, number])[] =>
      [...w.runs].sort((a, b) => b.length - a.length)[0] ?? [];

    const a = arcOf(warped);
    const b = arcOf(plain);
    expect(a[0]?.[0]).toBeCloseTo(b[0]?.[0] ?? 0, 9);
    expect(a[0]?.[1]).toBeCloseTo(b[0]?.[1] ?? 0, 9);
    expect(a[a.length - 1]?.[0]).toBeCloseTo(b[b.length - 1]?.[0] ?? 0, 9);
    expect(a[a.length - 1]?.[1]).toBeCloseTo(b[b.length - 1]?.[1] ?? 0, 9);
  });

  it('still samples the arc when it is switched off', () => {
    const plain = run(letter('n'), off(['curves']));
    expect(Math.max(...plain.runs.map((r) => r.length))).toBeGreaterThan(10);
  });

  it('changes the arc when it is on', () => {
    const warped = JSON.stringify(run(letter('n'), off([])));
    const plain = JSON.stringify(run(letter('n'), off(['curves'])));
    expect(warped).not.toBe(plain);
  });
});

describe('the bowls stage', () => {
  it('traces the curve when on and an ellipse when off', () => {
    const traced = JSON.stringify(run(bowl, off([])).rings);
    const plain = JSON.stringify(run(bowl, off(['bowls'])).rings);
    expect(traced).not.toBe(plain);
    expect(JSON.parse(plain)).toHaveLength(1);
  });

  it('cuts a ring into runs where a cut region removes points', () => {
    const ring: readonly (readonly [number, number])[] = [
      [0, 0], [10, 0], [20, 0], [20, 10], [20, 20], [10, 20], [0, 20], [0, 10],
    ];
    const whole = cutRing(ring, []);
    expect(whole.closed).toBe(ring);

    const cut = cutRing(ring, [{ x0: 15, y0: -1, x1: 25, y1: 25 }]);
    expect(cut.closed).toBeNull();
    expect(cut.runs.length).toBeGreaterThan(0);
    for (const r of cut.runs) for (const [x] of r) expect(x).toBeLessThan(15);
  });
});

describe('the bend stage', () => {
  it('moves the middle of a long run and leaves both ends', () => {
    const bent = run(stem, off([]));
    const straight = run(stem, off(['bend']));

    const a = bent.runs[0] ?? [];
    const b = straight.runs[0] ?? [];
    expect(a[0]).toEqual(b[0]);
    expect(a[a.length - 1]).toEqual(b[b.length - 1]);
    expect(a.length).toBeGreaterThan(b.length);
  });

  it('leaves a short segment straight', () => {
    const short: GlyphSkeleton = {
      advance: 14,
      parts: [{ kind: 'stroke', segments: [{ kind: 'point', x: 0, y: 0 }, { kind: 'point', x: 4, y: 0 }] }],
    };
    expect(run(short, off([])).runs[0]).toEqual([[0, 0], [4, 0]]);
  });
});

describe('the proportions stage', () => {
  it('remaps height in four bands', () => {
    expect(remapHeight(0, GRID, 68)).toBe(0);
    expect(remapHeight(-28, GRID, 68)).toBe(-28);
    expect(remapHeight(56, GRID, 68)).toBeCloseTo(68, 9);
    expect(remapHeight(28, GRID, 68)).toBeCloseTo(34, 9);
    expect(remapHeight(86, GRID, 68)).toBeCloseTo(86, 9);
    expect(remapHeight(100, GRID, 68)).toBe(100);
  });

  it('scales width and leaves the baseline alone', () => {
    const wide = run(stem, off([]), { modulation: { widthFactor: 1.28, xHeight: 68 } });
    const first = wide.runs[0]?.[0];
    expect(first?.[0]).toBeCloseTo(7 * 1.28, 9);
    expect(first?.[1]).toBe(0);
  });

  it('does nothing when it is off', () => {
    const plain = run(stem, off(['proportions']), { modulation: { widthFactor: 2, xHeight: 68 } });
    expect(plain.runs[0]?.[0]?.[0]).toBe(7);
  });
});

describe('the invariants the prototype claims', () => {
  it('a point on the baseline stays on the baseline, for any parameters', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 20, noNaN: true }),
        fc.double({ min: 0, max: 180, noNaN: true }),
        fc.double({ min: 45, max: 70, noNaN: true }),
        (A, rot, xHeight) => {
          const working = run(stem, DEFAULT_STAGE_LIST, {
            templateParams: { A },
            rotation: rot * DEG,
            modulation: { widthFactor: 1, xHeight },
          });
          const points = working.runs.flat();
          const onBaseline = points.filter(([, y]) => Math.abs(y) < 1e-9);
          expect(onBaseline.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('a bowl encloses a positive area, for any parameters', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 20, noNaN: true }),
        fc.double({ min: 0, max: 180, noNaN: true }),
        (A, rot) => {
          const ring = run(bowl, DEFAULT_STAGE_LIST, {
            templateParams: { A },
            rotation: rot * DEG,
          }).rings[0];
          expect(ring).toBeDefined();

          let area = 0;
          const points = ring ?? [];
          for (let i = 0; i < points.length; i++) {
            const a = points[i];
            const b = points[(i + 1) % points.length];
            if (a === undefined || b === undefined) continue;
            area += a[0] * b[1] - b[0] * a[1];
          }
          expect(Math.abs(area / 2)).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('no stage produces a coordinate that is not finite', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 20, noNaN: true }),
        fc.double({ min: 0, max: 180, noNaN: true }),
        fc.constantFrom(...Object.keys(latinGlyphs)),
        (A, rot, character) => {
          const working = run(letter(character), DEFAULT_STAGE_LIST, {
            templateParams: { A },
            rotation: rot * DEG,
          });
          for (const [x, y] of [...working.runs, ...working.rings].flat()) {
            expect(Number.isFinite(x) && Number.isFinite(y), character).toBe(true);
          }
          for (const d of working.dots) {
            expect(Number.isFinite(d.x) && Number.isFinite(d.y) && Number.isFinite(d.r)).toBe(true);
          }
        },
      ),
      { numRuns: 200 },
    );
  });
});
