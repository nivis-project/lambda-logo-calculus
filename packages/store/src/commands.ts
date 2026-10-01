import { applyPatches, enablePatches, produceWithPatches, type Patch } from 'immer';
import {
  randomizeParams,
  resolveParams,
  type ParamDef,
  type ParamValue,
  isEmptyPatch,
  type GlyphPatch,
  type ModulationEntry,
  type ParamValues,
  type SpacingPair,
  type StageListEntry,
} from '@trefoil/core';
import { deepFreeze, type MarkState, type ProjectState } from './state.js';

enablePatches();

export type Command =
  | { readonly kind: 'setTemplate'; readonly templateId: string; readonly params: Record<string, ParamValue> }
  | { readonly kind: 'setTemplateParam'; readonly paramId: string; readonly value: ParamValue }
  | { readonly kind: 'setText'; readonly text: string }
  | { readonly kind: 'setNumber'; readonly field: NumericField; readonly value: number }
  | { readonly kind: 'setEnding'; readonly endingId: string }
  | { readonly kind: 'setJoin'; readonly joinId: string | null }
  | { readonly kind: 'setPalette'; readonly paletteId: string }
  | { readonly kind: 'setShapePen'; readonly on: boolean }
  | { readonly kind: 'setStages'; readonly stages: readonly StageListEntry[] }
  | { readonly kind: 'setStageEnabled'; readonly stageId: string; readonly enabled: boolean }
  | { readonly kind: 'setMark'; readonly mark: Partial<MarkState> }
  | { readonly kind: 'setLock'; readonly paramId: string; readonly locked: boolean }
  | { readonly kind: 'setSeed'; readonly seed: string }
  | { readonly kind: 'setModulation'; readonly entries: readonly ModulationEntry[] }
  | { readonly kind: 'setPatch'; readonly character: string; readonly patch: GlyphPatch | null }
  | { readonly kind: 'setPairs'; readonly pairs: readonly SpacingPair[] }
  | {
      readonly kind: 'randomize';
      readonly seed: string;
      readonly nextSeed: string;
      readonly templateDefs: readonly ParamDef[];
      readonly nestingDefs: readonly ParamDef[];
      readonly choiceDefs: readonly ParamDef[];
    }
  | { readonly kind: 'replaceState'; readonly state: ProjectState };

export type NumericField = 'copies' | 'rotation' | 'fit' | 'alpha';

export class UnknownCommandError extends Error {
  constructor(kind: string) {
    super(`no command of kind "${kind}"`);
    this.name = 'UnknownCommandError';
  }
}

export interface Applied {
  readonly state: ProjectState;
  readonly forward: readonly Patch[];
  readonly inverse: readonly Patch[];
}

function usableValues(defs: readonly ParamDef[], values: ParamValues): ParamValues {
  const kept: Record<string, ParamValue> = {};
  for (const def of defs) {
    if (!Object.hasOwn(values, def.id)) continue;
    const value = values[def.id];
    if (value === undefined) continue;
    try {
      resolveParams([def], { [def.id]: value });
      kept[def.id] = value;
    } catch {
      continue;
    }
  }
  return kept;
}

