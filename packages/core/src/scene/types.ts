import type { Vec2 } from '../stage/types.js';
import type { CurveContour } from './curves.js';

export interface PathStyle {
  readonly fill: string;
  readonly opacity: number;
  readonly fillRule?: 'nonzero' | 'evenodd';
}

export interface Transform {
  readonly translate?: readonly [number, number];
  readonly rotate?: number;
  readonly scale?: readonly [number, number];
}

export interface PathNode {
  readonly kind: 'path';
  readonly contours: readonly (readonly Vec2[])[];
  readonly curves?: readonly CurveContour[];
  readonly style: PathStyle;
}

export interface GroupNode {
  readonly kind: 'group';
  readonly children: readonly SceneNode[];
  readonly transform?: Transform;
  readonly glyph?: { readonly character: string; readonly index: number };
}

export type SceneNode = PathNode | GroupNode;

export interface Scene {
  readonly viewBox: readonly [number, number, number, number];
  readonly root: GroupNode;
}

export function pathNode(
  contours: readonly (readonly Vec2[])[],
  style: PathStyle,
  curves?: readonly CurveContour[],
): PathNode {
  return {
    kind: 'path',
    contours,
    ...(curves === undefined ? {} : { curves }),
    style,
  };
}

export function groupNode(
  children: readonly SceneNode[],
  transform?: Transform,
  glyph?: GroupNode['glyph'],
): GroupNode {
  return {
    kind: 'group',
    children,
    ...(transform === undefined ? {} : { transform }),
    ...(glyph === undefined ? {} : { glyph }),
  };
}

export function countNodes(node: SceneNode): number {
  return node.kind === 'path'
    ? 1
    : node.children.reduce((total, child) => total + countNodes(child), 1);
}

export function allContours(node: SceneNode): readonly (readonly Vec2[])[] {
  return node.kind === 'path' ? node.contours : node.children.flatMap(allContours);
}
