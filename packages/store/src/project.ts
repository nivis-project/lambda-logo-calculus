import {
  DEFAULT_PROJECT,
  PROJECT_VERSION,
  deepFreeze,
  type MarkState,
  type ProjectState,
} from './state.js';

export const FILE_FORMAT = 'trefoil-studio-project';

export interface LoadProblem {
  readonly field: string;
  readonly message: string;
}

export type LoadResult =
  | { readonly ok: true; readonly project: ProjectState; readonly migrated: readonly number[] }
  | { readonly ok: false; readonly problems: readonly LoadProblem[] };

export interface Migration {
  readonly from: number;
  readonly to: number;
  run(value: Record<string, unknown>): Record<string, unknown>;
}

export const MIGRATIONS: readonly Migration[] = [];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStringArray(value: unknown): boolean {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isStageList(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        isRecord(entry) && typeof entry['id'] === 'string' && typeof entry['enabled'] === 'boolean',
    )
  );
}

function isMark(value: unknown): value is MarkState {
  return (
    isRecord(value) &&
    typeof value['enabled'] === 'boolean' &&
    isNumber(value['distance']) &&
    isNumber(value['height']) &&
    isNumber(value['size'])
  );
}

function isKinded(value: unknown): boolean {
  return isRecord(value) && typeof value['kind'] === 'string';
}

function isModulation(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        isRecord(entry) &&
        typeof entry['id'] === 'string' &&
        isKinded(entry['source']) &&
        isKinded(entry['target']) &&
        isNumber(entry['amount']) &&
        isKinded(entry['response']),
    )
  );
}

function isPatches(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return Object.values(value).every(
    (patch) =>
      isRecord(patch) &&
      (patch['offset'] === undefined ||
        (Array.isArray(patch['offset']) &&
          patch['offset'].length === 2 &&
          patch['offset'].every(isNumber))) &&
      (patch['scale'] === undefined || isNumber(patch['scale'])) &&
      (patch['advance'] === undefined || isNumber(patch['advance'])) &&
      (patch['endingId'] === undefined || typeof patch['endingId'] === 'string'),
  );
}

function isPairs(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (pair) =>
        isRecord(pair) &&
        typeof pair['before'] === 'string' &&
        typeof pair['after'] === 'string' &&
        isNumber(pair['extra']),
    )
  );
}

interface FieldCheck {
  readonly field: keyof ProjectState;
  readonly expected: string;
  accepts(value: unknown): boolean;
}

const FIELDS: readonly FieldCheck[] = [
  { field: 'version', expected: 'a number', accepts: isNumber },
  { field: 'templateId', expected: 'a string', accepts: (v) => typeof v === 'string' },
  { field: 'templateVersion', expected: 'a number', accepts: isNumber },
  { field: 'templateParams', expected: 'an object of parameter values', accepts: isRecord },
  { field: 'stages', expected: 'a list of { id, enabled }', accepts: isStageList },
  { field: 'endingId', expected: 'a string', accepts: (v) => typeof v === 'string' },
  { field: 'joinId', expected: 'a string or null', accepts: (v) => v === null || typeof v === 'string' },
  { field: 'paletteId', expected: 'a string', accepts: (v) => typeof v === 'string' },
  { field: 'text', expected: 'a string', accepts: (v) => typeof v === 'string' },
  { field: 'copies', expected: 'a number', accepts: isNumber },
  { field: 'rotation', expected: 'a number', accepts: isNumber },
  { field: 'fit', expected: 'a number', accepts: isNumber },
  { field: 'alpha', expected: 'a number', accepts: isNumber },
  { field: 'shapePen', expected: 'a boolean', accepts: (v) => typeof v === 'boolean' },
  { field: 'mark', expected: 'a mark of { enabled, distance, height, size }', accepts: isMark },
  { field: 'modulation', expected: 'a list of modulation entries', accepts: isModulation },
  { field: 'patches', expected: 'an object of per-glyph patches', accepts: isPatches },
  { field: 'pairs', expected: 'a list of { before, after, extra }', accepts: isPairs },
  { field: 'locked', expected: 'a list of parameter ids', accepts: isStringArray },
  { field: 'seed', expected: 'a string', accepts: (v) => typeof v === 'string' },
];

