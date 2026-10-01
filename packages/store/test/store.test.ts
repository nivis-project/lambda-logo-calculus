import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  DEFAULT_PROJECT,
  UnknownCommandError,
  applyCommand,
  createProjectStore,
  isProjectState,
  memoryStorage,
  type Command,
  type ProjectState,
  type Scheduler,
} from '../src/index.js';

function manualScheduler(): Scheduler & { run(): void; pending(): number } {
  let queued: (() => void)[] = [];
  const scheduler = ((run: () => void) => {
    queued.push(run);
    return () => {
      queued = queued.filter((q) => q !== run);
    };
  }) as Scheduler & { run(): void; pending(): number };
  scheduler.run = () => {
    const toRun = queued;
    queued = [];
    for (const run of toRun) run();
  };
  scheduler.pending = () => queued.length;
  return scheduler;
}

const SET_A: Command = { kind: 'setTemplateParam', paramId: 'A', value: 7 };
const SET_TEXT: Command = { kind: 'setText', text: 'Hello' };

describe('the project state', () => {
  it('round-trips through JSON unchanged', () => {
    expect(JSON.parse(JSON.stringify(DEFAULT_PROJECT))).toEqual(DEFAULT_PROJECT);
  });

  it('recognises itself and refuses what is not a project', () => {
    expect(isProjectState(DEFAULT_PROJECT)).toBe(true);
    expect(isProjectState(null)).toBe(false);
    expect(isProjectState([])).toBe(false);
    expect(isProjectState({})).toBe(false);
    expect(isProjectState({ ...DEFAULT_PROJECT, copies: 'six' })).toBe(false);
    expect(isProjectState({ ...DEFAULT_PROJECT, mark: null })).toBe(false);
  });

  it('is frozen, so a direct mutation fails', () => {
    const store = createProjectStore();
    const project = store.getProject();
    expect(() => {
      (project as { text: string }).text = 'nope';
    }).toThrow();
    expect(() => {
      (project.mark as { size: number }).size = 99;
    }).toThrow();
    expect(store.getProject().text).toBe(DEFAULT_PROJECT.text);
  });
});

describe('commands', () => {
  it('produces the next state without touching the one it was given', () => {
    const before = structuredClone(DEFAULT_PROJECT);
    const applied = applyCommand(DEFAULT_PROJECT, SET_A);
    expect(applied.state.templateParams['A']).toBe(7);
    expect(DEFAULT_PROJECT).toEqual(before);
    expect(applied.forward.length).toBeGreaterThan(0);
    expect(applied.inverse.length).toBeGreaterThan(0);
  });

  it('gives the same result after being serialised and parsed back', () => {
    for (const command of [
      SET_A,
      SET_TEXT,
      { kind: 'setNumber', field: 'copies', value: 9 },
      { kind: 'setEnding', endingId: 'slab' },
      { kind: 'setJoin', joinId: null },
      { kind: 'setPalette', paletteId: 'warm' },
      { kind: 'setShapePen', on: false },
      { kind: 'setStageEnabled', stageId: 'bend', enabled: false },
      { kind: 'setMark', mark: { size: 2 } },
      { kind: 'setLock', paramId: 'A', locked: true },
      { kind: 'setSeed', seed: 'other' },
      { kind: 'setTemplate', templateId: 'rose', templateVersion: 1, params: { A: 4, k: 5 } },
    ] satisfies Command[]) {
      const parsed = JSON.parse(JSON.stringify(command)) as Command;
      expect(applyCommand(DEFAULT_PROJECT, parsed).state, command.kind).toEqual(
        applyCommand(DEFAULT_PROJECT, command).state,
      );
    }
  });

  it('changes what each command says it changes', () => {
    const at = (command: Command): ProjectState => applyCommand(DEFAULT_PROJECT, command).state;
    expect(at({ kind: 'setText', text: 'x' }).text).toBe('x');
    expect(at({ kind: 'setNumber', field: 'rotation', value: 90 }).rotation).toBe(90);
    expect(at({ kind: 'setEnding', endingId: 'ball' }).endingId).toBe('ball');
    expect(at({ kind: 'setJoin', joinId: null }).joinId).toBeNull();
    expect(at({ kind: 'setPalette', paletteId: 'cool' }).paletteId).toBe('cool');
    expect(at({ kind: 'setShapePen', on: false }).shapePen).toBe(false);
    expect(at({ kind: 'setSeed', seed: 'z' }).seed).toBe('z');
    expect(
      at({ kind: 'setTemplate', templateId: 'rose', templateVersion: 4, params: { A: 2, k: 7 } }),
    ).toMatchObject({
      templateId: 'rose',
      templateVersion: 4,
      templateParams: { A: 2, k: 7 },
    });
    expect(
      at({ kind: 'setStageEnabled', stageId: 'bend', enabled: false }).stages.find(
        (s) => s.id === 'bend',
      )?.enabled,
    ).toBe(false);
    expect(at({ kind: 'setMark', mark: { size: 2 } }).mark).toEqual({
      ...DEFAULT_PROJECT.mark,
      size: 2,
    });
    expect(at({ kind: 'setStages', stages: [{ id: 'bend', enabled: false }] }).stages).toEqual([
      { id: 'bend', enabled: false },
    ]);
  });

  it('adds and removes a lock, keeping the list sorted', () => {
    let state = applyCommand(DEFAULT_PROJECT, { kind: 'setLock', paramId: 'rot', locked: true }).state;
    state = applyCommand(state, { kind: 'setLock', paramId: 'A', locked: true }).state;
    expect(state.locked).toEqual(['A', 'rot']);
    state = applyCommand(state, { kind: 'setLock', paramId: 'rot', locked: false }).state;
    expect(state.locked).toEqual(['A']);
  });

  it('refuses an unknown kind, naming it, leaving the state alone', () => {
    const before = structuredClone(DEFAULT_PROJECT);
    expect(() => applyCommand(DEFAULT_PROJECT, { kind: 'wobble' } as unknown as Command)).toThrow(
      UnknownCommandError,
    );
    expect(() => applyCommand(DEFAULT_PROJECT, { kind: 'wobble' } as unknown as Command)).toThrow(
      /no command of kind "wobble"/,
    );
    expect(DEFAULT_PROJECT).toEqual(before);
  });
});

