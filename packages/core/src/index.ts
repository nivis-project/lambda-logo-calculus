import { builtInTemplates } from '@trefoil/templates';

export const CORE_PACKAGE_VERSION = 0 as const;

export const FONT_UNITS_PER_EM = 1000 as const;

export function registeredTemplateCount(): number {
  return builtInTemplates.length;
}

export type {
  ParamDef,
  ParamKind,
  ParamValue,
  ParamValues,
  NumericParamDef,
  EnumParamDef,
  BoolParamDef,
  ColorParamDef,
  RandomizeRange,
} from './params/types.js';
export { isNumericParam } from './params/types.js';
export { ParamDefError, validateParamDef, validateParamDefs } from './params/validate.js';
export type { ClampReport, Resolved } from './params/resolve.js';
export { ParamResolveError, resolveParams } from './params/resolve.js';
export { randomizeParams } from './params/randomize.js';
export type { SeededRandom } from './random/seeded.js';
export { createSeededRandom } from './random/seeded.js';
export type { Registered, Registry } from './registry/registry.js';
export { RegistryError, createRegistry } from './registry/registry.js';
