export interface WhitelistedFunction {
  readonly arity: number | readonly number[];
  readonly call: (args: readonly number[]) => number;
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

export const FUNCTIONS: Readonly<Record<string, WhitelistedFunction>> = {
  sin: { arity: 1, call: ([a]) => Math.sin(a ?? 0) },
  cos: { arity: 1, call: ([a]) => Math.cos(a ?? 0) },
  tan: { arity: 1, call: ([a]) => Math.tan(a ?? 0) },
  abs: { arity: 1, call: ([a]) => Math.abs(a ?? 0) },
  sqrt: { arity: 1, call: ([a]) => Math.sqrt(a ?? 0) },
  floor: { arity: 1, call: ([a]) => Math.floor(a ?? 0) },
  ceil: { arity: 1, call: ([a]) => Math.ceil(a ?? 0) },
  round: { arity: 1, call: ([a]) => Math.round(a ?? 0) },
  pow: { arity: 2, call: ([a, b]) => Math.pow(a ?? 0, b ?? 0) },
  min: { arity: [2, 3, 4], call: (args) => Math.min(...args) },
  max: { arity: [2, 3, 4], call: (args) => Math.max(...args) },
  clamp: { arity: 3, call: ([a, b, c]) => clamp(a ?? 0, b ?? 0, c ?? 0) },
};

export const CONSTANTS: Readonly<Record<string, number>> = {
  pi: Math.PI,
  e: Math.E,
};

export const FUNCTION_NAMES = Object.keys(FUNCTIONS);
export const CONSTANT_NAMES = Object.keys(CONSTANTS);

export function describeArity(arity: number | readonly number[]): string {
  return typeof arity === 'number' ? `${arity}` : arity.join(' or ');
}

export function acceptsArity(arity: number | readonly number[], count: number): boolean {
  return typeof arity === 'number' ? arity === count : arity.includes(count);
}