describe('undo and redo', () => {
  it('restores the previous state and reapplies it', () => {
    const store = createProjectStore();
    store.dispatch(SET_A);
    expect(store.getProject().templateParams['A']).toBe(7);

    expect(store.undo()).toBe(true);
    expect(store.getProject().templateParams['A']).toBe(3);

    expect(store.redo()).toBe(true);
    expect(store.getProject().templateParams['A']).toBe(7);
  });

  it('reports when there is nothing to undo or redo, leaving the state alone', () => {
    const store = createProjectStore();
    expect(store.canUndo()).toBe(false);
    expect(store.undo()).toBe(false);
    expect(store.getProject()).toEqual(DEFAULT_PROJECT);

    expect(store.canRedo()).toBe(false);
    expect(store.redo()).toBe(false);
    expect(store.getProject()).toEqual(DEFAULT_PROJECT);
  });

  it('discards the redo entries when a new command follows an undo', () => {
    const store = createProjectStore();
    store.dispatch(SET_A);
    store.undo();
    expect(store.canRedo()).toBe(true);

    store.dispatch(SET_TEXT);
    expect(store.canRedo()).toBe(false);
    expect(store.redo()).toBe(false);
    expect(store.getProject().text).toBe('Hello');
  });

  it('passes back through each intermediate value in reverse', () => {
    const store = createProjectStore();
    const seen: number[] = [DEFAULT_PROJECT.copies];
    for (const copies of [2, 5, 9]) {
      store.dispatch({ kind: 'setNumber', field: 'copies', value: copies });
      seen.push(copies);
    }
    for (let i = seen.length - 1; i > 0; i--) {
      expect(store.getProject().copies).toBe(seen[i]);
      expect(store.undo()).toBe(true);
    }
    expect(store.getProject().copies).toBe(seen[0]);
  });

  it('returns exactly to the start after any sequence is fully undone', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.integer({ min: 1, max: 12 }).map(
              (value): Command => ({ kind: 'setNumber', field: 'copies', value }),
            ),
            fc.double({ min: 1, max: 20, noNaN: true }).map(
              (value): Command => ({ kind: 'setTemplateParam', paramId: 'A', value }),
            ),
            fc.string({ maxLength: 8 }).map((text): Command => ({ kind: 'setText', text })),
            fc.boolean().map((on): Command => ({ kind: 'setShapePen', on })),
          ),
          { minLength: 1, maxLength: 20 },
        ),
        (commands) => {
          const store = createProjectStore();
          for (const command of commands) store.dispatch(command);
          while (store.undo());
          return JSON.stringify(store.getProject()) === JSON.stringify(DEFAULT_PROJECT);
        },
      ),
    );
  });
});

