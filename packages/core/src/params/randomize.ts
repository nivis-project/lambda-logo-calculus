import { seededRandom } from '../random/seeded.js';
import { resolveParams } from './resolve.js';
import { isNumericParam, type ParamDef, type ParamValue, type ParamValues } from './types.js';

function rangeFor(def: ParamDef): { readonly min: number; readonly max: number } | null {
  if (!isNumericParam(def)) return null;
  if (def.randomize === false) return null;
  return def.randomize ?? { min: def.min, max: def.max };
}

export function randomizeParams(
  defs: readonly ParamDef[],
  current: ParamValues,
  locked: ReadonlySet<string>,
  seed: string,
): ParamValues {
  const random = seededRandom(seed);
  const next: Record<string, ParamValue> = { ...resolveParams(defs, current).values };

  for (const def of defs) {
    if (locked.has(def.id)) continue;
    if (def.randomize === false) continue;

    if (isNumericParam(def)) {
      const range = rangeFor(def);
      if (range === null) continue;
      const raw = range.min + random.next() * (range.max - range.min);
      const step = def.step ?? (def.kind === 'int' ? 1 : 0);
      const snapped = step > 0 ? range.min + Math.round((raw - range.min) / step) * step : raw;
      next[def.id] = Math.min(range.max, Math.max(range.min, snapped));
      continue;
    }

    if (def.kind === 'enum') next[def.id] = random.pick(def.options);
    else if (def.kind === 'bool') next[def.id] = random.next() < 0.5;
  }

  return resolveParams(defs, next).values;
}
