import type { ShapeTemplate } from '@trefoil/core';
import { trefoil } from './shapes/trefoil.js';
import { rose } from './shapes/rose.js';
import { superellipse } from './shapes/superellipse.js';
import { supershape } from './shapes/supershape.js';
import { roundedPolygon } from './shapes/rounded-polygon.js';
import { latinGlyphSet } from './glyphs/latin.js';

export const TEMPLATES_PACKAGE_VERSION = 0 as const;

export interface TemplateManifest {
  readonly id: string;
  readonly version: number;
}

export const builtInShapeTemplates: readonly ShapeTemplate[] = [
  trefoil,
  rose,
  superellipse,
  supershape,
  roundedPolygon,
];

export const builtInTemplates: readonly TemplateManifest[] = builtInShapeTemplates.map((t) => ({
  id: t.id,
  version: t.version,
}));

export { trefoil, TREFOIL_LOBES } from './shapes/trefoil.js';
export { rose } from './shapes/rose.js';
export { superellipse } from './shapes/superellipse.js';
export { supershape } from './shapes/supershape.js';
export { roundedPolygon } from './shapes/rounded-polygon.js';
export { latinGlyphSet, latinGlyphs } from './glyphs/latin.js';

export const builtInGlyphSets = [latinGlyphSet] as const;
