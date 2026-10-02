import type { ParamValues } from '../params/types.js';
import type { GlyphSkeleton, GridMetrics } from '../glyph/types.js';
import type { Registered } from '../registry/registry.js';
import type { ShapeTemplate, Vec2 } from '../template/types.js';

export type Polyline = readonly Vec2[];

export interface Dot {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

export interface WorkingSkeleton {
  readonly advance: number;
  readonly runs: readonly Polyline[];
  readonly rings: readonly Polyline[];
  readonly dots: readonly Dot[];
}

export interface Modulation {
  readonly widthFactor: number;
  readonly xHeight: number;
}

export interface StageContext {
  readonly template: ShapeTemplate;
  readonly templateParams: ParamValues;
  readonly rotation: number;
  readonly metrics: GridMetrics;
  readonly modulation: Modulation;
  readonly params: ParamValues;
}

export interface SkeletonStage extends Registered {
  apply(working: WorkingSkeleton, glyph: GlyphSkeleton, context: StageContext): WorkingSkeleton;
  // Some stages still have structural work to do when they are switched off:
  // the curves stage samples an arc either way, and only the warp is optional.
  // A stage without this is simply skipped.
  applyDisabled?(
    working: WorkingSkeleton,
    glyph: GlyphSkeleton,
    context: StageContext,
  ): WorkingSkeleton;
}

export interface StageListEntry {
  readonly id: string;
  readonly enabled: boolean;
  readonly params?: ParamValues;
}

export function emptyWorking(advance: number): WorkingSkeleton {
  return { advance, runs: [], rings: [], dots: [] };
}
