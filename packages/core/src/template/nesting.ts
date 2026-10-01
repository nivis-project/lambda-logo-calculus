import type { ParamValues } from '../params/types.js';
import { radiusAt } from './sample.js';
import { parametricFit } from './parametric.js';
import { validateCurve } from './validate.js';
import type { SafetyWarning, ShapeTemplate } from './types.js';

export type NestingRoute = 'polar' | 'parametric';

const TAU = Math.PI * 2;
export const PERFECT_FIT_SAMPLES = 720;

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
  readonly route: NestingRoute;
  readonly routeReason?: string;
}

export interface RoutedFit {
  readonly value: number;
  readonly route: NestingRoute;
  readonly reason?: string;
}

export function fitForCurve(
  template: ShapeTemplate,
  params: ParamValues,
  phi: number,
): RoutedFit {
  const validation = validateCurve(template, params);
  if (validation.starShaped && validation.nonNegative && template.kind === 'polar') {
    return { value: perfectFit(template, params, phi), route: 'polar' };
  }
  return {
    value: parametricFit(template, params, phi),
    route: 'parametric',
    reason:
      validation.findings.length > 0
        ? validation.findings.join('; ')
        : 'the curve is not a star-shaped polar curve, so the polar ratio does not apply',
  };
}

export function perfectFit(
  template: ShapeTemplate,
  params: ParamValues,
  phi: number,
  samples = PERFECT_FIT_SAMPLES,
): number {
  let found = Number.POSITIVE_INFINITY;
  for (let k = 0; k < samples; k++) {
    const theta = (k / samples) * TAU;
    const numerator = radiusAt(template, theta, params);
    const denominator = radiusAt(template, theta - phi, params);
    if (denominator <= 1e-9) continue;
    found = Math.min(found, numerator / denominator);
  }
  return Number.isFinite(found) ? Math.max(found, 0) : 1;
}

export function effectiveScale(fitted: number, fit: number): number {
  return Math.pow(fitted, 1 - 5 * fit);
}

function applySafety(
  template: ShapeTemplate,
  params: ParamValues,
  warnings: SafetyWarning[],
): ParamValues {
  const guard = template.safety.minAmplitude;
  if (guard === undefined) return params;

  const given = params[guard.paramId];
  if (typeof given !== 'number' || given >= guard.value) return params;

  warnings.push({ limit: `${guard.paramId} minimum`, given, used: guard.value });
  return { ...params, [guard.paramId]: guard.value };
}

export function computeNesting(input: NestingInput): NestingResult {
  const { template, rotation, copies, fit } = input;
  const { safety } = template;
  const warnings: SafetyWarning[] = [];

  const params = applySafety(template, input.params, warnings);

  const routed = fitForCurve(template, params, rotation);
  const rawFit = routed.value;
  let fitted = rawFit;
  if (fitted < safety.minPerfectFit) {
    warnings.push({ limit: 'perfectFit minimum', given: rawFit, used: safety.minPerfectFit });
    fitted = safety.minPerfectFit;
  }

  const rawEffective = effectiveScale(fitted, fit);
  let effective = rawEffective;
  if (effective > safety.maxEffectiveScale) {
    warnings.push({
      limit: 'effective scale maximum',
      given: rawEffective,
      used: safety.maxEffectiveScale,
    });
    effective = safety.maxEffectiveScale;
  }

  const scales: number[] = [];
  let capped = false;
  let worst = 0;
  for (let i = 0; i < copies; i++) {
    const raw = Math.pow(effective, i);
    if (raw > safety.maxCopyScale) {
      capped = true;
      worst = Math.max(worst, raw);
      scales.push(safety.maxCopyScale);
    } else {
      scales.push(raw);
    }
  }
  if (capped) {
    warnings.push({ limit: 'copy scale maximum', given: worst, used: safety.maxCopyScale });
  }

  return {
    perfectFit: fitted,
    effectiveScale: effective,
    scales,
    warnings,
    route: routed.route,
    ...(routed.reason === undefined ? {} : { routeReason: routed.reason }),
  };
}
