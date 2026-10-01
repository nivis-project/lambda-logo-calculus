import type { Registered } from '../registry/registry.js';

export interface GridMetrics {
  readonly strokeWidth: number;
  readonly xHeight: number;
  readonly capHeight: number;
  readonly descender: number;
  readonly sideBearing: number;
  readonly trim: number;
  readonly dotRadius: number;
  readonly wordSpace: number;
  readonly lineHeight: number;
}

export const GRID: GridMetrics = {
  strokeWidth: 10,
  xHeight: 56,
  capHeight: 86,
  descender: -28,
  sideBearing: 9,
  trim: 8,
  dotRadius: 7,
  wordSpace: 28,
  lineHeight: 150,
};

export interface PointSegment {
  readonly kind: 'point';
  readonly x: number;
  readonly y: number;
}

export interface ArcSegment {
  readonly kind: 'arc';
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
  readonly a0: number;
  readonly a1: number;
}

export type StrokeSegment = PointSegment | ArcSegment;

export interface CutRegion {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}

export interface StrokePrimitive {
  readonly kind: 'stroke';
  readonly segments: readonly StrokeSegment[];
}

export interface BowlPrimitive {
  readonly kind: 'bowl';
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
  readonly cuts: readonly CutRegion[];
}

export interface DotPrimitive {
  readonly kind: 'dot';
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

export type SkeletonPrimitive = StrokePrimitive | BowlPrimitive | DotPrimitive;

export interface GlyphSkeleton {
  readonly advance: number;
  readonly parts: readonly SkeletonPrimitive[];
}

export const NOTDEF = '\u0000';

export interface GlyphSet extends Registered {
  readonly metrics: GridMetrics;
  readonly glyphs: Readonly<Record<string, GlyphSkeleton>>;
}
