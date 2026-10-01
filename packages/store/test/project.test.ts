import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PROJECT,
  FILE_FORMAT,
  PROJECT_VERSION,
  applyCommand,
  loadProject,
  reportOf,
  runMigrations,
  saveProject,
  validateProject,
  type Command,
  type Migration,
  type ProjectState,
} from '../src/index.js';

const RICH: ProjectState = [
  { kind: 'setTemplate', templateId: 'rose', templateVersion: 2, params: { A: 4, k: 5 } },
  { kind: 'setText', text: 'Trefoil Studio' },
  { kind: 'setPatch', character: 'T', patch: { offset: [12, -4], scale: 1.2, endingId: 'slab' } },
  { kind: 'setPairs', pairs: [{ before: 'T', after: 'r', extra: 14 }] },
  { kind: 'setLock', paramId: 'A', locked: true },
  { kind: 'setSeed', seed: 'kept' },
].reduce<ProjectState>(
  (state, command) => applyCommand(state, command as Command).state,
  DEFAULT_PROJECT,
);

function fileOf(project: Partial<ProjectState>, format: unknown = FILE_FORMAT): string {
  return JSON.stringify({ format, project: { ...RICH, ...project } });
}

describe('the file format', () => {
  it('holds the format marker and the project', () => {
    const parsed = JSON.parse(saveProject(RICH)) as Record<string, unknown>;
    expect(parsed['format']).toBe(FILE_FORMAT);
    expect(parsed['project']).toEqual(RICH);
  });

  it('reopens exactly as it was saved', () => {
    const loaded = loadProject(saveProject(RICH));
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.project).toEqual(RICH);
    expect(loaded.migrated).toEqual([]);
  });

  it('carries the template version, the formula, the modulation, the patches and the pairs', () => {
    const withFormula = applyCommand(RICH, {
      kind: 'setTemplateParam',
      paramId: 'formula',
      value: 'A + cos(3 * t)',
    }).state;

    const loaded = loadProject(saveProject(withFormula));
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.project.templateVersion).toBe(2);
    expect(loaded.project.templateParams['formula']).toBe('A + cos(3 * t)');
    expect(loaded.project.modulation).toEqual(withFormula.modulation);
    expect(loaded.project.patches['T']).toEqual({ offset: [12, -4], scale: 1.2, endingId: 'slab' });
    expect(loaded.project.pairs).toEqual([{ before: 'T', after: 'r', extra: 14 }]);
  });

  it('drops anything the format does not name', () => {
    const text = JSON.stringify({
      format: FILE_FORMAT,
      project: { ...RICH, smuggled: 'in' },
    });
    const loaded = loadProject(text);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.project).not.toHaveProperty('smuggled');
  });

  it('freezes what it loaded', () => {
    const loaded = loadProject(saveProject(RICH));
    if (!loaded.ok) throw new Error('expected a load');
    expect(() => {
      (loaded.project as { text: string }).text = 'nope';
    }).toThrow();
  });
});

