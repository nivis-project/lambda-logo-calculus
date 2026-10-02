import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  DEFAULT_STAGE_LIST,
  GRID,
  NIB_SIZE,
  SUPPORT_ENTRIES,
  builtInEndings,
  createEndingRegistry,
  createStageRegistry,
  isCurved,
  latinGlyphs,
  outlineSkeleton,
  roundEnding,
  roundPen,
  runStages,
  shapePen,
  slabEnding,
  splitRuns,
  supportAt,
  trefoil,
  type Contour,
  type Ending,
  type GlyphSkeleton,
  type OutlineOptions,
  type Pen,
  type StageContext,
  type WorkingSkeleton,
} from '../src/index.js';

const DEG = Math.PI / 180;
const stages = createStageRegistry();

function endingNamed(id: string): Ending {
  const found = builtInEndings.find((ending) => ending.id === id);
  if (found === undefined) throw new Error(`no ending "${id}"`);
  return found;
}

function letter(name: string): GlyphSkeleton {
  const found = latinGlyphs[name];
  if (found === undefined) throw new Error(`no glyph "${name}"`);
  return found;
}

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

function skeleton(name: string, over = {}): WorkingSkeleton {
  return runStages(letter(name), DEFAULT_STAGE_LIST, stages, context(over));
}

function options(over: Partial<OutlineOptions> = {}): OutlineOptions {
  return {
    pen: shapePen(trefoil, { A: 3 }, NIB_SIZE, 0),
    ending: roundEnding,
    shapeBuilt: true,
    template: trefoil,
    templateParams: { A: 3 },
    rotation: 24 * DEG,
    copyIndex: 0,
    nibSize: NIB_SIZE,
    amplitude: 3,
    joins: true,
    curvesOn: true,
    ...over,
  };
}

describe('the pen', () => {
  it('is a support table of 360 directions', () => {
    expect(roundPen(10).support).toHaveLength(SUPPORT_ENTRIES);
    expect(shapePen(trefoil, { A: 3 }, NIB_SIZE, 0).support).toHaveLength(SUPPORT_ENTRIES);
  });

  it('reads the same in every direction when it is round', () => {
    const pen = roundPen(10);
    for (const angle of [0, 0.7, Math.PI, 4.2, -2]) expect(supportAt(pen, angle)).toBe(5);
  });

  it('reads differently in different directions when it is the shape', () => {
    const pen = shapePen(trefoil, { A: 3 }, NIB_SIZE, 0);
    const readings = new Set(
      Array.from({ length: 12 }, (_unused, k) => supportAt(pen, (k / 12) * Math.PI * 2).toFixed(4)),
    );
    expect(readings.size).toBeGreaterThan(1);
  });

  it('turns with its copy', () => {
    const still = shapePen(trefoil, { A: 3 }, NIB_SIZE, 0);
    const turned = shapePen(trefoil, { A: 3 }, NIB_SIZE, 40 * DEG);
    expect(supportAt(turned, 0)).not.toBeCloseTo(supportAt(still, 0), 6);
  });

  it('reaches further where the shape reaches further', () => {
    const pen = shapePen(trefoil, { A: 3 }, 1, 0);
    expect(supportAt(pen, 0)).toBeCloseTo(1, 6);
  });
});

describe('runs and free ends', () => {
  it('splits a sharp turn into two runs that share a point', () => {
    const runs = splitRuns([
      [0, 0],
      [0, 50],
      [40, 50],
    ]);
    expect(runs).toHaveLength(2);
    expect(runs[0]?.points[runs[0].points.length - 1]).toEqual(runs[1]?.points[0]);
  });

  it('marks the outer ends free and the inner ones not', () => {
    const runs = splitRuns([
      [0, 0],
      [0, 50],
      [40, 50],
      [40, 0],
    ]);
    expect(runs.map((run) => [run.freeStart, run.freeEnd])).toEqual([
      [true, false],
      [false, false],
      [false, true],
    ]);
  });

  it('leaves a gentle curve as one run', () => {
    const runs = splitRuns([
      [0, 0],
      [10, 1],
      [20, 3],
      [30, 6],
    ]);
    expect(runs).toHaveLength(1);
  });

  it('knows a curve from a stem', () => {
    expect(isCurved([[0, 0], [0, 20], [0, 40]])).toBe(false);
    const arc = Array.from({ length: 20 }, (_unused, k): readonly [number, number] => {
      const t = (k / 19) * Math.PI;
      return [20 * Math.cos(t), 20 * Math.sin(t)];
    });
    expect(isCurved(arc)).toBe(true);
  });
});

