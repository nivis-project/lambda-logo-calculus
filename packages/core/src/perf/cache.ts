export interface Cache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  readonly size: number;
  readonly capacity: number;
  readonly hits: number;
  readonly misses: number;
  clear(): void;
}

export function createCache<T>(capacity = 2048): Cache<T> {
  const held = new Map<string, T>();
  let hits = 0;
  let misses = 0;

  return {
    get(key) {
      const found = held.get(key);
      if (found === undefined) {
        misses++;
        return undefined;
      }
      hits++;
      held.delete(key);
      held.set(key, found);
      return found;
    },
    set(key, value) {
      held.set(key, value);
      if (held.size > capacity) {
        const oldest = held.keys().next();
        if (!oldest.done) held.delete(oldest.value);
      }
    },
    get size() {
      return held.size;
    },
    capacity,
    get hits() {
      return hits;
    },
    get misses() {
      return misses;
    },
    clear() {
      held.clear();
      hits = 0;
      misses = 0;
    },
  };
}
