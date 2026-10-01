import type { Expression, ParsedFormula } from './parse.js';
import { FormulaError } from './tokenise.js';
import { CONSTANTS, FUNCTIONS } from './whitelist.js';

export type Bindings = Readonly<Record<string, number>>;

export class FormulaEvaluationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FormulaEvaluationError';
  }
}

function walk(node: Expression, bindings: Bindings): number {
  switch (node.kind) {
    case 'number':
      return node.value;

    case 'variable': {
      if (Object.hasOwn(CONSTANTS, node.name)) return CONSTANTS[node.name] ?? 0;
      if (Object.hasOwn(bindings, node.name)) return bindings[node.name] ?? 0;
      throw new FormulaEvaluationError(`"${node.name}" has no value`);
    }

    case 'unary':
      return -walk(node.operand, bindings);

    case 'binary': {
      const left = walk(node.left, bindings);
      const right = walk(node.right, bindings);
      if (node.operator === '+') return left + right;
      if (node.operator === '-') return left - right;
      if (node.operator === '*') return left * right;
      if (node.operator === '/') return left / right;
      if (node.operator === '%') return left % right;
      return Math.pow(left, right);
    }

    case 'call': {
      const definition = FUNCTIONS[node.name];
      if (definition === undefined) {
        throw new FormulaEvaluationError(`"${node.name}" is not a function`);
      }
      return definition.call(node.args.map((argument) => walk(argument, bindings)));
    }
  }
}

export interface EvaluationResult {
  readonly ok: boolean;
  readonly value: number;
  readonly reason?: string;
}

export function evaluateFormula(formula: ParsedFormula, bindings: Bindings): EvaluationResult {
  let value: number;
  try {
    value = walk(formula.expression, bindings);
  } catch (error) {
    return {
      ok: false,
      value: Number.NaN,
      reason: error instanceof Error ? error.message : String(error),
    };
  }

  if (!Number.isFinite(value)) {
    return {
      ok: false,
      value,
      reason: `the formula produced ${String(value)} for these values`,
    };
  }
  return { ok: true, value };
}

export { FormulaError };
