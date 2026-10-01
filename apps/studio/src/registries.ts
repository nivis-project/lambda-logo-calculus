import {
  BUILT_IN_ENDINGS,
  BUILT_IN_JOINS,
  createGlyphSetRegistry,
  createPaletteRegistry,
  createStageRegistry,
  createTemplateRegistry,
  type Ending,
  type Join,
} from '@trefoil/core';
import { builtInShapeTemplates, latinGlyphSet } from '@trefoil/templates';
import type { SceneRegistries } from '@trefoil/store';

export function createRegistries(): SceneRegistries {
  const templates = createTemplateRegistry();
  for (const template of builtInShapeTemplates) templates.register(template);

  const glyphSets = createGlyphSetRegistry();
  glyphSets.register(latinGlyphSet);

  return {
    templates,
    glyphSets,
    palettes: createPaletteRegistry(),
    stages: createStageRegistry(),
    endings: new Map<string, Ending>(BUILT_IN_ENDINGS.map((e) => [e.id, e])),
    joins: new Map<string, Join>(BUILT_IN_JOINS.map((j) => [j.id, j])),
    glyphSetId: 'latin-basic',
  };
}
