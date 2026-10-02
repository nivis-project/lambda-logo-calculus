import type { Contour } from '../stroke/endings.js';

export interface Transform {
  readonly translate?: readonly [number, number];
  readonly scale?: readonly [number, number];
  readonly rotate?: number;
}

export interface PathStyle {
  readonly fill: string;
  readonly opacity: number;
  readonly fillRule?: 'nonzero' | 'evenodd';
}

export interface PathNode {
  readonly kind: 'path';
  readonly contours: readonly Contour[];
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

export function pathNode(contours: readonly Contour[], style: PathStyle): PathNode {
  return { kind: 'path', contours, style };
}

export function groupNode(children: readonly SceneNode[], transform?: Transform): GroupNode {
  return transform === undefined
    ? { kind: 'group', children }
    : { kind: 'group', children, transform };
}

export function countNodes(node: SceneNode): number {
  return node.kind === 'path'
    ? 1
    : node.children.reduce((total, child) => total + countNodes(child), 1);
}

export function allContours(node: SceneNode): readonly Contour[] {
  return node.kind === 'path' ? node.contours : node.children.flatMap(allContours);
}
