export interface SeededRandom {
  next(): number;
  nextInRange(min: number, max: number): number;
  nextInt(min: number, max: number): number;
  pick<T>(options: readonly T[]): T;
}

function mix(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function createSeededRandom(seed: string | number): SeededRandom {
  let state = (typeof seed === 'number' ? seed >>> 0 : mix(seed)) || 0x9e3779b9;

  const next = (): number => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0x100000000;
  };

  const nextInRange = (min: number, max: number): number => min + next() * (max - min);

  const nextInt = (min: number, max: number): number => {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    if (hi < lo) return lo;
    return lo + Math.floor(next() * (hi - lo + 1));
  };

  const pick = <T>(options: readonly T[]): T => {
    const chosen = options[nextInt(0, options.length - 1)];
    if (chosen === undefined) {
      throw new Error('cannot pick from an empty set of options');
    }
    return chosen;
  };

  return { next, nextInRange, nextInt, pick };
}
