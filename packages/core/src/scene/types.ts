import type { Vec2 } from '../stage/types.js';

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
  readonly style: PathStyle;
}

export interface GroupNode {
  readonly kind: 'group';
  readonly children: readonly SceneNode[];
  readonly transform?: Transform;
}

export type SceneNode = PathNode | GroupNode;

export interface Scene {
  readonly viewBox: readonly [number, number, number, number];
  readonly root: GroupNode;
}

export function pathNode(
  contours: readonly (readonly Vec2[])[],
  style: PathStyle,
): PathNode {
  return { kind: 'path', contours, style };
}

export function groupNode(children: readonly SceneNode[], transform?: Transform): GroupNode {
  return transform === undefined ? { kind: 'group', children } : { kind: 'group', children, transform };
}

export function countNodes(node: SceneNode): number {
  return node.kind === 'path'
    ? 1
    : node.children.reduce((total, child) => total + countNodes(child), 1);
}

export function allContours(node: SceneNode): readonly (readonly Vec2[])[] {
  return node.kind === 'path' ? node.contours : node.children.flatMap(allContours);
}
