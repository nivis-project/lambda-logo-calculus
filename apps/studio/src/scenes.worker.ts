import * as Comlink from 'comlink';
import { DRAFT_QUALITY, FULL_QUALITY, createGlyphCache, type Scene } from '@trefoil/core';
import { lockupSceneFromProject, sceneFromProject, type ProjectState } from '@trefoil/store';
import { createRegistries } from './registries.js';

export interface SceneSet {
  readonly wordmark: Scene;
  readonly mark: Scene;
  readonly side: Scene;
  readonly stacked: Scene;
  readonly ms: number;
  readonly quality: string;
}

export interface SceneBuilder {
  build(project: ProjectState, draft: boolean): SceneSet;
}

const registries = createRegistries();
const cache = createGlyphCache();

export function buildScenes(project: ProjectState, draft: boolean): SceneSet {
  const quality = draft ? DRAFT_QUALITY : FULL_QUALITY;
  const options = draft ? { quality } : { quality, cache };
  const started = performance.now();

  const set = {
    wordmark: sceneFromProject(project, registries, options),
    mark: sceneFromProject({ ...project, text: 'o' }, registries, options),
    side: lockupSceneFromProject(project, registries, 'side', options),
    stacked: lockupSceneFromProject(project, registries, 'stacked', options),
  };

  return { ...set, ms: performance.now() - started, quality: quality.id };
}

const api: SceneBuilder = { build: buildScenes };

Comlink.expose(api);
