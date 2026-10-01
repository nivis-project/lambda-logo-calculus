import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  CONSTANT_NAMES,
  FUNCTION_NAMES,
  FormulaError,
  MAX_DEPTH,
  buildCustomTemplate,
  computeNesting,
  createTemplateRegistry,
  evaluateFormula,
  parseFormula,
  radiusAt,
  sampleCurve,
  tokenise,
  validateCurve,
  type NumericParamDef,
} from '../src/index.js';

const VARS = ['theta', 'A'];

function value(source: string, bindings: Record<string, number> = {}): number {
  const result = evaluateFormula(parseFormula(source, VARS), bindings);
  if (!result.ok) throw new Error(result.reason ?? 'evaluation failed');
  return result.value;
}

describe('the tokeniser', () => {
  it('reads numbers, names, operators and parentheses with their positions', () => {
    expect(tokenise('A + cos(3*theta)').map((t) => [t.kind, t.text, t.at])).toEqual([
      ['identifier', 'A', 0],
      ['operator', '+', 2],
      ['identifier', 'cos', 4],
      ['lparen', '(', 7],
      ['number', '3', 8],
      ['operator', '*', 9],
      ['identifier', 'theta', 10],
      ['rparen', ')', 15],
    ]);
  });

  it('reads decimals and exponents', () => {
    expect(tokenise('1.5e-3').map((t) => t.text)).toEqual(['1.5e-3']);
    expect(tokenise('.5').map((t) => t.text)).toEqual(['.5']);
  });

  it('refuses a character outside the grammar, naming it and where', () => {
    for (const [source, char] of [
      ['a.b', '.'],
      ['a[0]', '['],
      ['a; b', ';'],
      ["'x'", "'"],
      ['`x`', '`'],
      ['a = 1', '='],
      ['a & b', '&'],
      ['a | b', '|'],
      ['a ? b : c', '?'],
      ['{a}', '{'],
    ] as const) {
      try {
        tokenise(source);
        expect.unreachable(`should have refused ${source}`);
      } catch (error) {
        expect(error, source).toBeInstanceOf(FormulaError);
        expect((error as Error).message, source).toContain(`"${char}" is not allowed`);
        expect((error as Error).message, source).toMatch(/at position \d+/);
      }
    }
  });
});

describe('the parser', () => {
  it('applies the precedence a formula expects', () => {
    expect(value('2 + 3 * 4')).toBe(14);
    expect(value('(2 + 3) * 4')).toBe(20);
    expect(value('2 ** 3 ** 2')).toBe(512);
    expect(value('-2 ** 2')).toBe(-4);
    expect(value('2 * -3')).toBe(-6);
    expect(value('7 % 3')).toBe(1);
    expect(value('10 / 4')).toBe(2.5);
    expect(value('+5')).toBe(5);
    expect(value('--5')).toBe(5);
  });

  it('accepts the caret as exponentiation', () => {
    expect(value('2 ^ 10')).toBe(1024);
  });

  it('resolves declared parameters and the curve variable', () => {
    expect(value('A + cos(3 * theta)', { A: 3, theta: 0 })).toBeCloseTo(4, 12);
    expect(parseFormula('A + theta', VARS).variables).toEqual(['A', 'theta']);
  });

  it('refuses an unknown identifier, naming it and where', () => {
    expect(() => parseFormula('A + wobble', VARS)).toThrow(
      /"wobble" is not a parameter, a variable or a known constant \(at position 4\)/,
    );
  });

  it('refuses an unknown function, naming it and where', () => {
    expect(() => parseFormula('A + wiggle(theta)', VARS)).toThrow(
      /"wiggle" is not a function you can use here \(at position 4\)/,
    );
  });

  it('refuses a wrong argument count, saying how many it expects', () => {
    expect(() => parseFormula('clamp(1, 2)', VARS)).toThrow(/clamp takes 3 argument\(s\), found 2/);
    expect(() => parseFormula('cos(1, 2)', VARS)).toThrow(/cos takes 1 argument\(s\), found 2/);
    expect(() => parseFormula('min(1)', VARS)).toThrow(
      /min takes 2 or 3 or 4 argument\(s\), found 1/,
    );
  });

  it('refuses an unbalanced parenthesis and an empty formula', () => {
    expect(() => parseFormula('(1 + 2', VARS)).toThrow(/expected a closing parenthesis/);
    expect(() => parseFormula('', VARS)).toThrow(/the formula is empty/);
    expect(() => parseFormula('   ', VARS)).toThrow(/the formula is empty/);
  });

  it('refuses trailing input and a dangling operator', () => {
    expect(() => parseFormula('1 2', VARS)).toThrow(/unexpected "2" after the formula/);
    expect(() => parseFormula('1 +', VARS)).toThrow(/expected a value/);
    expect(() => parseFormula(')', VARS)).toThrow(/unexpected "\)"/);
  });

  it('bounds the nesting depth rather than overflowing the stack', () => {
    const deep = `${'('.repeat(MAX_DEPTH + 5)}1${')'.repeat(MAX_DEPTH + 5)}`;
    expect(() => parseFormula(deep, VARS)).toThrow(
      new RegExp(`nests deeper than ${MAX_DEPTH} levels`),
    );
    const shallow = `${'('.repeat(MAX_DEPTH - 2)}1${')'.repeat(MAX_DEPTH - 2)}`;
    expect(() => parseFormula(shallow, VARS)).not.toThrow();
  });
});

