import type { GridMetrics } from '../glyph/types.js';
import type { Vec2 } from '../template/types.js';
import type { Dot, Polyline, SkeletonStage, StageContext } from './types.js';

export function remapHeight(y: number, metrics: GridMetrics, xHeight: number): number {
  if (y <= 0) return y;
  if (y <= metrics.xHeight) return (y * xHeight) / metrics.xHeight;
  if (y <= metrics.capHeight) {
    return (
      xHeight +
      ((y - metrics.xHeight) * (metrics.capHeight - xHeight)) /
        (metrics.capHeight - metrics.xHeight)
    );
  }
  return y;
}

function move(point: Vec2, context: StageContext): Vec2 {
  return [
    point[0] * context.modulation.widthFactor,
    remapHeight(point[1], context.metrics, context.modulation.xHeight),
  ];
}

function moveRun(run: Polyline, context: StageContext): Polyline {
  return run.map((point) => move(point, context));
}

function moveDot(dot: Dot, context: StageContext): Dot {
  const [x, y] = move([dot.x, dot.y], context);
  return { x, y, r: dot.r };
}

export const proportionsStage: SkeletonStage = {
  id: 'proportions',
  version: 1,
  label: 'Proportions',
  params: [],

  apply(working, _glyph, context) {
    return {
      ...working,
      runs: working.runs.map((run) => moveRun(run, context)),
      rings: working.rings.map((ring) => moveRun(ring, context)),
      dots: working.dots.map((dot) => moveDot(dot, context)),
    };
  },
};
