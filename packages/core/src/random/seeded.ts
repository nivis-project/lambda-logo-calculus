export interface RandomSource {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(from: readonly T[]): T;
}

function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash === 0 ? 0x9e3779b9 : hash;
}

export function seededRandom(seed: string): RandomSource {
  let state = hashSeed(seed);

  const next = (): number => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0x100000000;
  };

  return {
    next,
    int(min, max) {
      return min + Math.floor(next() * (max - min + 1));
    },
    pick(from) {
      const chosen = from[Math.floor(next() * from.length)];
      if (chosen === undefined) throw new Error('cannot pick from an empty list');
      return chosen;
    },
  };
}
