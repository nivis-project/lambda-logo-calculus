import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  BEND_PARAMS,
  BOWLS_PARAMS,
  CURVES_PARAMS,
  DEFAULT_STAGE_LIST,
  GRID,
  IDENTITY_MODULATION,
  PROPORTIONS_PARAMS,
  bendRun,
  bendStage,
  bowlsStage,
  buildBowl,
  computeNesting,
  createStageRegistry,
  curvesStage,
  emptyWorking,
  isNumericParam,
  proportionsStage,
  prototypeModulation,
  remapY,
  runStages,
  sampleArc,
  strokeToPolyline,
  type ArcSegment,
  type BowlPrimitive,
  type GlyphSkeleton,
  type ParamDef,
  type Polyline,
  type ShapeTemplate,
  type StageContext,
  type StrokePrimitive,
  type Vec2,
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

function context(overrides: Partial<StageContext> = {}): StageContext {
  const templateParams = overrides.templateParams ?? { A: 3 };
  const rotation = overrides.rotation ?? 24 * DEG;
  const amplitude = templateParams['A'] as number;
  return {
    template: trefoil,
    templateParams,
    rotation,
    nesting: computeNesting({
      template: trefoil,
      params: templateParams,
      rotation,
      copies: 6,
      fit: 0,
    }),
    metrics: GRID,
    modulation: prototypeModulation({ amplitude, fit: 0, metrics: GRID }),
    params: {},
    ...overrides,
  };
}

function defaults(defs: readonly ParamDef[]): Record<string, number | string | boolean> {
  return Object.fromEntries(defs.map((d) => [d.id, d.default as number]));
}

function arcStroke(a: ArcSegment): StrokePrimitive {
  return { kind: 'stroke', segments: [a] };
}

const ARC: ArcSegment = { kind: 'arc', cx: 24, cy: 34, rx: 19, ry: 22, a0: 180, a1: 0 };
const BOWL: BowlPrimitive = { kind: 'bowl', cx: 24, cy: 28, rx: 24, ry: 28, cuts: [] };
const CUT_BOWL: BowlPrimitive = {
  kind: 'bowl',
  cx: 24,
  cy: 28,
  rx: 24,
  ry: 28,
  cuts: [{ x0: 33, y0: 17, x1: 60, y1: 40 }],
};

function area(ring: Polyline): number {
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    if (a === undefined || b === undefined) continue;
    sum += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(sum) / 2;
}

describe('the stage registry and list', () => {
  it('registers the four built-in stages in pipeline order', () => {
    expect(DEFAULT_STAGE_LIST.map((e) => e.id)).toEqual([
      'curves',
      'bowls',
      'bend',
      'proportions',
    ]);
    expect(createStageRegistry().list().map((s) => s.id).sort()).toEqual([
      'bend',
      'bowls',
      'curves',
      'proportions',
    ]);
  });

  it('applies stages in list order, and a reordered list changes the order', () => {
    const registry = createStageRegistry();
    const glyph: GlyphSkeleton = { advance: 48, parts: [BOWL] };
    const ctx = context();

    const normal = runStages(glyph, DEFAULT_STAGE_LIST, registry, ctx);
    const swapped = runStages(
      glyph,
      [
        { id: 'proportions', enabled: true },
        { id: 'curves', enabled: true },
        { id: 'bowls', enabled: true },
        { id: 'bend', enabled: true },
      ],
      registry,
      ctx,
    );
    expect(normal.rings[0]).not.toEqual(swapped.rings[0]);
  });

  it('skips a disabled stage with no disabled behaviour', () => {
    const registry = createStageRegistry();
    const glyph: GlyphSkeleton = {
      advance: 48,
      parts: [
        {
          kind: 'stroke',
          segments: [
            { kind: 'point', x: 0, y: 0 },
            { kind: 'point', x: 0, y: 80 },
          ],
        },
      ],
    };
    const bent = runStages(glyph, DEFAULT_STAGE_LIST, registry, context());
    const straight = runStages(
      glyph,
      DEFAULT_STAGE_LIST.map((e) => (e.id === 'bend' ? { ...e, enabled: false } : e)),
      registry,
      context(),
    );
    expect(straight.runs[0]).toHaveLength(2);
    expect(bent.runs[0]?.length).toBeGreaterThan(2);
  });

  it('does not mutate its input', () => {
    const glyph: GlyphSkeleton = { advance: 48, parts: [BOWL] };
    const before = structuredClone(glyph);
    runStages(glyph, DEFAULT_STAGE_LIST, createStageRegistry(), context());
    expect(glyph).toEqual(before);
  });

  it('is deterministic', () => {
    const glyph: GlyphSkeleton = { advance: 48, parts: [BOWL, arcStroke(ARC)] };
    const registry = createStageRegistry();
    expect(runStages(glyph, DEFAULT_STAGE_LIST, registry, context())).toEqual(
      runStages(glyph, DEFAULT_STAGE_LIST, registry, context()),
    );
  });
});

