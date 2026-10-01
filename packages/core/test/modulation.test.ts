import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  CURVE_NAMES,
  GRID,
  PROTOTYPE_PRESET,
  applyCurve,
  evaluateModulation,
  prototypeModulation,
  prototypeWidthFactor,
  prototypeXHeight,
  sourceValue,
  type ModulationContext,
  type ModulationEntry,
  type NumericParamDef,
} from '../src/index.js';

const AMPLITUDE: NumericParamDef = {
  id: 'A',
  label: 'Amplitude',
  kind: 'number',
  min: 1,
  max: 21,
  default: 3,
  lockable: true,
};

function context(overrides: Partial<ModulationContext> = {}): ModulationContext {
  return {
    templateDefs: [AMPLITUDE],
    templateParams: { A: 3 },
    nesting: { copies: 6, rotation: 24, fit: 0, alpha: 0.22 },
    copyIndex: 0,
    copyCount: 6,
    charIndex: 0,
    charCount: 10,
    seed: 'trefoil',
    metrics: GRID,
    ...overrides,
  };
}

describe('sources', () => {
  it('normalises a template parameter to its range', () => {
    expect(sourceValue({ kind: 'param', paramId: 'A' }, context({ templateParams: { A: 11 } })).value)
      .toBeCloseTo(0.5, 12);
  });

  it('normalises a nesting value to its range', () => {
    expect(
      sourceValue({ kind: 'nesting', field: 'fit' }, context({ nesting: { fit: 0 } })).value,
    ).toBeCloseTo(0.5, 12);
  });

  it('keeps the unnormalised value for a named transfer to read', () => {
    const result = sourceValue({ kind: 'param', paramId: 'A' }, context({ templateParams: { A: 11 } }));
    expect(result.raw).toBe(11);
  });

  it('spans the copy index and the character position', () => {
    expect(sourceValue({ kind: 'copyIndex' }, context({ copyIndex: 0 })).value).toBe(0);
    expect(sourceValue({ kind: 'copyIndex' }, context({ copyIndex: 5 })).value).toBe(1);
    expect(sourceValue({ kind: 'charPosition' }, context({ charIndex: 0 })).value).toBe(0);
    expect(sourceValue({ kind: 'charPosition' }, context({ charIndex: 9 })).value).toBe(1);
  });

  it('gives zero rather than dividing by zero', () => {
    expect(sourceValue({ kind: 'copyIndex' }, context({ copyCount: 1 })).value).toBe(0);
    expect(sourceValue({ kind: 'charPosition' }, context({ charCount: 1 })).value).toBe(0);
  });

  it('is reproducible and in range for a seeded source', () => {
    const source = { kind: 'random', salt: 'jitter' } as const;
    const a = sourceValue(source, context());
    const b = sourceValue(source, context());
    expect(a.value).toBe(b.value);
    expect(a.value).toBeGreaterThanOrEqual(0);
    expect(a.value).toBeLessThan(1);
    expect(sourceValue(source, context({ copyIndex: 2 })).value).not.toBe(a.value);
  });

  it('reports a source it cannot read rather than giving a silent zero', () => {
    expect(sourceValue({ kind: 'param', paramId: 'nope' }, context()).missing).toMatch(
      /no numeric parameter "nope"/,
    );
    expect(
      sourceValue({ kind: 'param', paramId: 'A' }, context({ templateParams: {} })).missing,
    ).toMatch(/has no value/);
    expect(
      sourceValue({ kind: 'nesting', field: 'fit' }, context({ nesting: {} })).missing,
    ).toMatch(/has no value/);
  });
});

describe('curves', () => {
  it('maps both ends through every curve', () => {
    for (const name of CURVE_NAMES) {
      expect(applyCurve(name, 0), name).toBe(0);
      expect(applyCurve(name, 1), name).toBe(1);
    }
  });

  it('keeps linear as the identity', () => {
    for (const t of [0, 0.1, 0.37, 0.5, 0.99, 1]) {
      expect(applyCurve('linear', t)).toBe(t);
    }
  });

  it('starts ease in slower than linear', () => {
    expect(applyCurve('easeIn', 0.25)).toBeLessThan(0.25);
    expect(applyCurve('easeOut', 0.25)).toBeGreaterThan(0.25);
  });

  it('steps at the midpoint', () => {
    expect(applyCurve('step', 0.49)).toBe(0);
    expect(applyCurve('step', 0.51)).toBe(1);
  });

  it('stays in range everywhere', () => {
    fc.assert(
      fc.property(fc.double({ min: -2, max: 3, noNaN: true }), (t) =>
        CURVE_NAMES.every((name) => {
          const value = applyCurve(name, t);
          return value >= 0 && value <= 1;
        }),
      ),
    );
  });
});

