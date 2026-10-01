import type { CurveContour, PathNode, Scene, SceneNode } from '@trefoil/core';
import { pathNode } from '@trefoil/core';
import { polygonClippingEngine, type BooleanEngine, type Polygon } from './boolean.js';
import { DEFAULT_FIT_TOLERANCE, fitPolygon } from './fit.js';

export interface CleanOptions {
  readonly engine?: BooleanEngine;
  readonly tolerance?: number;
}

export function cleanPass(
  contours: PathNode['contours'],
  engine: BooleanEngine = polygonClippingEngine,
): readonly Polygon[] {
  return engine.evenOdd(contours);
}

export function cleanPathNode(node: PathNode, options: CleanOptions = {}): PathNode {
  const engine = options.engine ?? polygonClippingEngine;
  const tolerance = options.tolerance ?? DEFAULT_FIT_TOLERANCE;

  const curves: CurveContour[] = [];
  for (const polygon of cleanPass(node.contours, engine)) {
    curves.push(...fitPolygon(polygon, tolerance));
  }

  return pathNode(node.contours, { ...node.style, fillRule: 'nonzero' }, curves);
}

function cleanNode(node: SceneNode, options: CleanOptions): SceneNode {
  if (node.kind === 'path') return cleanPathNode(node, options);
  if (node.kind === 'text') return node;
  return {
    ...node,
    children: node.children.map((child) => cleanNode(child, options)),
  };
}

export function cleanScene(scene: Scene, options: CleanOptions = {}): Scene {
  const root = cleanNode(scene.root, options);
  if (root.kind !== 'group') throw new Error('the scene root is not a group');
  return { viewBox: scene.viewBox, root };
}