function describe(value: unknown): string {
  if (value === undefined) return 'it was missing';
  if (value === null) return 'it was null';
  if (Array.isArray(value)) return 'it was a list';
  return `it was ${typeof value}`;
}

export function validateProject(value: unknown): readonly LoadProblem[] {
  if (!isRecord(value)) {
    return [{ field: 'project', message: `expected an object, ${describe(value)}` }];
  }

  const problems: LoadProblem[] = [];
  for (const check of FIELDS) {
    const found = value[check.field];
    if (!check.accepts(found)) {
      problems.push({
        field: check.field,
        message: `expected ${check.expected}, ${describe(found)}`,
      });
    }
  }
  return problems;
}

export function runMigrations(
  value: Record<string, unknown>,
  from: number,
  to: number,
  migrations: readonly Migration[],
): { readonly value: Record<string, unknown>; readonly ran: readonly number[] } {
  let current = value;
  let at = from;
  const ran: number[] = [];

  while (at < to) {
    const step = migrations.find((migration) => migration.from === at);
    if (step === undefined) {
      throw new Error(`no migration from version ${at}, so a version ${from} file cannot be read`);
    }
    current = step.run(current);
    ran.push(step.to);
    at = step.to;
  }

  return { value: current, ran };
}

export function saveProject(project: ProjectState): string {
  return `${JSON.stringify({ format: FILE_FORMAT, project }, null, 2)}\n`;
}

export function loadProject(
  text: string,
  migrations: readonly Migration[] = MIGRATIONS,
  currentVersion: number = PROJECT_VERSION,
): LoadResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return {
      ok: false,
      problems: [{ field: 'file', message: `the text is not JSON: ${(error as Error).message}` }],
    };
  }

  if (!isRecord(parsed)) {
    return { ok: false, problems: [{ field: 'file', message: `expected an object, ${describe(parsed)}` }] };
  }

  if (parsed['format'] !== FILE_FORMAT) {
    return {
      ok: false,
      problems: [
        {
          field: 'format',
          message: `expected "${FILE_FORMAT}", ${describe(parsed['format'])}`,
        },
      ],
    };
  }

  const held = parsed['project'];
  if (!isRecord(held)) {
    return { ok: false, problems: [{ field: 'project', message: `expected an object, ${describe(held)}` }] };
  }

  const version = held['version'];
  if (!isNumber(version)) {
    return { ok: false, problems: [{ field: 'version', message: `expected a number, ${describe(version)}` }] };
  }

  if (version > currentVersion) {
    return {
      ok: false,
      problems: [
        {
          field: 'version',
          message: `the file is version ${version} and this studio reads version ${currentVersion}`,
        },
      ],
    };
  }

  let migrated: Record<string, unknown>;
  let ran: readonly number[];
  try {
    const result = runMigrations(held, version, currentVersion, migrations);
    migrated = result.value;
    ran = result.ran;
  } catch (error) {
    return { ok: false, problems: [{ field: 'version', message: (error as Error).message }] };
  }

  const problems = validateProject(migrated);
  if (problems.length > 0) return { ok: false, problems };

  const project: Record<string, unknown> = {};
  for (const key of Object.keys(DEFAULT_PROJECT) as (keyof ProjectState)[]) {
    project[key] = migrated[key];
  }

  return { ok: true, project: deepFreeze(project as unknown as ProjectState), migrated: ran };
}

export function reportOf(problems: readonly LoadProblem[]): string {
  return problems.map((problem) => `${problem.field}: ${problem.message}`).join('\n');
}
