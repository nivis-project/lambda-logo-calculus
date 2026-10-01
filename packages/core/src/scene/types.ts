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

export interface TextNode {
  readonly kind: 'text';
  readonly at: Vec2;
  readonly text: string;
  readonly size: number;
  readonly fill: string;
}

export type SceneNode = PathNode | GroupNode | TextNode;

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

export function textNode(at: Vec2, text: string, size: number, fill: string): TextNode {
  return { kind: 'text', at, text, size, fill };
}

export function countNodes(node: SceneNode): number {
  return node.kind === 'group'
    ? node.children.reduce((total, child) => total + countNodes(child), 1)
    : 1;
}

export function placeScene(scene: Scene, at: Vec2, scale: number): GroupNode {
  return groupNode([scene.root], { translate: at, scale: [scale, scale] });
}

export function allContours(node: SceneNode): readonly (readonly Vec2[])[] {
  if (node.kind === 'path') return node.contours;
  if (node.kind === 'text') return [];
  return node.children.flatMap(allContours);
}