function reduce(draft: ProjectState, command: Command): void {
  const mutable = draft as {
    -readonly [K in keyof ProjectState]: ProjectState[K];
  };

  switch (command.kind) {
    case 'setTemplate':
      mutable.templateId = command.templateId;
      mutable.templateParams = { ...command.params };
      return;

    case 'setTemplateParam':
      mutable.templateParams = { ...mutable.templateParams, [command.paramId]: command.value };
      return;

    case 'setText':
      mutable.text = command.text;
      return;

    case 'setNumber':
      mutable[command.field] = command.value;
      return;

    case 'setEnding':
      mutable.endingId = command.endingId;
      return;

    case 'setJoin':
      mutable.joinId = command.joinId;
      return;

    case 'setPalette':
      mutable.paletteId = command.paletteId;
      return;

    case 'setShapePen':
      mutable.shapePen = command.on;
      return;

    case 'setStages':
      mutable.stages = command.stages.map((entry) => ({ ...entry }));
      return;

    case 'setStageEnabled':
      mutable.stages = mutable.stages.map((entry) =>
        entry.id === command.stageId ? { ...entry, enabled: command.enabled } : entry,
      );
      return;

    case 'setMark':
      mutable.mark = { ...mutable.mark, ...command.mark };
      return;

    case 'setLock': {
      const without = mutable.locked.filter((id) => id !== command.paramId);
      mutable.locked = command.locked ? [...without, command.paramId].sort() : without;
      return;
    }

    case 'setSeed':
      mutable.seed = command.seed;
      return;

    case 'setModulation':
      mutable.modulation = command.entries.map((entry) => ({ ...entry }));
      return;

    case 'setPatch': {
      const next = Object.fromEntries(
        Object.entries(mutable.patches).filter(([ch]) => ch !== command.character),
      );
      if (command.patch !== null && !isEmptyPatch(command.patch)) {
        next[command.character] = { ...command.patch };
      }
      mutable.patches = next;
      return;
    }

    case 'setPairs':
      mutable.pairs = command.pairs.map((pair) => ({ ...pair }));
      return;

    case 'randomize': {
      const locked = new Set(mutable.locked);

      mutable.templateParams = randomizeParams(
        command.templateDefs,
        usableValues(command.templateDefs, mutable.templateParams),
        locked,
        `${command.seed}:template`,
      );

      const nesting = randomizeParams(
        command.nestingDefs,
        usableValues(command.nestingDefs, {
          copies: mutable.copies,
          rotation: mutable.rotation,
          fit: mutable.fit,
          alpha: mutable.alpha,
        }),
        locked,
        `${command.seed}:nesting`,
      );
      if (typeof nesting['copies'] === 'number') mutable.copies = nesting['copies'];
      if (typeof nesting['rotation'] === 'number') mutable.rotation = nesting['rotation'];
      if (typeof nesting['fit'] === 'number') mutable.fit = nesting['fit'];
      if (typeof nesting['alpha'] === 'number') mutable.alpha = nesting['alpha'];

      const choices: ParamValues = randomizeParams(
        command.choiceDefs,
        usableValues(command.choiceDefs, {
          ending: mutable.endingId,
          join: mutable.joinId ?? 'none',
          palette: mutable.paletteId,
          shapePen: mutable.shapePen,
        }),
        locked,
        `${command.seed}:choices`,
      );
      if (typeof choices['ending'] === 'string') mutable.endingId = choices['ending'];
      if (typeof choices['join'] === 'string') {
        mutable.joinId = choices['join'] === 'none' ? null : choices['join'];
      }
      if (typeof choices['palette'] === 'string') mutable.paletteId = choices['palette'];
      if (typeof choices['shapePen'] === 'boolean') mutable.shapePen = choices['shapePen'];

      mutable.seed = command.nextSeed;
      return;
    }

    case 'replaceState': {
      for (const key of Object.keys(command.state) as (keyof ProjectState)[]) {
        (mutable as Record<string, unknown>)[key] = structuredClone(command.state[key]);
      }
      return;
    }
  }
}

const KINDS = new Set<string>([
  'setTemplate',
  'setTemplateParam',
  'setText',
  'setNumber',
  'setEnding',
  'setJoin',
  'setPalette',
  'setShapePen',
  'setStages',
  'setStageEnabled',
  'setMark',
  'setLock',
  'setSeed',
  'setModulation',
  'setPatch',
  'setPairs',
  'randomize',
  'replaceState',
]);

export function applyCommand(state: ProjectState, command: Command): Applied {
  if (!KINDS.has(command.kind)) {
    throw new UnknownCommandError(command.kind);
  }

  const [next, forward, inverse] = produceWithPatches(state, (draft) => {
    reduce(draft, command);
  });

  return { state: deepFreeze(next), forward, inverse };
}

export function applyPatchList(state: ProjectState, patches: readonly Patch[]): ProjectState {
  return deepFreeze(applyPatches(state, [...patches]));
}

export type { Patch };
