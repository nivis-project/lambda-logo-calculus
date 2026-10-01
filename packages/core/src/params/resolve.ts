import { isNumericParam, type ParamDef, type ParamValue, type ParamValues } from './types.js';
import { validateParamDefs } from './validate.js';

export class ParamResolveError extends Error {
  readonly paramId: string;

  constructor(paramId: string, message: string) {
    super(`parameter "${paramId}": ${message}`);
    this.name = 'ParamResolveError';
    this.paramId = paramId;
  }
}

export interface ClampReport {
  readonly paramId: string;
  readonly given: number;
  readonly used: number;
}

export interface Resolved {
  readonly values: ParamValues;
  readonly clamped: readonly ClampReport[];
}

function describe(value: unknown): string {
  return value === null ? 'null' : typeof value;
}

export function resolveParams(defs: readonly ParamDef[], stored: ParamValues): Resolved {
  validateParamDefs(defs);

  const byId = new Map<string, ParamDef>();
  for (const def of defs) byId.set(def.id, def);

  for (const id of Object.keys(stored)) {
    if (!byId.has(id)) {
      throw new ParamResolveError(id, 'no parameter with this id is declared');
    }
  }

  const values: Record<string, ParamValue> = {};
  const clamped: ClampReport[] = [];

  for (const def of defs) {
    const given = Object.hasOwn(stored, def.id) ? stored[def.id] : undefined;

    if (given === undefined) {
      values[def.id] = def.default;
      continue;
    }

    if (isNumericParam(def)) {
      if (typeof given !== 'number' || !Number.isFinite(given)) {
        throw new ParamResolveError(
          def.id,
          `expected a finite ${def.kind}, found ${describe(given)}`,
        );
      }
      if (def.kind === 'int' && !Number.isInteger(given)) {
        throw new ParamResolveError(def.id, `expected an integer, found ${given}`);
      }
      const used = Math.min(def.max, Math.max(def.min, given));
      if (used !== given) {
        clamped.push({ paramId: def.id, given, used });
      }
      values[def.id] = used;
      continue;
    }

    if (def.kind === 'enum') {
      if (typeof given !== 'string') {
        throw new ParamResolveError(def.id, `expected an enum option, found ${describe(given)}`);
      }
      if (!def.options.includes(given)) {
        throw new ParamResolveError(
          def.id,
          `"${given}" is not among the options ${def.options.join(', ')}`,
        );
      }
      values[def.id] = given;
      continue;
    }

    if (def.kind === 'bool') {
      if (typeof given !== 'boolean') {
        throw new ParamResolveError(def.id, `expected a boolean, found ${describe(given)}`);
      }
      values[def.id] = given;
      continue;
    }

    if (typeof given !== 'string') {
      throw new ParamResolveError(def.id, `expected a colour string, found ${describe(given)}`);
    }
    values[def.id] = given;
  }

  return { values, clamped };
}
