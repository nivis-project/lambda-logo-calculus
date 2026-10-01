import { useState } from 'react';
import type { ParamDef, ParamValue, ParamValues } from '@trefoil/core';
import { ParamControl } from './ParamControl.js';

export interface ParamPanelProps {
  readonly title: string;
  readonly defs: readonly ParamDef[];
  readonly values: ParamValues;
  readonly locked: readonly string[];
  readonly onChange: (paramId: string, value: ParamValue) => void;
  readonly onLock: (paramId: string, locked: boolean) => void;
  readonly testId: string;
}

export const UNGROUPED = 'General';

export function groupsOf(defs: readonly ParamDef[]): readonly string[] {
  const seen: string[] = [];
  for (const def of defs) {
    const group = def.group ?? UNGROUPED;
    if (!seen.includes(group)) seen.push(group);
  }
  return seen;
}

export function ParamPanel({
  title,
  defs,
  values,
  locked,
  onChange,
  onLock,
  testId,
}: ParamPanelProps): JSX.Element {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const hasAdvanced = defs.some((def) => def.advanced === true);
  const visible = defs.filter((def) => showAdvanced || def.advanced !== true);

  if (defs.length === 0) return <></>;

  const groups = groupsOf(visible);
  const sameName = groups.length === 1 && groups[0]?.toLowerCase() === title.toLowerCase();

  return (
    <section data-testid={testId}>
      <h2>{title}</h2>
      {groups.map((group) => (
        <div className="group" key={group} data-testid={`group-${group}`}>
          {!sameName && <h3>{group}</h3>}
          {visible
            .filter((def) => (def.group ?? UNGROUPED) === group)
            .map((def) => (
              <ParamControl
                key={def.id}
                def={def}
                value={values[def.id] ?? def.default}
                locked={locked.includes(def.id)}
                onChange={(value) => { onChange(def.id, value); }}
                onLock={(on) => { onLock(def.id, on); }}
                onReset={() => { onChange(def.id, def.default); }}
              />
            ))}
        </div>
      ))}
      {hasAdvanced && (
        <button
          type="button"
          data-testid={`advanced-${testId}`}
          aria-pressed={showAdvanced}
          onClick={() => { setShowAdvanced((on) => !on); }}
        >
          {showAdvanced ? 'Hide advanced' : 'Show advanced'}
        </button>
      )}
    </section>
  );
}
