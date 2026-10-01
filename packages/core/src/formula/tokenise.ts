export type TokenKind = 'number' | 'identifier' | 'operator' | 'lparen' | 'rparen' | 'comma';

export interface Token {
  readonly kind: TokenKind;
  readonly text: string;
  readonly at: number;
}

export class FormulaError extends Error {
  readonly at: number;

  constructor(message: string, at: number) {
    super(`${message} (at position ${at})`);
    this.name = 'FormulaError';
    this.at = at;
  }
}

const OPERATORS = ['**', '+', '-', '*', '/', '%', '^'];

export function tokenise(source: string): readonly Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < source.length) {
    const char = source[i];
    if (char === undefined) break;

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(source[i + 1] ?? ''))) {
      const match = /^[0-9]*\.?[0-9]+(?:[eE][+-]?[0-9]+)?/.exec(source.slice(i));
      if (match === null) throw new FormulaError(`"${char}" does not start a number`, i);
      tokens.push({ kind: 'number', text: match[0], at: i });
      i += match[0].length;
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      const match = /^[A-Za-z_][A-Za-z0-9_]*/.exec(source.slice(i));
      if (match === null) throw new FormulaError(`"${char}" does not start a name`, i);
      tokens.push({ kind: 'identifier', text: match[0], at: i });
      i += match[0].length;
      continue;
    }

    if (char === '(') {
      tokens.push({ kind: 'lparen', text: char, at: i });
      i++;
      continue;
    }
    if (char === ')') {
      tokens.push({ kind: 'rparen', text: char, at: i });
      i++;
      continue;
    }
    if (char === ',') {
      tokens.push({ kind: 'comma', text: char, at: i });
      i++;
      continue;
    }

    const operator = OPERATORS.find((op) => source.startsWith(op, i));
    if (operator !== undefined) {
      tokens.push({ kind: 'operator', text: operator, at: i });
      i += operator.length;
      continue;
    }

    throw new FormulaError(`"${char}" is not allowed in a formula`, i);
  }

  return tokens;
}
