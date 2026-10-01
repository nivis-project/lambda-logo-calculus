import type { Polyline } from '../stage/types.js';
import type { WidthProfile } from './stroker.js';

export const MIN_WIDTH_FACTOR = 0.12;

export interface ProfileOptions {
  readonly freeStart: boolean;
  readonly freeEnd: boolean;
  readonly taperLength: number;
  readonly flareLength: number;
  readonly flareAmount: number;
}

export const PROTOTYPE_PROFILE: Omit<ProfileOptions, 'freeStart' | 'freeEnd'> = {
  taperLength: 22,
  flareLength: 16,
  flareAmount: 0.4,
};

function arcLengths(run: Polyline): number[] {
  const lengths = [0];
  for (let j = 1; j < run.length; j++) {
    const a = run[j - 1];
    const b = run[j];
    if (a === undefined || b === undefined) {
      lengths.push(lengths[j - 1] ?? 0);
      continue;
    }
    lengths.push((lengths[j - 1] ?? 0) + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  return lengths;
}

function build(
  run: Polyline,
  options: ProfileOptions,
  weigh: (distance: number, span: number) => number,
  span: number,
): WidthProfile {
  const lengths = arcLengths(run);
  const total = lengths[lengths.length - 1] ?? 0;
  const factors = lengths.map((s) => {
    let factor = 1;
    if (options.freeStart) factor *= weigh(s, span);
    if (options.freeEnd) factor *= weigh(total - s, span);
    return Math.max(MIN_WIDTH_FACTOR, factor);
  });
  return { factors };
}

export function taperProfile(run: Polyline, options: ProfileOptions): WidthProfile {
  const lengths = arcLengths(run);
  const total = lengths[lengths.length - 1] ?? 0;
  const span = Math.min(total * 0.45, options.taperLength);
  if (span <= 0) return { factors: lengths.map(() => 1) };
  return build(run, options, (d, s) => Math.pow(Math.min(1, Math.max(0, d) / s), 0.8), span);
}

export function flareProfile(run: Polyline, options: ProfileOptions): WidthProfile {
  const lengths = arcLengths(run);
  const total = lengths[lengths.length - 1] ?? 0;
  const span = Math.min(total * 0.4, options.flareLength);
  if (span <= 0) return { factors: lengths.map(() => 1) };
  return build(
    run,
    options,
    (d, s) => (d < s ? 1 + options.flareAmount * Math.pow(1 - d / s, 2) : 1),
    span,
  );
}
