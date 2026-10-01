import type { ParamValues } from '../params/types.js';
import { fitForCurve, type RoutedFit } from './nesting.js';
import type { ShapeTemplate } from './types.js';

const DEFAULT_CAPACITY = 512;

function keyFor(template: ShapeTemplate, params: ParamValues, phi: number): string {
  const parts = Object.keys(params)
    .sort()
    .map((id) => `${id}=${String(params[id])}`)
    .join('&');
  return `${template.id}@${template.version}|${parts}|${phi}`;
}

export interface PerfectFitMemo {
  get(template: ShapeTemplate, params: ParamValues, phi: number): number;
  getRouted(template: ShapeTemplate, params: ParamValues, phi: number): RoutedFit;
  readonly size: number;
  readonly capacity: number;
  clear(): void;
}

export function createPerfectFitMemo(capacity = DEFAULT_CAPACITY): PerfectFitMemo {
  const cache = new Map<string, RoutedFit>();

  const routed = (
    template: ShapeTemplate,
    params: ParamValues,
    phi: number,
  ): RoutedFit => {
    const key = keyFor(template, params, phi);
    const hit = cache.get(key);
    if (hit !== undefined) {
      cache.delete(key);
      cache.set(key, hit);
      return hit;
    }
    const computed = fitForCurve(template, params, phi);
    cache.set(key, computed);
    if (cache.size > capacity) {
      const oldest = cache.keys().next();
      if (!oldest.done) cache.delete(oldest.value);
    }
    return computed;
  };

  return {
    get(template, params, phi) {
      return routed(template, params, phi).value;
    },
    getRouted: routed,
    get size() {
      return cache.size;
    },
    capacity,
    clear() {
      cache.clear();
    },
  };
}