describe('the evaluator', () => {
  it('computes every whitelisted function', () => {
    expect(value('sin(0)')).toBe(0);
    expect(value('cos(0)')).toBe(1);
    expect(value('tan(0)')).toBe(0);
    expect(value('abs(-3)')).toBe(3);
    expect(value('sqrt(16)')).toBe(4);
    expect(value('floor(2.7)')).toBe(2);
    expect(value('ceil(2.1)')).toBe(3);
    expect(value('round(2.5)')).toBe(3);
    expect(value('pow(2, 8)')).toBe(256);
    expect(value('min(5, 2)')).toBe(2);
    expect(value('max(5, 2, 9)')).toBe(9);
    expect(value('clamp(15, 0, 10)')).toBe(10);
    expect(value('clamp(-5, 0, 10)')).toBe(0);
  });

  it('knows its constants', () => {
    expect(value('pi')).toBeCloseTo(Math.PI, 12);
    expect(value('e')).toBeCloseTo(Math.E, 12);
    expect(CONSTANT_NAMES.sort()).toEqual(['e', 'pi']);
    expect(FUNCTION_NAMES).toHaveLength(12);
  });

  it('reports a non-finite result rather than returning it', () => {
    const divided = evaluateFormula(parseFormula('1 / 0', VARS), {});
    expect(divided.ok).toBe(false);
    expect(divided.reason).toMatch(/produced Infinity/);

    const root = evaluateFormula(parseFormula('sqrt(-1)', VARS), {});
    expect(root.ok).toBe(false);
    expect(root.reason).toMatch(/produced NaN/);
  });

  it('reports a variable with no value', () => {
    const result = evaluateFormula(parseFormula('A + 1', VARS), {});
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/"A" has no value/);
  });

  it('terminates and returns a number for random bindings', () => {
    const formula = parseFormula('A + cos(3 * theta) + clamp(A * theta, -5, 5)', VARS);
    fc.assert(
      fc.property(
        fc.double({ min: -100, max: 100, noNaN: true }),
        fc.double({ min: -100, max: 100, noNaN: true }),
        (a, theta) => {
          const result = evaluateFormula(formula, { A: a, theta });
          return typeof result.value === 'number' && (result.ok ? Number.isFinite(result.value) : true);
        },
      ),
    );
  });
});

