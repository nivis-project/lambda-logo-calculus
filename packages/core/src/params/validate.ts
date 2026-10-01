import { isNumericParam, type ParamDef } from './types.js';

export class ParamDefError extends Error {
  readonly paramId: string;

  constructor(paramId: string, message: string) {
    super(`parameter "${paramId}": ${message}`);
    this.name = 'ParamDefError';
    this.paramId = paramId;
  }
}

const COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$|^hsl\(|^rgb\(/;

export function validateParamDef(def: ParamDef): void {
  if (def.id.length === 0) {
    throw new ParamDefError('<empty>', 'the id is empty');
  }
  if (def.label.length === 0) {
    throw new ParamDefError(def.id, 'the label is empty');
  }

  if (isNumericParam(def)) {
    if (!Number.isFinite(def.min) || !Number.isFinite(def.max)) {
      throw new ParamDefError(def.id, `kind "${def.kind}" needs a finite min and max`);
    }
    if (def.min > def.max) {
      throw new ParamDefError(def.id, `min ${def.min} is above max ${def.max}`);
    }
    if (def.default < def.min || def.default > def.max) {
      throw new ParamDefError(
        def.id,
        `default ${def.default} lies outside the range ${def.min} to ${def.max}`,
      );
    }
    if (def.kind === 'int' && !Number.isInteger(def.default)) {
      throw new ParamDefError(def.id, `kind "int" needs an integer default, found ${def.default}`);
    }
    if (def.step !== undefined && !(def.step > 0)) {
      throw new ParamDefError(def.id, `step ${def.step} must be above zero`);
    }
    if (def.randomize !== undefined && def.randomize !== false) {
      const { min, max } = def.randomize;
      if (min > max) {
        throw new ParamDefError(def.id, `randomize min ${min} is above max ${max}`);
      }
      if (min < def.min || max > def.max) {
        throw new ParamDefError(
          def.id,
          `randomize range ${min} to ${max} escapes the range ${def.min} to ${def.max}`,
        );
      }
    }
    return;
  }

  if (def.kind === 'enum') {
    if (def.options.length === 0) {
      throw new ParamDefError(def.id, 'kind "enum" needs at least one option');
    }
    if (!def.options.includes(def.default)) {
      throw new ParamDefError(
        def.id,
        `default "${def.default}" is not among the options ${def.options.join(', ')}`,
      );
    }
    return;
  }

  if (def.kind === 'color' && !COLOR.test(def.default)) {
    throw new ParamDefError(def.id, `default "${def.default}" is not a recognised colour`);
  }
}

export function validateParamDefs(defs: readonly ParamDef[]): void {
  const seen = new Set<string>();
  for (const def of defs) {
    validateParamDef(def);
    if (seen.has(def.id)) {
      throw new ParamDefError(def.id, 'declared twice in one set');
    }
    seen.add(def.id);
  }
}
