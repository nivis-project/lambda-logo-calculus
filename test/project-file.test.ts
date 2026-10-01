import { describe, expect, it } from 'vitest';
import {
  BUILT_IN_ENDINGS,
  BUILT_IN_JOINS,
  createGlyphSetRegistry,
  createPaletteRegistry,
  createStageRegistry,
  createTemplateRegistry,
  type Ending,
  type Join,
  type Scene,
} from '@trefoil/core';
import { builtInShapeTemplates, latinGlyphSet, trefoil } from '@trefoil/templates';
import {
  DEFAULT_PROJECT,
  applyCommand,
  loadProject,
  lockupSceneFromProject,
  saveProject,
  sceneFromProject,
  type Command,
  type ProjectState,
  type SceneRegistries,
} from '@trefoil/store';

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

const EDITS: readonly Command[] = [
  { kind: 'setText', text: 'Saved Logo' },
  { kind: 'setNumber', field: 'rotation', value: 31 },
  { kind: 'setNumber', field: 'copies', value: 3 },
  { kind: 'setEnding', endingId: 'slab' },
  { kind: 'setPalette', paletteId: 'cool' },
  { kind: 'setStageEnabled', stageId: 'bend', enabled: false },
  { kind: 'setPatch', character: 'S', patch: { offset: [8, 3], scale: 1.1, advance: 72 } },
  { kind: 'setPairs', pairs: [{ before: 'S', after: 'a', extra: 20 }] },
  { kind: 'setMark', mark: { size: 1.3, distance: 0.4 } },
];

const EDITED: ProjectState = EDITS.reduce<ProjectState>(
  (state, command) => applyCommand(state, command).state,
  DEFAULT_PROJECT,
);

function reopened(project: ProjectState): ProjectState {
  const loaded = loadProject(saveProject(project));
  if (!loaded.ok) throw new Error(`the file did not load: ${JSON.stringify(loaded.problems)}`);
  return loaded.project;
}

function sceneText(scene: Scene): string {
  return JSON.stringify(scene);
}

describe('a reopened project', () => {
  it('draws an identical wordmark', () => {
    const shared = registries();
    expect(sceneText(sceneFromProject(reopened(EDITED), shared))).toBe(
      sceneText(sceneFromProject(EDITED, shared)),
    );
  });

  it('draws identical lockups', () => {
    const shared = registries();
    for (const lockup of ['side', 'stacked'] as const) {
      expect(sceneText(lockupSceneFromProject(reopened(EDITED), shared, lockup))).toBe(
        sceneText(lockupSceneFromProject(EDITED, shared, lockup)),
      );
    }
  });

  it('draws a different scene when a saved value differs, so the comparison means something', () => {
    const shared = registries();
    const other = applyCommand(EDITED, { kind: 'setNumber', field: 'rotation', value: 12 }).state;
    expect(sceneText(sceneFromProject(reopened(other), shared))).not.toBe(
      sceneText(sceneFromProject(EDITED, shared)),
    );
  });

  it('is equal to what was saved, field for field', () => {
    expect(reopened(EDITED)).toEqual(EDITED);
  });
});

describe('the template version', () => {
  it('starts at the version of the template the studio opens with', () => {
    expect(DEFAULT_PROJECT.templateId).toBe(trefoil.id);
    expect(DEFAULT_PROJECT.templateVersion).toBe(trefoil.version);
  });

  it('is recorded when a template is chosen', () => {
    for (const template of builtInShapeTemplates) {
      const state = applyCommand(DEFAULT_PROJECT, {
        kind: 'setTemplate',
        templateId: template.id,
        templateVersion: template.version,
        params: {},
      }).state;
      expect(state.templateVersion).toBe(template.version);
      expect(reopened(state).templateVersion).toBe(template.version);
    }
  });
});