describe('nothing in the grammar reaches a global', () => {
  const attempts = [
    'constructor',
    'globalThis',
    'process',
    'window',
    'Function',
    'eval',
    'require',
    'import',
    'this',
    '__proto__',
    'toString',
    'Math',
    'Object',
    'constructor("return 1")',
    'globalThis.process',
    'A.constructor',
    '[].constructor',
    'cos.constructor',
  ];

  it('refuses every known escape attempt', () => {
    for (const attempt of attempts) {
      expect(() => parseFormula(attempt, VARS), attempt).toThrow();
    }
  });

  it('refuses a name that exists in the host but not on the whitelist', () => {
    expect(() => parseFormula('Math', VARS)).toThrow(/is not a parameter/);
    expect(() => parseFormula('NaN', VARS)).toThrow(/is not a parameter/);
    expect(() => parseFormula('Infinity', VARS)).toThrow(/is not a parameter/);
    expect(() => parseFormula('undefined', VARS)).toThrow(/is not a parameter/);
  });

  it('only ever resolves a name to a parameter, the variable or a constant', () => {
    fc.assert(
      fc.property(fc.stringMatching(/^[A-Za-z_][A-Za-z0-9_]{0,10}$/), (name) => {
        const known = VARS.includes(name) || CONSTANT_NAMES.includes(name);
        try {
          parseFormula(name, VARS);
          return known;
        } catch {
          return !known;
        }
      }),
    );
  });
});

describe('a custom template', () => {
  const amplitude: NumericParamDef = {
    id: 'A',
    label: 'Amplitude',
    kind: 'number',
    min: 1,
    max: 20,
    default: 3,
    lockable: true,
  };

  const definition = {
    id: 'my-curve',
    label: 'My curve',
    kind: 'polar' as const,
    params: [amplitude],
    radiusFormula: 'A + cos(5 * theta)',
  };

  it('registers, samples and nests like any other template', () => {
    const template = buildCustomTemplate(definition);
    const registry = createTemplateRegistry();
    expect(() => {
      registry.register(template);
    }).not.toThrow();

    expect(radiusAt(template, 0, { A: 3 })).toBeCloseTo(4, 12);
    expect(sampleCurve(template, { A: 3 }, 64)).toHaveLength(64);
    expect(
      computeNesting({
        template,
        params: { A: 3 },
        rotation: (24 * Math.PI) / 180,
        copies: 6,
        fit: 0,
      }).scales[0],
    ).toBe(1);
  });

  it('turns the parameters the designer declared into parameter definitions', () => {
    expect(buildCustomTemplate(definition).params).toEqual([amplitude]);
  });

  it('rebuilds from its stored text and parameters to the same curve', () => {
    const first = buildCustomTemplate(definition);
    const rebuilt = buildCustomTemplate(first.definition);
    for (let k = 0; k < 64; k++) {
      const theta = (k / 64) * Math.PI * 2;
      expect(radiusAt(rebuilt, theta, { A: 4.5 })).toBe(radiusAt(first, theta, { A: 4.5 }));
    }
  });

  it('builds a parametric custom template too', () => {
    const template = buildCustomTemplate({
      id: 'my-parametric',
      label: 'My parametric curve',
      kind: 'parametric',
      params: [amplitude],
      xFormula: 'A * cos(t)',
      yFormula: 'A * sin(t)',
    });
    expect(template.point?.(0, { A: 2 })).toEqual([2, 0]);
    expect(sampleCurve(template, { A: 2 }, 32)).toHaveLength(32);
  });

  it('refuses a template that declares no formula for its kind', () => {
    expect(() =>
      buildCustomTemplate({ ...definition, radiusFormula: undefined as unknown as string }),
    ).toThrow(/polar but declares no radius formula/);
    expect(() =>
      buildCustomTemplate({
        id: 'x',
        label: 'x',
        kind: 'parametric',
        params: [],
        xFormula: 'cos(t)',
      }),
    ).toThrow(/parametric but declares no x and y formulas/);
  });

  it('refuses a formula naming an undeclared parameter', () => {
    expect(() =>
      buildCustomTemplate({ ...definition, radiusFormula: 'A + B * cos(theta)' }),
    ).toThrow(/"B" is not a parameter/);
  });

  it('reports an invalid curve through validation rather than drawing it', () => {
    const template = buildCustomTemplate({
      ...definition,
      id: 'goes-negative',
      radiusFormula: 'cos(3 * theta)',
    });
    const validation = validateCurve(template, { A: 3 });
    expect(validation.nonNegative).toBe(false);
    expect(validation.findings.join(' ')).toMatch(/the radius is/);
  });
});