describe('variants', () => {
  it('restores the state it recorded', () => {
    const store = createProjectStore();
    store.dispatch(SET_A);
    store.takeVariant('seven');
    store.dispatch({ kind: 'setTemplateParam', paramId: 'A', value: 12 });

    expect(store.restoreVariant('seven')).toBe(true);
    expect(store.getProject().templateParams['A']).toBe(7);
  });

  it('can be undone, because restoring is itself a command', () => {
    const store = createProjectStore();
    store.takeVariant('start');
    store.dispatch(SET_A);
    store.restoreVariant('start');
    expect(store.getProject().templateParams['A']).toBe(3);

    store.undo();
    expect(store.getProject().templateParams['A']).toBe(7);
  });

  it('reports an unknown variant', () => {
    expect(createProjectStore().restoreVariant('nothing')).toBe(false);
  });

  it('keeps several variants across unrelated edits', () => {
    const store = createProjectStore();
    store.dispatch({ kind: 'setNumber', field: 'copies', value: 2 });
    store.takeVariant('two');
    store.dispatch({ kind: 'setNumber', field: 'copies', value: 9 });
    store.takeVariant('nine');

    store.dispatch(SET_TEXT);
    store.dispatch({ kind: 'setPalette', paletteId: 'warm' });

    store.restoreVariant('two');
    expect(store.getProject().copies).toBe(2);
    store.restoreVariant('nine');
    expect(store.getProject().copies).toBe(9);
  });
});

describe('autosave', () => {
  it('writes once after the debounce, carrying the final state', () => {
    const storage = memoryStorage();
    const scheduler = manualScheduler();
    const store = createProjectStore({ storage, scheduler });

    store.dispatch({ kind: 'setNumber', field: 'copies', value: 2 });
    store.dispatch({ kind: 'setNumber', field: 'copies', value: 5 });
    store.dispatch({ kind: 'setNumber', field: 'copies', value: 9 });
    expect(storage.value).toBeNull();
    expect(scheduler.pending()).toBe(1);

    scheduler.run();
    expect(storage.value).not.toBeNull();
    expect(JSON.parse(storage.value ?? '{}')).toMatchObject({ copies: 9 });
  });

  it('can be flushed immediately', () => {
    const storage = memoryStorage();
    const store = createProjectStore({ storage, scheduler: manualScheduler() });
    store.dispatch(SET_TEXT);
    store.flushAutosave();
    expect(JSON.parse(storage.value ?? '{}')).toMatchObject({ text: 'Hello' });
  });

  it('starts from a saved state', () => {
    const saved = { ...DEFAULT_PROJECT, text: 'Restored', copies: 4 };
    const store = createProjectStore({ storage: memoryStorage(JSON.stringify(saved)) });
    expect(store.getProject().text).toBe('Restored');
    expect(store.getState().restoreFailure).toBeNull();
  });

  it('falls back to the defaults and says so when the stored project cannot be read', () => {
    const broken = createProjectStore({ storage: memoryStorage('{ not json') });
    expect(broken.getProject()).toEqual(DEFAULT_PROJECT);
    expect(broken.getState().restoreFailure).toMatch(/could not be read/);

    const wrong = createProjectStore({ storage: memoryStorage('{"version":1}') });
    expect(wrong.getProject()).toEqual(DEFAULT_PROJECT);
    expect(wrong.getState().restoreFailure).toMatch(/not a valid project/);
  });

  it('does nothing when it has no storage', () => {
    const store = createProjectStore();
    store.dispatch(SET_TEXT);
    expect(() => {
      store.flushAutosave();
    }).not.toThrow();
  });
});

describe('the store surface', () => {
  it('offers no route to the project state but commands, undo, redo and restore', () => {
    const store = createProjectStore();
    const changing = Object.keys(store).filter((key) =>
      ['dispatch', 'undo', 'redo', 'restoreVariant'].includes(key),
    );
    expect(changing.sort()).toEqual(['dispatch', 'redo', 'restoreVariant', 'undo']);
    expect(Object.keys(store).sort()).toEqual([
      'api',
      'canRedo',
      'canUndo',
      'dispatch',
      'flushAutosave',
      'getProject',
      'getState',
      'redo',
      'removeVariant',
      'restoreVariant',
      'subscribe',
      'takeVariant',
      'undo',
    ]);
  });

  it('notifies subscribers', () => {
    const store = createProjectStore();
    let seen = 0;
    const stop = store.subscribe(() => {
      seen++;
    });
    store.dispatch(SET_TEXT);
    expect(seen).toBe(1);
    stop();
    store.dispatch(SET_A);
    expect(seen).toBe(1);
  });
});

