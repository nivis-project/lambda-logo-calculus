import { createRegistry, type Registry } from '../registry/registry.js';
import type { GlyphSkeleton } from '../glyph/types.js';
import { bendStage } from './bend.js';
import { bowlsStage } from './bowls.js';
import { curvesStage } from './curves.js';
import { proportionsStage } from './proportions.js';
import { emptyWorking, type SkeletonStage, type StageContext, type StageListEntry, type WorkingSkeleton } from './types.js';

export const builtInStages: readonly SkeletonStage[] = [
  curvesStage,
  bowlsStage,
  bendStage,
  proportionsStage,
];

export const DEFAULT_STAGE_LIST: readonly StageListEntry[] = builtInStages.map((stage) => ({
  id: stage.id,
  enabled: true,
}));

export function createStageRegistry(): Registry<SkeletonStage> {
  const registry = createRegistry<SkeletonStage>('skeleton-stage');
  for (const stage of builtInStages) registry.register(stage);
  return registry;
}

export function runStages(
  glyph: GlyphSkeleton,
  list: readonly StageListEntry[],
  stages: Registry<SkeletonStage>,
  context: Omit<StageContext, 'params'>,
): WorkingSkeleton {
  let working = emptyWorking(glyph.advance);

  for (const entry of list) {
    const stage = stages.get(entry.id);
    const withParams: StageContext = { ...context, params: entry.params ?? {} };

    if (entry.enabled) working = stage.apply(working, glyph, withParams);
    else if (stage.applyDisabled !== undefined) {
      working = stage.applyDisabled(working, glyph, withParams);
    }
  }

  return working;
}
