import { createSeededRandom } from '../random/seeded.js';
import { isNumericParam, type ParamDef, type ParamValue, type ParamValues } from './types.js';
import { resolveParams } from './resolve.js';

export function randomizeParams(
  defs: readonly ParamDef[],
  values: ParamValues,
  locked: ReadonlySet<string>,
  seed: string | number,
): ParamValues {
  const current = resolveParams(defs, values).values;
  const random = createSeededRandom(seed);
  const next: Record<string, ParamValue> = { ...current };

  for (const def of defs) {
    if (locked.has(def.id) || def.randomize === false) continue;

    if (isNumericParam(def)) {
      const range = def.randomize ?? { min: def.min, max: def.max };
      next[def.id] =
        def.kind === 'int'
          ? random.nextInt(range.min, range.max)
          : random.nextInRange(range.min, range.max);
      continue;
    }

    if (def.kind === 'enum') {
      next[def.id] = random.pick(def.options);
      continue;
    }

    if (def.kind === 'bool') {
      next[def.id] = random.next() < 0.5;
    }
  }

  return next;
}