const TEMPLATE_DEFS = [
  { id: 'A', label: 'Amplitude', kind: 'number', min: 1, max: 20, default: 3, lockable: true },
] as const;

const NESTING_DEFS = [
  { id: 'copies', label: 'Copies', kind: 'int', min: 1, max: 12, default: 6, lockable: true },
  {
    id: 'rotation',
    label: 'Rotation',
    kind: 'angle',
    min: 0,
    max: 180,
    step: 1,
    default: 24,
    lockable: true,
  },
  { id: 'fit', label: 'Fit', kind: 'number', min: -1, max: 1, default: 0, lockable: true },
  {
    id: 'alpha',
    label: 'Alpha',
    kind: 'number',
    min: 0,
    max: 1,
    default: 0.22,
    lockable: true,
    randomize: { min: 0.2, max: 0.3 },
  },
] as const;

const CHOICE_DEFS = [
  {
    id: 'palette',
    label: 'Palette',
    kind: 'enum',
    options: ['analogous', 'warm', 'cool', 'triadic'],
    default: 'analogous',
    lockable: true,
  },
  { id: 'shapePen', label: 'Pen', kind: 'bool', default: true, lockable: true },
  {
    id: 'ending',
    label: 'Ending',
    kind: 'enum',
    options: ['round', 'flat'],
    default: 'round',
    lockable: true,
    randomize: false,
  },
] as const;

function randomizeCommand(seed: string, nextSeed = `${seed}+`): Command {
  return {
    kind: 'randomize',
    seed,
    nextSeed,
    templateDefs: [...TEMPLATE_DEFS],
    nestingDefs: [...NESTING_DEFS],
    choiceDefs: [...CHOICE_DEFS],
  };
}

describe('randomize', () => {
  it('produces one log entry and advances the seed', () => {
    const store = createProjectStore();
    store.dispatch(randomizeCommand('one', 'two'));
    expect(store.getState().log).toHaveLength(1);
    expect(store.getProject().seed).toBe('two');
  });

  it('is undone by a single undo', () => {
    const store = createProjectStore();
    const before = store.getProject();
    store.dispatch(randomizeCommand('one'));
    expect(store.getProject()).not.toEqual(before);
    store.undo();
    expect(store.getProject()).toEqual(before);
  });

  it('round-trips through JSON', () => {
    const command = randomizeCommand('rt');
    const parsed = JSON.parse(JSON.stringify(command)) as Command;
    expect(applyCommand(DEFAULT_PROJECT, parsed).state).toEqual(
      applyCommand(DEFAULT_PROJECT, command).state,
    );
  });

  it('leaves a locked parameter exactly as it was', () => {
    let state = applyCommand(DEFAULT_PROJECT, { kind: 'setLock', paramId: 'copies', locked: true }).state;
    state = applyCommand(state, { kind: 'setNumber', field: 'copies', value: 4 }).state;
    for (const seed of ['a', 'b', 'c', 'd', 'e']) {
      expect(applyCommand(state, randomizeCommand(seed)).state.copies, seed).toBe(4);
    }
  });

  it('changes nothing but the seed when everything is locked', () => {
    let state = DEFAULT_PROJECT;
    for (const id of ['A', 'copies', 'rotation', 'fit', 'alpha', 'palette', 'shapePen', 'ending']) {
      state = applyCommand(state, { kind: 'setLock', paramId: id, locked: true }).state;
    }
    const after = applyCommand(state, randomizeCommand('locked', 'next')).state;
    expect({ ...after, seed: state.seed }).toEqual(state);
    expect(after.seed).toBe('next');
  });

  it('moves an unlocked parameter across repeated runs', () => {
    const seen = new Set(
      ['a', 'b', 'c', 'd', 'e', 'f'].map(
        (seed) => applyCommand(DEFAULT_PROJECT, randomizeCommand(seed)).state.copies,
      ),
    );
    expect(seen.size).toBeGreaterThan(1);
  });

  it('honours a declared randomize range', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const alpha = applyCommand(DEFAULT_PROJECT, randomizeCommand(seed)).state.alpha;
      expect(alpha, seed).toBeGreaterThanOrEqual(0.2);
      expect(alpha, seed).toBeLessThanOrEqual(0.3);
    }
  });

  it('leaves a parameter that opted out alone', () => {
    for (const seed of ['a', 'b', 'c', 'd']) {
      expect(applyCommand(DEFAULT_PROJECT, randomizeCommand(seed)).state.endingId).toBe(
        DEFAULT_PROJECT.endingId,
      );
    }
  });

  it('gives the same result for the same seed and values', () => {
    expect(applyCommand(DEFAULT_PROJECT, randomizeCommand('same')).state).toEqual(
      applyCommand(DEFAULT_PROJECT, randomizeCommand('same')).state,
    );
  });

  it('differs on a second press, because the seed advanced', () => {
    const first = applyCommand(DEFAULT_PROJECT, randomizeCommand('one', 'two')).state;
    const second = applyCommand(first, randomizeCommand(first.seed, 'three')).state;
    expect({ ...second, seed: '' }).not.toEqual({ ...first, seed: '' });
  });

  it('records the seed it drew from in the log', () => {
    const store = createProjectStore();
    store.dispatch(randomizeCommand('recorded', 'after'));
    const entry = store.getState().log[0];
    expect(entry?.command.kind).toBe('randomize');
    expect(entry?.command.kind === 'randomize' ? entry.command.seed : '').toBe('recorded');
  });
});

