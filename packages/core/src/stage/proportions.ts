import type { ParamDef } from '../params/types.js';
import type { GridMetrics } from '../glyph/types.js';
import type { Modulation, SkeletonStage, StageContext, Vec2, WorkingSkeleton } from './types.js';

export const PROPORTIONS_PARAMS: readonly ParamDef[] = [
  {
    id: 'widthBase',
    label: 'Width base',
    kind: 'number',
    min: 0.2,
    max: 2,
    step: 0.01,
    default: 0.78,
    lockable: true,
    group: 'Proportions',
    advanced: true,
  },
  {
    id: 'widthSpan',
    label: 'Width span',
    kind: 'number',
    min: 0,
    max: 2,
    step: 0.01,
    default: 0.5,
    lockable: true,
    group: 'Proportions',
    advanced: true,
  },
  {
    id: 'widthFalloff',
    label: 'Width falloff',
    kind: 'number',
    min: 0.5,
    max: 20,
    step: 0.1,
    default: 4,
    lockable: true,
    group: 'Proportions',
    advanced: true,
  },
  {
    id: 'xHeightGain',
    label: 'x-height gain',
    kind: 'number',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.22,
    lockable: true,
    group: 'Proportions',
    advanced: true,
  },
  {
    id: 'xHeightHeadroom',
    label: 'x-height headroom',
    kind: 'number',
    min: 0,
    max: 60,
    step: 1,
    default: 16,
    lockable: true,
    group: 'Proportions',
    advanced: true,
  },
];

export interface ModulationInput {
  readonly amplitude: number;
  readonly fit: number;
  readonly metrics: GridMetrics;
  readonly widthBase?: number;
  readonly widthSpan?: number;
  readonly widthFalloff?: number;
  readonly xHeightGain?: number;
  readonly xHeightHeadroom?: number;
}

export function prototypeModulation(input: ModulationInput): Modulation {
  const base = input.widthBase ?? 0.78;
  const span = input.widthSpan ?? 0.5;
  const falloff = input.widthFalloff ?? 4;
  const gain = input.xHeightGain ?? 0.22;
  const headroom = input.xHeightHeadroom ?? 16;

  return {
    widthFactor: base + span * (1 - Math.exp(-(input.amplitude - 1) / falloff)),
    xHeight: Math.min(
      input.metrics.capHeight - headroom,
      input.metrics.xHeight * (1 + gain * input.fit),
    ),
  };
}

export const IDENTITY_MODULATION = (metrics: GridMetrics): Modulation => ({
  widthFactor: 1,
  xHeight: metrics.xHeight,
});

export function remapY(y: number, metrics: GridMetrics, modulatedXHeight: number): number {
  if (y <= 0) return y;
  if (y <= metrics.xHeight) return (y * modulatedXHeight) / metrics.xHeight;
  if (y <= metrics.capHeight) {
    return (
      modulatedXHeight +
      ((y - metrics.xHeight) * (metrics.capHeight - modulatedXHeight)) /
        (metrics.capHeight - metrics.xHeight)
    );
  }
  return y;
}

function transform(context: StageContext, active: boolean): (point: Vec2) => Vec2 {
  const modulation = active ? context.modulation : IDENTITY_MODULATION(context.metrics);
  return ([x, y]) => [x * modulation.widthFactor, remapY(y, context.metrics, modulation.xHeight)];
}

function build(active: boolean): SkeletonStage['apply'] {
  return (skeleton: WorkingSkeleton, context: StageContext): WorkingSkeleton => {
    const tf = transform(context, active);
    return {
      ...skeleton,
      runs: skeleton.runs.map((run) => run.map(tf)),
      rings: skeleton.rings.map((ring) => ring.map(tf)),
      dots: skeleton.dots.map((dot) => {
        const [x, y] = tf([dot.x, dot.y]);
        return { x, y, r: dot.r };
      }),
    };
  };
}

export const proportionsStage: SkeletonStage = {
  id: 'proportions',
  version: 1,
  label: 'Proportions',
  params: PROPORTIONS_PARAMS,
  apply: build(true),
  applyDisabled: build(false),
};
