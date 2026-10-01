import type { ParamValues } from '../params/types.js';
import { sampleCurve } from './sample.js';
import type { ShapeTemplate } from './types.js';

export interface CurveValidation {
  readonly closed: boolean;
  readonly nonNegative: boolean;
  readonly starShaped: boolean;
  readonly findings: readonly string[];
}

const CLOSURE_TOLERANCE = 0.05;

export function validateCurve(
  template: ShapeTemplate,
  params: ParamValues,
  samples = 360,
): CurveValidation {
  const findings: string[] = [];

  let nonNegative = true;
  if (template.kind === 'polar' && template.radius !== undefined) {
    for (let k = 0; k < samples; k++) {
      const theta = (k / samples) * Math.PI * 2;
      const r = template.radius(theta, params);
      if (!Number.isFinite(r) || r < 0) {
        nonNegative = false;
        findings.push(
          `the radius is ${Number.isFinite(r) ? r.toFixed(4) : String(r)} at ${((theta * 180) / Math.PI).toFixed(1)} degrees`,
        );
        break;
      }
    }
  }

  let points;
  try {
    points = sampleCurve(template, params, samples);
  } catch (error) {
    return {
      closed: false,
      nonNegative: false,
      starShaped: false,
      findings: [...findings, `the curve could not be sampled: ${(error as Error).message}`],
    };
  }

  const first = points[0];
  const last = points[points.length - 1];
  const step =
    first === undefined || points[1] === undefined
      ? 0
      : Math.hypot(points[1].x - first.x, points[1].y - first.y);
  const gap =
    first === undefined || last === undefined ? Number.POSITIVE_INFINITY : Math.hypot(last.x - first.x, last.y - first.y);
  const closed = gap <= Math.max(step * 2, CLOSURE_TOLERANCE);
  if (!closed) findings.push(`the ends are ${gap.toFixed(4)} apart, which does not close`);

  let starShaped = nonNegative;
  if (starShaped) {
    let previous = Number.NEGATIVE_INFINITY;
    for (const { x, y } of points) {
      const angle = Math.atan2(y, x);
      const unwrapped = angle < previous - Math.PI ? angle + Math.PI * 2 : angle;
      if (unwrapped < previous - 1e-9) {
        starShaped = false;
        findings.push('the curve doubles back, so a ray from the centre crosses it more than once');
        break;
      }
      previous = unwrapped;
    }
  }

  return { closed, nonNegative, starShaped, findings };
}
