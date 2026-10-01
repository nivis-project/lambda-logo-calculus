export const STORE_PACKAGE_VERSION = 0 as const;

export type { MarkState, ProjectState } from './state.js';
export { DEFAULT_PROJECT, PROJECT_VERSION, deepFreeze, isProjectState } from './state.js';
export type { Applied, Command, NumericField, Patch } from './commands.js';
export { UnknownCommandError, applyCommand, applyPatchList } from './commands.js';
export type {
  LogEntry,
  ProjectStore,
  Scheduler,
  Storage,
  StoreOptions,
  StoreState,
  Variant,
} from './store.js';
export { createProjectStore, memoryStorage } from './store.js';
export type { ArtboardKind, SceneRegistries } from './scene.js';
export { lockupSceneFromProject, sceneFromProject, skeletonsFromProject } from './scene.js';
export type { LoadProblem, LoadResult, Migration } from './project.js';
export {
  FILE_FORMAT,
  MIGRATIONS,
  loadProject,
  reportOf,
  runMigrations,
  saveProject,
  validateProject,
} from './project.js';