describe('the Curves stage', () => {
  const ctx = context({ params: defaults(CURVES_PARAMS) });

  it('leaves a stroke of points unchanged', () => {
    const stroke: StrokePrimitive = {
      kind: 'stroke',
      segments: [
        { kind: 'point', x: 5, y: 0 },
        { kind: 'point', x: 5, y: 86 },
      ],
    };
    expect(strokeToPolyline(stroke, ctx, true)).toEqual([
      [5, 0],
      [5, 86],
    ]);
  });

  it('keeps a warped arc meeting its endpoints', () => {
    const warped = sampleArc(ARC, ctx, true);
    const plain = sampleArc(ARC, ctx, false);
    expect(warped[0]?.[0]).toBeCloseTo(plain[0]?.[0] ?? 0, 9);
    expect(warped[0]?.[1]).toBeCloseTo(plain[0]?.[1] ?? 0, 9);
    expect(warped[warped.length - 1]?.[0]).toBeCloseTo(plain[plain.length - 1]?.[0] ?? 0, 9);
    expect(warped[warped.length - 1]?.[1]).toBeCloseTo(plain[plain.length - 1]?.[1] ?? 0, 9);
  });

  it('samples without warping when disabled', () => {
    const working = emptyWorking(48, [arcStroke(ARC)]);
    const off = curvesStage.applyDisabled?.(working, ctx);
    const on = curvesStage.apply(working, ctx);
    expect(off?.runs[0]).toHaveLength(on.runs[0]?.length ?? 0);
    expect(off?.runs[0]).not.toEqual(on.runs[0]);
  });

  it('keeps every warped sample inside the declared bounds', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1.15, max: 20, noNaN: true }),
        fc.double({ min: 0, max: 360, noNaN: true }),
        (a, rot) => {
          const c = context({ templateParams: { A: a }, rotation: rot * DEG, params: defaults(CURVES_PARAMS) });
          const plain = sampleArc(ARC, c, false);
          const warped = sampleArc(ARC, c, true);
          return warped.every((point, i) => {
            const base = plain[i];
            if (base === undefined) return false;
            const dr = Math.hypot(point[0] - ARC.cx, point[1] - ARC.cy);
            const br = Math.hypot(base[0] - ARC.cx, base[1] - ARC.cy);
            const ratio = br === 0 ? 1 : dr / br;
            return ratio >= 0.5 - 1e-9 && ratio <= 1.5 + 1e-9;
          });
        },
      ),
    );
  });
});

describe('the Bowls stage', () => {
  const ctx = context({ params: defaults(BOWLS_PARAMS) });

  it('yields one closed ring for a bowl with no cut', () => {
    const built = buildBowl(BOWL, ctx, true);
    expect(built.rings).toHaveLength(1);
    expect(built.runs).toHaveLength(0);
  });

  it('opens a bowl that has a cut region', () => {
    const built = buildBowl(CUT_BOWL, ctx, true);
    expect(built.rings).toHaveLength(0);
    expect(built.runs.length).toBeGreaterThan(0);
  });

  it('builds a plain ellipse when disabled', () => {
    const working = emptyWorking(48, [BOWL]);
    const off = bowlsStage.applyDisabled?.(working, ctx);
    const ring = off?.rings[0] ?? [];
    for (const [x, y] of ring) {
      const u = (x - BOWL.cx) / (BOWL.rx - 5);
      const v = (y - BOWL.cy) / (BOWL.ry - 5);
      expect(Math.hypot(u, v)).toBeCloseTo(1, 6);
    }
  });

  it('never collapses the counter', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1.15, max: 20, noNaN: true }),
        fc.double({ min: 0, max: 360, noNaN: true }),
        (a, rot) => {
          const c = context({
            templateParams: { A: a },
            rotation: rot * DEG,
            params: defaults(BOWLS_PARAMS),
          });
          return area(buildBowl(BOWL, c, true).rings[0] ?? []) > 0;
        },
      ),
    );
  });

  it('fits every ring inside the inset box, touching all four sides', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1.15, max: 20, noNaN: true }),
        fc.double({ min: 0, max: 360, noNaN: true }),
        (a, rot) => {
          const c = context({
            templateParams: { A: a },
            rotation: rot * DEG,
            params: defaults(BOWLS_PARAMS),
          });
          const ring = buildBowl(BOWL, c, true).rings[0] ?? [];
          const xs = ring.map(([x]) => x);
          const ys = ring.map(([, y]) => y);
          const halfX = BOWL.rx - 5;
          const halfY = BOWL.ry - 5;
          const within = ring.every(
            ([x, y]) =>
              Math.abs(x - BOWL.cx) <= halfX + 1e-6 && Math.abs(y - BOWL.cy) <= halfY + 1e-6,
          );
          const touches =
            Math.abs(Math.min(...xs) - (BOWL.cx - halfX)) < 1e-6 &&
            Math.abs(Math.max(...xs) - (BOWL.cx + halfX)) < 1e-6 &&
            Math.abs(Math.min(...ys) - (BOWL.cy - halfY)) < 1e-6 &&
            Math.abs(Math.max(...ys) - (BOWL.cy + halfY)) < 1e-6;
          return within && touches;
        },
      ),
    );
  });
});

