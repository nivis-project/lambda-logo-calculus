import { describe, expect, it } from 'vitest';
import {
  BUILT_IN_ENDINGS,
  BEND_PARAMS,
  bendRun,
  emptyWorking,
  flareProfile,
  flatEnding,
  loopJoin,
  outlineSkeleton,
  roundEnding,
  roundPen,
  taperProfile,
  taperedEnding,
  type OutlineOptions,
  type Polyline,
  type ShapeTemplate,
  type StageContext,
  type Vec2,
  type WorkingSkeleton,
} from '../src/index.js';

const DEG = Math.PI / 180;

const trefoil: ShapeTemplate = {
  id: 'trefoil',
  version: 1,
  label: 'Trefoil',
  kind: 'polar',
  symmetry: 3,
  params: [
    { id: 'A', label: 'Amplitude', kind: 'number', min: 1, max: 20, default: 3, lockable: true },
  ],
  safety: {
    minAmplitude: { paramId: 'A', value: 1.15 },
    minPerfectFit: 0.02,
    maxEffectiveScale: 1.5,
    maxCopyScale: 1.6,
  },
  radius: (theta, params) => (params['A'] as number) + Math.cos(3 * theta),
  maxRadius: (params) => (params['A'] as number) + 1,
};

const bare: ShapeTemplate = {
  ...trefoil,
  id: 'bare',
  safety: { minPerfectFit: 0.02, maxEffectiveScale: 1.5, maxCopyScale: 1.6 },
};

const STRAIGHT: Polyline = [
  [0, 0],
  [0, 20],
  [0, 40],
  [0, 60],
];

const CURVED: Polyline = Array.from({ length: 24 }, (_, i) => {
  const t = (i / 23) * Math.PI;
  return [30 * Math.cos(t), 30 * Math.sin(t)] as Vec2;
});

const CORNERED: Polyline = [
  [0, 0],
  [0, 50],
  [40, 50],
];

function options(overrides: Partial<OutlineOptions> = {}): OutlineOptions {
  return {
    pen: roundPen(10),
    ending: roundEnding,
    shapeBuilt: false,
    template: trefoil,
    templateParams: { A: 3 },
    rotation: 24 * DEG,
    copyIndex: 0,
    ...overrides,
  };
}

function skeletonOf(runs: Polyline[], rings: Polyline[] = []): WorkingSkeleton {
  return { ...emptyWorking(48, []), runs, rings, dots: [{ x: 7, y: 72, r: 7 }] };
}

describe('outlining a skeleton', () => {
  it('strokes every run and carries the dots through', () => {
    const outline = outlineSkeleton(skeletonOf([STRAIGHT]), options());
    expect(outline.contours.length).toBeGreaterThan(0);
    expect(outline.dots).toEqual([{ x: 7, y: 72, r: 7 }]);
    expect(outline.style).toBe('letter');
  });

  it('strokes closed rings into two contours each', () => {
    const ring: Polyline = Array.from({ length: 32 }, (_, i) => {
      const t = (i / 32) * Math.PI * 2;
      return [20 * Math.cos(t), 20 * Math.sin(t)] as Vec2;
    });
    const bare = outlineSkeleton(
      { ...emptyWorking(48, []), rings: [ring] },
      options({ ending: flatEnding }),
    );
    expect(bare.contours).toHaveLength(2);
  });

  it('skips a run too short to stroke', () => {
    const outline = outlineSkeleton(skeletonOf([[[0, 0]]]), options());
    expect(outline.contours).toHaveLength(0);
  });

  it('adds ball geometry on a curved run and none on a straight one', () => {
    const ball = BUILT_IN_ENDINGS.find((e) => e.id === 'ball');
    expect(ball).toBeDefined();
    if (ball === undefined) return;

    const curved = outlineSkeleton(skeletonOf([CURVED]), options({ ending: ball }));
    const straight = outlineSkeleton(skeletonOf([STRAIGHT]), options({ ending: ball }));
    expect(curved.contours.length).toBeGreaterThan(straight.contours.length);
  });

  it('adds a loop at a sharp corner only when a join is given', () => {
    const without = outlineSkeleton(skeletonOf([CORNERED]), options({ ending: flatEnding }));
    const withJoin = outlineSkeleton(
      skeletonOf([CORNERED]),
      options({ ending: flatEnding, join: loopJoin, joinParams: { radius: 11, samples: 24 } }),
    );
    expect(withJoin.contours.length).toBe(without.contours.length + 1);
  });

  it('applies the taper profile for the tapered ending and the flare for the flared', () => {
    const flat = outlineSkeleton(skeletonOf([STRAIGHT]), options({ ending: flatEnding }));
    const tapered = outlineSkeleton(skeletonOf([STRAIGHT]), options({ ending: taperedEnding }));
    const flared = BUILT_IN_ENDINGS.find((e) => e.id === 'flared');
    expect(flared).toBeDefined();
    if (flared === undefined) return;
    const widened = outlineSkeleton(skeletonOf([STRAIGHT]), options({ ending: flared }));

    expect(tapered.contours[0]).not.toEqual(flat.contours[0]);
    expect(widened.contours[0]).not.toEqual(flat.contours[0]);
  });

  it('records the style it was given', () => {
    expect(outlineSkeleton(skeletonOf([STRAIGHT]), options({ style: 'ornament' })).style).toBe(
      'ornament',
    );
  });

  it('works for a template that declares no amplitude guard', () => {
    const outline = outlineSkeleton(
      skeletonOf([STRAIGHT]),
      options({ template: bare, shapeBuilt: true }),
    );
    expect(outline.contours.length).toBeGreaterThan(0);
  });
});

