import pc from 'polygon-clipping';
import { createRegistry, type Registry, type Vec2 } from '@trefoil/core';

export type Ring = readonly Vec2[];
export type Polygon = readonly Ring[];

export class BooleanEngineError extends Error {
  constructor(engineId: string, reason: string) {
    super(`the "${engineId}" engine could not combine the rings: ${reason}`);
    this.name = 'BooleanEngineError';
  }
}

export const SNAP_STEPS: readonly number[] = [1e-4, 1e-3, 1e-2];

export interface BooleanEngine {
  readonly id: string;
  readonly version: number;
  readonly label: string;
  readonly params: readonly [];
  evenOdd(rings: readonly Ring[]): readonly Polygon[];
  union(polygons: readonly Polygon[]): readonly Polygon[];
  difference(from: readonly Polygon[], cut: readonly Polygon[]): readonly Polygon[];
}

function closed(ring: Ring): Vec2[] {
  const points: Vec2[] = [];
  for (const [x, y] of ring) {
    const last = points[points.length - 1];
    if (last !== undefined && last[0] === x && last[1] === y) continue;
    points.push([x, y]);
  }
  const first = points[0];
  const last = points[points.length - 1];
  if (first !== undefined && last !== undefined && (first[0] !== last[0] || first[1] !== last[1])) {
    points.push([first[0], first[1]]);
  }
  return points;
}

export function signedArea(ring: Ring): number {
  let total = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    if (a === undefined || b === undefined) continue;
    total += a[0] * b[1] - b[0] * a[1];
  }
  return total / 2;
}

export function usableRing(ring: Ring): Vec2[] | null {
  if (ring.length < 3) return null;
  if (!ring.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y))) return null;

  const points = closed(ring);
  if (points.length < 4) return null;
  if (Math.abs(signedArea(points)) < 1e-9) return null;
  return points;
}

function snapped(ring: readonly Vec2[], step: number): Vec2[] {
  const points: Vec2[] = [];
  for (const [x, y] of ring) {
    const point: Vec2 = [Math.round(x / step) * step, Math.round(y / step) * step];
    const last = points[points.length - 1];
    if (last !== undefined && last[0] === point[0] && last[1] === point[1]) continue;
    points.push(point);
  }
  return points;
}

function toPolygons(value: pc.MultiPolygon): readonly Polygon[] {
  return value.map((polygon) => polygon.map((ring) => ring.map(([x, y]) => [x, y] as Vec2)));
}

function fromPolygons(polygons: readonly Polygon[]): pc.Polygon[] {
  return polygons
    .map((polygon) =>
      polygon.map(usableRing).filter((ring): ring is Vec2[] => ring !== null) as pc.Polygon,
    )
    .filter((polygon) => polygon.length > 0);
}

export const polygonClippingEngine: BooleanEngine = {
  id: 'polygon-clipping',
  version: 1,
  label: 'polygon-clipping',
  params: [],

  evenOdd(rings) {
    let lastFailure = 'no rings';

    for (const step of SNAP_STEPS) {
      const usable = rings
        .map((ring) => usableRing(snapped(ring, step)))
        .filter((ring): ring is Vec2[] => ring !== null);
      if (usable.length === 0) return [];

      const [first, ...rest] = usable.map((ring) => [ring] as pc.Polygon);
      if (first === undefined) return [];

      try {
        return toPolygons(pc.xor(first, ...rest));
      } catch (error) {
        lastFailure = (error as Error).message;
      }
    }

    throw new BooleanEngineError('polygon-clipping', lastFailure);
  },

  union(polygons) {
    const usable = fromPolygons(polygons);
    const [first, ...rest] = usable;
    if (first === undefined) return [];
    return toPolygons(pc.union(first, ...rest));
  },

  difference(from, cut) {
    const left = fromPolygons(from);
    const [first, ...rest] = left;
    if (first === undefined) return [];
    const right = fromPolygons(cut);
    if (right.length === 0) return toPolygons(pc.union(first, ...rest));
    return toPolygons(pc.difference([first, ...rest] as pc.MultiPolygon, ...right));
  },
};

export function createBooleanEngineRegistry(): Registry<BooleanEngine> {
  const registry = createRegistry<BooleanEngine>('boolean-engine');
  registry.register(polygonClippingEngine);
  return registry;
}
