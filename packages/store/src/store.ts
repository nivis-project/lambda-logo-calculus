import { createStore, type StoreApi } from 'zustand/vanilla';
import { applyCommand, applyPatchList, type Command, type Patch } from './commands.js';
import { DEFAULT_PROJECT, deepFreeze, isProjectState, type ProjectState } from './state.js';

export interface LogEntry {
  readonly command: Command;
  readonly forward: readonly Patch[];
  readonly inverse: readonly Patch[];
}

export interface Variant {
  readonly name: string;
  readonly state: ProjectState;
  readonly thumbnail?: string;
}

export interface Storage {
  read(): string | null;
  write(value: string): void;
}

export function memoryStorage(initial: string | null = null): Storage & { value: string | null } {
  let value = initial;
  return {
    get value() {
      return value;
    },
    read: () => value,
    write: (next) => {
      value = next;
    },
  };
}

export interface StoreState {
  readonly project: ProjectState;
  readonly log: readonly LogEntry[];
  readonly position: number;
  readonly variants: readonly Variant[];
  readonly restoreFailure: string | null;
}

export interface Scheduler {
  (run: () => void, delayMs: number): () => void;
}

const defaultScheduler: Scheduler = (run, delayMs) => {
  const handle = setTimeout(run, delayMs);
  return () => {
    clearTimeout(handle);
  };
};

export interface StoreOptions {
  readonly storage?: Storage;
  readonly autosaveDelayMs?: number;
  readonly scheduler?: Scheduler;
  readonly initial?: ProjectState;
}

export interface ProjectStore {
  readonly api: StoreApi<StoreState>;
  getState(): StoreState;
  getProject(): ProjectState;
  dispatch(command: Command): void;
  undo(): boolean;
  redo(): boolean;
  canUndo(): boolean;
  canRedo(): boolean;
  takeVariant(name: string, thumbnail?: string): void;
  restoreVariant(name: string): boolean;
  removeVariant(name: string): boolean;
  flushAutosave(): void;
  subscribe(listener: (state: StoreState) => void): () => void;
}

function readInitial(options: StoreOptions): { project: ProjectState; failure: string | null } {
  if (options.initial !== undefined) {
    return { project: deepFreeze(structuredClone(options.initial)), failure: null };
  }

  const raw = options.storage?.read() ?? null;
  if (raw === null) return { project: DEFAULT_PROJECT, failure: null };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isProjectState(parsed)) {
      return { project: DEFAULT_PROJECT, failure: 'the stored project is not a valid project' };
    }
    return { project: deepFreeze(parsed), failure: null };
  } catch (error) {
    return {
      project: DEFAULT_PROJECT,
      failure: `the stored project could not be read: ${(error as Error).message}`,
    };
  }
}

export function createProjectStore(options: StoreOptions = {}): ProjectStore {
  const { project, failure } = readInitial(options);
  const delay = options.autosaveDelayMs ?? 400;
  const schedule = options.scheduler ?? defaultScheduler;

  const api = createStore<StoreState>(() => ({
    project,
    log: [],
    position: 0,
    variants: [],
    restoreFailure: failure,
  }));

  let cancel: (() => void) | null = null;

  const save = (): void => {
    if (options.storage === undefined) return;
    options.storage.write(JSON.stringify(api.getState().project));
  };

  const scheduleSave = (): void => {
    if (options.storage === undefined) return;
    cancel?.();
    cancel = schedule(() => {
      cancel = null;
      save();
    }, delay);
  };

  const dispatch = (command: Command): void => {
    const current = api.getState();
    const applied = applyCommand(current.project, command);
    api.setState({
      project: applied.state,
      log: [
        ...current.log.slice(0, current.position),
        { command, forward: applied.forward, inverse: applied.inverse },
      ],
      position: current.position + 1,
    });
    scheduleSave();
  };

  const undo = (): boolean => {
    const current = api.getState();
    if (current.position === 0) return false;
    const entry = current.log[current.position - 1];
    if (entry === undefined) return false;
    api.setState({
      project: applyPatchList(current.project, entry.inverse),
      position: current.position - 1,
    });
    scheduleSave();
    return true;
  };

  const redo = (): boolean => {
    const current = api.getState();
    if (current.position >= current.log.length) return false;
    const entry = current.log[current.position];
    if (entry === undefined) return false;
    api.setState({
      project: applyPatchList(current.project, entry.forward),
      position: current.position + 1,
    });
    scheduleSave();
    return true;
  };

  return {
    api,
    getState: () => api.getState(),
    getProject: () => api.getState().project,
    dispatch,
    undo,
    redo,
    canUndo: () => api.getState().position > 0,
    canRedo: () => api.getState().position < api.getState().log.length,
    takeVariant(name, thumbnail) {
      const current = api.getState();
      api.setState({
        variants: [
          ...current.variants.filter((v) => v.name !== name),
          thumbnail === undefined
            ? { name, state: current.project }
            : { name, state: current.project, thumbnail },
        ],
      });
    },
    removeVariant(name) {
      const current = api.getState();
      if (!current.variants.some((v) => v.name === name)) return false;
      api.setState({ variants: current.variants.filter((v) => v.name !== name) });
      return true;
    },
    restoreVariant(name) {
      const found = api.getState().variants.find((v) => v.name === name);
      if (found === undefined) return false;
      dispatch({ kind: 'replaceState', state: found.state });
      return true;
    },
    flushAutosave() {
      cancel?.();
      cancel = null;
      save();
    },
    subscribe: (listener) => api.subscribe(listener),
  };
}
