import type { ParamDef } from '../params/types.js';
import type { Polyline, SkeletonStage, StageContext, Vec2, WorkingSkeleton } from './types.js';

export const BEND_PARAMS: readonly ParamDef[] = [
  {
    id: 'factor',
    label: 'Bend',
    kind: 'number',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.22,
    lockable: true,
    randomize: { min: 0, max: 0.4 },
    group: 'Bend',
  },
  {
    id: 'threshold',
    label: 'Bend threshold',
    kind: 'number',
    min: 0,
    max: 60,
    step: 1,
    default: 8,
    lockable: true,
    group: 'Bend',
    advanced: true,
  },
  {
    id: 'samples',
    label: 'Bend samples',
    kind: 'int',
    min: 2,
    max: 64,
    default: 12,
    lockable: true,
    group: 'Bend',
    advanced: true,
  },
];

function num(context: StageContext, id: string, fallback: number): number {
  const value = context.params[id];
  return typeof value === 'number' ? value : fallback;
}

function guardedAmplitude(context: StageContext): number {
  const guard = context.template.safety.minAmplitude;
  if (guard === undefined) return 1;
  const given = context.templateParams[guard.paramId];
  if (typeof given !== 'number') return guard.value;
  return Math.max(given, guard.value);
}

export function bendRun(run: Polyline, context: StageContext): Polyline {
  if (run.length < 2) return run;

  const factor = num(context, 'factor', 0.22);
  const threshold = num(context, 'threshold', 8);
  const steps = Math.max(2, Math.round(num(context, 'samples', 12)));
  const lobes =
    context.template.symmetryFor?.(context.templateParams) ?? context.template.symmetry ?? 3;
  const amplitude = guardedAmplitude(context);

  const first = run[0];
  if (first === undefined) return run;

  const out: Vec2[] = [first];
  for (let j = 0; j < run.length - 1; j++) {
    const a = run[j];
    const b = run[j + 1];
    if (a === undefined || b === undefined) continue;

    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const length = Math.hypot(dx, dy);

    if (factor === 0 || length <= threshold) {
      out.push(b);
      continue;
    }

    const angle = Math.atan2(dy, dx);
    const amp = (length * factor * Math.cos(lobes * angle - context.rotation)) / amplitude;
    const nx = -dy / length;
    const ny = dx / length;

    for (let k = 1; k <= steps; k++) {
      const u = k / steps;
      const offset = amp * Math.sin(Math.PI * u);
      out.push([a[0] + dx * u + nx * offset, a[1] + dy * u + ny * offset]);
    }
  }
  return out;
}

export const bendStage: SkeletonStage = {
  id: 'bend',
  version: 1,
  label: 'Bend',
  params: BEND_PARAMS,
  apply(skeleton: WorkingSkeleton, context: StageContext): WorkingSkeleton {
    return { ...skeleton, runs: skeleton.runs.map((run) => bendRun(run, context)) };
  },
};
