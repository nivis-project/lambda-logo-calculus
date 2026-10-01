import type { Vec2, WorkingSkeleton } from '../stage/types.js';

export interface GlyphPatch {
  readonly offset?: Vec2;
  readonly scale?: number;
  readonly advance?: number;
  readonly endingId?: string;
}

export type GlyphPatches = Readonly<Record<string, GlyphPatch>>;

export interface SpacingPair {
  readonly before: string;
  readonly after: string;
  readonly extra: number;
}

export const EMPTY_PATCH: GlyphPatch = {};

export function isEmptyPatch(patch: GlyphPatch | undefined): boolean {
  if (patch === undefined) return true;
  return (
    patch.offset === undefined &&
    patch.scale === undefined &&
    patch.advance === undefined &&
    patch.endingId === undefined
  );
}

function centreOf(skeleton: WorkingSkeleton): Vec2 {
  const points = [...skeleton.runs, ...skeleton.rings].flat();
  if (points.length === 0) {
    return skeleton.dots.length === 0
      ? [0, 0]
      : [
          skeleton.dots.reduce((sum, d) => sum + d.x, 0) / skeleton.dots.length,
          skeleton.dots.reduce((sum, d) => sum + d.y, 0) / skeleton.dots.length,
        ];
  }
  let x0 = Number.POSITIVE_INFINITY;
  let y0 = Number.POSITIVE_INFINITY;
  let x1 = Number.NEGATIVE_INFINITY;
  let y1 = Number.NEGATIVE_INFINITY;
  for (const [x, y] of points) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  return [(x0 + x1) / 2, (y0 + y1) / 2];
}

export function applyPatch(skeleton: WorkingSkeleton, patch: GlyphPatch | undefined): WorkingSkeleton {
  if (isEmptyPatch(patch) || patch === undefined) return skeleton;

  const scale = patch.scale ?? 1;
  const [ox, oy] = patch.offset ?? [0, 0];
  const [cx, cy] = scale === 1 ? [0, 0] : centreOf(skeleton);

  const move = ([x, y]: Vec2): Vec2 =>
    scale === 1
      ? [x + ox, y + oy]
      : [cx + (x - cx) * scale + ox, cy + (y - cy) * scale + oy];

  return {
    ...skeleton,
    runs: skeleton.runs.map((run) => run.map(move)),
    rings: skeleton.rings.map((ring) => ring.map(move)),
    dots: skeleton.dots.map((dot) => {
      const [x, y] = move([dot.x, dot.y]);
      return { x, y, r: dot.r * scale };
    }),
  };
}

export function advanceWithPairs(
  characters: readonly string[],
  index: number,
  baseAdvance: number,
  patch: GlyphPatch | undefined,
  pairs: readonly SpacingPair[],
): number {
  const advance = patch?.advance ?? baseAdvance;
  const here = characters[index];
  const next = characters[index + 1];
  if (here === undefined || next === undefined) return advance;

  const extra = pairs
    .filter((pair) => pair.before === here && pair.after === next)
    .reduce((sum, pair) => sum + pair.extra, 0);

  return advance + extra;
}
