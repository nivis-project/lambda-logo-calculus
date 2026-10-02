import { isNumericParam, type ParamDef, type ParamValue, type ParamValues } from './types.js';

export class ParamResolveError extends Error {
  constructor(
    readonly paramId: string,
    reason: string,
  ) {
    super(`parameter "${paramId}": ${reason}`);
    this.name = 'ParamResolveError';
  }
}

export interface ClampReport {
  readonly paramId: string;
  readonly given: number;
  readonly used: number;
  readonly limit: 'minimum' | 'maximum';
}

export interface Resolved {
  readonly values: ParamValues;
  readonly clamped: readonly ClampReport[];
}

function snap(def: { readonly step?: number; readonly min: number }, value: number): number {
  if (def.step === undefined || def.step <= 0) return value;
  return def.min + Math.round((value - def.min) / def.step) * def.step;
}

function resolveOne(
  def: ParamDef,
  given: ParamValue | undefined,
  clamped: ClampReport[],
): ParamValue {
  if (given === undefined) return def.default;

  if (isNumericParam(def)) {
    if (typeof given !== 'number' || !Number.isFinite(given)) {
      throw new ParamResolveError(def.id, `expected a finite number, got ${typeof given}`);
    }
    if (given < def.min) {
      clamped.push({ paramId: def.id, given, used: def.min, limit: 'minimum' });
      return def.min;
    }
    if (given > def.max) {
      clamped.push({ paramId: def.id, given, used: def.max, limit: 'maximum' });
      return def.max;
    }
    const snapped = snap(def, given);
    return def.kind === 'int' ? Math.round(snapped) : snapped;
  }

  if (def.kind === 'enum') {
    if (typeof given !== 'string') {
      throw new ParamResolveError(def.id, `expected one of its options, got ${typeof given}`);
    }
    if (!def.options.includes(given)) {
      throw new ParamResolveError(def.id, `"${given}" is not one of ${def.options.join(', ')}`);
    }
    return given;
  }

  if (def.kind === 'bool') {
    if (typeof given !== 'boolean') {
      throw new ParamResolveError(def.id, `expected a boolean, got ${typeof given}`);
    }
    return given;
  }

  if (typeof given !== 'string') {
    throw new ParamResolveError(def.id, `expected a colour, got ${typeof given}`);
  }
  return given;
}

export function resolveParams(defs: readonly ParamDef[], given: ParamValues): Resolved {
  const byId = new Map(defs.map((def) => [def.id, def]));

  for (const id of Object.keys(given)) {
    if (!byId.has(id)) {
      throw new ParamResolveError(id, 'no parameter with this id is declared');
    }
  }

  const clamped: ClampReport[] = [];
  const values: Record<string, ParamValue> = {};
  for (const def of defs) values[def.id] = resolveOne(def, given[def.id], clamped);

  return { values, clamped };
}
