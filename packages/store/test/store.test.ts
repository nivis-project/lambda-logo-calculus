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
      { kind: 'setTemplate', templateId: 'rose', params: { A: 4, k: 5 } },
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
    expect(at({ kind: 'setTemplate', templateId: 'rose', params: { A: 2, k: 7 } })).toMatchObject({
      templateId: 'rose',
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
