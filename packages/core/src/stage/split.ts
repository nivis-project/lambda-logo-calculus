import type { ParamDef } from '../params/types.js';
import type { Polyline, SkeletonStage, StageContext, Vec2, WorkingSkeleton } from './types.js';

const DEG = Math.PI / 180;

export const SPLIT_PARAMS: readonly ParamDef[] = [
  {
    id: 'threshold',
    label: 'Run split threshold',
    kind: 'angle',
    min: 0,
    max: 180,
    step: 1,
    default: 25,
    lockable: true,
    group: 'Runs',
    advanced: true,
  },
];

function turnAt(a: Vec2, b: Vec2, c: Vec2): number {
  const a1 = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const a2 = Math.atan2(c[1] - b[1], c[0] - b[0]);
  const d = Math.abs(a2 - a1);
  return d > Math.PI ? Math.PI * 2 - d : d;
}

export function splitRun(run: Polyline, thresholdDegrees: number): readonly Polyline[] {
  if (run.length < 3) return run.length > 1 ? [run] : [];

  const runs: Polyline[] = [];
  let current: Vec2[] = [];
  const first = run[0];
  if (first === undefined) return [];
  current.push(first);

  for (let j = 1; j < run.length - 1; j++) {
    const before = run[j - 1];
    const here = run[j];
    const after = run[j + 1];
    if (before === undefined || here === undefined || after === undefined) continue;

    current.push(here);
    if (turnAt(before, here, after) > thresholdDegrees * DEG) {
      runs.push(current);
      current = [here];
    }
  }

  const last = run[run.length - 1];
  if (last !== undefined) current.push(last);
  runs.push(current);

  return runs.filter((r) => r.length > 1);
}

export const splitStage: SkeletonStage = {
  id: 'split',
  version: 1,
  label: 'Run splitting',
  params: SPLIT_PARAMS,
  apply(skeleton: WorkingSkeleton, context: StageContext): WorkingSkeleton {
    const threshold = typeof context.params['threshold'] === 'number' ? context.params['threshold'] : 25;
    return { ...skeleton, runs: skeleton.runs.flatMap((run) => splitRun(run, threshold)) };
  },
};