describe('fallbacks when a parameter is absent', () => {
  function stageContext(template: ShapeTemplate): StageContext {
    return {
      template,
      templateParams: { A: 3 },
      rotation: 24 * DEG,
      nesting: { perfectFit: 1, effectiveScale: 1, scales: [1], warnings: [] },
      metrics: {
        strokeWidth: 10,
        xHeight: 56,
        capHeight: 86,
        descender: -28,
        sideBearing: 9,
        trim: 8,
        dotRadius: 7,
        wordSpace: 28,
        lineHeight: 150,
      },
      modulation: { widthFactor: 1, xHeight: 56 },
      params: {},
    };
  }

  it('bends with the declared defaults when no parameters are supplied', () => {
    const bent = bendRun(STRAIGHT, stageContext(trefoil));
    expect(bent.length).toBeGreaterThan(STRAIGHT.length);
  });

  it('bends against a template with no amplitude guard', () => {
    const bent = bendRun(STRAIGHT, stageContext(bare));
    expect(bent.length).toBeGreaterThan(STRAIGHT.length);
  });

  it('bends against a template with no declared symmetry', () => {
    const noSymmetry: ShapeTemplate = { ...trefoil, id: 'plain', symmetry: undefined };
    expect(bendRun(STRAIGHT, stageContext(noSymmetry)).length).toBeGreaterThan(STRAIGHT.length);
  });

  it('declares a sensible default for every bend parameter', () => {
    expect(BEND_PARAMS.map((p) => p.id).sort()).toEqual(['factor', 'samples', 'threshold']);
  });

  it('leaves a profile unchanged when the free flags are both false', () => {
    const bound = {
      freeStart: false,
      freeEnd: false,
      taperLength: 22,
      flareLength: 16,
      flareAmount: 0.4,
    };
    expect(taperProfile(STRAIGHT, bound).factors.every((f) => f === 1)).toBe(true);
    expect(flareProfile(STRAIGHT, bound).factors.every((f) => f === 1)).toBe(true);
  });

  it('tapers and flares from both ends when both are free', () => {
    const both = {
      freeStart: true,
      freeEnd: true,
      taperLength: 22,
      flareLength: 16,
      flareAmount: 0.4,
    };
    const taper = taperProfile(STRAIGHT, both).factors;
    const flare = flareProfile(STRAIGHT, both).factors;
    expect(taper[0]).toBeLessThan(1);
    expect(taper[taper.length - 1]).toBeLessThan(1);
    expect(flare[0]).toBeGreaterThan(1);
    expect(flare[flare.length - 1]).toBeGreaterThan(1);
  });
});
