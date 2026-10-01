import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  ParamDefError,
  ParamResolveError,
  resolveParams,
  validateParamDef,
  validateParamDefs,
  type BoolParamDef,
  type ColorParamDef,
  type EnumParamDef,
  type NumericParamDef,
  type ParamDef,
} from '../src/index.js';

const amplitude: NumericParamDef = {
  id: 'A',
  label: 'Amplitude',
  kind: 'number',
  min: 1,
  max: 20,
  default: 3,
  lockable: true,
};

const copies: NumericParamDef = {
  id: 'copies',
  label: 'Copies',
  kind: 'int',
  min: 1,
  max: 12,
  default: 6,
  lockable: true,
};

const rotation: NumericParamDef = {
  id: 'rot',
  label: 'Rotation',
  kind: 'angle',
  min: 0,
  max: 360,
  default: 24,
  lockable: true,
};

const palette: EnumParamDef = {
  id: 'pal',
  label: 'Palette',
  kind: 'enum',
  options: ['Monochrome', 'Analogous', 'Complementary', 'Triadic', 'Warm', 'Cool'],
  default: 'Analogous',
  lockable: true,
};

const joins: BoolParamDef = {
  id: 'joins',
  label: 'Looped joins',
  kind: 'bool',
  default: true,
  lockable: true,
};

const ink: ColorParamDef = {
  id: 'ink',
  label: 'Ink',
  kind: 'color',
  default: '#1a1a18',
  lockable: true,
};

const ALL: readonly ParamDef[] = [amplitude, copies, rotation, palette, joins, ink];

describe('parameter definitions', () => {
  it('accepts a valid definition of every kind', () => {
    for (const def of ALL) {
      expect(() => {
        validateParamDef(def);
      }).not.toThrow();
    }
  });

  it('rejects a numeric definition with no finite range', () => {
    expect(() => {
      validateParamDef({ ...amplitude, max: Number.POSITIVE_INFINITY });
    }).toThrow(/needs a finite min and max/);
  });

  it('rejects a default outside its range, naming both values', () => {
    expect(() => {
      validateParamDef({ ...amplitude, default: 25 });
    }).toThrow(/default 25 lies outside the range 1 to 20/);
  });

  it('rejects min above max', () => {
    expect(() => {
      validateParamDef({ ...amplitude, min: 30 });
    }).toThrow(/min 30 is above max 20/);
  });

  it('rejects a fractional default for an int', () => {
    expect(() => {
      validateParamDef({ ...copies, default: 6.5 });
    }).toThrow(/needs an integer default/);
  });

  it('rejects a non-positive step', () => {
    expect(() => {
      validateParamDef({ ...amplitude, step: 0 });
    }).toThrow(/must be above zero/);
  });

  it('rejects a randomize range that escapes the declared range', () => {
    expect(() => {
      validateParamDef({ ...amplitude, randomize: { min: 0, max: 30 } });
    }).toThrow(/escapes the range 1 to 20/);
  });

  it('rejects an inverted randomize range', () => {
    expect(() => {
      validateParamDef({ ...amplitude, randomize: { min: 9, max: 2 } });
    }).toThrow(/randomize min 9 is above max 2/);
  });

  it('rejects an enum with no options', () => {
    expect(() => {
      validateParamDef({ ...palette, options: [], default: 'x' });
    }).toThrow(/needs at least one option/);
  });

  it('rejects an enum default that is not an option', () => {
    expect(() => {
      validateParamDef({ ...palette, default: 'Neon' });
    }).toThrow(/is not among the options/);
  });

  it('rejects an empty id and an empty label', () => {
    expect(() => {
      validateParamDef({ ...amplitude, id: '' });
    }).toThrow(/the id is empty/);
    expect(() => {
      validateParamDef({ ...amplitude, label: '' });
    }).toThrow(/the label is empty/);
  });

  it('rejects a colour default that is not a colour', () => {
    expect(() => {
      validateParamDef({ ...ink, default: 'blueish' });
    }).toThrow(/is not a recognised colour/);
  });

  it('names the parameter id on every rejection', () => {
    try {
      validateParamDef({ ...amplitude, default: 99 });
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ParamDefError);
      expect((error as ParamDefError).paramId).toBe('A');
    }
  });

  it('rejects the same id declared twice in one set', () => {
    expect(() => {
      validateParamDefs([amplitude, { ...amplitude, label: 'Again' }]);
    }).toThrow(/declared twice in one set/);
  });
});

