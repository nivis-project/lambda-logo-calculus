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
export { createTemplateRegistry, symmetryOf } from './template/registry.js';
export { maxRadius, pointAt, radiusAt, sampleCurve } from './template/sample.js';
export type { NestingInput, NestingResult, NestingRoute, RoutedFit } from './template/nesting.js';
export {
  PERFECT_FIT_SAMPLES,
  computeNesting,
  effectiveScale,
  fitForCurve,
  perfectFit,
} from './template/nesting.js';
export { ON_EDGE_EPSILON, isOnSegment, pointInPolygon, polygonInPolygon } from './template/geometry.js';
export type { CurveValidation } from './template/validate.js';
export { validateCurve } from './template/validate.js';
export { PARAMETRIC_SAMPLES, SEARCH_STEPS, parametricFit } from './template/parametric.js';
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
export { SPLIT_PARAMS, splitRun, splitStage } from './stage/split.js';
export type { ModulationInput } from './stage/proportions.js';
export {
  IDENTITY_MODULATION,
  PROPORTIONS_PARAMS,
  proportionsStage,
  prototypeModulation,
  remapY,
} from './stage/proportions.js';
export type { StageParamOverrides } from './stage/pipeline.js';
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

export type {
  GroupNode,
  PathNode,
  PathStyle,
  Scene,
  SceneNode,
  Transform,
} from './scene/types.js';
export { allContours, countNodes, groupNode, pathNode } from './scene/types.js';
export type { Palette } from './style/palette.js';
export {
  BASE_HUE,
  BUILT_IN_PALETTES,
  analogous,
  complementary,
  cool,
  createPaletteRegistry,
  hsl,
  monochrome,
  passOpacity,
  triadic,
  warm,
  wrapHue,
} from './style/palette.js';
export type { LayoutMetrics, WrapResult } from './layout/text.js';
export { advanceOf, widthOf, wrapText } from './layout/text.js';
export type { LockupInput, LockupResult, MarkBounds, MarkSettings } from './layout/lockup.js';
export { OPTICAL_ENLARGEMENT, layoutLockup } from './layout/lockup.js';
export type { Bounds } from './layout/bounds.js';
export { boundsOfScene } from './layout/bounds.js';
export type { Lockup, LockupInputs, Placement } from './layout/registry.js';
export {
  BUILT_IN_LOCKUPS,
  createLockupRegistry,
  sideLockup,
  stackedLockup,
} from './layout/registry.js';
export type { PerGlyphModulation, SceneInput } from './scene/build.js';
export { buildScene } from './scene/build.js';

export type { Token, TokenKind } from './formula/tokenise.js';
export { FormulaError, tokenise } from './formula/tokenise.js';
export type { WhitelistedFunction } from './formula/whitelist.js';
export {
  CONSTANTS,
  CONSTANT_NAMES,
  FUNCTIONS,
  FUNCTION_NAMES,
  acceptsArity,
  describeArity,
} from './formula/whitelist.js';
export type { Expression, ParsedFormula } from './formula/parse.js';
export { MAX_DEPTH, parseFormula } from './formula/parse.js';
export type { Bindings, EvaluationResult } from './formula/evaluate.js';
export { FormulaEvaluationError, evaluateFormula } from './formula/evaluate.js';
export type { CustomTemplate, CustomTemplateDefinition } from './formula/template.js';
export {
  DEFAULT_CUSTOM_SAFETY,
  PARAMETRIC_VARIABLE,
  POLAR_VARIABLE,
  buildCustomTemplate,
} from './formula/template.js';

export type {
  ModulationCurve,
  ModulationEntry,
  ModulationResponse,
  ModulationSource,
  ModulationTarget,
  NamedTransfer,
  NestingField,
} from './modulation/types.js';
export { CURVES, CURVE_NAMES, applyCurve } from './modulation/types.js';
export type { ModulationContext, ModulationResult, SourceResult } from './modulation/evaluate.js';
export {
  PROTOTYPE_PRESET,
  evaluateModulation,
  prototypeWidthFactor,
  prototypeXHeight,
  sourceValue,
} from './modulation/evaluate.js';
