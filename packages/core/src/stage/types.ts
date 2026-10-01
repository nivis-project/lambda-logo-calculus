import type { ParamValues } from '../params/types.js';
import type { GridMetrics, SkeletonPrimitive } from '../glyph/types.js';
import type { NestingResult } from '../template/nesting.js';
import type { ShapeTemplate } from '../template/types.js';
import type { Registered } from '../registry/registry.js';

export type Vec2 = readonly [number, number];
export type Polyline = readonly Vec2[];

export interface PlacedDot {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

export interface WorkingSkeleton {
  readonly advance: number;
  readonly parts: readonly SkeletonPrimitive[];
  readonly runs: readonly Polyline[];
  readonly rings: readonly Polyline[];
  readonly dots: readonly PlacedDot[];
}

export interface Modulation {
  readonly widthFactor: number;
  readonly xHeight: number;
}

export interface StageContext {
  readonly template: ShapeTemplate;
  readonly templateParams: ParamValues;
  readonly rotation: number;
  readonly nesting: NestingResult;
  readonly metrics: GridMetrics;
  readonly modulation: Modulation;
  readonly params: ParamValues;
}

export interface SkeletonStage extends Registered {
  apply(skeleton: WorkingSkeleton, context: StageContext): WorkingSkeleton;
  applyDisabled?(skeleton: WorkingSkeleton, context: StageContext): WorkingSkeleton;
}

export interface StageListEntry {
  readonly id: string;
  readonly enabled: boolean;
  readonly params?: ParamValues;
}

export function emptyWorking(advance: number, parts: readonly SkeletonPrimitive[]): WorkingSkeleton {
  return { advance, parts, runs: [], rings: [], dots: [] };
}