describe('validation', () => {
  it('names the field and the type it expected', () => {
    const loaded = loadProject(fileOf({ copies: '6' as unknown as number }));
    expect(loaded.ok).toBe(false);
    if (loaded.ok) return;
    expect(loaded.problems).toEqual([
      { field: 'copies', message: 'expected a number, it was string' },
    ]);
  });

  it('reports every problem, not only the first', () => {
    const loaded = loadProject(
      fileOf({
        copies: '6' as unknown as number,
        text: 7 as unknown as string,
        stages: 'all' as unknown as ProjectState['stages'],
      }),
    );
    expect(loaded.ok).toBe(false);
    if (loaded.ok) return;
    expect(loaded.problems.map((p) => p.field)).toEqual(['stages', 'text', 'copies']);
    expect(reportOf(loaded.problems)).toContain('stages: expected a list of { id, enabled }');
  });

  it('says when a field is missing rather than wrong', () => {
    const without = { ...RICH } as Record<string, unknown>;
    delete without['seed'];
    const loaded = loadProject(JSON.stringify({ format: FILE_FORMAT, project: without }));
    expect(loaded.ok).toBe(false);
    if (loaded.ok) return;
    expect(loaded.problems).toEqual([{ field: 'seed', message: 'expected a string, it was missing' }]);
  });

  it('refuses text that is not JSON', () => {
    const loaded = loadProject('not a project at all');
    expect(loaded.ok).toBe(false);
    if (loaded.ok) return;
    expect(loaded.problems[0]?.field).toBe('file');
    expect(loaded.problems[0]?.message).toMatch(/not JSON/);
  });

  it('refuses JSON that is not this format', () => {
    expect(loadProject(JSON.stringify({ format: 'something-else', project: RICH })).ok).toBe(false);
    expect(loadProject(JSON.stringify([1, 2, 3])).ok).toBe(false);
    expect(loadProject(JSON.stringify({ format: FILE_FORMAT, project: 4 })).ok).toBe(false);
  });

  it('checks a patch and a pair rather than trusting the shape', () => {
    expect(loadProject(fileOf({ patches: { T: { scale: 'big' } } as never })).ok).toBe(false);
    expect(loadProject(fileOf({ pairs: [{ before: 'T', after: 'r' }] as never })).ok).toBe(false);
    expect(loadProject(fileOf({ modulation: [{ id: 'x' }] as never })).ok).toBe(false);
    expect(loadProject(fileOf({ mark: { enabled: true } as never })).ok).toBe(false);
  });

  it('validates a value on its own, without a file around it', () => {
    expect(validateProject(RICH)).toEqual([]);
    expect(validateProject(null)).toEqual([
      { field: 'project', message: 'expected an object, it was null' },
    ]);
    expect(validateProject([])).toHaveLength(1);
  });
});

describe('versions', () => {
  const steps: readonly Migration[] = [
    {
      from: 1,
      to: 2,
      run: (value) => ({ ...value, version: 2, text: `${String(value['text'])}!` }),
    },
    {
      from: 2,
      to: 3,
      run: (value) => ({ ...value, version: 3, seed: `${String(value['seed'])}-3` }),
    },
  ];

  it('runs every step in order from the file version to the current one', () => {
    const loaded = loadProject(saveProject(RICH), steps, 3);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.migrated).toEqual([2, 3]);
    expect(loaded.project.text).toBe('Trefoil Studio!');
    expect(loaded.project.seed).toBe('kept-3');
    expect(loaded.project.version).toBe(3);
  });

  it('runs nothing when the file is already current', () => {
    const loaded = loadProject(saveProject(RICH), steps, PROJECT_VERSION);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.migrated).toEqual([]);
    expect(loaded.project.text).toBe('Trefoil Studio');
  });

  it('is a pure function of the value, testable without a file', () => {
    const before = { version: 1, text: 'a', seed: 's' };
    const { value, ran } = runMigrations(before, 1, 3, steps);
    expect(ran).toEqual([2, 3]);
    expect(value).toEqual({ version: 3, text: 'a!', seed: 's-3' });
    expect(before).toEqual({ version: 1, text: 'a', seed: 's' });
  });

  it('refuses a file from a newer version, naming both', () => {
    const text = JSON.stringify({ format: FILE_FORMAT, project: { ...RICH, version: 9 } });
    const loaded = loadProject(text);
    expect(loaded.ok).toBe(false);
    if (loaded.ok) return;
    expect(loaded.problems[0]?.message).toBe(
      `the file is version 9 and this studio reads version ${PROJECT_VERSION}`,
    );
  });

  it('refuses a version it has no step for', () => {
    const text = JSON.stringify({ format: FILE_FORMAT, project: { ...RICH, version: 1 } });
    const loaded = loadProject(text, [], 4);
    expect(loaded.ok).toBe(false);
    if (loaded.ok) return;
    expect(loaded.problems[0]?.message).toMatch(/no migration from version 1/);
  });

  it('ships no migrations, because version 1 is the first', () => {
    expect(PROJECT_VERSION).toBe(1);
    expect(loadProject(saveProject(RICH)).ok).toBe(true);
  });
});
