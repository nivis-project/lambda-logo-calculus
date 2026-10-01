import { isNumericParam, type ParamDef, type ParamValues } from '../params/types.js';
import { createSeededRandom } from '../random/seeded.js';
import type { GridMetrics } from '../glyph/types.js';
import type { Modulation } from '../stage/types.js';
import { applyCurve, type ModulationEntry, type ModulationSource } from './types.js';

export interface ModulationContext {
  readonly templateDefs: readonly ParamDef[];
  readonly templateParams: ParamValues;
  readonly nesting: Readonly<Record<string, number>>;
  readonly copyIndex: number;
  readonly copyCount: number;
  readonly charIndex: number;
  readonly charCount: number;
  readonly seed: string;
  readonly metrics: GridMetrics;
}

export interface SourceResult {
  readonly value: number;
  readonly raw: number;
  readonly missing?: string;
}

const NESTING_RANGES: Readonly<Record<string, readonly [number, number]>> = {
  copies: [1, 12],
  rotation: [0, 180],
  fit: [-1, 1],
  alpha: [0, 1],
};

function span(index: number, count: number): number {
  return count > 1 ? Math.min(1, Math.max(0, index / (count - 1))) : 0;
}

function normalise(raw: number, min: number, max: number): number {
  const width = max - min;
  return width === 0 ? 0 : Math.min(1, Math.max(0, (raw - min) / width));
}

export function sourceValue(source: ModulationSource, context: ModulationContext): SourceResult {
  switch (source.kind) {
    case 'param': {
      const def = context.templateDefs.find((d) => d.id === source.paramId);
      if (def === undefined || !isNumericParam(def)) {
        return { value: 0, raw: 0, missing: `no numeric parameter "${source.paramId}" to drive from` };
      }
      const raw = context.templateParams[source.paramId];
      if (typeof raw !== 'number') {
        return { value: 0, raw: 0, missing: `parameter "${source.paramId}" has no value` };
      }
      return { value: normalise(raw, def.min, def.max), raw };
    }

    case 'nesting': {
      const range = NESTING_RANGES[source.field];
      const raw = context.nesting[source.field];
      if (range === undefined || typeof raw !== 'number') {
        return { value: 0, raw: 0, missing: `nesting value "${source.field}" has no value` };
      }
      return { value: normalise(raw, range[0], range[1]), raw };
    }

    case 'copyIndex':
      return { value: span(context.copyIndex, context.copyCount), raw: context.copyIndex };

    case 'charPosition':
      return { value: span(context.charIndex, context.charCount), raw: context.charIndex };

    case 'random': {
      const random = createSeededRandom(
        `${context.seed}:${source.salt}:${String(context.copyIndex)}:${String(context.charIndex)}`,
      );
      const value = random.next();
      return { value, raw: value };
    }
  }
}

export function prototypeWidthFactor(amplitude: number): number {
  return 0.78 + 0.5 * (1 - Math.exp(-(amplitude - 1) / 4));
}

export function prototypeXHeight(fit: number, metrics: GridMetrics): number {
  return Math.min(metrics.capHeight - 16, metrics.xHeight * (1 + 0.22 * fit));
}

export const PROTOTYPE_PRESET: readonly ModulationEntry[] = [
  {
    id: 'amplitude-to-width',
    source: { kind: 'param', paramId: 'A' },
    target: { kind: 'widthFactor' },
    amount: 1,
    response: { kind: 'named', name: 'prototypeWidth' },
  },
  {
    id: 'fit-to-x-height',
    source: { kind: 'nesting', field: 'fit' },
    target: { kind: 'xHeight' },
    amount: 1,
    response: { kind: 'named', name: 'prototypeXHeight' },
  },
];

export interface ModulationResult {
  readonly modulation: Modulation;
  readonly stageParams: Readonly<Record<string, Readonly<Record<string, number>>>>;
  readonly missing: readonly string[];
}

export function evaluateModulation(
  entries: readonly ModulationEntry[],
  context: ModulationContext,
): ModulationResult {
  const missing: string[] = [];
  const neutral = { widthFactor: 1, xHeight: context.metrics.xHeight };

  let widthFactor = neutral.widthFactor;
  let xHeight = neutral.xHeight;
  const stageParams: Record<string, Record<string, number>> = {};

  for (const entry of entries) {
    if (entry.source.kind === 'copyIndex' && entry.target.kind === 'stageParam') {
      missing.push(
        `${entry.id}: the copy index cannot drive a stage parameter, because the stages run once per glyph and before the copies are made`,
      );
      continue;
    }

    const source = sourceValue(entry.source, context);
    if (source.missing !== undefined) {
      missing.push(`${entry.id}: ${source.missing}`);
      continue;
    }

    if (entry.response.kind === 'named') {
      const full =
        entry.response.name === 'prototypeWidth'
          ? prototypeWidthFactor(source.raw)
          : prototypeXHeight(source.raw, context.metrics);
      const base = entry.response.name === 'prototypeWidth' ? neutral.widthFactor : neutral.xHeight;
      const blended = base + (full - base) * entry.amount;
      if (entry.target.kind === 'widthFactor') widthFactor = blended;
      else if (entry.target.kind === 'xHeight') xHeight = blended;
      continue;
    }

    const driven = applyCurve(entry.response.curve, source.value) * entry.amount;

    if (entry.target.kind === 'widthFactor') {
      widthFactor = neutral.widthFactor + driven;
      continue;
    }
    if (entry.target.kind === 'xHeight') {
      xHeight = neutral.xHeight + driven;
      continue;
    }

    const forStage = stageParams[entry.target.stageId] ?? {};
    forStage[entry.target.paramId] = (forStage[entry.target.paramId] ?? 0) + driven;
    stageParams[entry.target.stageId] = forStage;
  }

  return { modulation: { widthFactor, xHeight }, stageParams, missing };
}
