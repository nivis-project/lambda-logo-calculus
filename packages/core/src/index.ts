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

export type { SafetyWarning, SampledPoint, ShapeTemplate, Vec2 } from './template/types.js';
export { radiusAt, sampleCurve } from './template/sample.js';
export {
  AMPLITUDE_FLOOR,
  TREFOIL_PARAMS,
  TREFOIL_LOBES,
  amplitudeOf,
  builtInTemplates,
  trefoil,
} from './template/trefoil.js';
export type { NestingInput, NestingResult } from './template/nesting.js';
export {
  COPY_SCALE_CEILING,
  EFFECTIVE_SCALE_CEILING,
  PERFECT_FIT_FLOOR,
  PERFECT_FIT_SAMPLES,
  computeNesting,
  effectiveScale,
  perfectFit,
} from './template/nesting.js';
export { createTemplateRegistry } from './template/registry.js';

export type {
  ArcSegment,
  BowlPrimitive,
  CutRegion,
  DotPrimitive,
  GlyphSet,
  GlyphSkeleton,
  GridMetrics,
  PointSegment,
  SkeletonPrimitive,
  StrokePrimitive,
  StrokeSegment,
} from './glyph/types.js';
export { GRID, NOTDEF } from './glyph/types.js';
export { GlyphError, validateGlyph, validateGlyphs } from './glyph/validate.js';
export { latinGlyphs } from './glyph/latin.js';
export { createGlyphSetRegistry, glyphFor, latinGlyphSet } from './glyph/registry.js';

export type {
  Dot,
  Modulation,
  Polyline,
  SkeletonStage,
  StageContext,
  StageListEntry,
  WorkingSkeleton,
} from './stage/types.js';
export { emptyWorking } from './stage/types.js';
export { CURVES_PARAMS, curvesStage, sampleArc } from './stage/curves.js';
export { BOWLS_PARAMS, bowlsStage, cutRing } from './stage/bowls.js';
export { BEND_PARAMS, bendRun, bendStage } from './stage/bend.js';
export { proportionsStage, remapHeight } from './stage/proportions.js';
export {
  DEFAULT_STAGE_LIST,
  builtInStages,
  createStageRegistry,
  runStages,
} from './stage/pipeline.js';
