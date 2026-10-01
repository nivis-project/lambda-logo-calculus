import type { Vec2 } from '../stage/types.js';
import type { Scene, SceneNode, Transform } from '../scene/types.js';

export interface Bounds {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
  readonly width: number;
  readonly height: number;
}

function apply(point: Vec2, transform: Transform | undefined): Vec2 {
  if (transform === undefined) return point;
  let [x, y] = point;
  if (transform.scale !== undefined) {
    x *= transform.scale[0];
    y *= transform.scale[1];
  }
  if (transform.rotate !== undefined) {
    const radians = (transform.rotate * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    [x, y] = [x * cos - y * sin, x * sin + y * cos];
  }
  if (transform.translate !== undefined) {
    x += transform.translate[0];
    y += transform.translate[1];
  }
  return [x, y];
}

function walk(node: SceneNode, inherited: readonly Transform[], out: Vec2[]): void {
  if (node.kind === 'path') {
    for (const contour of node.contours) {
      for (const point of contour) {
        let moved: Vec2 = point;
        for (let i = inherited.length - 1; i >= 0; i--) {
          moved = apply(moved, inherited[i]);
        }
        out.push(moved);
      }
    }
    return;
  }
  const next = node.transform === undefined ? inherited : [...inherited, node.transform];
  for (const child of node.children) walk(child, next, out);
}

export function boundsOfScene(scene: Scene): Bounds | null {
  const points: Vec2[] = [];
  walk(scene.root, [], points);
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

  return { x0, y0, x1, y1, width: x1 - x0, height: y1 - y0 };
}