describe('the Bend stage', () => {
  const ctx = context({ params: defaults(BEND_PARAMS) });
  const straight: Polyline = [
    [0, 0],
    [0, 80],
  ];

  it('keeps the endpoints of a bent run', () => {
    const bent = bendRun(straight, ctx);
    expect(bent[0]).toEqual([0, 0]);
    expect(bent[bent.length - 1]?.[0]).toBeCloseTo(0, 9);
    expect(bent[bent.length - 1]?.[1]).toBeCloseTo(80, 9);
  });

  it('leaves a segment shorter than the threshold straight', () => {
    const short: Polyline = [
      [0, 0],
      [0, 7],
    ];
    expect(bendRun(short, ctx)).toEqual(short);
    const long: Polyline = [
      [0, 0],
      [0, 9],
    ];
    expect(bendRun(long, ctx).length).toBeGreaterThan(2);
  });

  it('leaves runs straight when the bend factor is zero, without being disabled', () => {
    const zero = context({ params: { ...defaults(BEND_PARAMS), factor: 0 } });
    expect(bendRun(straight, zero)).toEqual(straight);
  });

  it('declares no disabled behaviour, so the pipeline simply skips it', () => {
    const working = { ...emptyWorking(48, []), runs: [straight] };
    expect(Object.hasOwn(bendStage, 'applyDisabled')).toBe(false);
    expect(bendStage.apply(working, ctx).runs[0]).not.toEqual(straight);
  });

  it('never moves a run endpoint, for any amplitude or rotation', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1.15, max: 20, noNaN: true }),
        fc.double({ min: 0, max: 360, noNaN: true }),
        (a, rot) => {
          const c = context({
            templateParams: { A: a },
            rotation: rot * DEG,
            params: defaults(BEND_PARAMS),
          });
          const bent = bendRun(straight, c);
          const first = bent[0];
          const last = bent[bent.length - 1];
          if (first === undefined || last === undefined) return false;
          return (
            first[0] === 0 &&
            first[1] === 0 &&
            Math.abs(last[0]) < 1e-9 &&
            Math.abs(last[1] - 80) < 1e-9
          );
        },
      ),
    );
  });
});

describe('the Proportions stage', () => {
  it('computes the prototype width factor and x-height', () => {
    const m = prototypeModulation({ amplitude: 3, fit: 0, metrics: GRID });
    expect(m.widthFactor).toBeCloseTo(0.78 + 0.5 * (1 - Math.exp(-0.5)), 12);
    expect(m.xHeight).toBe(56);
  });

  it('leaves the cap unused across the whole fit slider range', () => {
    for (const fit of [0, 0.25, 0.5, 0.75, 1]) {
      const m = prototypeModulation({ amplitude: 3, fit, metrics: GRID });
      expect(m.xHeight).toBeCloseTo(GRID.xHeight * (1 + 0.22 * fit), 12);
      expect(m.xHeight).toBeLessThan(GRID.capHeight - 16);
    }
  });

  it('caps the x-height when a fit beyond the slider range would exceed the headroom', () => {
    const m = prototypeModulation({ amplitude: 3, fit: 2, metrics: GRID });
    expect(m.xHeight).toBe(GRID.capHeight - 16);
  });

  it('leaves the baseline and the cap-height in place and maps the x-height', () => {
    expect(remapY(0, GRID, 70)).toBe(0);
    expect(remapY(GRID.xHeight, GRID, 70)).toBeCloseTo(70, 12);
    expect(remapY(GRID.capHeight, GRID, 70)).toBeCloseTo(GRID.capHeight, 12);
    expect(remapY(GRID.descender, GRID, 70)).toBe(GRID.descender);
    expect(remapY(120, GRID, 70)).toBe(120);
  });

  it('is monotonic in y', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -40, max: 120, noNaN: true }),
        fc.double({ min: -40, max: 120, noNaN: true }),
        fc.double({ min: 40, max: 70, noNaN: true }),
        (p, q, xh) => {
          if (p === q) return true;
          const lo = Math.min(p, q);
          const hi = Math.max(p, q);
          return remapY(lo, GRID, xh) <= remapY(hi, GRID, xh) + 1e-9;
        },
      ),
    );
  });

  it('leaves every coordinate untouched when disabled', () => {
    const working = {
      ...emptyWorking(48, []),
      runs: [
        [
          [5, 0],
          [5, 56],
        ] as Polyline,
      ],
      dots: [{ x: 7, y: 72, r: 7 }],
    };
    const ctx = context({ params: defaults(PROPORTIONS_PARAMS) });
    const off = proportionsStage.applyDisabled?.(working, ctx);
    expect(off?.runs[0]).toEqual(working.runs[0]);
    expect(off?.dots[0]).toEqual(working.dots[0]);
    expect(IDENTITY_MODULATION(GRID)).toEqual({ widthFactor: 1, xHeight: 56 });
  });
});