describe('variants with thumbnails', () => {
  it('carries a thumbnail when one is given', () => {
    const store = createProjectStore();
    store.takeVariant('one', 'data:image/svg+xml,thumb');
    expect(store.getState().variants[0]?.thumbnail).toBe('data:image/svg+xml,thumb');
  });

  it('removes one and leaves the others', () => {
    const store = createProjectStore();
    store.takeVariant('a');
    store.takeVariant('b');
    store.takeVariant('c');

    expect(store.removeVariant('b')).toBe(true);
    expect(store.getState().variants.map((v) => v.name)).toEqual(['a', 'c']);
    expect(store.removeVariant('nothing')).toBe(false);
  });
});

describe('patches and pairs', () => {
  const PATCH: Command = {
    kind: 'setPatch',
    character: 'T',
    patch: { offset: [12, -4], scale: 1.2, advance: 70, endingId: 'slab' },
  };
  const PAIRS: Command = {
    kind: 'setPairs',
    pairs: [{ before: 'A', after: 'v', extra: 14 }],
  };

  it('round-trips through JSON', () => {
    const store = createProjectStore();
    store.dispatch(PATCH);
    store.dispatch(PAIRS);

    const project = store.getProject();
    const copy = JSON.parse(JSON.stringify(project)) as ProjectState;
    expect(copy).toEqual(project);
    expect(copy.patches['T']).toEqual({ offset: [12, -4], scale: 1.2, advance: 70, endingId: 'slab' });
    expect(copy.pairs).toEqual([{ before: 'A', after: 'v', extra: 14 }]);
  });

  it('keeps patches for one character apart from another', () => {
    const store = createProjectStore();
    store.dispatch(PATCH);
    store.dispatch({ kind: 'setPatch', character: 'o', patch: { scale: 0.8 } });
    expect(Object.keys(store.getProject().patches).sort()).toEqual(['T', 'o']);
  });

  it('drops a patch that has nothing left in it', () => {
    const store = createProjectStore();
    store.dispatch(PATCH);
    store.dispatch({ kind: 'setPatch', character: 'T', patch: {} });
    expect(store.getProject().patches).toEqual({});

    store.dispatch(PATCH);
    store.dispatch({ kind: 'setPatch', character: 'T', patch: null });
    expect(store.getProject().patches).toEqual({});
  });

  it('undoes and redoes a patch and a pair list', () => {
    const store = createProjectStore();
    store.dispatch(PATCH);
    store.dispatch(PAIRS);

    store.undo();
    expect(store.getProject().pairs).toEqual([]);
    expect(store.getProject().patches).toHaveProperty('T');

    store.undo();
    expect(store.getProject().patches).toEqual({});

    store.redo();
    expect(store.getProject().patches).toHaveProperty('T');
    store.redo();
    expect(store.getProject().pairs).toHaveLength(1);
  });

  it('is still a project state with patches and pairs on it', () => {
    const store = createProjectStore();
    store.dispatch(PATCH);
    expect(isProjectState(store.getProject())).toBe(true);
    expect(isProjectState({ ...DEFAULT_PROJECT, patches: [] })).toBe(false);
    expect(isProjectState({ ...DEFAULT_PROJECT, pairs: {} })).toBe(false);
  });
});
