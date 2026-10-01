import type { ParamValues } from '../params/types.js';
import type { Registered } from '../registry/registry.js';

export type Point = readonly [number, number];

export interface SampledPoint {
  readonly x: number;
  readonly y: number;
  readonly theta: number;
}

export interface TemplateSafety {
  readonly minAmplitude?: { readonly paramId: string; readonly value: number };
  readonly minPerfectFit: number;
  readonly maxEffectiveScale: number;
  readonly maxCopyScale: number;
}

export interface ShapeTemplate extends Registered {
  readonly kind: 'polar' | 'parametric';
  readonly symmetry?: number;
  symmetryFor?(params: ParamValues): number;
  readonly safety: TemplateSafety;
  radius?(theta: number, params: ParamValues): number;
  point?(t: number, params: ParamValues): Point;
  maxRadius?(params: ParamValues): number;
}

export interface SafetyWarning {
  readonly limit: string;
  readonly given: number;
  readonly used: number;
}
