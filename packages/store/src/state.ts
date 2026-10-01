import type { ParamValues, StageListEntry } from '@trefoil/core';

export interface MarkState {
  readonly enabled: boolean;
  readonly distance: number;
  readonly height: number;
  readonly size: number;
}

export interface ProjectState {
  readonly version: number;
  readonly templateId: string;
  readonly templateParams: ParamValues;
  readonly stages: readonly StageListEntry[];
  readonly endingId: string;
  readonly joinId: string | null;
  readonly paletteId: string;
  readonly text: string;
  readonly copies: number;
  readonly rotation: number;
  readonly fit: number;
  readonly alpha: number;
  readonly shapePen: boolean;
  readonly mark: MarkState;
  readonly locked: readonly string[];
  readonly seed: string;
}

export function deepFreeze<T>(value: T): T {
  if (typeof value !== 'object' || value === null) return value;
  for (const entry of Object.values(value as Record<string, unknown>)) {
    deepFreeze(entry);
  }
  return Object.freeze(value);
}

export const PROJECT_VERSION = 1;

const DEFAULTS: ProjectState = {
  version: PROJECT_VERSION,
  templateId: 'trefoil',
  templateParams: { A: 3 },
  stages: [
    { id: 'curves', enabled: true },
    { id: 'bowls', enabled: true },
    { id: 'bend', enabled: true },
    { id: 'proportions', enabled: true },
    { id: 'split', enabled: true },
  ],
  endingId: 'round',
  joinId: 'loop',
  paletteId: 'analogous',
  text: 'Trefoil Type 26',
  copies: 6,
  rotation: 24,
  fit: 0,
  alpha: 0.22,
  shapePen: true,
  mark: { enabled: true, distance: 0, height: 1, size: 1 },
  locked: [],
  seed: 'trefoil',
};

export const DEFAULT_PROJECT: ProjectState = deepFreeze(DEFAULTS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isProjectState(value: unknown): value is ProjectState {
  if (!isRecord(value)) return false;
  return (
    typeof value['version'] === 'number' &&
    typeof value['templateId'] === 'string' &&
    isRecord(value['templateParams']) &&
    Array.isArray(value['stages']) &&
    typeof value['endingId'] === 'string' &&
    typeof value['paletteId'] === 'string' &&
    typeof value['text'] === 'string' &&
    typeof value['copies'] === 'number' &&
    typeof value['rotation'] === 'number' &&
    typeof value['fit'] === 'number' &&
    typeof value['alpha'] === 'number' &&
    typeof value['shapePen'] === 'boolean' &&
    isRecord(value['mark']) &&
    Array.isArray(value['locked']) &&
    typeof value['seed'] === 'string'
  );
}