describe('stage parameters', () => {
  it('default to the prototype values', () => {
    const value = (defs: readonly ParamDef[], id: string): unknown =>
      defs.find((d) => d.id === id)?.default;
    expect(value(BOWLS_PARAMS, 'inset')).toBe(5);
    expect(value(BOWLS_PARAMS, 'radiusFloor')).toBe(0.35);
    expect(value(BEND_PARAMS, 'factor')).toBe(0.22);
    expect(value(BEND_PARAMS, 'threshold')).toBe(8);
    expect(value(BEND_PARAMS, 'samples')).toBe(12);
    expect(value(CURVES_PARAMS, 'warpMin')).toBe(0.5);
    expect(value(CURVES_PARAMS, 'warpMax')).toBe(1.5);
    expect(value(PROPORTIONS_PARAMS, 'widthBase')).toBe(0.78);
    expect(value(PROPORTIONS_PARAMS, 'xHeightGain')).toBe(0.22);
  });

  it('every stage parameter is declared with a range and a group', () => {
    for (const stage of [curvesStage, bowlsStage, bendStage, proportionsStage]) {
      for (const def of stage.params) {
        expect(def.group, `${stage.id}.${def.id}`).toBeDefined();
        if (isNumericParam(def)) {
          expect(Number.isFinite(def.min), `${stage.id}.${def.id}`).toBe(true);
          expect(Number.isFinite(def.max), `${stage.id}.${def.id}`).toBe(true);
        }
      }
    }
  });

  it('changing a parameter changes the output', () => {
    const base = context({ params: defaults(BOWLS_PARAMS) });
    const wider = context({ params: { ...defaults(BOWLS_PARAMS), inset: 12 } });
    expect(buildBowl(BOWL, base, true).rings[0]).not.toEqual(buildBowl(BOWL, wider, true).rings[0]);
  });
});

describe('stage invariants over the whole pipeline', () => {
  const registry = createStageRegistry();

  const onBaseline: GlyphSkeleton = {
    advance: 14,
    parts: [
      {
        kind: 'stroke',
        segments: [
          { kind: 'point', x: 7, y: 0 },
          { kind: 'point', x: 7, y: 86 },
        ],
      },
    ],
  };

  it('keeps a run that starts on the baseline on the baseline', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1.15, max: 20, noNaN: true }),
        fc.double({ min: 0, max: 360, noNaN: true }),
        (a, rot) => {
          const result = runStages(
            onBaseline,
            DEFAULT_STAGE_LIST,
            registry,
            context({ templateParams: { A: a }, rotation: rot * DEG }),
          );
          const first: Vec2 | undefined = result.runs[0]?.[0];
          return first !== undefined && Math.abs(first[1]) < 1e-9;
        },
      ),
    );
  });

  it('produces only finite coordinates', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1.15, max: 20, noNaN: true }),
        fc.double({ min: 0, max: 360, noNaN: true }),
        (a, rot) => {
          const glyph: GlyphSkeleton = { advance: 48, parts: [CUT_BOWL, arcStroke(ARC)] };
          const result = runStages(
            glyph,
            DEFAULT_STAGE_LIST,
            registry,
            context({ templateParams: { A: a }, rotation: rot * DEG }),
          );
          return [...result.runs, ...result.rings]
            .flat()
            .every(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
        },
      ),
    );
  });
});
