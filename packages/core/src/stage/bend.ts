import type { ParamDef } from '../params/types.js';
import { resolveParams } from '../params/resolve.js';
import { amplitudeOf, AMPLITUDE_FLOOR } from '../template/trefoil.js';
import type { Vec2 } from '../template/types.js';
import type { Polyline, SkeletonStage, StageContext } from './types.js';

export const BEND_PARAMS: readonly ParamDef[] = [
  {
    id: 'amount',
    label: 'Bend',
    kind: 'number',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.22,
    lockable: false,
    randomize: false,
    advanced: true,
    group: 'Bend',
  },
  {
    id: 'threshold',
    label: 'Shortest bent run',
    kind: 'number',
    min: 0,
    max: 40,
    step: 1,
    default: 8,
    lockable: false,
    randomize: false,
    advanced: true,
    group: 'Bend',
  },
  {
    id: 'samples',
    label: 'Bend samples',
    kind: 'int',
    min: 2,
    max: 48,
    step: 1,
    default: 12,
    lockable: false,
    randomize: false,
    advanced: true,
    group: 'Bend',
  },
];

export function bendRun(
  run: Polyline,
  context: StageContext,
  settings: { readonly amount: number; readonly threshold: number; readonly samples: number },
): Polyline {
  const first = run[0];
  if (first === undefined) return run;

  const amplitude = Math.max(amplitudeOf(context.templateParams), AMPLITUDE_FLOOR);
  const out: Vec2[] = [first];

  for (let j = 0; j < run.length - 1; j++) {
    const a = run[j];
    const b = run[j + 1];
    if (a === undefined || b === undefined) continue;

    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const length = Math.hypot(dx, dy);

    if (length <= settings.threshold) {
      out.push(b);
      continue;
    }

    const angle = Math.atan2(dy, dx);
    const bow = (length * settings.amount * Math.cos(3 * angle - context.rotation)) / amplitude;
    const nx = -dy / length;
    const ny = dx / length;

    for (let k = 1; k <= settings.samples; k++) {
      const u = k / settings.samples;
      const offset = bow * Math.sin(Math.PI * u);
      out.push([a[0] + dx * u + nx * offset, a[1] + dy * u + ny * offset]);
    }
  }

  return out;
}

export const bendStage: SkeletonStage = {
  id: 'bend',
  version: 1,
  label: 'Bent strokes',
  params: BEND_PARAMS,

  apply(working, _glyph, context) {
    const { values } = resolveParams(BEND_PARAMS, context.params);
    const settings = {
      amount: typeof values.amount === 'number' ? values.amount : 0.22,
      threshold: typeof values.threshold === 'number' ? values.threshold : 8,
      samples: typeof values.samples === 'number' ? values.samples : 12,
    };

    return { ...working, runs: working.runs.map((run) => bendRun(run, context, settings)) };
  },
};