describe('parameter resolution', () => {
  it('fills the default for a missing value', () => {
    const { values } = resolveParams(ALL, {});
    expect(values['A']).toBe(3);
    expect(values['copies']).toBe(6);
    expect(values['pal']).toBe('Analogous');
    expect(values['joins']).toBe(true);
    expect(values['ink']).toBe('#1a1a18');
  });

  it('keeps a value that is inside its range', () => {
    const { values, clamped } = resolveParams(ALL, { A: 7.5 });
    expect(values['A']).toBe(7.5);
    expect(clamped).toEqual([]);
  });

  it('clamps an out-of-range value and reports both values', () => {
    const { values, clamped } = resolveParams(ALL, { A: 50 });
    expect(values['A']).toBe(20);
    expect(clamped).toEqual([{ paramId: 'A', given: 50, used: 20 }]);
  });

  it('clamps below the minimum too', () => {
    const { values, clamped } = resolveParams(ALL, { A: -4 });
    expect(values['A']).toBe(1);
    expect(clamped[0]?.given).toBe(-4);
  });

  it('rejects a value of the wrong kind, naming what it found', () => {
    expect(() => resolveParams(ALL, { A: 'three' })).toThrow(
      /expected a finite number, found string/,
    );
    expect(() => resolveParams(ALL, { joins: 1 })).toThrow(/expected a boolean, found number/);
    expect(() => resolveParams(ALL, { pal: 4 })).toThrow(/expected an enum option, found number/);
    expect(() => resolveParams(ALL, { ink: 3 })).toThrow(/expected a colour string, found number/);
  });

  it('rejects a non-finite number', () => {
    expect(() => resolveParams(ALL, { A: Number.NaN })).toThrow(/expected a finite number/);
  });

  it('rejects a fraction for an int parameter', () => {
    expect(() => resolveParams(ALL, { copies: 6.4 })).toThrow(/expected an integer, found 6.4/);
  });

  it('rejects an enum value that is not an option', () => {
    expect(() => resolveParams(ALL, { pal: 'Neon' })).toThrow(/is not among the options/);
  });

  it('accepts a valid value for every non-numeric kind', () => {
    const { values } = resolveParams(ALL, {
      pal: 'Triadic',
      joins: false,
      ink: 'hsl(322 70% 50%)',
    });
    expect(values['pal']).toBe('Triadic');
    expect(values['joins']).toBe(false);
    expect(values['ink']).toBe('hsl(322 70% 50%)');
  });

  it('describes null distinctly from undefined when rejecting', () => {
    expect(() => resolveParams(ALL, { joins: null as unknown as boolean })).toThrow(
      /expected a boolean, found null/,
    );
  });

  it('rejects a stored id that matches no definition', () => {
    try {
      resolveParams(ALL, { wobble: 1 });
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ParamResolveError);
      expect((error as ParamResolveError).paramId).toBe('wobble');
    }
  });

  it('leaves in-range values untouched and reports no clamp', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 20, noNaN: true }),
        fc.integer({ min: 1, max: 12 }),
        fc.double({ min: 0, max: 360, noNaN: true }),
        (a, n, rot) => {
          const { values, clamped } = resolveParams(ALL, { A: a, copies: n, rot });
          return (
            values['A'] === a && values['copies'] === n && values['rot'] === rot && clamped.length === 0
          );
        },
      ),
    );
  });

  it('always returns a value for every declared parameter', () => {
    fc.assert(
      fc.property(fc.double({ min: -1000, max: 1000, noNaN: true }), (a) => {
        const { values } = resolveParams(ALL, { A: a });
        return ALL.every((def) => values[def.id] !== undefined);
      }),
    );
  });
});