describe('the endings', () => {
  it('registers nine', () => {
    expect(builtInEndings).toHaveLength(9);
    const registry = createEndingRegistry();
    expect(registry.list().map((e) => e.id).sort()).toEqual([
      'angled', 'ball', 'flare', 'flat', 'hair', 'round', 'slab', 'taper', 'wedge',
    ]);
  });

  it('draws each one differently, in both forms', () => {
    const shapes = new Set<string>();
    const plains = new Set<string>();

    for (const ending of builtInEndings) {
      const shaped = outlineSkeleton(skeleton('l'), options({ ending, shapeBuilt: true }));
      const plain = outlineSkeleton(skeleton('l'), options({ ending, shapeBuilt: false, pen: roundPen(10) }));
      shapes.add(JSON.stringify(shaped.contours));
      plains.add(JSON.stringify(plain.contours));
    }

    expect(shapes.size).toBeGreaterThan(5);
    expect(plains.size).toBeGreaterThan(5);
  });

  it('adds nothing for flat', () => {
    const flat = outlineSkeleton(skeleton('l'), options({ ending: endingNamed('flat') }));
    const round = outlineSkeleton(skeleton('l'), options({ ending: roundEnding }));
    expect(flat.contours.length).toBeLessThan(round.contours.length);
  });

  it('narrows the stroke itself for a taper', () => {
    const taper = endingNamed('taper');
    expect(taper.profile).toBe('taper');
    const flare = endingNamed('flare');
    expect(flare.profile).toBe('flare');

    const tapered = outlineSkeleton(skeleton('l'), options({ ending: taper }));
    const plain = outlineSkeleton(skeleton('l'), options({ ending: roundEnding }));
    expect(JSON.stringify(tapered.contours)).not.toBe(JSON.stringify(plain.contours));
  });

  it('puts a ball on a curve and not on a stem', () => {
    const ball = endingNamed('ball');
    const onStem = outlineSkeleton(skeleton('l'), options({ ending: ball }));
    const onCurve = outlineSkeleton(skeleton('c'), options({ ending: ball }));
    const flatOnStem = outlineSkeleton(skeleton('l'), options({ ending: endingNamed('flat') }));

    expect(onStem.contours.length).toBe(flatOnStem.contours.length);
    expect(onCurve.contours.length).toBeGreaterThan(0);
  });

  it('lays a serif flat on a stem and upright on an arm', () => {
    const stem = outlineSkeleton(skeleton('l'), options({ ending: slabEnding, shapeBuilt: false, pen: roundPen(10) }));
    const arm = outlineSkeleton(skeleton('T'), options({ ending: slabEnding, shapeBuilt: false, pen: roundPen(10) }));

    const spread = (contours: readonly Contour[]): number => {
      const xs = contours.flat().map(([x]) => x);
      return Math.max(...xs) - Math.min(...xs);
    };

    expect(spread(stem.contours)).toBeGreaterThan(0);
    expect(spread(arm.contours)).toBeGreaterThan(spread(stem.contours));
  });
});

describe('outlining', () => {
  it('turns a stem into a closed contour the run sits inside', () => {
    const outline = outlineSkeleton(skeleton('l'), options({ joins: false }));
    expect(outline.contours.length).toBeGreaterThan(0);
    for (const contour of outline.contours) expect(contour.length).toBeGreaterThanOrEqual(3);
  });

  it('turns a ring into two contours, so the counter stays open', () => {
    const outline = outlineSkeleton(skeleton('o'), options({ joins: false, ending: endingNamed('flat') }));
    expect(outline.contours).toHaveLength(2);
  });

  it('stamps every joint and every dot', () => {
    const withDot = outlineSkeleton(skeleton('i'), options());
    expect(withDot.stamps.length).toBeGreaterThan(0);
    expect(withDot.stamps.some((stamp) => stamp.size > NIB_SIZE)).toBe(true);

    // v is one stroke that turns, so it splits into two runs that share a
    // point. T is two separate strokes that cross, so it has no joint at all.
    const split = outlineSkeleton(skeleton('v'), options());
    expect(split.stamps.length).toBeGreaterThan(0);
    expect(outlineSkeleton(skeleton('T'), options()).stamps).toHaveLength(0);
  });

  it('draws a loop at a sharp corner, and none when joins are off', () => {
    const on = outlineSkeleton(skeleton('v'), options({ joins: true }));
    const off = outlineSkeleton(skeleton('v'), options({ joins: false }));
    expect(on.contours.length).toBeGreaterThan(off.contours.length);
  });

  it('holds no value that is not finite, over any glyph and any parameters', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 20, noNaN: true }),
        fc.double({ min: 0, max: 180, noNaN: true }),
        fc.constantFrom(...Object.keys(latinGlyphs)),
        fc.boolean(),
        fc.constantFrom(...builtInEndings.map((e) => e.id)),
        (A, rot, character, shapeBuilt, endingId) => {
          const ending = endingNamed(endingId);
          const pen: Pen = shapeBuilt ? shapePen(trefoil, { A }, NIB_SIZE, rot * DEG) : roundPen(10);
          const outline = outlineSkeleton(
            runStages(letter(character), DEFAULT_STAGE_LIST, stages, context({ templateParams: { A }, rotation: rot * DEG })),
            options({ pen, ending, shapeBuilt, templateParams: { A }, rotation: rot * DEG, amplitude: Math.max(A, 1.15) }),
          );

          for (const contour of outline.contours) {
            expect(contour.length, character).toBeGreaterThanOrEqual(3);
            for (const [x, y] of contour) {
              expect(Number.isFinite(x) && Number.isFinite(y), `${character} ${endingId}`).toBe(true);
            }
          }
          for (const stamp of outline.stamps) {
            expect(Number.isFinite(stamp.at[0]) && Number.isFinite(stamp.at[1])).toBe(true);
          }
        },
      ),
      { numRuns: 150 },
    );
  });
});
