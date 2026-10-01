import { FormulaError, tokenise, type Token } from './tokenise.js';
import { CONSTANTS, FUNCTIONS, acceptsArity, describeArity } from './whitelist.js';

export const MAX_DEPTH = 32;

export type Expression =
  | { readonly kind: 'number'; readonly value: number }
  | { readonly kind: 'variable'; readonly name: string }
  | { readonly kind: 'unary'; readonly operator: '-'; readonly operand: Expression }
  | {
      readonly kind: 'binary';
      readonly operator: '+' | '-' | '*' | '/' | '%' | '**';
      readonly left: Expression;
      readonly right: Expression;
    }
  | { readonly kind: 'call'; readonly name: string; readonly args: readonly Expression[] };

export interface ParsedFormula {
  readonly source: string;
  readonly expression: Expression;
  readonly variables: readonly string[];
}

export function parseFormula(source: string, allowedVariables: readonly string[]): ParsedFormula {
  const tokens = tokenise(source);
  if (tokens.length === 0) {
    throw new FormulaError('the formula is empty', 0);
  }

  const allowed = new Set(allowedVariables);
  const used = new Set<string>();
  let index = 0;
  let depth = 0;

  const peek = (): Token | undefined => tokens[index];
  const end = (): number => source.length;

  const expect = (kind: Token['kind'], what: string): Token => {
    const token = peek();
    if (token === undefined) throw new FormulaError(`expected ${what}`, end());
    if (token.kind !== kind) throw new FormulaError(`expected ${what}, found "${token.text}"`, token.at);
    index++;
    return token;
  };

  const enter = (at: number): void => {
    depth++;
    if (depth > MAX_DEPTH) {
      throw new FormulaError(`the formula nests deeper than ${MAX_DEPTH} levels`, at);
    }
  };

  function primary(): Expression {
    const token = peek();
    if (token === undefined) throw new FormulaError('expected a value', end());

    if (token.kind === 'number') {
      index++;
      return { kind: 'number', value: Number(token.text) };
    }

    if (token.kind === 'lparen') {
      enter(token.at);
      index++;
      const inner = additive();
      expect('rparen', 'a closing parenthesis');
      depth--;
      return inner;
    }

    if (token.kind === 'identifier') {
      index++;
      const next = peek();

      if (next?.kind === 'lparen') {
        const definition = FUNCTIONS[token.text];
        if (definition === undefined) {
          throw new FormulaError(`"${token.text}" is not a function you can use here`, token.at);
        }
        enter(token.at);
        index++;
        const args: Expression[] = [];
        if (peek()?.kind !== 'rparen') {
          args.push(additive());
          while (peek()?.kind === 'comma') {
            index++;
            args.push(additive());
          }
        }
        expect('rparen', `a closing parenthesis for ${token.text}`);
        depth--;

        if (!acceptsArity(definition.arity, args.length)) {
          throw new FormulaError(
            `${token.text} takes ${describeArity(definition.arity)} argument(s), found ${args.length}`,
            token.at,
          );
        }
        return { kind: 'call', name: token.text, args };
      }

      if (Object.hasOwn(CONSTANTS, token.text)) {
        return { kind: 'variable', name: token.text };
      }
      if (allowed.has(token.text)) {
        used.add(token.text);
        return { kind: 'variable', name: token.text };
      }
      throw new FormulaError(
        `"${token.text}" is not a parameter, a variable or a known constant`,
        token.at,
      );
    }

    throw new FormulaError(`unexpected "${token.text}"`, token.at);
  }

  function unary(): Expression {
    const token = peek();
    if (token?.kind === 'operator' && (token.text === '-' || token.text === '+')) {
      index++;
      const operand = unary();
      return token.text === '-' ? { kind: 'unary', operator: '-', operand } : operand;
    }
    return power();
  }

  function power(): Expression {
    const base = primary();
    const token = peek();
    if (token?.kind === 'operator' && (token.text === '**' || token.text === '^')) {
      index++;
      return { kind: 'binary', operator: '**', left: base, right: unary() };
    }
    return base;
  }

  function multiplicative(): Expression {
    let left = unary();
    for (;;) {
      const token = peek();
      if (
        token?.kind !== 'operator' ||
        (token.text !== '*' && token.text !== '/' && token.text !== '%')
      ) {
        return left;
      }
      index++;
      left = { kind: 'binary', operator: token.text, left, right: unary() };
    }
  }

  function additive(): Expression {
    let left = multiplicative();
    for (;;) {
      const token = peek();
      if (token?.kind !== 'operator' || (token.text !== '+' && token.text !== '-')) {
        return left;
      }
      index++;
      left = { kind: 'binary', operator: token.text, left, right: multiplicative() };
    }
  }

  const expression = additive();
  const trailing = peek();
  if (trailing !== undefined) {
    throw new FormulaError(`unexpected "${trailing.text}" after the formula`, trailing.at);
  }

  return { source, expression, variables: [...used].sort() };
}
