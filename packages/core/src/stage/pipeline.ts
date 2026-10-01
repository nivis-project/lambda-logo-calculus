import { createRegistry, type Registry } from '../registry/registry.js';
import { resolveParams } from '../params/resolve.js';
import type { GlyphSkeleton } from '../glyph/types.js';
import { bendStage } from './bend.js';
import { bowlsStage } from './bowls.js';
import { curvesStage } from './curves.js';
import { proportionsStage } from './proportions.js';
import { splitStage } from './split.js';
import {
  emptyWorking,
  type SkeletonStage,
  type StageContext,
  type StageListEntry,
  type WorkingSkeleton,
} from './types.js';

export const BUILT_IN_STAGES: readonly SkeletonStage[] = [
  curvesStage,
  bowlsStage,
  bendStage,
  proportionsStage,
  splitStage,
];

export const DEFAULT_STAGE_LIST: readonly StageListEntry[] = BUILT_IN_STAGES.map((stage) => ({
  id: stage.id,
  enabled: true,
}));

export function createStageRegistry(): Registry<SkeletonStage> {
  const registry = createRegistry<SkeletonStage>('skeleton-stage');
  for (const stage of BUILT_IN_STAGES) registry.register(stage);
  return registry;
}

export type StageParamOverrides = Readonly<
  Record<string, Readonly<Record<string, number>>>
>;

export function runStages(
  glyph: GlyphSkeleton,
  list: readonly StageListEntry[],
  registry: Registry<SkeletonStage>,
  context: Omit<StageContext, 'params'>,
  overrides: StageParamOverrides = {},
): WorkingSkeleton {
  let working = emptyWorking(glyph.advance, glyph.parts);

  for (const entry of list) {
    const stage = registry.get(entry.id);
    const declared = { ...(entry.params ?? {}), ...(overrides[entry.id] ?? {}) };
    const params = resolveParams(stage.params, declared).values;
    const stageContext: StageContext = { ...context, params };

    if (entry.enabled) {
      working = stage.apply(working, stageContext);
    } else if (stage.applyDisabled !== undefined) {
      working = stage.applyDisabled(working, stageContext);
    }
  }

  return working;
}