describe('the default preset', () => {
  it('matches the prototype formulas exactly at the defaults', () => {
    const result = evaluateModulation(PROTOTYPE_PRESET, context());
    const expected = prototypeModulation({ amplitude: 3, fit: 0, metrics: GRID });
    expect(result.modulation.widthFactor).toBe(expected.widthFactor);
    expect(result.modulation.xHeight).toBe(expected.xHeight);
    expect(result.missing).toEqual([]);
  });

  it('matches across a spread of amplitudes and fit sizes', () => {
    for (const amplitude of [1.15, 3, 7.5, 12, 20]) {
      for (const fit of [-1, -0.3, 0, 0.4, 1]) {
        const result = evaluateModulation(
          PROTOTYPE_PRESET,
          context({
            templateParams: { A: amplitude },
            nesting: { copies: 6, rotation: 24, fit, alpha: 0.22 },
          }),
        );
        const expected = prototypeModulation({ amplitude, fit, metrics: GRID });
        expect(result.modulation.widthFactor, `${amplitude}/${fit}`).toBe(expected.widthFactor);
        expect(result.modulation.xHeight, `${amplitude}/${fit}`).toBe(expected.xHeight);
      }
    }
  });

  it('keeps the formulas available on their own', () => {
    expect(prototypeWidthFactor(3)).toBeCloseTo(0.78 + 0.5 * (1 - Math.exp(-0.5)), 12);
    expect(prototypeXHeight(0, GRID)).toBe(GRID.xHeight);
  });
});

describe('editing the links', () => {
  it('leaves a target unmodulated when the entry is removed', () => {
    const without = PROTOTYPE_PRESET.filter((e) => e.target.kind !== 'widthFactor');
    const result = evaluateModulation(without, context({ templateParams: { A: 18 } }));
    expect(result.modulation.widthFactor).toBe(1);
  });

  it('leaves a target unmodulated at an amount of zero', () => {
    const muted = PROTOTYPE_PRESET.map((e) => ({ ...e, amount: 0 }));
    const result = evaluateModulation(muted, context({ templateParams: { A: 18 } }));
    expect(result.modulation.widthFactor).toBe(1);
    expect(result.modulation.xHeight).toBe(GRID.xHeight);
  });

  it('blends halfway at an amount of one half', () => {
    const half = PROTOTYPE_PRESET.map((e) => ({ ...e, amount: 0.5 }));
    const full = evaluateModulation(PROTOTYPE_PRESET, context({ templateParams: { A: 18 } }));
    const mid = evaluateModulation(half, context({ templateParams: { A: 18 } }));
    expect(mid.modulation.widthFactor).toBeCloseTo((1 + full.modulation.widthFactor) / 2, 12);
  });

  it('drives a stage parameter from a new entry', () => {
    const entry: ModulationEntry = {
      id: 'position-to-bend',
      source: { kind: 'charPosition' },
      target: { kind: 'stageParam', stageId: 'bend', paramId: 'factor' },
      amount: 0.4,
      response: { kind: 'curve', curve: 'linear' },
    };
    const result = evaluateModulation([entry], context({ charIndex: 9 }));
    expect(result.stageParams['bend']?.['factor']).toBeCloseTo(0.4, 12);
    expect(
      evaluateModulation([entry], context({ charIndex: 0 })).stageParams['bend']?.['factor'],
    ).toBe(0);
  });

  it('refuses to let the copy index drive a stage parameter, and says why', () => {
    const entry: ModulationEntry = {
      id: 'copies-to-bend',
      source: { kind: 'copyIndex' },
      target: { kind: 'stageParam', stageId: 'bend', paramId: 'factor' },
      amount: 0.4,
      response: { kind: 'curve', curve: 'linear' },
    };
    const result = evaluateModulation([entry], context({ copyIndex: 5 }));
    expect(result.stageParams['bend']).toBeUndefined();
    expect(result.missing.join(' ')).toMatch(
      /the copy index cannot drive a stage parameter.*stages run once per glyph/,
    );
  });

  it('combines two entries on one target in list order', () => {
    const a: ModulationEntry = {
      id: 'a',
      source: { kind: 'charPosition' },
      target: { kind: 'stageParam', stageId: 'bend', paramId: 'factor' },
      amount: 0.3,
      response: { kind: 'curve', curve: 'linear' },
    };
    const b: ModulationEntry = { ...a, id: 'b', amount: 0.2 };
    const result = evaluateModulation([a, b], context({ charIndex: 9 }));
    expect(result.stageParams['bend']?.['factor']).toBeCloseTo(0.5, 12);
    expect(evaluateModulation([b, a], context({ charIndex: 9 }))).toEqual(result);
  });

  it('round-trips an entry through JSON', () => {
    for (const entry of PROTOTYPE_PRESET) {
      const parsed = JSON.parse(JSON.stringify(entry)) as ModulationEntry;
      expect(evaluateModulation([parsed], context())).toEqual(
        evaluateModulation([entry], context()),
      );
    }
  });
});
