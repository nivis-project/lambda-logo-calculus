import { applyPatches, enablePatches, produceWithPatches, type Patch } from 'immer';
import type { ParamValue, StageListEntry } from '@trefoil/core';
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
