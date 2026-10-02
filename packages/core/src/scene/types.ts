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
  // On a group, opacity flattens the children first and then makes the result
  // transparent. On each child it would make them transparent separately, and
  // their overlaps would blend twice.
  readonly opacity?: number;
  readonly fill?: string;
}

export type SceneNode = PathNode | GroupNode;

export interface Scene {
  readonly viewBox: readonly [number, number, number, number];
  readonly root: GroupNode;
}

export function pathNode(contours: readonly Contour[], style: PathStyle): PathNode {
  return { kind: 'path', contours, style };
}

export interface GroupStyle {
  readonly opacity?: number;
  readonly fill?: string;
}

export function groupNode(
  children: readonly SceneNode[],
  transform?: Transform,
  style: GroupStyle = {},
): GroupNode {
  return {
    kind: 'group',
    children,
    ...(transform === undefined ? {} : { transform }),
    ...(style.opacity === undefined ? {} : { opacity: style.opacity }),
    ...(style.fill === undefined ? {} : { fill: style.fill }),
  };
}

export function countNodes(node: SceneNode): number {
  return node.kind === 'path'
    ? 1
    : node.children.reduce((total, child) => total + countNodes(child), 1);
}

export function allContours(node: SceneNode): readonly Contour[] {
  return node.kind === 'path' ? node.contours : node.children.flatMap(allContours);
}
