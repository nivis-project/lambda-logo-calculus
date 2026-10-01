export const CORE_PACKAGE_VERSION = 0 as const;

export const FONT_UNITS_PER_EM = 1000 as const;

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

export type {
  Point,
  SampledPoint,
  SafetyWarning,
  ShapeTemplate,
  TemplateSafety,
} from './template/types.js';
export { createTemplateRegistry } from './template/registry.js';
export { maxRadius, pointAt, radiusAt, sampleCurve } from './template/sample.js';
export type { NestingInput, NestingResult } from './template/nesting.js';
export {
  PERFECT_FIT_SAMPLES,
  computeNesting,
  effectiveScale,
  perfectFit,
} from './template/nesting.js';
export type { PerfectFitMemo } from './template/memo.js';
export { createPerfectFitMemo } from './template/memo.js';

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
export { createGlyphSetRegistry, glyphFor } from './glyph/registry.js';

export type {
  Modulation,
  PlacedDot,
  Polyline,
  SkeletonStage,
  StageContext,
  StageListEntry,
  Vec2,
  WorkingSkeleton,
} from './stage/types.js';
export { emptyWorking } from './stage/types.js';
export { CURVES_PARAMS, curvesStage, sampleArc, strokeToPolyline } from './stage/curves.js';
export { BOWLS_PARAMS, bowlsStage, buildBowl, shapeRho } from './stage/bowls.js';
export { BEND_PARAMS, bendRun, bendStage } from './stage/bend.js';
export type { ModulationInput } from './stage/proportions.js';
export {
  IDENTITY_MODULATION,
  PROPORTIONS_PARAMS,
  proportionsStage,
  prototypeModulation,
  remapY,
} from './stage/proportions.js';
export {
  BUILT_IN_STAGES,
  DEFAULT_STAGE_LIST,
  createStageRegistry,
  runStages,
} from './stage/pipeline.js';

export type { Pen } from './stroke/pen.js';
export { SUPPORT_ENTRIES, roundPen, shapePen, supportAt } from './stroke/pen.js';
export type { Contour, StrokeResult, WidthProfile } from './stroke/stroker.js';
export { UNIFORM_WIDTH, strokeRing, strokeRun } from './stroke/stroker.js';
export type { ProfileOptions } from './stroke/profile.js';
export { MIN_WIDTH_FACTOR, PROTOTYPE_PROFILE, flareProfile, taperProfile } from './stroke/profile.js';
export type { EndContext, Ending, EndingBuildContext } from './stroke/endings.js';
export {
  BUILT_IN_ENDINGS,
  angledEnding,
  ballEnding,
  createEndingRegistry,
  flaredEnding,
  flatEnding,
  hairlineEnding,
  roundEnding,
  slabEnding,
  taperedEnding,
  wedgeEnding,
} from './stroke/endings.js';
export type { Corner, Join, JoinBuildContext } from './stroke/joins.js';
export {
  BUILT_IN_JOINS,
  CORNER_THRESHOLD_DEGREES,
  createJoinRegistry,
  findCorners,
  loopJoin,
  turnBetween,
} from './stroke/joins.js';
export type { GlyphOutline, OutlineOptions, RenderStyle } from './stroke/outline.js';
export { outlineSkeleton } from './stroke/outline.js';
