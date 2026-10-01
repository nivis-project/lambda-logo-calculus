import { useState } from 'react';
import type { ParamValue, SkeletonStage, StageListEntry } from '@trefoil/core';
import { ParamPanel } from './ParamPanel.js';

export interface StageListProps {
  readonly entries: readonly StageListEntry[];
  readonly stages: readonly SkeletonStage[];
  readonly onToggle: (stageId: string, enabled: boolean) => void;
  readonly onReorder: (entries: readonly StageListEntry[]) => void;
  readonly onParam: (stageId: string, paramId: string, value: ParamValue) => void;
}

export function moveEntry(
  entries: readonly StageListEntry[],
  index: number,
  delta: number,
): readonly StageListEntry[] {
  const target = index + delta;
  if (index < 0 || index >= entries.length || target < 0 || target >= entries.length) {
    return entries;
  }
  const next = [...entries];
  const moved = next[index];
  const other = next[target];
  if (moved === undefined || other === undefined) return entries;
  next[index] = other;
  next[target] = moved;
  return next;
}

export function StageList({
  entries,
  stages,
  onToggle,
  onReorder,
  onParam,
}: StageListProps): JSX.Element {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section data-testid="stage-list">
      <h2>Stages</h2>
      <ol>
        {entries.map((entry, index) => {
          const stage = stages.find((s) => s.id === entry.id);
          return (
            <li key={entry.id} data-testid={`stage-${entry.id}`}>
              <div className="stage-head">
                <input
                  type="checkbox"
                  data-testid={`stage-enabled-${entry.id}`}
                  checked={entry.enabled}
                  onChange={(event) => { onToggle(entry.id, event.target.checked); }}
                />
                <span data-testid={`stage-label-${entry.id}`}>{stage?.label ?? entry.id}</span>
                <button
                  type="button"
                  data-testid={`stage-up-${entry.id}`}
                  disabled={index === 0}
                  onClick={() => { onReorder(moveEntry(entries, index, -1)); }}
                >
                  up
                </button>
                <button
                  type="button"
                  data-testid={`stage-down-${entry.id}`}
                  disabled={index === entries.length - 1}
                  onClick={() => { onReorder(moveEntry(entries, index, 1)); }}
                >
                  down
                </button>
                <button
                  type="button"
                  data-testid={`stage-expand-${entry.id}`}
                  aria-pressed={expanded === entry.id}
                  onClick={() => { setExpanded((current) => (current === entry.id ? null : entry.id)); }}
                >
                  {expanded === entry.id ? 'hide' : 'edit'}
                </button>
              </div>
              {expanded === entry.id && stage !== undefined && (
                <ParamPanel
                  title={stage.label}
                  testId={`stage-params-${entry.id}`}
                  defs={stage.params}
                  values={entry.params ?? {}}
                  locked={[]}
                  onChange={(paramId, value) => { onParam(entry.id, paramId, value); }}
                  onLock={() => undefined}
                />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
