import {
  GRID,
  groupNode,
  pathNode,
  type Scene,
  type SceneNode,
  type Vec2,
  type WorkingSkeleton,
} from '@trefoil/core';

export const OVERLAY_IDS = ['grid', 'skeletons', 'nib', 'bounds', 'optical'] as const;
export type OverlayId = (typeof OVERLAY_IDS)[number];

export type OverlayState = Readonly<Record<OverlayId, boolean>>;

export const NO_OVERLAYS: OverlayState = {
  grid: false,
  skeletons: false,
  nib: false,
  bounds: false,
  optical: false,
};

export const GRID_LINES: readonly { readonly id: string; readonly y: number }[] = [
  { id: 'baseline', y: 0 },
  { id: 'x-height', y: GRID.xHeight },
  { id: 'cap-height', y: GRID.capHeight },
  { id: 'descender', y: GRID.descender },
];

function line(from: Vec2, to: Vec2, fill: string): SceneNode {
  const thickness = 0.6;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy) || 1;
  const nx = (-dy / length) * thickness;
  const ny = (dx / length) * thickness;
  return pathNode(
    [
      [
        [from[0] + nx, from[1] + ny],
        [to[0] + nx, to[1] + ny],
        [to[0] - nx, to[1] - ny],
        [from[0] - nx, from[1] - ny],
        [from[0] + nx, from[1] + ny],
      ],
    ],
    { fill, opacity: 1 },
  );
}

function boxOutline(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  fill: string,
): readonly SceneNode[] {
  return [
    line([x0, y0], [x1, y0], fill),
    line([x1, y0], [x1, y1], fill),
    line([x1, y1], [x0, y1], fill),
    line([x0, y1], [x0, y0], fill),
  ];
}

function boundsOf(points: readonly Vec2[]): readonly [number, number, number, number] | null {
  if (points.length === 0) return null;
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
  return [x0, y0, x1, y1];
}

export interface OverlayInput {
  readonly scene: Scene;
  readonly overlays: OverlayState;
  readonly skeletons: readonly WorkingSkeleton[];
  readonly nib: readonly Vec2[];
  readonly width: number;
}

export function overlayNodes(input: OverlayInput): readonly SceneNode[] {
  const nodes: SceneNode[] = [];

  if (input.overlays.grid) {
    for (const { y } of GRID_LINES) {
      nodes.push(line([0, y], [input.width, y], '#3a7fd4'));
    }
  }

  if (input.overlays.skeletons) {
    for (const skeleton of input.skeletons) {
      for (const run of [...skeleton.runs, ...skeleton.rings]) {
        for (let i = 0; i < run.length - 1; i++) {
          const a = run[i];
          const b = run[i + 1];
          if (a !== undefined && b !== undefined) nodes.push(line(a, b, '#c47a0a'));
        }
      }
    }
  }

  if (input.overlays.nib && input.nib.length > 2) {
    nodes.push(pathNode([[...input.nib, input.nib[0] ?? [0, 0]]], { fill: '#18a558', opacity: 0.4 }));
  }

  if (input.overlays.bounds) {
    const points = input.scene.root.children.flatMap((child) =>
      child.kind === 'group'
        ? child.children.flatMap((pass) => (pass.kind === 'path' ? pass.contours.flat() : []))
        : child.kind === 'path'
          ? child.contours.flat()
          : [],
    );
    const box = boundsOf(points);
    if (box !== null) nodes.push(...boxOutline(box[0], box[1], box[2], box[3], '#8a5000'));
  }

  if (input.overlays.optical) {
    const inset = GRID.capHeight * 0.06;
    nodes.push(
      ...boxOutline(-inset, -inset, input.width + inset, GRID.capHeight + inset, '#b2156f'),
    );
  }

  return nodes;
}

export function withOverlays(scene: Scene, overlays: readonly SceneNode[]): Scene {
  if (overlays.length === 0) return scene;
  return {
    ...scene,
    root: groupNode([...scene.root.children, ...overlays], scene.root.transform),
  };
}
