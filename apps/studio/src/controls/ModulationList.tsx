import { CURVE_NAMES, type ModulationEntry } from '@trefoil/core';

export const TARGET_OPTIONS = ['widthFactor', 'xHeight', 'bend.factor'] as const;
export const SOURCE_OPTIONS = ['param:A', 'nesting:fit', 'copyIndex', 'charPosition'] as const;

export function describeSource(entry: ModulationEntry): string {
  const { source } = entry;
  if (source.kind === 'param') return `param:${source.paramId}`;
  if (source.kind === 'nesting') return `nesting:${source.field}`;
  return source.kind;
}

export function describeTarget(entry: ModulationEntry): string {
  const { target } = entry;
  if (target.kind === 'stageParam') return `${target.stageId}.${target.paramId}`;
  return target.kind;
}

export function targetFrom(value: string): ModulationEntry['target'] {
  if (value === 'widthFactor') return { kind: 'widthFactor' };
  if (value === 'xHeight') return { kind: 'xHeight' };
  const [stageId = 'bend', paramId = 'factor'] = value.split('.');
  return { kind: 'stageParam', stageId, paramId };
}

export function sourceFrom(value: string): ModulationEntry['source'] {
  if (value.startsWith('param:')) return { kind: 'param', paramId: value.slice(6) };
  if (value.startsWith('nesting:')) {
    return { kind: 'nesting', field: value.slice(8) as 'fit' };
  }
  if (value === 'charPosition') return { kind: 'charPosition' };
  return { kind: 'copyIndex' };
}

export interface ModulationListProps {
  readonly entries: readonly ModulationEntry[];
  readonly onChange: (entries: readonly ModulationEntry[]) => void;
}

export function ModulationList({ entries, onChange }: ModulationListProps): JSX.Element {
  const update = (id: string, patch: Partial<ModulationEntry>): void => {
    onChange(entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  };

  return (
    <section data-testid="modulation-list">
      <h2>Modulation</h2>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id} data-testid={`modulation-${entry.id}`}>
            <div className="modulation-head">
              <select
                data-testid={`modulation-source-${entry.id}`}
                value={describeSource(entry)}
                onChange={(event) => { update(entry.id, { source: sourceFrom(event.target.value) }); }}
              >
                {SOURCE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span>drives</span>
              <select
                data-testid={`modulation-target-${entry.id}`}
                value={describeTarget(entry)}
                onChange={(event) => { update(entry.id, { target: targetFrom(event.target.value) }); }}
              >
                {TARGET_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button
                type="button"
                data-testid={`modulation-remove-${entry.id}`}
                onClick={() => { onChange(entries.filter((e) => e.id !== entry.id)); }}
              >
                remove
              </button>
            </div>
            <div className="modulation-body">
              <label htmlFor={`amount-${entry.id}`}>amount</label>
              <input
                id={`amount-${entry.id}`}
                type="range"
                data-testid={`modulation-amount-${entry.id}`}
                min={0}
                max={1}
                step={0.01}
                value={entry.amount}
                onChange={(event) => { update(entry.id, { amount: Number(event.target.value) }); }}
              />
              <output data-testid={`modulation-amount-value-${entry.id}`}>{entry.amount}</output>
              <select
                data-testid={`modulation-response-${entry.id}`}
                value={entry.response.kind === 'named' ? entry.response.name : entry.response.curve}
                onChange={(event) => {
                  const value = event.target.value;
                  update(entry.id, {
                    response: CURVE_NAMES.includes(value as 'linear')
                      ? { kind: 'curve', curve: value as 'linear' }
                      : { kind: 'named', name: value as 'prototypeWidth' },
                  });
                }}
              >
                {['prototypeWidth', 'prototypeXHeight', ...CURVE_NAMES].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        data-testid="modulation-add"
        onClick={() => {
          onChange([
            ...entries,
            {
              id: `entry-${String(entries.length + 1)}`,
              source: { kind: 'charPosition' },
              target: { kind: 'stageParam', stageId: 'bend', paramId: 'factor' },
              amount: 0.2,
              response: { kind: 'curve', curve: 'linear' },
            },
          ]);
        }}
      >
        Add modulation
      </button>
    </section>
  );
}
