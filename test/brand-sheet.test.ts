import { describe, expect, it } from 'vitest';
import {
  GRID,
  boundsOfScene,
  createGlyphSetRegistry,
  createPaletteRegistry,
  createStageRegistry,
  createTemplateRegistry,
  type Scene,
} from '@trefoil/core';
import { builtInShapeTemplates, latinGlyphSet } from '@trefoil/templates';
import {
  DEFAULT_PROJECT,
  applyCommand,
  lockupSceneFromProject,
  sceneFromProject,
  type ProjectState,
  type SceneRegistries,
} from '@trefoil/store';
import { BUILT_IN_ENDINGS, BUILT_IN_JOINS, type Ending, type Join } from '@trefoil/core';
import { SHEET_PAGE, composeSheet, sceneToSvg } from '@trefoil/export';

function registries(): SceneRegistries {
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

const PROJECT: ProjectState = applyCommand(DEFAULT_PROJECT, {
  kind: 'setNumber',
  field: 'copies',
  value: 3,
}).state;

function sheetScene(): Scene {
  const shared = registries();
  const palette = shared.palettes.get(PROJECT.paletteId);

  return composeSheet({
    title: PROJECT.text,
    mark: sceneFromProject({ ...PROJECT, text: 'o' }, shared),
    side: lockupSceneFromProject(PROJECT, shared, 'side'),
    stacked: lockupSceneFromProject(PROJECT, shared, 'stacked'),
    colors: Array.from({ length: PROJECT.copies }, (_unused, copy) =>
      palette.colorAt(copy, PROJECT.copies, {}),
    ),
    ink: '#111111',
    paper: '#ffffff',
  });
}

describe('a brand sheet of the real project', () => {
  it('is unchanged', async () => {
    await expect(sceneToSvg(sheetScene(), 2, { tolerance: 1 })).toMatchFileSnapshot(
      './snapshots/brand-sheet.svg',
    );
  });

  it('stays on the page', () => {
    const bounds = boundsOfScene(sheetScene());
    if (bounds === null) throw new Error('an empty sheet');
    expect(bounds.x0).toBeGreaterThanOrEqual(0);
    expect(bounds.y0).toBeGreaterThanOrEqual(0);
    expect(bounds.x1).toBeLessThanOrEqual(SHEET_PAGE.width);
    expect(bounds.y1).toBeLessThanOrEqual(SHEET_PAGE.height);
  });

  it('holds the mark, both lockups and the grid metrics it was drawn at', () => {
    const svg = sceneToSvg(sheetScene(), 2, { tolerance: 1 });
    expect(svg).toContain('Lockup, beside');
    expect(svg).toContain('Lockup, stacked');
    expect(GRID.capHeight).toBe(86);
  });
});
