export const CORE_PACKAGE_VERSION = 0 as const;

export type {
  BoolParamDef,
  ColorParamDef,
  EnumParamDef,
  NumericParamDef,
  ParamDef,
  ParamKind,
  ParamValue,
  ParamValues,
  RandomizeRange,
} from './params/types.js';
export { isNumericParam } from './params/types.js';
export type { ClampReport, Resolved } from './params/resolve.js';
export { ParamResolveError, resolveParams } from './params/resolve.js';
export { randomizeParams } from './params/randomize.js';
export type { Registered, Registry } from './registry/registry.js';
export { RegistryError, createRegistry } from './registry/registry.js';
export type { RandomSource } from './random/seeded.js';
export { seededRandom } from './random/seeded.js';
