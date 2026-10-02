import type { ParamValues } from '../params/types.js';
import type { Registered } from '../registry/registry.js';

export type Vec2 = readonly [number, number];

export interface SampledPoint {
  readonly x: number;
  readonly y: number;
  readonly theta: number;
}

export interface ShapeTemplate extends Registered {
  readonly symmetry: number;
  radius(theta: number, params: ParamValues): number;
  maxRadius(params: ParamValues): number;
}

export interface SafetyWarning {
  readonly limit: string;
  readonly given: number;
  readonly used: number;
}
