import type { ShapeTemplate } from '@trefoil/core';
import { trefoil } from './shapes/trefoil.js';
import { latinGlyphSet } from './glyphs/latin.js';

export const TEMPLATES_PACKAGE_VERSION = 0 as const;

export interface TemplateManifest {
  readonly id: string;
  readonly version: number;
}

export const builtInShapeTemplates: readonly ShapeTemplate[] = [trefoil];

export const builtInTemplates: readonly TemplateManifest[] = builtInShapeTemplates.map((t) => ({
  id: t.id,
  version: t.version,
}));

export { trefoil, TREFOIL_LOBES } from './shapes/trefoil.js';
export { latinGlyphSet, latinGlyphs } from './glyphs/latin.js';

export const builtInGlyphSets = [latinGlyphSet] as const;
