import type { ParamValues } from '../params/types.js';
import { radiusAt } from './sample.js';
import { AMPLITUDE_FLOOR, amplitudeOf } from './trefoil.js';
import type { SafetyWarning, ShapeTemplate } from './types.js';

const TAU = Math.PI * 2;

export const PERFECT_FIT_SAMPLES = 720;
export const PERFECT_FIT_FLOOR = 0.02;
export const EFFECTIVE_SCALE_CEILING = 1.5;
export const COPY_SCALE_CEILING = 1.6;

export function perfectFit(
  template: ShapeTemplate,
  params: ParamValues,
  phi: number,
  samples = PERFECT_FIT_SAMPLES,
): number {
  let smallest = Number.POSITIVE_INFINITY;

  for (let k = 0; k < samples; k++) {
    const theta = (k / samples) * TAU;
    const numerator = radiusAt(template, theta, params);
    const denominator = radiusAt(template, theta - phi, params);
    if (denominator <= 1e-9) continue;
    smallest = Math.min(smallest, numerator / denominator);
  }

  return Number.isFinite(smallest) ? Math.max(smallest, 0) : 1;
}

export function effectiveScale(fitted: number, fit: number): number {
  return Math.pow(fitted, 1 - 5 * fit);
}

export interface NestingInput {
  readonly template: ShapeTemplate;
  readonly params: ParamValues;
  readonly rotation: number;
  readonly copies: number;
  readonly fit: number;
}

export interface NestingResult {
  readonly perfectFit: number;
  readonly effectiveScale: number;
  readonly scales: readonly number[];
  readonly warnings: readonly SafetyWarning[];
}

export function computeNesting(input: NestingInput): NestingResult {
  const warnings: SafetyWarning[] = [];

  const given = amplitudeOf(input.params);
  if (given < AMPLITUDE_FLOOR) {
    warnings.push({ limit: 'amplitude floor', given, used: AMPLITUDE_FLOOR });
  }

  const fitted = perfectFit(input.template, input.params, input.rotation);
  let base = fitted;
  if (base < PERFECT_FIT_FLOOR) {
    warnings.push({ limit: 'perfect fit floor', given: base, used: PERFECT_FIT_FLOOR });
    base = PERFECT_FIT_FLOOR;
  }

  const raw = effectiveScale(base, input.fit);
  let effective = raw;
  if (effective > EFFECTIVE_SCALE_CEILING) {
    warnings.push({ limit: 'effective scale ceiling', given: raw, used: EFFECTIVE_SCALE_CEILING });
    effective = EFFECTIVE_SCALE_CEILING;
  }

  const scales: number[] = [];
  for (let i = 0; i < input.copies; i++) {
    const wanted = Math.pow(effective, i);
    if (wanted > COPY_SCALE_CEILING) {
      warnings.push({ limit: 'copy scale ceiling', given: wanted, used: COPY_SCALE_CEILING });
      scales.push(COPY_SCALE_CEILING);
    } else {
      scales.push(wanted);
    }
  }

  return { perfectFit: fitted, effectiveScale: effective, scales, warnings };
}
