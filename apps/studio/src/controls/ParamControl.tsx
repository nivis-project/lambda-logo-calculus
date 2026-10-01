import { useState } from 'react';
import { isNumericParam, type ParamDef, type ParamValue } from '@trefoil/core';

export interface ParamControlProps {
  readonly def: ParamDef;
  readonly value: ParamValue;
  readonly locked: boolean;
  readonly onChange: (value: ParamValue) => void;
  readonly onLock: (locked: boolean) => void;
  readonly onReset: () => void;
}

export function ParamControl({
  def,
  value,
  locked,
  onChange,
  onLock,
  onReset,
}: ParamControlProps): JSX.Element {
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const [clamped, setClamped] = useState(false);

  const id = `param-${def.id}`;

  const commit = (): void => {
    if (!isNumericParam(def)) return;
    const parsed = Number(draft);
    if (Number.isFinite(parsed)) {
      const bounded = Math.min(def.max, Math.max(def.min, parsed));
      setClamped(bounded !== parsed);
      onChange(def.kind === 'int' ? Math.round(bounded) : bounded);
    }
    setTyping(false);
  };

  return (
    <div className="control" data-testid={`control-${def.id}`} data-kind={def.kind}>
      <div className="control-head">
        <label htmlFor={id}>{def.label}</label>
        <output data-testid={`value-${def.id}`}>{String(value)}</output>
        <button
          type="button"
          className={locked ? 'lock on' : 'lock'}
          data-testid={`lock-${def.id}`}
          aria-pressed={locked}
          onClick={() => { onLock(!locked); }}
          title="Lock"
        >
          {locked ? 'locked' : 'lock'}
        </button>
        <button type="button" data-testid={`reset-${def.id}`} onClick={onReset} title="Reset">
          reset
        </button>
      </div>

      {isNumericParam(def) && !typing && (
        <input
          id={id}
          type="range"
          data-testid={`slider-${def.id}`}
          min={def.min}
          max={def.max}
          step={def.step ?? (def.kind === 'int' ? 1 : 0.01)}
          value={typeof value === 'number' ? value : def.default}
          onChange={(event) => {
            setClamped(false);
            onChange(Number(event.target.value));
          }}
          onDoubleClick={() => {
            setDraft(String(value));
            setClamped(false);
            setTyping(true);
          }}
        />
      )}

      {isNumericParam(def) && typing && (
        <input
          id={id}
          type="text"
          data-testid={`exact-${def.id}`}
          autoFocus
          value={draft}
          onChange={(event) => { setDraft(event.target.value); }}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit();
            if (event.key === 'Escape') setTyping(false);
          }}
        />
      )}

      {def.kind === 'enum' && (
        <select
          id={id}
          data-testid={`select-${def.id}`}
          value={typeof value === 'string' ? value : def.default}
          onChange={(event) => { onChange(event.target.value); }}
        >
          {def.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}

      {def.kind === 'bool' && (
        <input
          id={id}
          type="checkbox"
          data-testid={`checkbox-${def.id}`}
          checked={typeof value === 'boolean' ? value : def.default}
          onChange={(event) => { onChange(event.target.checked); }}
        />
      )}

      {def.kind === 'color' && (
        <input
          id={id}
          type="color"
          data-testid={`color-${def.id}`}
          value={typeof value === 'string' ? value : def.default}
          onChange={(event) => { onChange(event.target.value); }}
        />
      )}

      {clamped && (
        <p className="note" data-testid={`clamped-${def.id}`}>
          clamped into range
        </p>
      )}
    </div>
  );
}
