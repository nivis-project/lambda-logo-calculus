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

export type { Pen } from './stroke/pen.js';
export { NIB_SIZE, PEN_SAMPLES, SUPPORT_ENTRIES, roundPen, shapePen, supportAt } from './stroke/pen.js';
export type { Run } from './stroke/geometry.js';
export {
  CORNER_TURN,
  CURVED_TURN,
  SPLIT_TURN,
  cross,
  dedupe,
  isCurved,
  normalise,
  resample,
  splitRuns,
  totalTurn,
  turnBetween,
} from './stroke/geometry.js';
export type { Contour, EndContext, Ending, EndingBuildContext } from './stroke/endings.js';
export {
  angledEnding,
  ballEnding,
  builtInEndings,
  createEndingRegistry,
  flareEnding,
  flatEnding,
  hairEnding,
  roundEnding,
  slabEnding,
  taperEnding,
  wedgeEnding,
} from './stroke/endings.js';
export type { GlyphOutline, OutlineOptions } from './stroke/outline.js';
export {
  JOIN_FLOOR,
  JOIN_RADIUS,
  JOIN_SAMPLES,
  outlineSkeleton,
  stampContour,
} from './stroke/outline.js';
export type { Corner } from './stage/types.js';
export { cornersOf } from './stage/curves.js';

export type { Palette } from './style/palette.js';
export {
  BASE_HUE,
  analogous,
  builtInPalettes,
  complementary,
  cool,
  createPaletteRegistry,
  hsl,
  letterOpacity,
  markOpacity,
  monochrome,
  ornamentOpacity,
  triadic,
  warm,
  wrapHue,
} from './style/palette.js';
export type { LayoutMetrics, WrapResult } from './layout/text.js';
export { advanceOf, widthOf, wrapText } from './layout/text.js';
export type { Bounds } from './layout/bounds.js';
export { boundsOf, boundsOfContours } from './layout/bounds.js';
export type { LockupInput, LockupResult, MarkSettings } from './layout/lockup.js';
export {
  OPTICAL_ENLARGEMENT,
  SETTLE_ITERATIONS,
  SIDE_WIDTH_LIMIT,
  STACKED_WIDTH_LIMIT,
  layoutLockup,
} from './layout/lockup.js';
export type { GroupNode, PathNode, PathStyle, Scene, SceneNode, Transform } from './scene/types.js';
export { allContours, countNodes, groupNode, pathNode } from './scene/types.js';
export type { SceneInput } from './scene/build.js';
export { buildScene } from './scene/build.js';
